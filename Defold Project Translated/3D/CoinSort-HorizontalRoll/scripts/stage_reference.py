"""Stage the pinned original for comparison without changing its checkout."""
from pathlib import Path
import json
import shutil
import subprocess

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT.parents[2]/'Original/3D/CoinSort-HorizontalRoll'
EXPECTED='ccb8e2b210a432272e0e4147a64b163484c4aa70'
head=subprocess.run(['git','-C',str(SOURCE),'rev-parse','HEAD'],capture_output=True,text=True,check=True).stdout.strip()
if head!=EXPECTED:raise SystemExit('Original revision differs from the pinned baseline; review and update provenance first.')
status=subprocess.run(['git','-C',str(SOURCE),'status','--porcelain'],capture_output=True,text=True,check=True).stdout
if status:raise SystemExit('Original has uncommitted changes; stage a clean pinned reference before conversion.')
destination=ROOT/'tools/reference'
shutil.copytree(SOURCE,destination,dirs_exist_ok=True,ignore=shutil.ignore_patterns('.git','node_modules','dist'))
main=destination/'src/main.ts'
text=main.read_text(encoding='utf-8')
text=text.replace('game = new Phaser.Game(config);','game = new Phaser.Game(config);\n  (window as unknown as {__coinSourceGame: Phaser.Game}).__coinSourceGame = game;')
main.write_text(text,encoding='utf-8')
print(json.dumps({'baseline':head,'destination':str(destination),'qa_instrumentation':'Expose the existing Phaser.Game on the comparison copy only; game logic is unchanged.'}))
