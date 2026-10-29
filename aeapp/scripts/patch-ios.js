// Portrait, iPhone-only, AdMob keys. Safe to run more than once.
const fs = require('fs');
const path = require('path');
const plistPath = path.join(__dirname, '..', 'ios', 'App', 'App', 'Info.plist');
const pbxPath = path.join(__dirname, '..', 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
if (!fs.existsSync(plistPath)) {
  console.log('No iOS project yet. Run npx cap add ios first.');
  process.exit(0);
}
let plist = fs.readFileSync(plistPath, 'utf8');
function setString(key, value) {
  const re = new RegExp('<key>' + key + '</key>\\s*<string>[^<]*</string>');
  const block = '<key>' + key + '</key>\n\t<string>' + value + '</string>';
  if (re.test(plist)) plist = plist.replace(re, block);
  else plist = plist.replace('</dict>\n</plist>', '\t' + block + '\n</dict>\n</plist>');
}
setString('GADApplicationIdentifier', 'ca-app-pub-0000000000000000~0000000000');
setString('NSUserTrackingUsageDescription', 'This lets Idle Realtor show ads that fit a property tycoon, instead of random ones. The game plays the same if you say no.');
setString('CFBundleDisplayName', 'Idle Realtor');
setString('CFBundleName', 'Idle Realtor');
if (!plist.includes('<key>UIRequiresFullScreen</key>')) {
  plist = plist.replace('</dict>\n</plist>', '\t<key>UIRequiresFullScreen</key>\n\t<true/>\n</dict>\n</plist>');
}
const SK = [
  'cstr6suwn9','4fzdc2evr5','2fnua5tdw4','ydx93a7ass','p78axxw29g','v72qych5uu','ludvb6z3bs','cp8zw746q7','3sh42y64q3','c6k4g5qg8m','s39g8k73mm','wg4vff78zm','3qy4746246','f38h382jlk','hs6bdukanm','mlmmfzh3r3','v4nxqhlyqp','wzmmz9fp6w','su67r6k2v3','yclnxrl5pm','t38b2kh725','7ug5zh24hu','gta9lk7p23','vutu7akeur','y5ghdn5j9k','v9wttpbfk9','n38lu8286q','47vhws6wlr','kbd757ywx3','9t245vhmpl','a2p9lx4jpn','22mmun2rn5','44jx6755aq','k674qkevps','4468km3ulz','2u9pt9hc89','8s468mfl3y','klf5c3l5u5','ppxm28t8ap','kbmxgpxpgc','uw77j35x4d','578prtvx9j','4dzt52r2t5','tl55sbb4fm','c3frkrj4fj','e5fvkxwrpn','8c4e2ghe7u','3rd42ekr43','97r2b46745','3qcr597p9d'
];
const skBlock = '<key>SKAdNetworkItems</key>\n\t<array>\n' + SK.map(id => '\t\t<dict>\n\t\t\t<key>SKAdNetworkIdentifier</key>\n\t\t\t<string>' + id + '.skadnetwork</string>\n\t\t</dict>').join('\n') + '\n\t</array>';
if (plist.includes('<key>SKAdNetworkItems</key>')) {
  plist = plist.replace(/<key>SKAdNetworkItems<\/key>[\s\S]*?<\/array>/, skBlock);
} else {
  plist = plist.replace('</dict>\n</plist>', '\t' + skBlock + '\n</dict>\n</plist>');
}
function orientArray(ipad) {
  const key = ipad ? 'UISupportedInterfaceOrientations~ipad' : 'UISupportedInterfaceOrientations';
  const block = '<key>' + key + '</key>\n\t<array>\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t</array>';
  const re = new RegExp('<key>' + key.replace('~', '~') + '</key>\\s*<array>[\\s\\S]*?</array>');
  if (re.test(plist)) plist = plist.replace(re, block);
  else plist = plist.replace('</dict>\n</plist>', '\t' + block + '\n</dict>\n</plist>');
}
orientArray(false);
orientArray(true);
fs.writeFileSync(plistPath, plist);
if (fs.existsSync(pbxPath)) {
  let pbx = fs.readFileSync(pbxPath, 'utf8');
  pbx = pbx.replace(/TARGETED_DEVICE_FAMILY = [^;]+;/g, 'TARGETED_DEVICE_FAMILY = 1;');
  pbx = pbx.replace(/IPHONEOS_DEPLOYMENT_TARGET = [^;]+;/g, 'IPHONEOS_DEPLOYMENT_TARGET = 15.0;');
  fs.writeFileSync(pbxPath, pbx);
}
const iconSrc = path.join(__dirname, '..', '..', 'icons', 'icon-1024.png');
const iconDir = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
if (fs.existsSync(iconDir) && fs.existsSync(iconSrc)) {
  const names = fs.readdirSync(iconDir).filter(f => f.endsWith('.png'));
  const dest = names[0] || 'AppIcon-512@2x.png';
  fs.copyFileSync(iconSrc, path.join(iconDir, dest));
  const contents = path.join(iconDir, 'Contents.json');
  if (fs.existsSync(contents)) {
    const j = JSON.parse(fs.readFileSync(contents, 'utf8'));
    (j.images || []).forEach(img => { if (!img.filename) img.filename = dest; });
    fs.writeFileSync(contents, JSON.stringify(j, null, 2));
  }
}
console.log('iOS project patched: portrait, iPhone only, AdMob placeholder, SKAdNetwork.');
