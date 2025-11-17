const products = [
  { id: 1, name: 'Camisa Linho', price: 89.9, img: 'assets/camisa-linho.jpg' },
  { id: 2, name: 'Camisa Preta', price: 79.9, img: 'assets/camisa-preta.jpg' }
];

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
      <img src="${p.img}" alt="${p.name}">
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
      <img src="${i.img}" alt="${i.name}">
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

// Observe DOM and replace external images/backgrounds with local assets
(function(){
  'use strict';
  try{
    const EXTERNAL_PATTERNS = ['static.zattini.com.br','static.netshoes.com.br','zattini-share.png','google-analytics.com','googletagmanager.com','hotjar.com'];
    const localProducts = ['assets/camisa-linho.jpg','assets/camisa-preta.jpg'];
    const placeholder = 'assets/placeholder.svg';
    const logo = 'assets/logo.png';
    let prodIndex = 0;

    function replaceIfExternal(img){
      try{
        if(!img || !(img instanceof HTMLImageElement)) return;
        const src = img.getAttribute('src') || '';
        const lower = src.toLowerCase();
        if(!src) return;
        if(EXTERNAL_PATTERNS.some(p => lower.includes(p)) || /https?:\/\//.test(src) && !src.startsWith(location.origin)){
          if(lower.includes('logo') || lower.includes('favicon')){
            img.src = logo;
          } else if(lower.includes('/bnn/') || lower.includes('banner') || lower.includes('1920x50') || lower.includes('stripe')){
            img.src = placeholder;
          } else if(lower.includes('/produt') || lower.includes('/prod/') || lower.includes('/produtos/') || lower.match(/\.(jpg|jpeg|png|webp)(\?|$)/)){
            img.src = localProducts[prodIndex % localProducts.length];
            prodIndex++;
          } else {
            img.src = placeholder;
          }
          img.onerror = function(){ this.src = placeholder; };
        }
      }catch(e){console.warn('replaceIfExternal error', e)}
    }

    // Replace existing images immediately
    if(document && document.querySelectorAll){
      document.querySelectorAll('img').forEach(replaceIfExternal);
    }

    // Observe DOM mutations to catch images added later by external scripts
    if(window.MutationObserver){
      const observer = new MutationObserver((mutations)=>{
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if(node.nodeType !== 1) return;
            if(node.tagName === 'IMG'){
              replaceIfExternal(node);
            } else {
              try{
                node.querySelectorAll && node.querySelectorAll('img').forEach(replaceIfExternal);
              }catch(e){}
            }

            // Replace external background images
            try{
              const elems = node.querySelectorAll ? node.querySelectorAll('*') : [];
              elems.forEach(el => {
                try{
                  const bg = window.getComputedStyle(el).backgroundImage || '';
                  if(bg && EXTERNAL_PATTERNS.some(p => bg.includes(p))){
                    el.style.backgroundImage = `url(${placeholder})`;
                  }
                }catch(e){}
              });
            }catch(e){}
          });
        });
      });
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }
  }catch(e){ console.warn('image replacement bootstrap failed', e); }
})();