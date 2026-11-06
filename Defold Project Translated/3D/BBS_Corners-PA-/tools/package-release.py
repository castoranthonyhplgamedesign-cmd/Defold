"""Package only locally built release artifacts; never uploads anything."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json

root = Path(__file__).resolve().parents[1]
publish = root / "publish"
brand = json.loads((root / "branding.json").read_text())
artifacts = []
for name, directory in [
    (brand["packageName"] + "-HTML5.zip", publish / brand["name"]),
    (brand["packageName"] + "-Windows.zip", publish / "windows" / brand["name"]),
]:
    files = [p for p in directory.rglob("*") if p.is_file() and p.name != ".gitattributes"]
    target = publish / name
    with ZipFile(target, "w", ZIP_DEFLATED, compresslevel=9) as archive:
        for file in files:
            archive.write(file, file.relative_to(directory))
    artifacts.append({"file": name, "bytes": target.stat().st_size,
                      "uncompressed_bytes": sum(p.stat().st_size for p in files),
                      "sha256": hashlib.sha256(target.read_bytes()).hexdigest()})
(publish / "release-manifest.json").write_text(json.dumps(artifacts, indent=2))
print(json.dumps(artifacts, indent=2))
