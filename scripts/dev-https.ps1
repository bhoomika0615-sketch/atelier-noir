$ErrorActionPreference = "Stop"
Push-Location (Join-Path $PSScriptRoot "..")
try {
  & node scripts/dev-both.mjs
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
