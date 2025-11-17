jQuery(document).ready(function(){
	
			// Coloca a classe banner + nÃƒÂºmero
			jQuery("#responsiveBanner > div").each(function(index){
				jQuery(this).addClass('box');
				jQuery(this).addClass('banner'+(index+1));
			});
			
			// Remove os styles inline
			jQuery("#responsiveBanner > div").removeAttr("style"); 
			
			// Adiciona id para o primeiro style css
			jQuery('style:first-of-type').attr('id', 'geral');
	
			// ExpressÃƒÂ£o regular para capturar qualquer @media com height e width
			const regex = /@media\s*\(height:\d+px\)\s*and\s*\(width:\d+px\)\s*{/g;

			// Substitui todas as ocorrÃƒÂªncias que correspondem ao regex
			jQuery("style#geral").html(jQuery("style#geral").html().replace(regex, ''));

	
			// Remove alguns parametros 
			jQuery("style#geral").html(jQuery("style#geral").html().replace('animation:undefined 0ms 0ms ease 1 both;}}','animation:undefined 0ms 0ms ease 1 both;}'));
			jQuery("style#geral").html(jQuery("style#geral").html().replace(/display:block!important;/g,'display:block;'));
			
			// Insere a div wrapper
			jQuery('#responsiveBanner').wrapAll('<div id="container"></div>');
	
			// Insere a div wrapper
			jQuery('#responsiveBanner .banner1 > div').wrapAll('<div class="wrapper"></div>');
			jQuery('#responsiveBanner .banner2 > div').wrapAll('<div class="wrapper"></div>');
			jQuery('#responsiveBanner .banner3 > div').wrapAll('<div class="wrapper"></div>');
			jQuery('#responsiveBanner .banner4 > div').wrapAll('<div class="wrapper"></div>');
			jQuery('#responsiveBanner .banner5 > div').wrapAll('<div class="wrapper"></div>');
	
			// Adiciona a classe no bg para esconder
			jQuery('.bgresponsive').next('.js-bnfy').addClass('bgcor');
			
			// Tira o bgresponsive fora da div wrapper
			jQuery('.bgresponsive').each(function() {
				jQuery(this).parent().after(this);
			});
	
	
	
			// Pega a imagem do bgresponsive e coloca como background do body
            function updateBackground() {
				jQuery('#responsiveBanner .box:visible').each(function() {
					var imageUrl = jQuery(this).find('.bgresponsive img').attr('src');
					if (imageUrl) {
						jQuery('body').css({
							'background': 'url(' + imageUrl + ') no-repeat center top',
							'background-size': 'cover'
						});
					}
				});
			}

			// Atualiza o background inicialmente
			updateBackground();

			// Ao recarregar a pÃƒÂ¡gina atualizar o background ativo
			jQuery(window).ready(function() {
				updateBackground();
			});

			// Monitora mudanÃƒÂ§as na janela para atualizar o background
			jQuery(window).resize(function() {
				updateBackground();
			});
        
			
			// Esconde as imagens
			jQuery(".bgresponsive img").css("display", "none");
			jQuery(".bgcor img").css("display", "none");
	
			// Responsive scaled
			function makeResizable(element){
				if (element && jQuery(element).length){
					var jQueryel = jQuery(element);
					var elHeight = jQueryel.outerHeight();
					var elWidth = jQueryel.outerWidth();

					var jQuerywrapper = jQueryel.parent();

					var starterData = {
						size: {
							width: jQuerywrapper.width(),
							height: jQuerywrapper.height()
						}
					}
					var scale = Math.min(
						starterData.size.width / jQueryel.outerWidth(),
						starterData.size.height / jQueryel.outerHeight()
					);
					if (scale > 1){
						scale = 1;
					}
					var elMarginBottom = (scale * elHeight) - starterData.size.height;
					jQueryel.css({
						transform: "translate3d(0, 0, 0) " + "scale(" + scale + ")",
						//transform: "translate3d(-50%, 0, 0) " + "scale(" + scale + ")",
						//'margin-bottom': elMarginBottom
					});
				}
			}
			jQuery(document).ready(function() {
				makeResizable('#container');
			});
			jQuery(window).load(function() {
			//	makeResizable('#container');
			});
			jQuery(window).resize(function() {
				makeResizable('#container');
			});
	
			// Seleciona a quantidade de banners para fazer a media query
			var filhos = jQuery('#responsiveBanner');

			if(filhos.children().length == 1) {
				filhos.addClass('item1');
			} else if (filhos.children().length == 2) {
				filhos.addClass('item2');
			} else if (filhos.children().length == 3) {
				filhos.addClass('item3');
			} else {
				filhos.addClass('item4');
			}	
	
			// Adiciona a class para App
			var section = jQuery('.box');
			var classgeral = jQuery('#responsiveBanner');
	
			var width = section.width();
			if (width == 300)
				classgeral.addClass('app');
	
			// Adiciona a class para Sticky
			var section = jQuery('.box');
			var classgeral = jQuery('#responsiveBanner');
	
			var width = section.width();
			if (width == 320)
				classgeral.addClass('sticky');
	
			// Adiciona a class para Leaderboard
			var section2 = jQuery('.box');
			var classgeral2 = jQuery('#responsiveBanner');
	
			var width2 = section2.width();
			if (width2 == 728)
				classgeral2.addClass('leaderboard');
	
			// Adiciona a class para interstitial
			var section3 = jQuery('.box:nth-child(2)');
			var classgeral3 = jQuery('#responsiveBanner');
			var section3b = jQuery('.box:nth-child(1)'); 

			var width3 = section3.width();
			var width3b = section3b.width(); 

			if (width3 == 1500 && width3b == 300) {
				classgeral3.addClass('interstitial');
			}
	
	
	
	
});




