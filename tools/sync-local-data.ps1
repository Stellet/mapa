$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$dataDirectory = Join-Path $projectRoot "data"
$outputFile = Join-Path $dataDirectory "local-data.generated.js"
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
$entries = New-Object System.Collections.Generic.List[string]

Get-ChildItem -LiteralPath $dataDirectory -File -Filter "*.json" |
  Sort-Object Name |
  ForEach-Object {
    $raw = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
    $parsed = $raw | ConvertFrom-Json -ErrorAction Stop
    $json = $parsed | ConvertTo-Json -Depth 100 -Compress
    $key = "data/$($_.Name)" | ConvertTo-Json -Compress
    $entries.Add("  ${key}: ${json}")
  }

$content = @(
  '"use strict";'
  ''
  '// Gerado por tools/sync-local-data.ps1. Não editar manualmente.'
  'window.LOCAL_DATA = {'
  ($entries -join ",`n")
  '};'
  ''
) -join "`n"

[System.IO.File]::WriteAllText($outputFile, $content, $utf8WithoutBom)
Write-Output "Gerado: $outputFile ($($entries.Count) JSONs)"
