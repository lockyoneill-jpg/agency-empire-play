# Store and ads, as the app actually behaves

The game’s shop, VIP sheet and Settings call `STORE.buy` / `STORE.restore`. Ads call `ADS`. Both branches live in `index.html`.

## Purchases

On the website, or anywhere Capacitor is absent, `buy()` grants the product immediately. That is the public playable build.

Inside the iOS app (`Capacitor.isNativePlatform()`), `buy()` waits for `cordova-plugin-purchase` (v13, `window.CdvPurchase`). If the plugin is missing or still not ready after that wait, the game opens a “Couldn’t buy” sheet and grants nothing. A slow store is not a free VIP.

A real purchase is granted only from a verified StoreKit transaction (`approved` → `verify` → `verified`). Non-consumables are idempotent. Consumable diamonds are granted once per transaction id. Restore calls `store.restorePurchases()`, then turns on any non-consumable the receipt says is owned. If the store cannot be reached, restore shows the same error sheet and does not pretend it succeeded.

Product ids, types and AUD prices are listed in `PRODUCTS.md`. The id prefix is `digital.studioden.agencyempire.` in `STORE_CFG`.

## Ads

Ad unit ids and the testing flag sit in one block, `STORE_CFG.admob`, in `index.html`. `testing` stays `true`, and the unit ids are Google’s test ids, until real ones are pasted in.

The AdMob **app** id (the one with `~`) is not a secret in this public repo. `Info.plist` ships Google’s sample id. `codemagic.yaml` overwrites `GADApplicationIdentifier` from the Codemagic variable `ADMOB_APP_ID_IOS` at build time.

Before the first ad request the app calls `requestConsentInfo` and, when Google says a form is required, `showConsentForm`. That is the EU/UK consent step. The iOS tracking prompt (`requestTrackingAuthorization`) is asked once during quiet play, after the tutorial, with no sheet and no auction open. It is not asked in the moment before an interstitial.

Rewarded ads are preloaded with `prepareRewardVideoAd` after each one finishes. The render loop pauses while a full-screen ad is up.

Rewarded placements, all on the same rewarded unit:

- Double offline earnings. The doubled amount is not saved first. A finished ad pays ×2. A failed or closed ad pays ×1.
- Double auction commission, on the result.
- Double the level-up reward.
- Skip the Board Room cooldown.
- Double a goal claim. A failed ad still pays the normal claim.
- Free diamonds (8) or free cash (about ten minutes of income) in the shop, three claims a day between them.

Interstitials play when an auction result is closed, and when the player confirms a move to a new town. The move waits until the ad is dismissed or fails, then reloads. They are skipped for VIP, ad-free, the tutorial, towns 0 and 1, an open sheet, or a live auction.

Turning a VIP client away still costs reputation. That penalty stays.

Report an ad is a mailto link in Settings. The address `support@studioden.digital` is a placeholder.
