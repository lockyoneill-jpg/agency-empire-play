# Store privacy prep sheet (Idle Estate Agent)

Plain-English draft answers for Apple's **App Privacy** questions (the "nutrition label") and Google Play's **Data safety** form.
These are drafts based on what the code does today. Check them again if you add analytics, accounts, cloud saves or another ad network.

## What the game actually does with data

| Thing | Who handles it | What leaves the phone |
|---|---|---|
| Game save (progress, diamonds, purchases owned) | The game itself | Nothing. Saved only on the phone (web storage plus a backup in the app's own storage). No accounts, no server. |
| In-app purchases (VIP, Ad-free, packs, diamonds) | Apple App Store / Google Play | Payment is handled entirely by Apple or Google. The game never sees card details. There's no receipt server. |
| Ads (Google AdMob) | Google | Google's ad SDK collects device and ad data to show and measure ads (details below). |
| Consent form (Google UMP) | Google | Your consent choice, stored on the phone and read by Google's SDK. |
| Tracking permission (Apple ATT) | Apple | If the player says yes, AdMob can use the advertising ID (IDFA). |

Contact address everywhere: `lockyoneill@icloud.com` in `STORE_CFG.support` (`index.html`), `privacy.html` and `support.html`.
Privacy policy URL for both stores: the published `privacy.html` (for example `https://<your GitHub Pages address>/privacy.html`).

## Apple: App Privacy (App Store Connect > App Privacy)

**Do you or your third-party partners collect data from this app?** Yes (because of AdMob).

| Data type (Apple's name) | Collected? | Linked to the user? | Used for tracking? | Purposes |
|---|---|---|---|---|
| Identifiers > Device ID (advertising ID) | Yes | No | Yes | Third-party advertising, Analytics |
| Usage Data > Product Interaction | Yes | No | Yes | Third-party advertising, Analytics |
| Usage Data > Advertising Data | Yes | No | Yes | Third-party advertising, Analytics |
| Location > Coarse Location (from IP address) | Yes | No | Yes | Third-party advertising |
| Diagnostics > Crash Data | Yes | No | No | Analytics |
| Diagnostics > Performance Data | Yes | No | Yes | Third-party advertising, Analytics |
| Purchases > Purchase History | No (Apple processes it; the game keeps nothing off the phone) | | | |
| Contact info, Name, Email, User content, Health, Financial info, Contacts | No | | | |

- **Tracking:** Yes. That's why the app shows Apple's ATT prompt and has an `NSUserTrackingUsageDescription` string.
- These answers match `aeapp/ios/App/App/PrivacyInfo.xcprivacy` (the app's privacy manifest). Google's SDKs add their own manifests on top.

## Google Play: Data safety (Play Console > App content > Data safety)

- **Does your app collect or share any of the required user data types?** Yes.
- **Is all of the user data collected by your app encrypted in transit?** Yes (AdMob uses HTTPS).
- **Do you provide a way for users to request that their data is deleted?** The game has no account or server data. The in-game "Start over" wipes the local save. Ad data is held by Google: point players to Google's controls in the privacy policy. Answer "No" to account deletion (there are no accounts).

| Data type (Google's name) | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Device or other IDs (advertising ID) | Yes | Yes (Google AdMob) | No | Advertising or marketing, Analytics, Fraud prevention |
| App activity > App interactions | Yes | Yes (AdMob) | No | Advertising or marketing, Analytics |
| Approximate location (from IP) | Yes | Yes (AdMob) | No | Advertising or marketing |
| App info and performance > Crash logs, Diagnostics | Yes | Yes (AdMob) | No | Analytics |
| Financial info > Purchase history | No. Google Play Billing handles purchases. The game doesn't collect them. | | | |
| Personal info, Messages, Photos, Contacts, Files | No | | | |

Also in Play Console:
- **Ads:** "Yes, my app contains ads."
- **Advertising ID:** declare use for "Advertising or marketing". The Android build must include the `com.google.android.gms.permission.AD_ID` permission (the AdMob SDK adds it).
- **Target audience:** if you choose any age under 13, Families policy rules apply and AdMob must be set up for child-directed ads. Simplest is 13+ (or 16+/18+).

## Before you submit (checklist)

1. Real AdMob app IDs and ad unit IDs in, test mode off (`STORE_CFG.admob.testing:false`).
2. Support email is `lockyoneill@icloud.com` in `index.html`, `privacy.html` and `support.html`.
3. Privacy policy live at a public URL, and that URL entered in both stores.
4. In AdMob > Privacy & messaging, create and publish a GDPR message (and the US states message if wanted). Without a published message, the in-app consent form won't appear.
5. Answers above entered in App Store Connect and Play Console.
