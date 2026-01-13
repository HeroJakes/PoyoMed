# PoyoMed 💊

PoyoMed is a modern, user-friendly mobile application designed to help users manage their medications effectively. Built with React Native and Expo, it provides a seamless experience for tracking dosages, setting reminders, and managing medicine inventory.

## 🚀 Features

- **Medicine Tracking:** Keep a comprehensive list of all your medications with dosage and frequency details.
- **Smart Reminders:** Never miss a dose with next-dose tracking and status alerts (Active, Low Stock, Expiring).
- **Medicine Scanner:** Quickly add new medications by scanning them using your device's camera.
- **Search & Filter:** Easily find specific medicines or filter by categories like Daily, Weekly, or Supplements.
- **Dark Mode Support:** Beautiful UI that adapts to your system's light or dark theme.
- **Cloud Sync:** Powered by Firebase to keep your data safe and accessible.

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Backend:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Icons:** [Ionicons](https://ionicons.com/) via `@expo/vector-icons`
- **Styling:** Custom design system with support for Light/Dark modes and Linear Gradients.

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your mobile device or an emulator.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HeroJakes/PoyoMed.git
   cd PoyoMed
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Environment Variables:
   Create a `.env` file in the root directory and add your Firebase configuration (if not already hardcoded in `firebase.js`).

### Running the App

Start the development server:
```bash
npx expo start
```

- Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).
- Press `a` for Android emulator.
- Press `i` for iOS simulator.
- Press `w` for web.

## 📂 Project Structure

- `app/`: Main application screens and routing (Expo Router).
- `components/`: Reusable UI components.
- `constants/`: Theme colors, gradients, and other constants.
- `hooks/`: Custom React hooks.
- `assets/`: Images, fonts, and other static assets.
- `firebase.js`: Firebase initialization and configuration.

## 📄 License

This project is private and for personal use.

