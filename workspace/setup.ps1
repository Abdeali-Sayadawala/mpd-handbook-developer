# Sets up the MPD workspace on a new machine, or keeps the workspace copies in step.
#   .\setup.ps1          clone any missing repos next to mpd-handbook-developer, copy CLAUDE.md and README.md to the workspace root
#   .\setup.ps1 -Sync    copy the workspace root CLAUDE.md and README.md INTO this repo (run before committing changes to them)
param([switch]$Sync)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path          # ...\mpd-handbook-developer\workspace
$workspace = Split-Path -Parent (Split-Path -Parent $here)        # ...\ (the workspace root)

if ($Sync) {
  Copy-Item "$workspace\CLAUDE.md" "$here\CLAUDE.md" -Force
  Copy-Item "$workspace\README.md" "$here\README.md" -Force
  Write-Host "Copied the workspace CLAUDE.md and README.md into $here. Commit them."
  return
}

$repos = 'mpd-context', 'mpd-backend', 'mpd-frontend', 'mpd-mobile', 'mpd-global', 'mpd-infra', 'mpd-handbook'
$owner = (gh api user --jq .login)
foreach ($r in $repos) {
  if (Test-Path "$workspace\$r") { Write-Host "$r already here"; continue }
  Write-Host "Cloning $r"
  gh repo clone "$owner/$r" "$workspace\$r"
}
foreach ($f in 'CLAUDE.md', 'README.md') {
  if (-not (Test-Path "$workspace\$f")) { Copy-Item "$here\$f" "$workspace\$f" }
}
Write-Host "Done. Next: see $here\NEW-MACHINE.md (environment files, database, running the apps)."
