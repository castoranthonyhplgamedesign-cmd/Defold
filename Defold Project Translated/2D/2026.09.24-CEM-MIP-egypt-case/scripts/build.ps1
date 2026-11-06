param([ValidateSet('release','debug')][string]$Variant='release',[switch]$PreviewOnly)
$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$javaPath='C:\Users\Anthony Castor\Documents\Defold\packages\jdk-25.0.4.1+1\bin\java.exe'
if (!(Test-Path -LiteralPath 'tools/bob-fast.jar')) {
    $ProgressPreference='SilentlyContinue'
    Invoke-WebRequest -Uri 'https://d.defold.com/archive/d295ed4edff2e49072719835713e625f409849f1/bob/bob.jar' -OutFile 'tools/bob-fast.jar'
}
python scripts/prepare.py
if ($LASTEXITCODE) { throw 'Asset preparation failed' }
& $javaPath -jar tools/bob-fast.jar --settings config/html5.settings --platform wasm-web --architectures wasm-web --variant $Variant --archive --bundle-output bundle resolve build bundle
if ($LASTEXITCODE) { throw 'Defold build failed' }
if ($PreviewOnly) { python scripts/publish.py --preview } else { python scripts/publish.py }
if ($LASTEXITCODE) { throw 'Local packaging failed' }
