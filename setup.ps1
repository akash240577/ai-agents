$ErrorActionPreference = 'Stop'
$dir = $PSScriptRoot
$copilotLink = "$env:USERPROFILE\.copilot"

Write-Host "=> ambs-toolkit setup"

# 1. Create .env if missing
$envFile = "$dir\.env"
if (-not (Test-Path $envFile)) {
    Copy-Item "$dir\.env.template" $envFile
    Write-Host "    created .env from template -- fill in your credentials before using scripts"
} else {
    Write-Host "    .env already exists, skipping"
}

# 2. npm install
Write-Host "=> Installing dependencies..."
Push-Location $dir
npm install
Pop-Location

# 3. Create ~/.copilot and sub-junctions (agents, skills)
if (-not (Test-Path $copilotLink)) {
    New-Item -ItemType Directory -Path $copilotLink | Out-Null
}
Write-Host "    $env:USERPROFILE\.copilot directory ready"

foreach ($sub in 'agents', 'skills') {
    $link = "$copilotLink\$sub"
    $target = "$dir\$sub"
    if (-not (Test-Path $link)) {
        New-Item -ItemType Junction -Path $link -Target $target | Out-Null
        Write-Host "    created ~/.copilot/$sub junction"
    } else {
        $item = Get-Item $link -Force
        if ($item.LinkType -eq 'Junction') {
            Write-Host "    ~/.copilot/$sub junction already exists, skipping"
        } else {
            # Existing real directory -- back it up before replacing with a junction
            $backup = "$link.bak-$(Get-Date -Format 'yyyyMMddHHmmss')"
            Write-Host "    ~/.copilot/$sub is a real directory (not a junction)"
            Write-Host "    backing up to $backup ..."
            Move-Item $link $backup
            Write-Host "    backup created: $backup"
            New-Item -ItemType Junction -Path $link -Target $target | Out-Null
            Write-Host "    created ~/.copilot/$sub junction"
            Write-Host "    NOTE: your previous $sub are in $backup -- review and remove when done"
        }
    }
}

# Write TOOLKIT_ROOT into .env (auto-refreshed on every setup run)
function Set-EnvValue([string]$file, [string]$key, [string]$value) {
    $content = Get-Content $file -Raw
    if ($content -match "(?m)^$key=") {
        $content = $content -replace "(?m)^$key=.*", "$key=$value"
    } else {
        $content = $content.TrimEnd() + "`n$key=$value"
    }
    Set-Content $file $content -NoNewline
}

Set-EnvValue $envFile 'TOOLKIT_ROOT' $dir
Write-Host "    wrote TOOLKIT_ROOT to .env"

# 4. Prompt for investigations folder
Write-Host ""
Write-Host "  The investigations folder is a central workspace for ticket investigation files"
Write-Host "  (notes, queries, dev notes, error logs). It lives outside any project repo so"
Write-Host "  cross-repo tickets share one place and is never accidentally committed."
Write-Host ""

$invDefault = "$env:USERPROFILE\workspace\ambs-investigations"
$invInput = Read-Host "  Where should the investigations folder live? [$invDefault]"
$invRoot = if ($invInput.Trim() -eq '') { $invDefault } else { $invInput.Trim() }

if (Test-Path $invRoot) {
    Write-Host "    $invRoot already exists, skipping creation"
} else {
    New-Item -ItemType Directory -Path $invRoot | Out-Null
    Write-Host "    created $invRoot"
}

Set-EnvValue $envFile 'INVESTIGATIONS_ROOT' $invRoot
Write-Host "    wrote INVESTIGATIONS_ROOT to .env"

# 5. Configure Copilot permissions for investigations folder
Write-Host "=> Configuring Copilot permissions for investigations folder..."
node "$dir\scripts\setup-permissions.js" $invRoot

Write-Host ""
Write-Host "Done. Next steps:"
Write-Host "  1. Open ambs-toolkit\.env and fill in your credentials:"
Write-Host "     JIRA_USER_EMAIL -> your.email@ascendlearning.com"
Write-Host "     JIRA_API_TOKEN  -> Jira > Profile > Security > API Token"
Write-Host "     GITLAB_TOKEN    -> GitLab > User > Preferences > Access Tokens"
Write-Host "  2. Open GitHub Copilot -- skills are ready to use"
