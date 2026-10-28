# In-app purchases

Create each product in App Store Connect with the id below. The prefix is `digital.studioden.agencyempire.` and the key is what the game registers with StoreKit (`cordova-plugin-purchase` v13). Prices are the Australian dollar labels in the code. Apple may localise the price the player sees. The fallback label is what the shop shows until the store has loaded.

Non-consumables can be restored. Consumables cannot. Buying something the player already owns does not grant it twice.

| Product id | Type | Price | What it unlocks |
| --- | --- | --- | --- |
| `digital.studioden.agencyempire.vip` | Non-consumable | A$9.99 | VIP: Isla Verde, +25% income, The Shark, 8h offline earnings |
| `digital.studioden.agencyempire.vip_noads` | Non-consumable | A$14.99 | VIP and ad-free together |
| `digital.studioden.agencyempire.noads` | Non-consumable | A$6.99 | No interstitial breaks. Rewarded buttons pay out straight away |
| `digital.studioden.agencyempire.starter` | Non-consumable | A$2.99 | 300 diamonds, a bucket of cash, ×2 income for 2 hours. Once |
| `digital.studioden.agencyempire.mgr_all` | Non-consumable | A$9.99 | All 7 managers |
| `digital.studioden.agencyempire.mgr_duo` | Non-consumable | A$2.99 | Front Desk Fran and Kylie the Closer |
| `digital.studioden.agencyempire.mgr_growth` | Non-consumable | A$4.99 | Bec, Baz and Pam |
| `digital.studioden.agencyempire.mgr_power` | Non-consumable | A$4.99 | Rita and Harris |
| `digital.studioden.agencyempire.gems_pouch` | Consumable | A$1.99 | 80 diamonds |
| `digital.studioden.agencyempire.gems_handful` | Consumable | A$4.99 | 250 diamonds |
| `digital.studioden.agencyempire.gems_sack` | Consumable | A$9.99 | 600 diamonds |
| `digital.studioden.agencyempire.gems_chest` | Consumable | A$19.99 | 1,400 diamonds |
| `digital.studioden.agencyempire.gems_vault` | Consumable | A$49.99 | 3,500 diamonds |
| `digital.studioden.agencyempire.gems_mountain` | Consumable | A$99.99 | 9,000 diamonds |

The website build does not talk to StoreKit. There, these buttons still grant the item on the spot so the public build can be tried. That fallback is refused inside the native app.
