# StoreKit purchases

The iOS app uses `capacitor-plugin-cdv-purchase` 13.20 (the Capacitor build of cordova-plugin-purchase v13) with StoreKit 2. The game talks to `window.CdvPurchase`, which `native.js` loads from `vendor/cdv-purchase.js` only inside the native app.

## What the player sees

- On the website, a purchase is still granted on the spot. That path is unchanged.
- In the app, `buy()` waits for the plugin (up to about 12 seconds). If StoreKit is missing or not ready, the game opens an in-style error and grants nothing.
- A confirmed StoreKit transaction is the only way a product is granted. Cancelling, a failed verify, or a store that never answers does not grant the item.
- Restore purchases calls `store.restorePurchases()`, then turns on every non-consumable the receipt says is owned. If the store cannot be reached, the same error sheet is shown. It does not pretend the restore worked.

Product ids, types, and AUD prices are in `PRODUCTS.md`.
