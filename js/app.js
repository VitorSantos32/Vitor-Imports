const products = [
  { id: 1, name: 'Camisa Linho', price: 89.9, img: 'assets/camisa-linho.jpg' },
  { id: 2, name: 'Camisa Preta', price: 79.9, img: 'assets/camisa-preta.jpg' }
];

// Map external image URLs to local copies under `assets/resources/static.zattini.com.br` when available.
function localizeUrl(url){
  if(!url) return url;
  try{
    const s = String(url);
    // Match absolute URLs like https://static.zattini.com.br/...
    let m = s.match(/https?:\/\/(?:www\.)?static\.zattini\.com\.br(\/.*)/i);
    if(m) return 'assets/resources/static.zattini.com.br' + m[1];
    // Match protocol-less URLs starting with //static.zattini.com.br/...
    m = s.match(/^(?:\/\/)(?:www\.)?static\.zattini\.com\.br(\/.*)/i);
    if(m) return 'assets/resources/static.zattini.com.br' + m[1];
    return url;
  }catch(e){ return url; }
}

function rewriteAllImages(){
  try{
    if(!document.querySelectorAll) return;
    document.querySelectorAll('img').forEach(img=>{
      const src = img.getAttribute('src') || img.src || '';
      const newSrc = localizeUrl(src);
      if(newSrc && newSrc !== src){
        try{ img.src = newSrc; }catch(e){}
      }
    });
  }catch(e){}
}

// Observe DOM for newly added images and rewrite their src when necessary
try{
  if(typeof MutationObserver !== 'undefined'){
    const _imgObserver = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if(m.type === 'childList' && m.addedNodes && m.addedNodes.length){
          m.addedNodes.forEach(node => {
            if(!node) return;
            if(node.tagName === 'IMG'){
              try{ const src = node.getAttribute('src') || node.src || ''; const ns = localizeUrl(src); if(ns && ns !== src) node.src = ns; }catch(e){}
            } else if(node.querySelectorAll){
              try{ node.querySelectorAll('img').forEach(img=>{ const src = img.getAttribute('src') || img.src || ''; const ns = localizeUrl(src); if(ns && ns !== src) img.src = ns; }); }catch(e){}
            }
          });
        }
      });
    });
    if(document && document.body) _imgObserver.observe(document.body, { childList:true, subtree:true });
  }
}catch(e){}

// NOTE: Some pages (or templates) may not include the elements used
// by this script. On case-sensitive hosts (Vercel) missing elements
// can cause runtime exceptions that break the whole page. We'll
// safely initialize only when DOM is ready and required elements exist.

let cart = [];

// Elements (will be looked up on DOMContentLoaded)
let productList = null;
let cartButton = null;
let cartCount = null;
let cartModal = null;
let closeCart = null;
let cartItemsEl = null;
let cartTotalEl = null;
let checkoutBtn = null;

function formatPrice(v){
  return v.toFixed(2).replace('.', ',');
}

function renderProducts(){
  if(!productList) return;
  productList.innerHTML = '';
  products.forEach(p =>{
    const el = document.createElement('div');
    el.className = 'product';
    el.innerHTML = `
      <img src="${localizeUrl(p.img)}" alt="${p.name}">
      <h4>${p.name}</h4>
      <div class="price">R$ ${formatPrice(p.price)}</div>
      <div class="actions">
        <button class="btn" data-id="${p.id}">Adicionar</button>
      </div>
    `;
    productList.appendChild(el);
  });
  productList.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.addEventListener('click', e=>{ addToCart(parseInt(btn.dataset.id)) });
  });
}

function addToCart(id){
  const p = products.find(x=>x.id===id);
  const item = cart.find(i=>i.id===id);
  if(item) item.qty++;
  else cart.push({ id:p.id, name:p.name, price:p.price, img:p.img, qty:1 });
  saveCart();
  updateCartUI();
}

function updateCartUI(){
  if(!cartCount || !cartItemsEl || !cartTotalEl) return;
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  cartCount.textContent = totalQty;
  cartItemsEl.innerHTML = '';
  cart.forEach(i=>{
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${localizeUrl(i.img)}" alt="${i.name}">
      <div style="flex:1">
        <div>${i.name}</div>
        <div class="price">R$ ${formatPrice(i.price)}</div>
        <div>Quantidade: <button data-op="-" data-id="${i.id}">-</button>
        <strong>${i.qty}</strong>
        <button data-op="+" data-id="${i.id}">+</button></div>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });
  cartItemsEl.querySelectorAll('button[data-op]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = parseInt(b.dataset.id);
      const op = b.dataset.op;
      const item = cart.find(x=>x.id===id);
      if(!item) return;
      if(op==='+') item.qty++;
      else item.qty--;
      if(item.qty<=0) cart = cart.filter(x=>x.id!==id);
      saveCart(); updateCartUI();
    });
  });
  const total = cart.reduce((s,i)=>s + i.price * i.qty,0);
  cartTotalEl.textContent = formatPrice(total);
}

function saveCart(){ try{ localStorage.setItem('lojara_cart', JSON.stringify(cart)); }catch(e){} }
function loadCart(){ try{ return JSON.parse(localStorage.getItem('lojara_cart'))||[] }catch(e){return []} }

// Safe initialization after DOM ready
function initApp(){
  productList = document.getElementById('product-list');
  cartButton = document.getElementById('cart-button');
  cartCount = document.getElementById('cart-count');
  cartModal = document.getElementById('cart-modal');
  closeCart = document.getElementById('close-cart');
  cartItemsEl = document.getElementById('cart-items');
  cartTotalEl = document.getElementById('cart-total');
  checkoutBtn = document.getElementById('checkout');

  cart = loadCart();

  // Rewrite any existing <img> elements to use local copies when available
  try{ rewriteAllImages(); }catch(e){}

  // Render only if productList exists
  try{
    renderProducts();
    updateCartUI();
  }catch(e){
    console.warn('Erro ao renderizar produtos/cart UI:', e);
  }

  if(cartButton && cartModal){
    cartButton.addEventListener('click', ()=>{ cartModal.setAttribute('aria-hidden','false'); });
  }
  if(closeCart && cartModal){
    closeCart.addEventListener('click', ()=>{ cartModal.setAttribute('aria-hidden','true'); });
  }
  if(cartModal){
    cartModal.addEventListener('click', (e)=>{ if(e.target===cartModal) cartModal.setAttribute('aria-hidden','true'); });
  }

  if(checkoutBtn){
    checkoutBtn.addEventListener('click', ()=>{
      if(cart.length===0){ alert('Seu carrinho está vazio.'); return }
      alert('Obrigado pela compra! (simulação)');
      cart = [];
      saveCart(); updateCartUI();
      if(cartModal) cartModal.setAttribute('aria-hidden','true');
    });
  }

  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', e=>{
      e.preventDefault();
      alert('Mensagem enviada! (simulação)');
      e.target.reset();
    });
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// --- Inject custom logo into pages that use .logo__image (e.g. Zattini template)
(function(){
  'use strict';
  
  // Try multiple possible paths
  const LOGO_PATHS = [
    'assets/logo.png',
    './assets/logo.png',
    '/assets/logo.png',
    'logo.png',
    './logo.png'
  ];
  
  let logoInserted = false;
  let currentLogoPath = null;
  
  function testImagePath(path, callback){
    const tester = new Image();
    tester.onload = function(){ callback(true, path); };
    tester.onerror = function(){ callback(false, path); };
    tester.src = path;
  }
  
  function findValidLogoPath(callback){
    let index = 0;
    function tryNext(){
      if(index >= LOGO_PATHS.length){
        console.warn('Nenhuma logo encontrada nos caminhos testados');
        callback(null);
        return;
      }
      const path = LOGO_PATHS[index];
      testImagePath(path, function(success, testedPath){
        if(success){
          callback(testedPath);
        } else {
          index++;
          tryNext();
        }
      });
    }
    tryNext();
  }
  
  function forceLogoReplacement(){
    const containers = document.querySelectorAll('.logo__image');
    if(containers.length === 0) return false;
    
    // If we already inserted the logo and it's still there, don't replace
    containers.forEach(container => {
      const existingImg = container.querySelector('img[data-custom-logo="true"]');
      if(existingImg && existingImg.complete && existingImg.naturalHeight > 0){
        return; // Logo already there and loaded
      }
      
      // Remove all existing content (SVG, text, etc.) except our custom logo
      const customLogo = container.querySelector('img[data-custom-logo="true"]');
      container.innerHTML = '';
      if(customLogo){
        container.appendChild(customLogo);
        return;
      }
      
      // Remove any background images
      container.style.backgroundImage = 'none';
      container.style.background = 'none';
      
      // If we don't have a valid path yet, find one
      if(!currentLogoPath){
        findValidLogoPath(function(path){
          if(path){
            currentLogoPath = path;
            insertLogo(container, path);
          } else {
            // Show placeholder if logo not found
            container.innerHTML = '<span style="color:#fff;font-weight:bold;">LOGO</span>';
          }
        });
      } else {
        insertLogo(container, currentLogoPath);
      }
    });
    
    return true;
  }
  
  function insertLogo(container, path){
    // Check if logo already exists
    const existing = container.querySelector('img[data-custom-logo="true"]');
    if(existing && existing.src.includes('logo.png')){
      return; // Already inserted
    }
    
    // Create and insert our logo
    const img = document.createElement('img');
    img.src = path;
    img.alt = 'Logo';
    img.setAttribute('data-custom-logo', 'true');
    img.style.maxHeight = '56px';
    img.style.width = 'auto';
    img.style.display = 'block';
    img.style.margin = '0';
    img.style.padding = '0';
    img.style.visibility = 'visible';
    img.style.opacity = '1';
    
    // Add error handling
    img.onerror = function(){
      console.warn('Erro ao carregar logo de:', path);
      this.style.display = 'none';
      // Try next path
      const currentIndex = LOGO_PATHS.indexOf(path);
      if(currentIndex < LOGO_PATHS.length - 1){
        currentLogoPath = null;
        forceLogoReplacement();
      }
    };
    
    img.onload = function(){
      console.log('Logo carregada com sucesso de:', path);
      logoInserted = true;
      this.style.display = 'block';
    };
    
    container.appendChild(img);
    logoInserted = true;
  }
  
  // Try immediately
  function startReplacement(){
    forceLogoReplacement();
    
    // Keep trying periodically to catch dynamic updates
    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(()=>{
      attempts++;
      forceLogoReplacement();
      if(logoInserted && attempts > 10){
        clearInterval(interval);
        // Continue monitoring but less frequently
        setInterval(forceLogoReplacement, 3000);
      } else if(attempts >= maxAttempts){
        clearInterval(interval);
      }
    }, 200);
  }
  
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', startReplacement);
  } else {
    startReplacement();
  }
  
  // Also watch for DOM mutations, but be careful not to remove our logo
  const observer = new MutationObserver((mutations)=>{
    let shouldReplace = false;
    mutations.forEach(mutation => {
      if(mutation.type === 'childList'){
        mutation.addedNodes.forEach(node => {
          if(node.nodeType === 1 && node.classList && node.classList.contains('logo__image')){
            shouldReplace = true;
          }
        });
        mutation.removedNodes.forEach(node => {
          if(node.nodeType === 1 && node.getAttribute && node.getAttribute('data-custom-logo') === 'true'){
            shouldReplace = true;
          }
        });
      }
    });
    if(shouldReplace){
      setTimeout(forceLogoReplacement, 100);
    }
  });
  
  if(document.body){
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
    document.addEventListener('DOMContentLoaded', ()=>{
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }
})();

// --- Protect banner and product list from being replaced by Vue.js search
(function(){
  'use strict';
  
  let bannerBackup = null;
  let productListBackup = null;
  let searchContentBackup = null;
  let isProtecting = false;
  
  // Function to save the current banner and product list content
  function saveBannerContent(){
    // Try to find banner elements
    const bannerFull = document.querySelector('.banner-full');
    const bannerStripe = document.querySelector('.banner-stripe, .stripe');
    const productList = document.querySelector('.product-list, .product-list__items, .search__content__list');
    const searchContent = document.querySelector('.search__content');
    
    // Save banner (prefer banner-full, fallback to stripe)
    if(bannerFull && bannerFull.children.length > 0){
      bannerBackup = bannerFull.cloneNode(true);
    } else if(bannerStripe && bannerStripe.children.length > 0 && !bannerBackup){
      bannerBackup = bannerStripe.cloneNode(true);
    }
    
    // Save product list
    if(productList && productList.children.length > 0){
      productListBackup = productList.cloneNode(true);
    }
    
    // Save search content as fallback
    if(searchContent && searchContent.children.length > 0 && !searchContentBackup){
      searchContentBackup = searchContent.cloneNode(true);
    }
  }
  
  // Function to check if "no results" message is showing
  function hasNoResultsMessage(){
    const allElements = document.querySelectorAll('*');
    for(let el of allElements){
      const text = (el.textContent || '').toUpperCase();
      if(text.includes('NÃO FOI POSSÍVEL ENCONTRAR') || 
         text.includes('NÃO FOI POSSIVEL ENCONTRAR') ||
         text.includes('VERIFIQUE SE VOCÊ DIGITOU') ||
         text.includes('VERIFIQUE SE VOCE DIGITOU') ||
         (text.includes('DICAS') && text.includes('DIGITAÇÃO'))){
        return true;
      }
    }
    return false;
  }
  
  // Function to restore banner and product list if they were removed
  function restoreBannerContent(){
    if(isProtecting) return;
    isProtecting = true;
    
    // Check if "não foi possível encontrar resultados" message is showing
    const hasNoResults = hasNoResultsMessage();
    
    // Always check if banner/product list exists, not just when no results
    const bannerFull = document.querySelector('.banner-full');
    const bannerStripe = document.querySelector('.banner-stripe, .stripe');
    const productList = document.querySelector('.product-list, .product-list__items, .search__content__list');
    const searchContent = document.querySelector('.search__content');
    
    // If no results message is showing or content is missing, restore
    if(hasNoResults || !bannerFull || !productList){
      // Restore banner if it was removed or empty
      if(bannerBackup){
        const currentBanner = bannerFull || bannerStripe;
        if(!currentBanner || currentBanner.children.length === 0 || hasNoResults){
          const parent = currentBanner ? currentBanner.parentNode : document.querySelector('.banners-wrapper, .search-wrapper, main');
          if(parent && bannerBackup){
            try {
              const existing = parent.querySelector('.banner-full, .banner-stripe, .stripe');
              if(existing && (existing.children.length === 0 || hasNoResults)){
                existing.replaceWith(bannerBackup.cloneNode(true));
              } else if(!existing){
                parent.insertBefore(bannerBackup.cloneNode(true), parent.firstChild);
              }
            } catch(e){
              console.warn('Erro ao restaurar banner:', e);
            }
          }
        }
      }
      
      // Restore product list if it was removed or empty
      if(productListBackup){
        const currentList = productList;
        if(!currentList || currentList.children.length === 0 || hasNoResults){
          const parent = currentList ? currentList.parentNode : document.querySelector('.search__content, main');
          if(parent && productListBackup){
            try {
              const existing = parent.querySelector('.product-list, .product-list__items, .search__content__list');
              if(existing && (existing.children.length === 0 || hasNoResults)){
                existing.replaceWith(productListBackup.cloneNode(true));
              } else if(!existing){
                parent.appendChild(productListBackup.cloneNode(true));
              }
            } catch(e){
              console.warn('Erro ao restaurar lista de produtos:', e);
            }
          }
        }
      }
      
      // Hide or remove the "no results" message
      if(hasNoResults){
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const text = (el.textContent || '').toUpperCase();
          if((text.includes('NÃO FOI POSSÍVEL ENCONTRAR') || 
              text.includes('NÃO FOI POSSIVEL ENCONTRAR') ||
              text.includes('VERIFIQUE SE VOCÊ DIGITOU') ||
              text.includes('VERIFIQUE SE VOCE DIGITOU')) &&
             el.children.length <= 2){
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.height = '0';
            el.style.overflow = 'hidden';
            el.style.opacity = '0';
          }
        });
      }
    }
    
    isProtecting = false;
  }
  
  // Monitor for changes that might remove the banner
  const bannerObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if(mutation.type === 'childList'){
        // Check if banner or product list was removed
        mutation.removedNodes.forEach(node => {
          if(node.nodeType === 1){
            if(node.classList && (
              node.classList.contains('banner-full') ||
              node.classList.contains('banner-stripe') ||
              node.classList.contains('stripe') ||
              node.classList.contains('product-list') ||
              node.querySelector('.banner-full, .banner-stripe, .product-list')
            )){
              setTimeout(restoreBannerContent, 100);
            }
          }
        });
        
        // Check if "no results" message was added
        mutation.addedNodes.forEach(node => {
          if(node.nodeType === 1){
            const text = (node.textContent || '').toUpperCase();
            if(text.includes('NÃO FOI POSSÍVEL ENCONTRAR') || 
               text.includes('NÃO FOI POSSIVEL ENCONTRAR') ||
               text.includes('VERIFIQUE SE VOCÊ DIGITOU') ||
               text.includes('VERIFIQUE SE VOCE DIGITOU')){
              setTimeout(restoreBannerContent, 100);
            }
            // Also check if banner/product list was replaced
            if(node.querySelector && !node.querySelector('.banner-full, .banner-stripe, .product-list')){
              setTimeout(restoreBannerContent, 200);
            }
          }
        });
      }
    });
  });
  
  // Initialize
  function initBannerProtection(){
    // Save initial content
    setTimeout(saveBannerContent, 500);
    setTimeout(saveBannerContent, 1000);
    setTimeout(saveBannerContent, 2000);
    
    // Start monitoring
    if(document.body){
      bannerObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    
    // Periodically check and restore
    setInterval(() => {
      saveBannerContent();
      restoreBannerContent();
    }, 2000);
  }
  
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initBannerProtection);
  } else {
    initBannerProtection();
  }
})();

// Image replacement removed — keep original external images. Initialization remains safe.

// --- Diagnostic helper: image / DOM instrumentation (temporary)
// Activate by adding `?debug=images` to the page URL.
(function(){
  'use strict';
  if(!location.search || !location.search.includes('debug=images')) return;
  try{
    console.info('[debug-images] Instrumentation ativa (use ?debug=images)');

    function attachImgHandlers(img){
      if(!img || img._dbgAttached) return;
      img._dbgAttached = true;
      img.addEventListener('load', ()=>{
        console.info('[debug-images] load', img.src);
      });
      img.addEventListener('error', ()=>{
        console.error('[debug-images] error loading', img.src, img);
      });
    }

    // Attach to existing images
    document.querySelectorAll && document.querySelectorAll('img').forEach(attachImgHandlers);

    const mo = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if(m.type === 'childList'){
          m.addedNodes && m.addedNodes.forEach(node => {
            if(node.nodeType !== 1) return;
            if(node.tagName === 'IMG') attachImgHandlers(node);
            if(node.querySelectorAll) node.querySelectorAll('img').forEach(attachImgHandlers);
          });
          m.removedNodes && m.removedNodes.forEach(node => {
            if(node.nodeType !== 1) return;
            // report removed images inside the removed subtree
            const removedImgs = (node.tagName === 'IMG') ? [node] : (node.querySelectorAll ? Array.from(node.querySelectorAll('img')) : []);
            removedImgs.forEach(img => console.warn('[debug-images] removed image element', img.src, img));
            // also list scripts present when removal happened
            try{
              const scriptList = Array.from(document.scripts || []).map(s=>s.src||'[inline]');
              console.warn('[debug-images] scripts on page at removal:', scriptList);
            }catch(e){console.warn('[debug-images] unable to list scripts', e);} 
          });
        } else if(m.type === 'attributes' && m.target && m.target.tagName === 'IMG'){
          console.warn('[debug-images] img attribute changed', m.attributeName, m.target.getAttribute(m.attributeName), m.target);
        }
      });
    });

    mo.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['src','style','class'] });

    // Global resource error capture (images failing to load)
    window.addEventListener('error', function(e){
      try{
        if(e && e.target && e.target.tagName === 'IMG'){
          console.error('[debug-images] resource error event', e.target.src, e);
        }
      }catch(ee){/* ignore */}
    }, true);

    // Helpful quick command printed for convenience
    console.info('[debug-images] use `location.search += "&debug=images"` to enable on subsequent loads');
  }catch(ex){
    console.error('[debug-images] failed to initialize', ex);
  }
})();