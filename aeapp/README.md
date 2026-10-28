# Agency Empire on iOS

The Capacitor 8.5.3 iOS project in this folder bundles the static game. It does not point `server.url` at a website. Purchases use StoreKit (`cordova-plugin-purchase` 13.20.0). Ads use `@capacitor-community/admob` 8.2.1, plus Preferences, Status Bar, Splash Screen and Haptics. The app is portrait and iPhone only.

`main` is the live GitHub Pages site. Build TestFlight from this branch, or from whatever branch you merge, via Codemagic. You do not need a Mac.

Codemagic looks for `codemagic.yaml` at the repo root by default. This repo keeps it at `aeapp/codemagic.yaml` (the game already refers to that path). In the Codemagic app, set the configuration file to `aeapp/codemagic.yaml`.

## Still on you

1. **Apple Developer Program**, enrolled on the account that owns the app.
2. **App Store Connect app** with bundle id `digital.studioden.agencyempire`. Name it Agency Empire. Add the privacy policy URL once Pages is serving `privacy.html` (same site as the game, path `/privacy.html`) and the support URL `/support.html`.
3. **In-app purchases.** Create every row in `PRODUCTS.md`. The id has to match, including the prefix. Non-consumable vs consumable matters. Attach them to the app and submit them with the first build (or as soon as App Store Connect allows).
4. **Signing in Codemagic.** Upload an App Store distribution certificate and a provisioning profile for `digital.studioden.agencyempire`, and let the workflow’s `ios_signing` block fetch them. Enable In-App Purchase on the App ID (it usually already is).
5. **App Store Connect API key.** In Codemagic, set these environment variables. Do not commit the values. The repo is public.
   - `APP_STORE_CONNECT_KEY_IDENTIFIER` — the key id
   - `APP_STORE_CONNECT_ISSUER_ID` — the issuer id
   - `APP_STORE_CONNECT_PRIVATE_KEY` — the contents of the `.p8` file, including the BEGIN and END lines
6. **AdMob.** Create the iOS app in AdMob. Put its app id (it contains `~`) in Codemagic as `ADMOB_APP_ID_IOS`. The build writes that into `Info.plist`. Then, in `index.html`, replace the test unit ids inside `STORE_CFG.admob` and set `testing` to `false`. Until you do that, the app requests Google’s test ads on purpose.
7. **Support mailbox.** `support@studioden.digital` is a placeholder in Settings, `privacy.html` and `support.html`. Swap it for a real address before review.
8. **Tracking and consent copy.** `NSUserTrackingUsageDescription` is already in `Info.plist`. Google’s UMP form needs a privacy message set up in AdMob (Funding Choices / Privacy & messaging) for the EU and UK, or the consent call has nothing to show.
9. **Run the workflow.** Codemagic checks out the branch, copies the game into `www/`, runs `npx cap sync ios`, stamps the AdMob app id, builds an IPA and uploads it to TestFlight.

Local check, still with no Mac, is just the website: the native store and the real ads only exist on device. A purchase attempt in Safari still grants the item. That is unchanged, and it is not what the iOS build does.
