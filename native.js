// Runs before the game. In the native app: keeps a copy of the save in the phone's app storage (iOS and Android can
// clear web storage when space runs low), restores it if the web copy has gone, and sets up the status bar, splash,
// and the store (StoreKit on iOS, Google Play Billing on Android).
// On the web (home-screen version): registers the offline cache.
(function(){
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
  // stay inside the app: http(s) links would open Safari chrome. mailto and in-app pages stay.
  document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a');if(!a)return;var href=a.getAttribute('href')||'';
    if(!href||href.indexOf('mailto:')===0||href.indexOf('#')===0||href.charAt(0)==='.'||href.indexOf('javascript:')===0)return;
    if(/^https?:/i.test(href)){e.preventDefault()}},true);
  if(!Prefs)return;
  // mirror every save into native storage
  var set=Storage.prototype.setItem,rem=Storage.prototype.removeItem;
  Storage.prototype.setItem=function(k,v){set.call(this,k,v);if(this===window.localStorage&&k===KEY){try{Prefs.set({key:KEY,value:String(v)})}catch(e){}}};
  Storage.prototype.removeItem=function(k){rem.call(this,k);if(this===window.localStorage&&k===KEY){try{Prefs.remove({key:KEY})}catch(e){}}};
  // the web copy is gone but the native one isn't: put it back and start again once
  var has=false;try{has=!!localStorage.getItem(KEY)}catch(e){}
  if(!has&&!sessionStorage.getItem('ae-restored')){
    Prefs.get({key:KEY}).then(function(r){if(r&&r.value){try{set.call(localStorage,KEY,r.value);sessionStorage.setItem('ae-restored','1');location.reload()}catch(e){}}}).catch(function(){})}
})();
