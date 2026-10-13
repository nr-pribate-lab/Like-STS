$ErrorActionPreference = "Stop"

$projectRoot = [System.IO.Path]::GetFullPath($PSScriptRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
$outputRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "dist"))
$buildId = [guid]::NewGuid().ToString("N")
$stagingRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot ".dist-staging-$buildId"))
$backupRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot ".dist-backup-$buildId"))

function Assert-ProjectChildPath {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$ExpectedName
  )

  $fullPath = [System.IO.Path]::GetFullPath($Path)
  $parentPath = [System.IO.Path]::GetDirectoryName($fullPath).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
  $leafName = [System.IO.Path]::GetFileName($fullPath)
  if ($parentPath -ne $projectRoot -or $leafName -ne $ExpectedName) {
    throw "Refusing to modify a path outside the expected project child: $fullPath"
  }
}

function Assert-OrdinaryDirectory {
  param([Parameter(Mandatory = $true)][string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) { return }
  $item = Get-Item -LiteralPath $Path -Force
  if (-not $item.PSIsContainer -or ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
    throw "Refusing to replace a non-directory or linked output path: $Path"
  }
}

Assert-ProjectChildPath -Path $outputRoot -ExpectedName "dist"
Assert-ProjectChildPath -Path $stagingRoot -ExpectedName ([System.IO.Path]::GetFileName($stagingRoot))
Assert-ProjectChildPath -Path $backupRoot -ExpectedName ([System.IO.Path]::GetFileName($backupRoot))
Assert-OrdinaryDirectory -Path $outputRoot

$requiredFiles = @(
  "index.html",
  "styles.css",
  "screens.css",
  "src\boot.js",
  "src\main.js",
  "game-core\combat.js"
)
foreach ($relativePath in $requiredFiles) {
  $sourcePath = Join-Path $projectRoot $relativePath
  if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "Required static source file is missing: $sourcePath"
  }
}

$contentRoot = Join-Path $projectRoot "content"
if (-not (Test-Path -LiteralPath $contentRoot -PathType Container)) {
  throw "Content directory is missing: $contentRoot"
}
$contentRootItem = Get-Item -LiteralPath $contentRoot -Force
if ($contentRootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
  throw "Refusing to package a linked content directory: $contentRoot"
}

$stagingCreated = $false
$backupCreated = $false
try {
  New-Item -ItemType Directory -Path $stagingRoot | Out-Null
  $stagingCreated = $true

  foreach ($relativePath in $requiredFiles) {
    $sourcePath = Join-Path $projectRoot $relativePath
    $destinationPath = Join-Path $stagingRoot $relativePath
    $destinationDirectory = Split-Path -Parent $destinationPath
    New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
  }

  $excludedPathPattern = '[\\/](\.git|\.aws|\.codex|\.agents|node_modules)([\\/]|$)'
  $allowedContentExtensions = @(".js", ".css", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".mp3", ".ogg", ".wav", ".mp4", ".webm", ".woff", ".woff2", ".ttf", ".otf")
  $contentEntries = Get-ChildItem -LiteralPath $contentRoot -Recurse -Force
  $linkedContentEntry = $contentEntries | Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } | Select-Object -First 1
  if ($linkedContentEntry) {
    throw "Refusing to package a linked content path: $($linkedContentEntry.FullName)"
  }
  $contentFiles = $contentEntries | Where-Object { $_.PSIsContainer -eq $false } |
    Where-Object {
      $_.Name -ne "README.md" -and
      $allowedContentExtensions -contains $_.Extension.ToLowerInvariant() -and
      $_.FullName -notmatch $excludedPathPattern -and
      -not $_.Name.StartsWith(".")
    }

  foreach ($sourceFile in $contentFiles) {
    $relativePath = $sourceFile.FullName.Substring($contentRoot.Length).TrimStart([char[]]@('\', '/'))
    $destinationPath = Join-Path (Join-Path $stagingRoot "content") $relativePath
    $destinationDirectory = Split-Path -Parent $destinationPath
    New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
    Copy-Item -LiteralPath $sourceFile.FullName -Destination $destinationPath -Force
  }

  foreach ($requiredOutput in @("index.html", "content\manifest.js", "game-core\combat.js")) {
    if (-not (Test-Path -LiteralPath (Join-Path $stagingRoot $requiredOutput) -PathType Leaf)) {
      throw "Build output is missing a required file: $requiredOutput"
    }
  }

  if (Test-Path -LiteralPath $outputRoot) {
    $backupName = [System.IO.Path]::GetFileName($backupRoot)
    Move-Item -LiteralPath $outputRoot -Destination (Join-Path $projectRoot $backupName)
    $backupCreated = $true
  }

  try {
    Move-Item -LiteralPath $stagingRoot -Destination $outputRoot
    $stagingCreated = $false
  } catch {
    if ($backupCreated -and -not (Test-Path -LiteralPath $outputRoot)) {
      Move-Item -LiteralPath $backupRoot -Destination $outputRoot
      $backupCreated = $false
    }
    throw
  }

  if ($backupCreated) {
    Assert-ProjectChildPath -Path $backupRoot -ExpectedName ([System.IO.Path]::GetFileName($backupRoot))
    Assert-OrdinaryDirectory -Path $backupRoot
    Remove-Item -LiteralPath $backupRoot -Recurse -Force
    $backupCreated = $false
  }

  Write-Output "Static game files assembled in $outputRoot"
} finally {
  if ($stagingCreated -and (Test-Path -LiteralPath $stagingRoot)) {
    Assert-ProjectChildPath -Path $stagingRoot -ExpectedName ([System.IO.Path]::GetFileName($stagingRoot))
    Assert-OrdinaryDirectory -Path $stagingRoot
    Remove-Item -LiteralPath $stagingRoot -Recurse -Force
  }
}
