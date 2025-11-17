Quick usage (after running the scraper):

1) Generate the mapping and images list

Set-Location -Path C:\Users\Administrator\Downloads\vs\tools
.\generate-maps.ps1

This creates:
- output\url-map.json        (JSON: remoteUrl -> tools/output/resources/<host>/<path>)
- output\images-list.txt    (one image URL per line)
- output\summary.txt        (counts and quick summary)

2) Preview mapping
Get-Content .\output\url-map.json | Out-String -Width 4096

3) Replace remote URLs in your local files (creates .bak backups)
.\replace-urls.ps1

Notes:
- `replace-urls.ps1` will update `index.html` and files under `js/` and `css/` in repository root.
- Backup files are created with `.bak` extension.
- Verify the site locally after changes; you may prefer to only replace image URLs instead of all resources.

If you want me to run the replacements automatically here, confirm and I will update the project files (`index.html`, `js/app.js`, etc.). Otherwise run the scripts locally and tell me the results.