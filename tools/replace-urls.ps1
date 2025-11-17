# replace-urls.ps1
# Substitui URLs remotos por caminhos locais usando `output/url-map.json`.
# Faz backup dos arquivos alterados com extensão .bak
# Uso (na pasta tools):
#   Set-Location -Path .\tools
#   .\replace-urls.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$mapFile = Join-Path $root 'output\url-map.json'
if(-not (Test-Path $mapFile)){
  Write-Error "Arquivo de mapeamento não encontrado: $mapFile. Execute generate-maps.ps1 primeiro."
  exit 1
}

$map = Get-Content $mapFile -Raw | ConvertFrom-Json

# Files to process (relative to repository root)
$repoRoot = Split-Path -Parent $root  # assumes tools/ is inside repo root
$targets = @()
$targets += Join-Path $repoRoot 'index.html'

$jsDir = Join-Path $repoRoot 'js'
if(Test-Path $jsDir){
  $jsFiles = Get-ChildItem -Path $jsDir -Filter *.js -File -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
  $targets += $jsFiles
}

$cssDir = Join-Path $repoRoot 'css'
if(Test-Path $cssDir){
  $cssFiles = Get-ChildItem -Path $cssDir -Filter *.css -File -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
  $targets += $cssFiles
}

# For each file, perform replacements
foreach($file in $targets){
  if(-not (Test-Path $file)) { continue }
  Write-Output "Processing: $file"
  $content = Get-Content $file -Raw -Encoding utf8
  $origContent = $content
  foreach($pair in $map.PSObject.Properties){
    $remote = $pair.Name
    $local = $pair.Value
    # escape for regex
    $esc = [regex]::Escape($remote)
    if($content -match $esc){
      $content = $content -replace $esc, $local
    }
  }
  if($content -ne $origContent){
    Copy-Item -Path $file -Destination ($file + '.bak') -Force
    $content | Out-File -FilePath $file -Encoding utf8
    Write-Output "Updated: $file (backup: $file.bak)"
  }else{
    Write-Output "No changes for: $file"
  }
}

Write-Output "Done."
