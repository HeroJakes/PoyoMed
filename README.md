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
- **AI Interaction Guard**: Proactively checks new scans against active medications. Features a **Safety Confirmation Flow** for high-risk interactions, ensuring users are fully informed before adding potentially conflicting drugs.
- **Jargon Decoder**: Simplifies complex medical instructions into clear safety tips.
- **Pharma-Aware Correction**: Automatically corrects spelling errors in scanned medicine names by cross-referencing a professional pharmaceutical knowledge base (e.g., recognizing "claynase" as "Clarinase").
- **AI Confidence & Safety Transparency**: Real-time accuracy metrics and safety warnings (e.g., "AI is not sure") when scan quality is low, ensuring a "Human-in-the-loop" verification process for critical health data.
- **AI-Driven Risk Classification**: Automatically categorizes medications into Low, Medium, or High risk levels. This powers our **Safe Disposal Engine**, providing tailored instructions on whether an item can be binned or must be returned to a pharmacy.

### 3. 🏥 Holistic Health Management
- **Smart Schedule**: Real-time dose tracking and "Daily Health Tips" to boost wellness.
- **Inventory Control**: Automated "Low Stock" and "Expiring" alerts to help you recycle before it's too late.

---

## ⚙️ Google Technology Integration
We utilized a "Cause-and-Effect" approach to integrate Google's powerful ecosystem:

- **Google Gemini 1.5 Flash**: The brain of PoyoMed. We used Gemini's multimodal capabilities to analyze medicine labels in real-time. This **allowed our system to provide instant, contextual extraction** of complex medical data (dosage, expiry, risk).
- **Firebase Firestore & Auth**: The backbone of our real-time synchronization. Firestore **enabled seamless state management** between AI analysis and the user's dashboard, ensuring safety alerts are delivered immediately.
- **Google Maps Integration**: We integrated location data to connect users with official drop-off points. This **simplified the recycling path**, directly increasing the likelihood of responsible disposal.

---

## 📂 Repository Roadmap
- `app/`: View layer - modular screens for every core feature.
- `services/`: AI & External API communication layers (contains Interaction Logic).
- `hooks/`: Reusable logic for forms and state management.
- `utils/`: Business logic, date calculations, and risk algorithms.
- `constants/`: Global style tokens and configuration.
- `components/`: Atomic UI components.

---

## 🏗️ Technical Architecture
PoyoMed is built on a modular, serverless architecture designed for real-time safety and global scalability. Our data flows seamlessly from scan to safety check:

```text
User Input (Medicine Label Photo & Text)
           ↓
Firebase Authentication (Secure User Session)
           ↓
Gemini 1.5 Flash API (Multimodal AI Extraction & Reasoning)
           ↓
AI Service Layer (Interaction Guard & Risk Classification)
           ↓
Firestore (Real-time DB Sync & Schedule Creation)
           ↓
React Native UI (Live Dashboard & Disposal Alerts)
```

## 🚀 Future Roadmap
1. **E-Pharmacy Integration**: Direct refill requests via certified pharmacy partners based on tracked inventory levels.
2. **Poyo-Rider Fleet**: A crowdsourced or partner-based pickup network for "Recycle-First" collection bags.
3. **Advanced Interaction DB**: Expanding the AI's clinical knowledge base to include traditional and herbal medicine interactions.

## 🧠 Challenges & Learnings
- **The "Accuracy Gap"**: We discovered that hospital medicine labels often omit clear expiry dates. We overcame this by training our Gemini prompt logic to "infer" safety windows from dispense dates and local pharmaceutical standards.
- **UX of Safety**: Initially, users found AI-generated instructions too technical. We solved this by implementing the **Jargon Decoder** to simplify clinical text into friendly, actionable advice.

---

## 🌿 License & Acknowledgments
Developed for **Kitahack 2026** to showcase the potential of Google AI in sustainable healthcare.

<p align="center"><b>Let's heal the world, one dose at a time.</b></p>
