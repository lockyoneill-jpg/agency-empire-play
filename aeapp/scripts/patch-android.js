// Portrait, phone screens, AdMob test app id. Safe to run more than once.
const fs = require('fs');
const path = require('path');
const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (!fs.existsSync(manifestPath)) {
  console.log('No Android project yet. Run npx cap add android first.');
  process.exit(0);
}
let xml = fs.readFileSync(manifestPath, 'utf8');
if (!xml.includes('android:screenOrientation="portrait"')) {
  xml = xml.replace('<activity', '<activity\n            android:screenOrientation="portrait"');
}
if (!xml.includes('<supports-screens')) {
  xml = xml.replace('<manifest xmlns:android="http://schemas.android.com/apk/res/android">',
    `<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <supports-screens android:anyDensity="true" android:smallScreens="true" android:normalScreens="true" android:largeScreens="false" android:xlargeScreens="false" />`);
}
const TEST = 'ca-app-pub-3940256099942544~3347511713';
if (!xml.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  xml = xml.replace('</application>',
    `        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${TEST}"/>\n    </application>`);
}
fs.writeFileSync(manifestPath, xml);
console.log('Android project patched: portrait, phone screens, AdMob app id present.');

// IAP_ENABLED.android is false (see native.js). cap sync puts the purchase plugin
// back into the generated Gradle files and capacitor.plugins.json. Strip it so
// Android startup never loads Play Billing. When that flag flips to true, stop
// stripping these lines.
function stripPurchasePlugin() {
  const gradleFiles = [
    path.join(__dirname, '..', 'android', 'app', 'capacitor.build.gradle'),
    path.join(__dirname, '..', 'android', 'capacitor.settings.gradle')
  ];
  for (const f of gradleFiles) {
    if (!fs.existsSync(f)) continue;
    const src = fs.readFileSync(f, 'utf8');
    const next = src.split('\n').filter(line => !line.includes('capacitor-plugin-cdv-purchase')).join('\n');
    if (next !== src) {
      fs.writeFileSync(f, next);
      console.log('Purchase plugin left out of ' + path.basename(f));
    }
  }
  const plugins = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'capacitor.plugins.json');
  if (!fs.existsSync(plugins)) return;
  let list;
  try { list = JSON.parse(fs.readFileSync(plugins, 'utf8')); } catch (e) { return; }
  if (!Array.isArray(list)) return;
  const filtered = list.filter(p => !JSON.stringify(p).includes('cdv-purchase'));
  if (filtered.length !== list.length) {
    fs.writeFileSync(plugins, JSON.stringify(filtered, null, '\t') + '\n');
    console.log('Purchase plugin left out of capacitor.plugins.json');
  }
}
stripPurchasePlugin();
