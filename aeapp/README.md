# Agency Empire for iOS

The playable game stays at the repo root and on GitHub Pages from `main`. This folder is the Capacitor iOS app. It copies those static files into the bundle. There is no `server.url`, so the app does not load the website.

Bundle id: `digital.studioden.agencyempire`. Portrait only. iPhone only.

## Native features (for App Review notes)

These are the reasons the binary is an app, not a wrapped site. Paste the block below into App Review notes.

- The game is bundled on the device and plays with no network. There is no Safari chrome, no remote page, and no `server.url`.
- Purchases go through StoreKit 2 (`capacitor-plugin-cdv-purchase`). A product is granted only after StoreKit confirms it. If the store is slow or missing, the player sees an error and receives nothing. Restore purchases reads the Apple receipt. Non-consumables only. See `STORE_iap.md` and `PRODUCTS.md`.
- Haptics use the system Taptic Engine for taps, sales, level-ups, auctions, errors, and rewards (`@capacitor/haptics`). The Vibration switch in Settings turns them off.
- Local notifications (`@capacitor/local-notifications`) are opt-in. The app asks at a quiet moment, with an in-game choice before the iOS prompt. If allowed, it schedules three on-device reminders: earnings building while away, offline earnings full, and a later nudge if the office is idle. Nothing is sent from a server. Turning the switch off cancels them.
- Share uses the iOS share sheet (`@capacitor/share`) from a level-up, a sold auction, a town move, and Settings.
- The layout respects the notch and the home indicator (`viewport-fit=cover`, status bar over the web view, safe-area insets on the HUD, dock, sheets, and auction panel).
- Ads, when shown, use Google AdMob with UMP consent before the first request and the tracking prompt at a quiet moment, not in front of an interstitial. Test ads stay on until real unit ids are pasted into `STORE_CFG` in `index.html`.
- Splash screen and status bar are native. The app is portrait and iPhone-only.

## Still manual

No secrets belong in this repo. It is public.

1. Enroll in the Apple Developer Program. Create the app in App Store Connect with bundle id `digital.studioden.agencyempire`.
2. Create every product in `PRODUCTS.md` with that exact id, type, and AUD price. Non-consumables must be restorable.
3. In AdMob, create the iOS app and the interstitial and rewarded units. Paste the unit ids into `STORE_CFG.admob` in `index.html` and set `testing` to `false`. Put the AdMob app id (the one with `~`) in Codemagic as `ADMOB_APP_ID_IOS`. The placeholder in Info.plist is `ca-app-pub-0000000000000000~0000000000` and the build replaces it when that variable is set.
4. In Codemagic, set the configuration file to `aeapp/codemagic.yaml`. Create a variable group named `appstore_credentials` with `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_KEY_IDENTIFIER`, and `APP_STORE_CONNECT_PRIVATE_KEY` (the `.p8` contents). Mark them secret. The key needs App Manager access. Add `ADMOB_APP_ID_IOS` in the same group or another group the workflow imports.
5. Replace `support@studioden.digital` in `STORE_CFG.support` (`index.html`) and on `privacy.html` and `support.html`. Put the privacy policy URL on the App Store listing (the GitHub Pages copy of `privacy.html` once this is on `main`, or a page you host).
6. Upload screenshots, the age rating, and the privacy nutrition labels in App Store Connect. The first binary can go up from the Codemagic workflow; the app record has to exist first.
7. Publish a GDPR message in AdMob so the UMP form has something to show in the EU and UK. Leave the tracking prompt’s usage string as it is unless you want different wording (`NSUserTrackingUsageDescription` in `scripts/patch-ios.js`).

`main` is the live site. Do not push this folder’s experiments there until you mean to ship the web copy too. The iOS build does not depend on the site being updated.

## Build locally

Needs a Mac only if you want to open Xcode. Codemagic is the path without one.

```bash
cd aeapp
npm ci
npm run cap:sync
node scripts/patch-ios.js
```
