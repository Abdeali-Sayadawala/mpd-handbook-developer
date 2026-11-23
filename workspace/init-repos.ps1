# Run once in PowerShell from D:\MPDv2.
# Needs: git, and the GitHub CLI (https://cli.github.com), logged in with:  gh auth login
# Creates the 8 PRIVATE repos under YOUR PERSONAL GitHub account (no organisation needed).
# Later they can be moved to the owner's organisation with GitHub's "Transfer repository" (history kept).
# Usage:  .\init-repos.ps1            (uses the logged-in account)
#         .\init-repos.ps1 -Owner someone-else
param([string]$Owner = "")
if ($Owner -eq "") { $Owner = (gh api user --jq .login) }
Write-Host "Creating private repos under: $Owner"
$repos = "mpd-context","mpd-backend","mpd-frontend","mpd-mobile","mpd-global","mpd-infra","mpd-handbook-developer","mpd-handbook"
foreach ($r in $repos) {
  Push-Location $r
  if (-not (Test-Path .git)) { git init -b main | Out-Null }
  git add -A
  git commit -m "chore: initial scaffold (README, CLAUDE.md, gitignore)" | Out-Null
  git branch develop 2>$null
  gh repo create "$Owner/$r" --private --source . --remote origin --push
  git push -u origin develop
  Write-Host "$r -> github.com/$Owner/$r"
  Pop-Location
}
Write-Host "`nOne setting to change: in github.com/$Owner/mpd-infra > Settings > Actions > General > Access,"
Write-Host "choose 'Accessible from repositories owned by the user' so the other repos can use its shared workflows."
