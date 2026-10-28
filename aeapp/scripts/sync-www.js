// Copies the playable site into www/ for the iOS bundle. No server.url: the app is the files.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const www = path.resolve(__dirname, '..', 'www');
const files = [
  'index.html', 'native.js', 'three.min.js', 'sw.js', 'manifest.webmanifest',
  'privacy.html', 'support.html'
];
fs.rmSync(www, {recursive: true, force: true});
fs.mkdirSync(www, {recursive: true});
for (const f of files) fs.copyFileSync(path.join(root, f), path.join(www, f));
for (const dir of ['icons', 'fonts']) {
  fs.cpSync(path.join(root, dir), path.join(www, dir), {recursive: true});
}
const plug = path.join(__dirname, '..', 'node_modules', 'capacitor-plugin-cdv-purchase', 'www');
const vendor = path.join(www, 'vendor');
fs.mkdirSync(vendor, {recursive: true});
fs.copyFileSync(path.join(plug, 'store.js'), path.join(vendor, 'cdv-purchase.js'));
fs.copyFileSync(path.join(plug, 'capacitor-plugin.js'), path.join(vendor, 'cdv-purchase-marker.js'));
console.log('www synced from', root);
