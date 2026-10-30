/* Lala Ayen Global Plaza: automatic website translator (Google Translate website widget, free, no key).
   The chosen language is remembered across every page. English is the default; nothing extra loads for English. */
(function(){
  'use strict';
  var LANGS=[['en','English'],['es','Español'],['fr','Français'],['tl','Filipino / Tagalog'],['pt','Português'],['ja','日本語'],['zh-CN','中文 (简体)'],['ko','한국어'],['ar','العربية'],['de','Deutsch'],['it','Italiano'],['hi','हिन्दी'],['id','Bahasa Indonesia'],['vi','Tiếng Việt']];
  var KEY='lala_lang';
  function saved(){try{return localStorage.getItem(KEY)||'';}catch(e){return '';}}
  function cookieLang(){var m=document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]*\/([^;]+)/);return m?decodeURIComponent(m[1]):'';}
  function setCookie(v){
    var host=location.hostname,base=host.replace(/^www\./,'');
    var exp=v?'; max-age=31536000':'; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    var val=v?'/en/'+v:'';
    document.cookie='googtrans='+val+'; path=/'+exp;
    if(base.indexOf('.')>0)document.cookie='googtrans='+val+'; path=/; domain=.'+base+exp;
  }
  var current=saved()||cookieLang()||'en';
  if(current!=='en'&&cookieLang()!==current)setCookie(current);
  function choose(v){try{localStorage.setItem(KEY,v);}catch(e){}setCookie(v==='en'?'':v);location.reload();}
  function build(){
    var host=document.querySelector('.topbar-actions')||document.querySelector('.site-account-actions');
    if(!host||document.getElementById('lt-lang'))return;
    var s=document.createElement('select');s.id='lt-lang';s.className='lt-lang notranslate';s.setAttribute('aria-label','Language');s.title='Translate this website';
    LANGS.forEach(function(l){s.appendChild(new Option('🌐 '+l[1],l[0]));});
    s.value=LANGS.some(function(l){return l[0]===current;})?current:'en';
    s.addEventListener('change',function(){choose(s.value);});
    host.insertBefore(s,host.firstChild);
    if(current!=='en'){
      var box=document.createElement('div');box.id='google_translate_element';box.style.display='none';document.body.appendChild(box);
      window.lalaTranslateInit=function(){try{new window.google.translate.TranslateElement({pageLanguage:'en',autoDisplay:false},'google_translate_element');}catch(e){}};
      var sc=document.createElement('script');sc.src='https://translate.google.com/translate_a/element.js?cb=lalaTranslateInit';sc.async=true;document.head.appendChild(sc);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
