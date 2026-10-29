# Agency Empire for iOS and Android

The playable game stays at the repo root and on GitHub Pages from `main`. This folder is the Capacitor app. It copies those static files into the bundle. There is no `server.url`, so the app does not load the website. `main` is not changed by the Android project.

Bundle id: `digital.studioden.agencyempire`. Portrait only. iPhone only on iOS. Phone screens only on Android (small and normal; tablets are filtered out).

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

## Android

Same bundle id, portrait only, phones only. The first Play build is ads only. Purchases are off until you flip the one flag below. When that flag is on, Google Play Billing uses `capacitor-plugin-cdv-purchase` with the product ids in `PRODUCTS.md`. A purchase is granted only after Play confirms it. Ads use the Android test unit ids already in `STORE_CFG.admob.android`, and UMP consent runs before the first ad request, the same calls as iOS. The launcher icon is the 1024 artwork. The splash is the same navy as iOS (`#051f3f`).

### Turn Android purchases on

`IAP_ENABLED` in `native.js` (repo root) is the only switch. `android` is `false` for this launch. iOS stays `true`. The website is not in that table.

Set `android` to `true` to bring the shop back in full: VIP, remove ads, diamond packs, manager packs, Isla Verde, The Shark, and Restore purchases. Then put the purchase plugin back into the Android build:

```bash
cd aeapp
npm run cap:sync:android
npm run android:patch
```

`cap sync` adds `capacitor-plugin-cdv-purchase`. `patch-android.js` reads the same `android` flag. It leaves the plugin in the project when the flag is `true`, and removes it when the flag is `false`, so Play Billing does not start during the ads-only launch.

Native points worth mentioning if Play asks what the app does on the device:

- The game is bundled on the device and plays with no network. There is no browser chrome and no `server.url`.
- Purchases stay off while `IAP_ENABLED.android` is `false`. After that flag is `true` and the sync steps above have been run, purchases go through Google Play Billing. Nothing is granted if Billing is missing or slow. Restore turns on non-consumables Play reports as owned.
- Haptics, the system share sheet, and opt-in local notifications use the same in-game switches as iOS.
- The layout uses the status bar and the gesture-navigation inset. The splash and status bar are native. The activity is portrait.

### Still manual on Android

No keystore, keystore password, or Play service account belongs in this repo.

1. Create the app in Play Console with package name `digital.studioden.agencyempire`. Create every product in `PRODUCTS.md` with that exact id, type, and AUD price.
2. In AdMob, create the Android app and the interstitial and rewarded units. Paste the unit ids into `STORE_CFG.admob.android` and set `testing` to `false` when you are done with test ads. Put the AdMob app id (the one with `~`) in Codemagic as `ADMOB_APP_ID_ANDROID` inside a variable group named `android_credentials`. The manifest placeholder is Google’s test app id `ca-app-pub-3940256099942544~3347511713`, and the workflow replaces it when that variable is set.
3. In Codemagic, upload the upload keystore as an Android code-signing reference named `agency_empire`. That sets `CM_KEYSTORE_PATH`, `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS`, and `CM_KEY_PASSWORD` during the build. `bundleRelease` signs the AAB only when those are present. The workflow `android-aab` in `aeapp/codemagic.yaml` produces the AAB as an artifact. It does not upload to Play.
4. Publish a GDPR message in AdMob so the UMP form has something to show. Put the privacy policy URL on the Play listing.

`main` is the live site. Do not push this folder’s experiments there until you mean to ship the web copy too. The store builds do not depend on the site being updated.

## Build locally

Needs a Mac only if you want to open Xcode. Codemagic is the path without one. Android Studio is optional; the AAB workflow does not need it.

```bash
cd aeapp
npm ci
npm run cap:sync
node scripts/patch-ios.js
npm run cap:sync:android
node scripts/patch-android.js
```
