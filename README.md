# PoyoMed 💊
> Saving lives and protecting our environment through AI-powered medicine management.

PoyoMed is a premium, AI-driven mobile application designed to bridge the gap between medication management and environmental sustainability. Built with **React Native** and powered by **Google Gemini AI**, PoyoMed doesn't just track your pills—it ensures you use them safely and dispose of them responsibly.

---

## 🌟 Key Features

### 🤖 AI Medicine Scanner (Gemini Powered)
- **Intelligent Recognition**: Effortlessly scan medicine labels to extract names, dosages, and expiry dates.
- **Auto-Correction**: Our AI intelligently corrects spelling errors (e.g., "fver" → "Fever") and normalizes medication names.
- **Smart Date Parsing**: Automatically distinguishes between "Dispensed Date" and "Expiry Date," providing safe estimations when only a dispensed date is available.

### ⚠️ Risk-Aware Management
- **Safety Classification**: Every medication is automatically classified into **Low**, **Medium**, or **High** risk levels.
- **Visual Safety Badges**: Quick-glance risk indicators on your dashboard and medicine cards.
- **Disposal Guidelines**: Integrated expert guidelines on how to safely dispose of different types of medications.

### ♻️ Eco-Recycling Ecosystem
- **Eco Impact Dashboard**: Track your contribution to a cleaner planet with "Meds Saved" and "CO2 Reduced" metrics.
- **The Drop-off Bag**: A dedicated space to manage expired or unused medications ready for recycling.
- **Recycling Point Locator**: Find the nearest certified medicine collection points with real-time navigation.

### 📱 Modern User Experience
- **Premium Design**: A beautiful, glassmorphism-inspired UI with warm gradients and sleek micro-animations.
- **Adaptive Theme**: Full support for system-wide Light and Dark modes.
- **Smart Reminders**: Stay on top of your health with automated next-dose calculation and expiring item alerts.

---

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 52)
- **AI Intelligence:** [Google Gemini Pro Vision](https://deepmind.google/technologies/gemini/) (REST API Integration)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (v3)
- **Backend:** [Firebase Firestore](https://firebase.google.com/docs/firestore) & Authentication
- **Graphics:** [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: LTS version (v18+)
- **Expo Go App**: Downloaded on your mobile device (iOS/Android) or an emulator.
- **Gemini API Key**: Required for the scanner features.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HeroJakes/PoyoMed.git
   cd PoyoMed
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Running the App
```bash
npx expo start
```

---

## 📂 Project Structure
- `app/`: Routing and main screens (Medicine List, Home, Camera, Recycle).
- `services/`: AI logic and external API integrations.
- `utils/`: Core business logic for risk classification and medication utilities.
- `components/`: Modular UI elements following our design system.
- `constants/`: Global theme configurations (Colors, Gradients, Fonts).

---

## 📄 License
This project is a private hackathon submission for **HeroJakes**. All rights reserved.

---

<p align="center">Made with ❤️ for a Greener World.</p>
