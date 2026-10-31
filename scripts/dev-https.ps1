$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$localAppData = $env:LOCALAPPDATA
if (-not $localAppData) {
  throw "LOCALAPPDATA is not set; cannot store the local HTTPS certificate."
}

$certificateDirectory = Join-Path $localAppData "atelier-noir\certificates"
$certificatePath = Join-Path $certificateDirectory "localhost.pem"
$keyPath = Join-Path $certificateDirectory "localhost-key.pem"
$mkcert = Get-Command mkcert -ErrorAction SilentlyContinue

if ($mkcert) {
  $mkcertPath = $mkcert.Source
} else {
  $mkcertDirectory = Join-Path $localAppData "mkcert"
  $mkcertBinary = Get-ChildItem $mkcertDirectory -Filter "mkcert-v*-windows-amd64.exe" -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    Select-Object -First 1
  if (-not $mkcertBinary) {
    throw "mkcert is required for trusted local HTTPS. Install mkcert, run 'mkcert -install', then run 'npm run dev' again."
  }
  $mkcertPath = $mkcertBinary.FullName
}

$caDirectory = (& $mkcertPath -CAROOT).Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Could not locate the local mkcert certificate authority."
}

$rootCertificatePath = Join-Path $caDirectory "rootCA.pem"
if (-not (Test-Path $rootCertificatePath)) {
  throw "The local mkcert root certificate is missing. Run 'mkcert -install' and try again."
}

$rootPem = Get-Content $rootCertificatePath -Raw
$rootBase64 = [regex]::Match($rootPem, "(?s)-----BEGIN CERTIFICATE-----\s*(.*?)\s*-----END CERTIFICATE-----").Groups[1].Value -replace "\s", ""
$rootBytes = [Convert]::FromBase64String($rootBase64)
$rootCertificate = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 -ArgumentList (,$rootBytes)
$trustCheck = & certutil.exe -user -store Root $rootCertificate.Thumbprint 2>&1
if ($LASTEXITCODE -ne 0) {
  & $mkcertPath -install
  $trustCheck = & certutil.exe -user -store Root $rootCertificate.Thumbprint 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "The local HTTPS certificate authority is not trusted by Windows. Run 'mkcert -install' and try again."
  }
}

if (-not (Test-Path $certificatePath) -or -not (Test-Path $keyPath)) {
  New-Item -ItemType Directory -Force -Path $certificateDirectory | Out-Null
  & $mkcertPath -cert-file $certificatePath -key-file $keyPath localhost 127.0.0.1 ::1
  if ($LASTEXITCODE -ne 0) {
    throw "Could not create the HTTPS certificate for localhost."
  }
}

Push-Location $projectRoot
try {
  & npx.cmd prisma db push --schema prisma/schema.sqlite.prisma
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  & npx.cmd prisma generate --schema prisma/schema.sqlite.prisma
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  & npx.cmd next dev --experimental-https --experimental-https-key $keyPath --experimental-https-cert $certificatePath
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
