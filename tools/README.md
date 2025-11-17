Scrape and package a rendered page using Puppeteer

What this does
- Opens a URL with headless Chromium (Puppeteer) and waits for network idle
- Saves the fully rendered HTML as `page.html`
- Extracts resource URLs (CSS, JS, images, preloads, links) and writes `resources.json`
- Optionally downloads all discovered resources into `resources/` and creates `site-package.zip`

Requirements
- Node.js (recommended >= 18), Git, network access

Install
Open PowerShell in `tools` and run. If you want to use the Chrome/Chromium already installed on your PC (recommended to avoid downloading a separate Chromium), set the environment variable to skip the Chromium download and install dependencies, or simply install as usual after updating `package.json` to use `puppeteer-core`.

Recommended (use existing Chrome; no large Chromium download):

```powershell
Set-Location -Path C:\Users\Administrator\Downloads\vs\tools
npm install
```

Then run the script passing the path to your chrome executable (example path shown):

```powershell
node scrape-zattini.js "https://www.zattini.com.br/camisetas/masculino/nike" --executablePath="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
```

If you prefer to explicitly skip Chromium download during install (not necessary when using `puppeteer-core`), you can set:

```powershell
$env:PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true'
npm install
```

Run
Basic usage (just render and list resources):

```powershell
node scrape-zattini.js "https://www.zattini.com.br/camisetas/masculino/nike"
```

Download resources into `output/resources`:

```powershell
node scrape-zattini.js "https://www.zattini.com.br/camisetas/masculino/nike" --download
```

Download and also create ZIP (`output/site-package.zip`):

```powershell
node scrape-zattini.js "https://www.zattini.com.br/camisetas/masculino/nike" --download --zip
```

Change output directory:

```powershell
node scrape-zattini.js "https://..." --outdir=my-output
```

Notes and caveats
- Puppeteer will download a Chromium binary during `npm install` (this is large). If you already have Chrome/Chromium installed and want to use it, modify the script to pass `executablePath` to `puppeteer.launch`.
- Some sites detect headless browsers or require login; this script may need extra headers, cookies, or slower timeouts to fully render.
- Make sure you have permission to copy/download site content.
