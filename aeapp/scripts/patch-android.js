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
