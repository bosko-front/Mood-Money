# MoodMoney

AI-assisted personal finance and mood tracking app built with Expo and React Native.

MoodMoney helps you understand how your emotions influence spending and saving. Log entries, visualize trends, and get AI insights tailored to your mood and financial habits.

Effective date: 2025-12-04

## Features

- Mood-aware expense and income entries
- AI insights and summaries (see `app/(tabs)/ai-insights.tsx`)
- Charts and visualizations (Victory + Skia)
- Secure sync with Firebase (Auth + Firestore)
- In-app purchases/subscriptions (RevenueCat SDK)
- Offline-friendly and fast state with Zustand
- Expo Router file-based navigation

## Tech Stack

- React Native 0.81, Expo SDK 54
- Expo Router 6, TypeScript
- Firebase (app, auth, firestore)
- Zustand for state management
- RevenueCat (`react-native-purchases`, `react-native-purchases-ui`)
- Charts: `victory-native`, `@shopify/react-native-skia`
- Utilities: `date-fns`, `@expo/vector-icons`, etc.

See `package.json` for full dependency versions.

## Project Structure (high level)

- `app/` – screens and routing (Expo Router)
  - `(tabs)/` – tabbed app screens (Home, AI Insights, Settings)
- `src/` – reusable modules
  - `components/` – UI components (e.g., `home/EntryItem.tsx`)
  - `store/` – Zustand stores (e.g., `useEntriesStore.ts`)
- `assets/` – images, lottie, fonts
- `firebaseConfig.ts` – Firebase bootstrap
- `PRIVACY_POLICY.md`, `TERMS_OF_USE.md`, `support.md` – user-facing docs

## Prerequisites

- Node.js 18+ and npm
- Xcode (macOS) for iOS builds; Android Studio for Android
- Expo CLI: `npm i -g expo` (optional; `npx expo` works too)

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure Firebase

- Add platform configs already included:
  - `GoogleService-Info.plist` (iOS)
  - `google-services.json` (Android)
- Ensure `firebaseConfig.ts` points to your Firebase project configuration.

3) RevenueCat (optional, if you plan to test purchases)

- Configure products and entitlements in RevenueCat dashboard.
- Ensure the bundle identifiers and package names match your app.json / native projects.

## Running the App (Dev)

Start Metro and choose a target:

```bash
npx expo start
```

Useful scripts:

- iOS simulator: `npm run ios`
- Android emulator: `npm run android`
- Web (limited): `npm run web`

## Building

Local builds using the native toolchains:

- iOS: `npm run ios` (requires Xcode)
- Android: `npm run android` (requires Android Studio/SDK)

You can also configure EAS Build if desired (not included by default).

## Environment and Secrets

- Firebase credentials are provided via `GoogleService-Info.plist` and `google-services.json`.
- Do not commit sensitive keys. For additional secrets, prefer platform-specific secure storage or CI secrets.

## Quality

- TypeScript strictness is enabled per `tsconfig.json`.
- Lint: `npm run lint`
- At present, there are no unit tests in this repository.

## Release Checklist

- Update app metadata, icons, splash, and version in `app.json` and native projects
- Verify Firebase config for production project
- Verify RevenueCat products/entitlements and sandbox testers
- Run through purchase flows on physical devices
- Check analytics/consent as required by your region
- Update `PRIVACY_POLICY.md`, `TERMS_OF_USE.md` if needed

## Support

For help, see `support.md` or contact:

- Email: support@moodmoney.app
- Alternate: boskojaksic2407995@gmail.com

Typical response: 1–2 business days. Severity handling and templates are in `support.md`.

## Privacy and Terms

- Privacy Policy: `PRIVACY_POLICY.md`
- Terms of Use: `TERMS_OF_USE.md`

## Contributing

This is a private application repository. External contributions are not currently accepted.

## Security

If you discover a vulnerability, please email `support@moodmoney.app` with subject "Security Report" and do not disclose publicly until addressed.

## License

Copyright (c) MoodMoney. All rights reserved.
