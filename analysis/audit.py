"""Read-only workspace audit; build only isolated copies under analysis/staging."""
from pathlib import Path
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor
import configparser
import hashlib
import json
import re
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
EVIDENCE = HERE / 'evidence'
PROJECTS = [
    ('bbs', '3D/BBS_Corners-PA-'),
    ('ludios', '3D/Ludios-Sort-Marble-Run'),
    ('conveyor', '3D/ARF-Template-Three.js'),
    ('egypt', '2D/2026.09.24-CEM-MIP-egypt-case'),
    ('puzzlebox', '2D/2026.10.14-CCS-MIP-unblock_puzzlebox'),
]
SKIP = {'.git', '.internal', 'node_modules', 'build', 'dist', 'local-publish', 'qa', 'tools'}


def run(args, cwd=ROOT, timeout=90):
    try:
        p = subprocess.run([str(a) for a in args], cwd=cwd, capture_output=True,
                           text=True, encoding='utf-8', errors='replace', timeout=timeout)
        return {'command': [str(a) for a in args], 'exit_code': p.returncode,
                'stdout': p.stdout, 'stderr': p.stderr}
    except subprocess.TimeoutExpired as e:
        return {'command': [str(a) for a in args], 'exit_code': None, 'timeout_seconds': timeout,
                'stdout': str(e.stdout or ''), 'stderr': str(e.stderr or '')}


def files(folder):
    if not folder.exists():
        return []
    return sorted(p for p in folder.rglob('*') if p.is_file()
                  and not any(x in SKIP for x in p.relative_to(folder).parts))


def inventory():
    EVIDENCE.mkdir(exist_ok=True)
    report = {'captured_utc': datetime.now(timezone.utc).isoformat(), 'projects': []}
    for key, rel in PROJECTS:
        original = ROOT / 'Original' / rel
        translated = ROOT / 'Defold Project Translated' / rel
        original_git = {name: run(['git', '-C', original, *args]) for name, args in {
            'commit': ['rev-parse', 'HEAD'], 'branch': ['branch', '--show-current'],
            'status': ['status', '--porcelain'],
        }.items()}
        tracked = files(translated)
        digests = {p.relative_to(translated).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                   for p in tracked}
        missing = []
        # Check project resource references, allowing Defold's compiled suffix convention.
        cfg = translated / 'game.project'
        if cfg.exists():
            for lineno, line in enumerate(cfg.read_text(encoding='utf-8').splitlines(), 1):
                if '=' not in line:
                    continue
                values = line.split('=', 1)[1].strip().split(',')
                for value in (v.strip() for v in values):
                    if not value.startswith('/') or value.startswith('/builtins/'):
                        continue
                    path = translated / value.lstrip('/')
                    if not path.exists() and not (value.endswith('c') and Path(str(path)[:-1]).exists()):
                        missing.append({'file': 'game.project', 'line': lineno, 'resource': value})
        missing_modules = []
        for p in tracked:
            if p.suffix not in {'.lua', '.script', '.gui_script', '.render_script'}:
                continue
            for module in re.findall(r"require\s*\(?\s*['\"]([^'\"]+)['\"]", p.read_text(encoding='utf-8')):
                if not (translated / (module.replace('.', '/') + '.lua')).exists():
                    missing_modules.append({'file': p.relative_to(translated).as_posix(), 'module': module})
        scripts = {}
        pkg = translated / 'package.json'
        if pkg.exists():
            scripts = json.loads(pkg.read_text(encoding='utf-8')).get('scripts', {})
        report['projects'].append({
            'key': key, 'relative_path': rel, 'original_git': original_git,
            'translated_exists': translated.exists(), 'translated_git_exists': (translated / '.git').exists(),
            'translated_git': run(['git', '-C', translated, 'log', '-1', '--format=%H']) if (translated / '.git').exists() else None,
            'files_sha256': digests, 'missing_project_resources': missing,
            'missing_lua_modules': missing_modules, 'package_scripts': scripts,
        })
    (EVIDENCE / 'inventory.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'inventory': str(EVIDENCE / 'inventory.json'), 'projects': [
        {'key': p['key'], 'exists': p['translated_exists'], 'files': len(p['files_sha256']),
         'missing_resources': p['missing_project_resources'], 'missing_modules': p['missing_lua_modules']}
        for p in report['projects']]}))


def build():
    EVIDENCE.mkdir(exist_ok=True)
    java = next(Path('C:/Users/Anthony Castor/Documents/Defold/packages').glob('**/bin/java.exe'))
    bob = ROOT / '.tools/bob.jar'
    environment = {'default_java': run(['java', '-version']), 'default_bob': run(['java', '-jar', bob, '--version']),
                   'bundled_java': run([java, '-version']), 'bundled_bob': run([java, '-jar', bob, '--version']),
                   'bob_help': run([java, '-jar', bob, '--help'])}
    (EVIDENCE / 'toolchain.json').write_text(json.dumps(environment, indent=2) + '\n', encoding='utf-8')
    inventory_data = json.loads((EVIDENCE / 'inventory.json').read_text(encoding='utf-8'))
    jobs = []
    for project in inventory_data['projects']:
        if not project['translated_exists']:
            continue
        dest = HERE / 'staging' / project['key']
        dest.mkdir(parents=True, exist_ok=True)
        source = ROOT / 'Defold Project Translated' / project['relative_path']
        changed = []
        for rel, expected in project['files_sha256'].items():
            p = source / rel
            target = dest / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists():
                shutil.copy2(p, target)
            if hashlib.sha256(target.read_bytes()).hexdigest() != expected:
                changed.append(rel)
        jobs.append((project['key'], dest, changed))

    def one(job):
        key, dest, changed = job
        result = run([java, '-jar', bob, '--root', dest, '--platform', 'wasm-web', '--variant', 'debug',
                      '--max-cpu-threads', '2', '--archive', 'resolve', 'build', 'bundle'], cwd=dest, timeout=240)
        result['changed_since_inventory'] = changed
        result['snapshot_sha256'] = {p.relative_to(dest).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                                     for p in files(dest)}
        (EVIDENCE / (key + '-build.json')).write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
        return {'key': key, 'exit_code': result['exit_code'], 'changed_since_inventory': changed,
                'tail': (result['stdout'] + result['stderr'])[-3000:]}

    with ThreadPoolExecutor(max_workers=3) as pool:
        for result in pool.map(one, jobs):
            print(json.dumps(result), flush=True)


if __name__ == '__main__':
    {'inventory': inventory, 'build': build}[sys.argv[1]]()
