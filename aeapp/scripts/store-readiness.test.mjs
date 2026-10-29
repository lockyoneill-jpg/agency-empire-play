// Stubs the Capacitor review and browser plugins and checks the quiet rules.
// Run from the repo root: node aeapp/scripts/store-readiness.test.mjs
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import {fileURLToPath} from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fails = [];
function check(name, cond){if(!cond)fails.push(name);else console.log('ok', name)}

const window = {
  AE_BUILD: '',
  addEventListener(){},
  Capacitor: null
};
const navigator = {serviceWorker: {}, userAgent: 'test'};
const screen = {height: 800, width: 400, orientation: {lock(){return Promise.resolve()}}};
const document = {addEventListener(){}, documentElement: {}, body: null};
const context = {
  window, navigator, screen, document,
  location: {protocol: 'http:'},
  matchMedia(){return {matches: false}},
  innerHeight: 700, innerWidth: 400,
  addEventListener: window.addEventListener,
  console
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'native.js'), 'utf8'), context);

const rules = window.AEReviewRules;
const ask = window.AEReviewAsk;
const route = window.AERouteLink;
check('rules loaded', typeof rules === 'function' && typeof ask === 'function' && typeof route === 'function');

const ver = '0.31';
function snap(over){
  return Object.assign({
    native: true, started: true, hidden: false, tut: 99, tutOn: false, sheet: false, doc: false,
    ad: false, auc: false, reviewFor: '', version: ver, sessions: 2, playMs: 0,
    lastIap: 0, lastBuy: 0, lastAd: 0, now: 1_000_000, pending: 'sale'
  }, over);
}
function calls(){
  const hit = [];
  return {hit, plug: {requestReview(){hit.push('review'); return Promise.resolve()}}};
}

check('sale asks', rules(snap()).ok && rules(snap()).why === 'sale');
check('town asks', rules(snap({pending: 'town'})).why === 'town');
check('pass is not a sale', rules(snap({pending: 'pass'})).why === 'no-event');
check('web is a no-op', rules(snap({native: false})).why === 'web');
check('tutorial blocks', rules(snap({tut: 2})).why === 'tutorial');
check('tutorial flag blocks', rules(snap({tutOn: true})).why === 'tutorial');
check('sheet blocks', rules(snap({sheet: true})).why === 'sheet');
check('doc blocks', rules(snap({doc: true})).why === 'sheet');
check('ad open blocks', rules(snap({ad: true})).why === 'busy');
check('auction open blocks', rules(snap({auc: true})).why === 'busy');
check('one session is too new', rules(snap({sessions: 1, playMs: 1000})).why === 'new');
check('ten minutes counts', rules(snap({sessions: 1, playMs: 600000})).ok);
check('just under ten minutes does not', rules(snap({sessions: 1, playMs: 599999})).why === 'new');
check('ad cooldown', rules(snap({lastAd: 1_000_000 - 59000})).why === 'ad');
check('ad cooldown ends', rules(snap({lastAd: 1_000_000 - 60000})).ok);
check('purchase cooldown', rules(snap({lastBuy: 1_000_000 - 1000})).why === 'purchase');
check('iap sheet cooldown', rules(snap({lastIap: 1_000_000 - 1000})).why === 'iap');
check('already this version', rules(snap({reviewFor: ver})).why === 'already');
check('older version can ask again', rules(snap({reviewFor: '0.30'})).ok);

{
  const {hit, plug} = calls();
  let committed = 0;
  const first = ask(snap(), plug, () => {committed++});
  check('plugin fires once', first.ok && hit.length === 1 && committed === 1);
  const second = ask(snap({reviewFor: ver}), plug, () => {committed++});
  check('second ask is blocked', !second.ok && second.why === 'already' && hit.length === 1 && committed === 1);
}
{
  const {hit, plug} = calls();
  const blocked = ask(snap({lastAd: 999000}), plug, () => {});
  check('no plugin call after an ad', !blocked.ok && blocked.why === 'ad' && hit.length === 0);
}
{
  const {hit, plug} = calls();
  const web = ask(snap({native: false, pending: 'sale'}), plug, () => {});
  check('web never calls the plugin', web.why === 'web' && hit.length === 0);
}
{
  const missing = ask(snap(), null, () => {throw new Error('should not commit')});
  check('missing plugin does not commit', missing.why === 'no-plugin');
}

const opened = [];
const plugins = {Browser: {open(o){opened.push(o.url); return Promise.resolve()}}};
function go(href, native){return route(href, {native, plugins})}
check('terms opens in the in-app browser', go(window.AE_LEGAL.terms, true).action === 'browser' && opened[0] === window.AE_LEGAL.terms);
check('hosted privacy is allow-listed', go(window.AE_LEGAL.privacy, true).action === 'browser');
check('hosted support is allow-listed', go(window.AE_LEGAL.support, true).action === 'browser');
check('other sites stay blocked', go('https://example.com/phish', true).action === 'blocked' && opened.length === 3);
check('bundled privacy stays an overlay', go('privacy.html', true).action === 'overlay');
check('bundled support stays an overlay', go('support.html', true).action === 'overlay');
check('mail still works', go('mailto:lockyoneill@icloud.com', true).action === 'passthrough');
check('web does not hijack links', go('https://example.com', false).action === 'web' && opened.length === 3);

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fin = html.slice(html.indexOf('function finishAuction'), html.indexOf('function endAuction'));
check('sold auction notes a review', fin.includes("if(r.sold)noteReview('sale')"));
check('passed-in does not note a review by itself', !fin.includes("noteReview('pass')"));
const move = html.slice(html.indexOf('function moveTown'), html.indexOf('function gemArt'));
check('town unlock notes a review', move.includes("noteReview('town')"));
check('town note is after a successful save', move.indexOf('if(!save())') < move.indexOf("noteReview('town')"));

const plist = fs.readFileSync(path.join(root, 'aeapp/ios/App/App/PrivacyInfo.xcprivacy'), 'utf8');
check('tracking is declared', plist.includes('<key>NSPrivacyTracking</key>') && plist.includes('<true/>'));
check('no tracking domains of our own', /<key>NSPrivacyTrackingDomains<\/key>\s*<array\s*\/>/.test(plist) || /<key>NSPrivacyTrackingDomains<\/key>\s*<array>\s*<\/array>/.test(plist));
check('user defaults reason', plist.includes('NSPrivacyAccessedAPICategoryUserDefaults') && plist.includes('CA92.1'));
check('no file-timestamp reason', !plist.includes('C617.1'));
check('no disk-space reason', !plist.includes('E174.1') && !plist.includes('85F4.1'));

if(fails.length){
  console.error('FAILED', fails.join(', '));
  process.exit(1);
}
console.log('all checks passed');
