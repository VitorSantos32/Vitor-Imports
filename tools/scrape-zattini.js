#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const fetch = require('node-fetch');
const archiver = require('archiver');

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

async function downloadFile(url, dest){
  try{
    const res = await fetch(url, { redirect: 'follow' });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.buffer();
    ensureDir(path.dirname(dest));
    fs.writeFileSync(dest, buffer);
    return true;
  }catch(e){
    return false;
  }
}

function normalizeUrl(u, base){
  try{ return new URL(u, base).toString(); }catch(e){ return null; }
}

(async ()=>{
  const args = process.argv.slice(2);
  if(args.length === 0){
    console.log('Usage: node scrape-zattini.js <url> [--download] [--zip] [--outdir=output] [--executablePath=path]');
    process.exit(1);
  }
  const url = args[0];
  const download = args.includes('--download');
  const makeZip = args.includes('--zip');
  const outArg = args.find(a=>a.startsWith('--outdir='));
  const outdir = outArg ? outArg.split('=')[1] : 'output';
  const exeArg = args.find(a=>a.startsWith('--executablePath='));
  const executablePath = exeArg ? exeArg.split('=')[1] : null;
  ensureDir(outdir);

  const launchOptions = { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] };
  if(executablePath) launchOptions.executablePath = executablePath;
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7204.251 Safari/537.36');

  const networkUrls = new Set();
  page.on('requestfinished', req => {
    try{ networkUrls.add(req.url()); }catch(e){}
  });
  page.on('requestfailed', req => {
    try{ networkUrls.add(req.url()); }catch(e){}
  });

  console.log('Opening', url);
  try{
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  }catch(e){
    console.log('Warning: page.goto timeout or navigation failed, continuing with rendered content anyway.');
  }
  await page.waitForTimeout(2000);

  const rendered = await page.content();
  fs.writeFileSync(path.join(outdir, 'page.html'), rendered, 'utf8');
  console.log('Saved rendered HTML ->', path.join(outdir,'page.html'));

  const domResources = await page.evaluate(()=>{
    const out = {css:[], js:[], images:[], preloads:[], links:[], inlineStyleUrls:[], metas:[]};
    document.querySelectorAll('link[rel=stylesheet]').forEach(n=>n.href && out.css.push(n.href));
    document.querySelectorAll('link[rel=preload]').forEach(n=>n.href && out.preloads.push(n.href));
    document.querySelectorAll('script[src]').forEach(n=>n.src && out.js.push(n.src));
    document.querySelectorAll('img').forEach(i=>{
      if(i.src) out.images.push(i.src);
      if(i.getAttribute('srcset')){
        i.getAttribute('srcset').split(',').forEach(s=>{ const url = s.trim().split(' ')[0]; if(url) out.images.push(url); });
      }
      // data-src etc
      ['data-src','data-src-lg','data-lazy','data-original'].forEach(a=>{ if(i.dataset && i.dataset[a]) out.images.push(i.dataset[a]); if(i.getAttribute(a)) out.images.push(i.getAttribute(a)); });
    });
    document.querySelectorAll('meta[property^="og:"]').forEach(m=>m.content && out.metas.push(m.content));
    document.querySelectorAll('meta[name^="twitter:"]').forEach(m=>m.content && out.metas.push(m.content));
    // Inline style url(...) patterns
    document.querySelectorAll('[style]').forEach(el=>{
      const s = el.getAttribute('style');
      if(s && s.includes('url(')){
        const re = /url\(([^)]+)\)/g; let m;
        while((m = re.exec(s))!==null){ out.inlineStyleUrls.push(m[1].replace(/['\"]+/g,'')); }
      }
    });
    // Stylesheets with @import rules
    Array.from(document.styleSheets).forEach(ss=>{
      try{
        const rules = ss.cssRules || [];
        for(const r of rules){
          if(r && r.href) out.css.push(r.href);
          if(r && r.cssText){ const re = /@import\s+url\(([^)]+)\)/g; let mm; while((mm=re.exec(r.cssText))!==null) out.css.push(mm[1].replace(/['\"]/g,'')); }
        }
      }catch(e){}
    });
    // Links
    document.querySelectorAll('a[href]').forEach(a=>out.links.push(a.href));
    return out;
  });

  // combine with observed network requests
  const observed = Array.from(networkUrls);

  const all = { observed, ...domResources };

  // Normalize and dedupe
  function normalizeList(list){
    const set = new Set();
    for(const u of list){ try{ if(!u) continue; const nu = new URL(u, document && document.baseURI ? document.baseURI : undefined).toString(); set.add(nu);}catch(e){ try{ const nu2 = new URL(u, url).toString(); set.add(nu2);}catch(e){ /* ignore */ } } }
    return Array.from(set);
  }

  // Since page.evaluate cannot access 'url' variable, normalize later in Node
  function dedupeAndNormalize(list){
    const s = new Set();
    list.forEach(u=>{
      if(!u) return;
      try{ s.add(new URL(u, url).toString()); }catch(e){}
    });
    return Array.from(s);
  }

  const result = {
    url,
    timestamp: new Date().toISOString(),
    resources: {
      observed: dedupeAndNormalize(all.observed || []),
      css: dedupeAndNormalize(all.css || []),
      js: dedupeAndNormalize(all.js || []),
      images: dedupeAndNormalize(all.images.concat(all.metas || []).concat(all.inlineStyleUrls || [])),
      preloads: dedupeAndNormalize(all.preloads || []),
      links: dedupeAndNormalize(all.links || []),
    }
  };

  fs.writeFileSync(path.join(outdir, 'resources.json'), JSON.stringify(result, null, 2), 'utf8');
  console.log('Saved resources list ->', path.join(outdir,'resources.json'));

  if(download){
    const resourcesDir = path.join(outdir, 'resources');
    ensureDir(resourcesDir);
    const toDownload = new Set([...result.resources.observed, ...result.resources.css, ...result.resources.js, ...result.resources.images, ...result.resources.preloads]);
    console.log('Will attempt to download', toDownload.size, 'resources');
    let count = 0;
    for(const r of toDownload){
      try{
        const u = new URL(r);
        const safePath = u.hostname + u.pathname;
        const dest = path.join(resourcesDir, safePath.replace(/^\/+/, ''));
        const ok = await downloadFile(r, dest);
        if(ok) count++;
        else fs.writeFileSync(dest + '.failed.txt', `failed to download: ${r}`);
      }catch(e){ /* skip invalid */ }
    }
    console.log('Downloaded', count, 'resources to', resourcesDir);

    if(makeZip){
      const zipPath = path.join(outdir, 'site-package.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', ()=>{ console.log('ZIP created:', zipPath, archive.pointer() + ' total bytes'); });
      archive.on('warning', err=>console.warn(err));
      archive.pipe(output);
      archive.directory(resourcesDir, 'resources');
      archive.file(path.join(outdir,'page.html'), { name: 'page.html' });
      archive.file(path.join(outdir,'resources.json'), { name: 'resources.json' });
      await archive.finalize();
    }
  }

  await browser.close();
  console.log('Done. Output in', outdir);
  process.exit(0);
})();
