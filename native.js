// Runs before the game. In the native app: keeps a copy of the save in the phone's app storage (iOS and Android can
// clear web storage when space runs low), restores it if the web copy has gone, and sets up the status bar, splash,
// and the store (StoreKit on iOS, Google Play Billing on Android).
// On the web (home-screen version): registers the offline cache.
// Splash failsafe first: whatever happens below, the native splash is hidden within 10s.
(function(){try{var C=window.Capacitor;if(C&&C.isNativePlatform&&C.isNativePlatform())setTimeout(function(){try{C.Plugins.SplashScreen.hide()}catch(e){}},10000)}catch(e){}})();
(function(){try{
  var KEY='agency-empire-v2';
  var C=window.Capacitor,native=!!(C&&C.isNativePlatform&&C.isNativePlatform());
  var plat='web';
  try{if(C&&C.getPlatform)plat=C.getPlatform()}catch(e){}
  // IAP_ENABLED — the only purchase switch. Do not add a second one.
  // ios stays true (App Store). The website is not listed and keeps its simulated shop.
  // android is the ads-only launch. Leave it false until Play Billing should ship.
  // Flip android to true to bring every purchase back: shop, VIP, no-ads, diamond
  // packs, manager packs, Isla Verde, The Shark, restore, and the purchase plugin.
  // Then from aeapp/ run: npm run cap:sync:android && npm run android:patch
  // Exact steps are in aeapp/README.md under "Turn Android purchases on".
  var IAP_ENABLED={
    ios:true,
    android:false
  };
  window.IAP_ENABLED=plat==='ios'?IAP_ENABLED.ios:(plat==='android'?IAP_ENABLED.android:true);
  // iOS 26 home-screen apps can lay the page out a status bar short of the screen: if so, stretch to the real height
  var sa=(navigator.standalone||(matchMedia&&matchMedia('(display-mode: standalone)').matches));
  if(sa&&!native){var fit=function(){var H=Math.max(screen.height,screen.width)===screen.height?screen.height:screen.width;if(innerHeight<H-2&&innerWidth<innerHeight){document.documentElement.style.height=H+'px';document.body&&(document.body.style.height=H+'px');window.scrollTo(0,0)}};
    addEventListener('load',fit);addEventListener('resize',function(){setTimeout(fit,60)});document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(fit,60)})}
  window.AE_BUILD='28Oct 2026';
  // Settings shows this. The rate prompt is offered at most once for this string.
  window.AE_VER='0.31';
  // Hosted copies are not on the live site yet (privacy.html is not on main).
  // The app still knows these URLs so a future link is not a dead tap.
  window.AE_LEGAL={
    terms:'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
    privacy:'https://lockyoneill-jpg.github.io/agency-empire-play/privacy.html',
    support:'https://lockyoneill-jpg.github.io/agency-empire-play/support.html'
  };
  window.AEOpenExternal=function(href){
    if(!href)return 'ignore';
    var h=String(href);
    if(h.indexOf('mailto:')===0||h.indexOf('#')===0||h.charAt(0)==='.'||h.indexOf('javascript:')===0)return 'ignore';
    if(h==='privacy.html'||h==='support.html')return 'local';
    if(!/^https?:/i.test(h))return 'ignore';
    var bare=h.split('#')[0];
    var L=window.AE_LEGAL;
    if(bare===L.terms||bare===L.privacy||bare===L.support)return 'browser';
    return 'blocked';
  };
  window.AERouteLink=function(href, opts){
    opts=opts||{};
    var native=opts.native;
    if(native==null){var C=window.Capacitor;native=!!(C&&C.isNativePlatform&&C.isNativePlatform());}
    var kind=window.AEOpenExternal(href);
    if(!native)return {kind:kind, action:'web'};
    if(kind==='browser'){
      var plugs=opts.plugins||(window.Capacitor&&window.Capacitor.Plugins)||{};
      var B=plugs.Browser;
      if(B&&B.open){try{var p=B.open({url:String(href).split('#')[0], presentationStyle:'fullscreen'});if(p&&p.catch)p.catch(function(){});}catch(e){}return {kind:kind, action:'browser'};}
      return {kind:kind, action:'browser-missing'};
    }
    if(kind==='blocked')return {kind:kind, action:'blocked'};
    if(kind==='local')return {kind:kind, action:'overlay'};
    return {kind:kind, action:'passthrough'};
  };
  // Pure gate for the native rate prompt. The game fills `s`. Web always fails closed.
  window.AEReviewRules=function(s){
    s=s||{};
    if(!s.native)return {ok:false, why:'web'};
    if(!s.started)return {ok:false, why:'not-started'};
    if(s.hidden)return {ok:false, why:'hidden'};
    if(s.pending!=='sale'&&s.pending!=='town')return {ok:false, why:'no-event'};
    if(s.reviewFor&&s.reviewFor===s.version)return {ok:false, why:'already'};
    if((s.tut|0)<99||s.tutOn)return {ok:false, why:'tutorial'};
    if(s.sheet||s.doc)return {ok:false, why:'sheet'};
    if(s.ad||s.auc)return {ok:false, why:'busy'};
    if((s.sessions|0)<2&&(s.playMs|0)<600000)return {ok:false, why:'new'};
    var now=s.now||0;
    if(s.lastIap&&now-s.lastIap<60000)return {ok:false, why:'iap'};
    if(s.lastBuy&&now-s.lastBuy<60000)return {ok:false, why:'purchase'};
    if(s.lastAd&&now-s.lastAd<60000)return {ok:false, why:'ad'};
    return {ok:true, why:s.pending};
  };
  window.AEReviewAsk=function(s, plug, commit){
    var r=window.AEReviewRules(s);
    if(!r.ok)return r;
    if(!plug||typeof plug.requestReview!=='function')return {ok:false, why:'no-plugin'};
    try{if(commit)commit();}catch(e){return {ok:false, why:'save'};}
    try{var p=plug.requestReview();if(p&&p.catch)p.catch(function(){});}catch(e){}
    return {ok:true, why:r.why};
  };
  try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('portrait').catch(function(){})}catch(e){}
  if(!native){
    if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});
    return}
  var P=C.Plugins||{},Prefs=P.Preferences;
  try{var SB=P.StatusBar;if(SB){SB.setOverlaysWebView&&SB.setOverlaysWebView({overlay:true});SB.setStyle&&SB.setStyle({style:'DARK'})}}catch(e){}
  // Newer Android forces edge-to-edge, and the WebView often reports
  // env(safe-area-inset-top) as 0 while the status bar still covers the top.
  // The money bar uses max(env, --ae-sat). If the env inset is missing, reserve 24px.
  // iOS already supplies the env inset, so this runs on Android only.
  if(plat==='android'){
    var pinStatus=function(){
      var probe=document.createElement('div');
      probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px)';
      (document.body||document.documentElement).appendChild(probe);
      var measured=0;try{measured=parseFloat(getComputedStyle(probe).paddingTop)||0}catch(e){}
      probe.remove();
      if(measured<20)document.documentElement.style.setProperty('--ae-sat','24px');
    };
    if(document.body)pinStatus();else document.addEventListener('DOMContentLoaded',pinStatus);
  }
  // hold the splash until the office has actually painted, then a failsafe
  (function(){var gone=false;function hide(){if(gone)return;gone=true;try{P.SplashScreen&&P.SplashScreen.hide()}catch(e){}}
    var iv=setInterval(function(){var l=document.getElementById('loading');if(!l||l.hidden){clearInterval(iv);hide()}},200);
    setTimeout(hide,8000)})();
  // Purchase plugin stays out of startup when the flag is off. Android's ads-only
  // launch never loads it, so Play Billing is never initialised and nothing can
  // show "Google Play didn't answer". iOS still loads StoreKit.
  if(window.IAP_ENABLED){
    // The marker must exist before store.js picks a bridge. Loaded only in the app.
    window.CdvPurchaseCapacitor={installed:true};
    var ps=document.createElement('script');ps.src='vendor/cdv-purchase.js';ps.async=false;document.head.appendChild(ps);
  }
  // Stay inside the app. Terms, and the hosted privacy and support URLs, open in the
  // in-app browser (Safari view on iPhone, Custom Tabs on Android). Every other http(s) link is blocked.
  document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a');if(!a)return;var href=a.getAttribute('href')||'';
    var route=window.AERouteLink(href,{native:true,plugins:P});
    if(route.action==='blocked'||route.action==='browser'||route.action==='browser-missing')e.preventDefault();
  },true);
  if(!Prefs)return;
  // mirror every save into native storage
  var set=Storage.prototype.setItem,rem=Storage.prototype.removeItem;
  Storage.prototype.setItem=function(k,v){set.call(this,k,v);if(this===window.localStorage&&k===KEY){try{Prefs.set({key:KEY,value:String(v)})}catch(e){}}};
  Storage.prototype.removeItem=function(k){rem.call(this,k);if(this===window.localStorage&&k===KEY){try{Prefs.remove({key:KEY})}catch(e){}}};
  // the web copy is gone but the native one isn't: put it back and start again once
  var has=false;try{has=!!localStorage.getItem(KEY)}catch(e){}
  if(!has&&!sessionStorage.getItem('ae-restored')){
    Prefs.get({key:KEY}).then(function(r){if(r&&r.value){try{set.call(localStorage,KEY,r.value);sessionStorage.setItem('ae-restored','1');location.reload()}catch(e){}}}).catch(function(){})}
}catch(err){try{var SS=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.SplashScreen;SS&&SS.hide()}catch(e){}}
})();
