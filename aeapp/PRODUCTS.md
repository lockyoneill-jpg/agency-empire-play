# In-app purchases

Product id = `digital.studioden.agencyempire.` + key. Prices are the Australian dollar amounts coded in the game. App Store Connect and Google Play can localise the charge; the id, type, and this AUD price must match. Play Console uses these same ids.

| Product id | Type | AUD price | What the player gets |
| --- | --- | --- | --- |
| `digital.studioden.agencyempire.vip` | Non-consumable | A$9.99 | VIP: Isla Verde, +25% income, 8h offline earnings, The Shark hired |
| `digital.studioden.agencyempire.vip_noads` | Non-consumable | A$14.99 | VIP and ads removed |
| `digital.studioden.agencyempire.noads` | Non-consumable | A$6.99 | Ads removed. Rewards still pay out |
| `digital.studioden.agencyempire.starter` | Non-consumable | A$2.99 | Starter pack: 300 diamonds, a bucket of cash, ×2 income for 2 hours |
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

Cash packs in the shop are paid with diamonds already on the save. They are not App Store products.

Only non-consumables are restored. A restore never grants a product the store does not report as owned, and a purchase is never granted because the store plugin was slow to load. The same rule applies to StoreKit and to Google Play Billing.
