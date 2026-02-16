# PoyoMed 🌿💊
> **The Sustainable Medication Assistant: Saving Lives, One Recycled Dose at a Time.**

---

### 🚨 QUICK START GUIDE
To run the prototype for evaluation, please follow these steps:
1. **Duplicate** `.env.example` and rename the copy to `.env`.
2. **Add your API Keys**:
   - `EXPO_PUBLIC_GEMINI_API_KEY`: Get one at [Google AI Studio](https://aistudio.google.com/).
   - `EXPO_PUBLIC_FIREBASE_*`: Create a project in [Firebase Console](https://console.firebase.google.com/), enable Firestore and Auth, and copy the config.
3. Run `npm install` and `npx expo start`.
4. Scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

---

## 🌎 The Mission
To transform how humanity interacts with medication—shifting from a "consume and discard" cycle to a circular economy of responsible health management and environmental protection.

### 🎯 SDG Alignment (United Nations Sustainable Development Goals)
PoyoMed is built to directly address three critical global challenges:
- **SDG 3: Good Health and Well-being**: Our **AI Interaction Guard** and **Smart Schedule** ensure users take medication safely, preventing dangerous drug interactions and dosage errors.
- **SDG 12: Responsible Consumption and Production**: We tackle the billions of dollars in medical waste by facilitating a frictionless path to recycling and proper disposal.
- **SDG 14: Life Below Water**: By keeping pharmaceuticals out of landfills and toilets, we prevent active ingredients from contaminating water systems and harming aquatic life.

---

## 🛠️ Core Pillars

### 1. ♻️ "Recycle-First" Ecosystem
- **Eco-Impact Dashboard**: Visualize your contribution with metrics like **Meds Saved** and **CO2 Reduction**.
- **Smart Drop-off Bag**: A dedicated workflow for items ready for disposal.
- **Request Pick-up**: Seamlessly schedule a home collection for your recycling bag.
- **Point Locator**: Map-integrated finder for certified pharmacy collection boxes.

### 2. 🤖 Advanced AI Intelligence (Powered by Gemini)
- **Smart Scanner**: Contextual extraction of generic names, dosages, and intelligent expiry date prediction.
- **AI Interaction Guard**: Proactively checks new scans against active medications to warn of dangerous interactions.
- **Jargon Decoder**: Simplifies complex medical instructions into clear safety tips.
- **Self-Correction**: Automatically corrects spelling errors in scanned medicine names.

### 3. 🏥 Holistic Health Management
- **Smart Schedule**: Real-time dose tracking and "Daily Health Tips" to boost wellness.
- **Inventory Control**: Automated "Low Stock" and "Expiring" alerts to help you recycle before it's too late.

---

## ⚙️ Google Technology Integration
We utilized a "Cause-and-Effect" approach to integrate Google's powerful ecosystem:

- **Google Gemini 1.5 Flash**: The brain of PoyoMed. We used Gemini's multimodal capabilities to analyze medicine labels in real-time. This **allowed our system to provide instant, contextual extraction** of complex medical data (dosage, expiry, risk).
- **Firebase Firestore & Auth**: The backbone of our real-time synchronization. Firestore **enabled seamless state management** between AI analysis and the user's dashboard, ensuring safety alerts are delivered immediately.
- **Google Maps (Native Integration)**: We integrated location services to connect users with drop-off points. This **simplified the recycling path**, directly increasing the likelihood of responsible disposal.

---

## 📂 Repository Roadmap
- `app/`: View layer - modular screens for every core feature.
- `services/`: AI & External API communication layers (contains Interaction Logic).
- `hooks/`: Reusable logic for forms and state management.
- `utils/`: Business logic, date calculations, and risk algorithms.
- `constants/`: Global style tokens and configuration.
- `components/`: Atomic UI components.

---

## 🌿 License & Acknowledgments
Developed for **Kitahack 2026** to showcase the potential of Google AI in sustainable healthcare.

<p align="center"><b>Let's heal the world, one dose at a time.</b></p>
