$projectRoot = $PSScriptRoot
$outputRoot = Join-Path $projectRoot "dist"
$coreSource = Join-Path $projectRoot "game-core\combat.js"

if (-not (Test-Path -LiteralPath $coreSource -PathType Leaf)) {
  throw "Game core is missing: $coreSource"
}

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $outputRoot "src") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $outputRoot "game-core") | Out-Null

Copy-Item -LiteralPath (Join-Path $projectRoot "index.html") -Destination $outputRoot -Force
Copy-Item -LiteralPath (Join-Path $projectRoot "styles.css") -Destination $outputRoot -Force
Copy-Item -LiteralPath (Join-Path $projectRoot "screens.css") -Destination $outputRoot -Force
Copy-Item -LiteralPath (Join-Path $projectRoot "src\main.js") -Destination (Join-Path $outputRoot "src") -Force
Copy-Item -LiteralPath (Join-Path $projectRoot "content") -Destination $outputRoot -Recurse -Force
Copy-Item -LiteralPath $coreSource -Destination (Join-Path $outputRoot "game-core\combat.js") -Force

Write-Output "Static game files assembled in $outputRoot"
