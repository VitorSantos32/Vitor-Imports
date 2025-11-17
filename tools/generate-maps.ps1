# generate-maps.ps1
# Gera `url-map.json` e `images-list.txt` a partir de `output/resources.json`.
# Uso: execute na pasta `tools` (PowerShell):
#   Set-Location -Path .\tools
#   .\generate-maps.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$resFile = Join-Path $root 'output\resources.json'
$outDir = Join-Path $root 'output'
$resourcesDir = Join-Path $outDir 'resources'

if(-not (Test-Path $resFile)){
  Write-Error "Arquivo não encontrado: $resFile"
  exit 1
}

$json = Get-Content $resFile -Raw | ConvertFrom-Json

# Keys we will process
$keys = @('observed','css','js','images','preloads','links')

$map = @{}
$images = @()

foreach($k in $keys){
  $arr = $json.resources.$k
  if(-not $arr){ continue }
  foreach($u in $arr){
    if(-not $u){ continue }
    try{
      $uri = [uri]$u
      $host = $uri.Host
      $path = $uri.AbsolutePath.TrimStart('/')
      if([string]::IsNullOrEmpty($path)) { $path = 'root' }
      # Local path where downloader saved files: output/resources/<host>/<path>
      $localPath = Join-Path $resourcesDir (Join-Path $host $path)
      # Normalize to forward slashes for use in HTML
      $relativeForHtml = "tools/output/resources/" + ($host + '/' + $path).TrimStart('/')
      $map[$u] = $relativeForHtml
      if($k -eq 'images'){
        $images += $u
      }
    }catch{
      # Not a valid URL (data: or others) - keep original
      $map[$u] = $u
      if($k -eq 'images'){ $images += $u }
    }
  }
}

# Save outputs
$mapOut = Join-Path $outDir 'url-map.json'
$imagesOut = Join-Path $outDir 'images-list.txt'
$summaryOut = Join-Path $outDir 'summary.txt'

$map | ConvertTo-Json -Depth 4 | Out-File -FilePath $mapOut -Encoding utf8
$images | Out-File -FilePath $imagesOut -Encoding utf8

# Summary
$summary = @()
$summary += "Resource summary for: $($json.url)"
$summary += "Timestamp: $($json.timestamp)"
$summary += ""
foreach($k in $keys){
  $count = 0
  if($json.resources.$k){ $count = ($json.resources.$k).Count }
  $summary += "- $k : $count"
}
$summary += ""
$summary += "Downloaded resources folder: $resourcesDir"
$summary += "Generated files: $mapOut, $imagesOut"

$summary | Out-File -FilePath $summaryOut -Encoding utf8

Write-Output "Generated: $mapOut"
Write-Output "Generated: $imagesOut"
Write-Output "Generated: $summaryOut"
Write-Output "Done."
