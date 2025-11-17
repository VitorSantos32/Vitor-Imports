window._vwo_code = window._vwo_code || (function() {

          var account_id = 752933;
          var version = 1.5;
          var settings_tolerance = 2000;
          var library_tolerance = 2500;
          var use_existing_jquery = false;
          var is_spa = 1;
          var hide_element = 'body';
          var hide_element_style = '';

          /* DO NOT EDIT BELOW THIS LINE */
          var f = false;
          var w = window;
          var d = document;
          var vwoCodeEl = d.querySelector('#vwoCode');

          var code = {
              use_existing_jquery: function() {
                  return use_existing_jquery;
              },
              library_tolerance: function() {
                  return library_tolerance;
              },
              hide_element_style: function() {
                  return '{' + hide_element_style + '}';
              },
              finish: function() {
                  if (!f) {
                      f = true;
                      var e = d.getElementById('_vis_opt_path_hides');
                      if (e) e.parentNode.removeChild(e);
                  }
              },
              finished: function() {
                  return f;
              },
              load: function(e) {
                  var t = d.createElement('script');
                  t.fetchPriority = 'high';
                  t.src = e;
                  t.type = 'text/javascript';
                  t.onerror = function() {
                      _vwo_code.finish();
                  };
                  d.getElementsByTagName('head')[0].appendChild(t);
              },
              getVersion: function() {
                  return version;
              },
              getMatchedCookies: function(e) {
                  var t = [];
                  if (document.cookie) {
                      t = document.cookie.match(e) || [];
                  }
                  return t;
              },
              getCombinationCookie: function() {
                  var e = code.getMatchedCookies(/(?:^|;)\s?(_vis_opt_exp_\d+_combi=[^;$]*)/gi);
                  e = e.map(function(e) {
                      try {
                          var t = decodeURIComponent(e);
                          if (!/_vis_opt_exp_\d+_combi=(?:\d+,?)+\s*$/.test(t)) {
                              return '';
                          }
                          return t;
                      } catch (e) {
                          return '';
                      }
                  });
                  var i = [];
                  e.forEach(function(e) {
                      var t = e.match(/([\d,]+)/g);
                      if (t) i.push(t.join('-'));
                  });
                  return i.join('|');
              },
              init: function() {
                  if (d.URL.indexOf('__vwo_disable__') > -1) return;

                  w.settings_timer = setTimeout(function() {
                      _vwo_code.finish();
                  }, settings_tolerance);

                  var e = d.currentScript;
                  var t = d.createElement('style');
                  var i = e && !e.async ? (hide_element ? hide_element + '{' + hide_element_style + '}' : '') : code.lA = 1;
                  var n = d.getElementsByTagName('head')[0];

                  t.setAttribute('id', '_vis_opt_path_hides');
                  vwoCodeEl && t.setAttribute('nonce', vwoCodeEl.nonce);
                  t.setAttribute('type', 'text/css');

                  if (t.styleSheet) t.styleSheet.cssText = i;
                  else t.appendChild(d.createTextNode(i));
                  n.appendChild(t);

                  var o = this.getCombinationCookie();
                  this.load('https://dev.visualwebsiteoptimizer.com/j.php?a=' + account_id + '&u=' + encodeURIComponent(d.URL) + '&f=' + is_spa + '&vn=' + version + (o ? '&c=' + o : ''));
                  return settings_timer;
              }
          };

          w._vwo_settings_timer = code.init();
          return code;
      })();