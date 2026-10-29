// Runs before the game. In the native app: keeps a copy of the save in the phone's app storage (iOS and Android can
// clear web storage when space runs low), restores it if the web copy has gone, and sets up the status bar, splash,
// and the store (StoreKit on iOS, Google Play Billing on Android).
// On the web (home-screen version): registers the offline cache.
(function(){
  var KEY='agency-empire-v2';
  var C=window.Capacitor,native=!!(C&&C.isNativePlatform&&C.isNativePlatform());
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
  // hold the splash until the office has actually painted, then a failsafe
  (function(){var gone=false;function hide(){if(gone)return;gone=true;try{P.SplashScreen&&P.SplashScreen.hide()}catch(e){}}
    var iv=setInterval(function(){var l=document.getElementById('loading');if(!l||l.hidden){clearInterval(iv);hide()}},200);
    setTimeout(hide,8000)})();
  // StoreKit 2 / Google Play Billing (capacitor-plugin-cdv-purchase). The marker must exist before store.js picks a bridge.
  // Loaded only in the app so the website never pulls the store script.
  window.CdvPurchaseCapacitor={installed:true};
  var ps=document.createElement('script');ps.src='vendor/cdv-purchase.js';ps.async=false;document.head.appendChild(ps);
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
