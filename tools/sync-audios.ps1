param([switch]$Force)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content (Join-Path $root 'data/import/audio-sources-floor-1.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$out = Join-Path $root 'obras/audios'
New-Item -ItemType Directory -Path $out -Force | Out-Null
$downloaded = @(); $ignored = @(); $failed = @()

function Get-DriveFileId($source) {
  if (!$source -or $source -match '/folders/') { return $null }
  if ($source -match '/file/d/([^/?#]+)') { return $Matches[1] }
  if ($source -match '[?&]id=([^&#]+)') { return $Matches[1] }
  return $null
}
function Get-AudioExtension([byte[]]$bytes, [string]$contentType, [string]$fileName) {
  if ($bytes.Length -lt 12) { return $null }
  $head = [Text.Encoding]::ASCII.GetString($bytes, 0, [Math]::Min($bytes.Length, 16))
  if ($head.StartsWith('ID3') -or ($bytes[0] -eq 255 -and ($bytes[1] -band 224) -eq 224 -and ($bytes[1] -band 6) -ne 0)) { return '.mp3' }
  if ($head.StartsWith('RIFF') -and [Text.Encoding]::ASCII.GetString($bytes, 8, 4) -eq 'WAVE') { return '.wav' }
  if ($head.StartsWith('OggS')) { if ($fileName -match '(?i)\.oga$') { return '.oga' }; return '.ogg' }
  if ($head.StartsWith('fLaC')) { return '.flac' }
  if ($bytes[0] -eq 26 -and $bytes[1] -eq 69 -and $bytes[2] -eq 223 -and $bytes[3] -eq 163 -and $contentType -match '^audio/webm') { return '.webm' }
  if ([Text.Encoding]::ASCII.GetString($bytes, 4, 4) -eq 'ftyp') {
    $brand = [Text.Encoding]::ASCII.GetString($bytes, 8, 4)
    if ($brand -match '^(M4A |M4B |M4P |isom|iso2|mp41|mp42|3gp4)$' -and [Text.Encoding]::ASCII.GetString($bytes) -match 'soun') { return '.m4a' }

  }
  if ($bytes[0] -eq 255 -and ($bytes[1] -band 246) -eq 240) { return '.aac' }
  if ($head.StartsWith('FORM') -and [Text.Encoding]::ASCII.GetString($bytes, 8, 4) -match '^(AIFF|AIFC)$') { return '.aiff' }
  return $null
}

Add-Type -AssemblyName System.Net.Http
$handler = New-Object Net.Http.HttpClientHandler
$handler.AllowAutoRedirect = $true
$client = New-Object Net.Http.HttpClient($handler)
$client.Timeout = [TimeSpan]::FromSeconds(45)
$client.DefaultRequestHeaders.UserAgent.ParseAdd('Mozilla/5.0')
try {
  foreach ($item in $manifest.sources) {
    $id = [int]$item.id
    $number = $id.ToString('000')
    $fileId = Get-DriveFileId $item.source
    if (!$fileId -or ($item.driveFileId -and $item.driveFileId -ne $fileId)) { $ignored += "$number link inválido/ausente"; continue }
    $existing = @(Get-ChildItem -LiteralPath $out -File | Where-Object BaseName -eq $number)
    $validExisting = @($existing | Where-Object {
      $bytes = [IO.File]::ReadAllBytes($_.FullName)
      $detected = Get-AudioExtension $bytes '' $_.Name
      $detected -and $detected -eq $_.Extension.ToLowerInvariant()
    })
    if ($validExisting.Count -and !$Force) { $ignored += "$number existente valido"; continue }
    try {
      $url = "https://drive.usercontent.google.com/download?id=$fileId&export=download&confirm=t"
      $response = $client.GetAsync($url).GetAwaiter().GetResult()
      try {
        if (!$response.IsSuccessStatusCode) { throw "HTTP $([int]$response.StatusCode)" }
        $bytes = $response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
        $type = if ($response.Content.Headers.ContentType) { $response.Content.Headers.ContentType.MediaType } else { '' }
        $fileName = if ($response.Content.Headers.ContentDisposition) { $response.Content.Headers.ContentDisposition.FileName.Trim('"') } else { '' }
        $extension = Get-AudioExtension $bytes $type $fileName
        if (!$extension) { throw "conteúdo não é áudio reconhecido ($type)" }
        $target = Join-Path $out ($number + $extension)
        [IO.File]::WriteAllBytes($target, $bytes)
        $existing | Where-Object FullName -ne $target | Remove-Item -Force
        $downloaded += "$number $extension"
      } finally { $response.Dispose() }
    } catch { $failed += "$number $($_.Exception.Message)" }
  }
} finally { $client.Dispose(); $handler.Dispose() }
"BAIXADOS ($($downloaded.Count))"; $downloaded | ForEach-Object { "  $_" }
"IGNORADOS ($($ignored.Count))"; $ignored | ForEach-Object { "  $_" }
"FALHAS ($($failed.Count))"; $failed | ForEach-Object { "  $_" }
