# PoyoMed 💊
> **Pioneering Smart Healthcare & Environmental Sustainability.**

PoyoMed is an all-in-one medication management ecosystem that leverages **Generative AI** and **Cloud Infrastructure** to help users stay healthy while minimizing the environmental impact of medical waste.

By combining proactive health tracking with a first-of-its-kind medication recycling system, PoyoMed addresses two critical global challenges: medication non-adherence and pharmaceutical pollution.

---

## 🌍 The Mission
To empower individuals to manage their health with confidence and provide a frictionless path for the responsible disposal of unused medications.

---

## 🛠️ Core Pillars

### 1. 🏥 Intelligent Health Management
Stay in control of your daily regimen with a sophisticated dashboard designed for clarity.
- **Smart Schedule**: Dynamic "Today's Schedule" that calculates your next dose in real-time.
- **Inventory Control**: Track stock levels with automated "Low Stock" and "Expiring" alerts.
- **Medication Archive**: Maintain a persistent history of all past and current prescriptions.
- **Detailed Insights**: View comprehensive medicine details, including dosage instructions and frequency.

### 2. 🤖 AI-Powered Scanner (Gemini 2.5)
Our scanner isn't just OCR—it's an intelligent assistant that understands your medicine labels.
- **Contextual Extraction**: Gemini AI parses brand names, generic active ingredients, and dosage units (pills, ml, tablets).
- **Spelling Normalization**: Automatically corrects handwriting or printing errors (e.g., "fver" → "Fever").
- **Smart Expiry Logic**: Intelligently distinguishes between *Dispensed Date* and *Expiry Date*. If an expiry date is missing, the AI estimates one based on the medicine type (syrup vs. tablet).
- **Manual Override**: A seamless transition from AI scanning to a pre-filled manual form for final verification.

### 3. ⚠️ Safety & Risk Classification
Safety is at the heart of PoyoMed. Every medicine enters a safety pipeline:
- **Risk Mapping**: Medicines are categorized as **Low**, **Medium**, or **High** risk based on therapeutic class (e.g., Vitamins vs. Antibiotics).
- **Safety Badges**: Visual indicators integrated throughout the app (Cards, Details, Recents).
- **Disposal Intelligence**: Targeted disposal methods (trash vs. pharmacy return) generated per medicine.

### 4. ♻️ The Recycling Ecosystem
A first-in-class feature set built for a greener planet.
- **Eco-Impact Dashboard**: Visualize your contribution with metrics like **Meds Saved** and **CO2 Reduction**.
- **The Drop-off Bag**: A dedicated workspace for items ready for disposal.
- **Point Locator**: Map-integrated finder for certified pharmacy collection boxes.
- **Educational Tips**: Bite-sized guides on how to protect our water and soil from pharmaceutical contamination.

---

## 🎨 Design Philosophy: "Poyo Warmth"
PoyoMed features a unique design system called **Warmth**:
- **Palette**: Soft Peach (#FFF5EB), Warm Orange (#FF8C42), and Eco Green (#82C91E).
- **Glassmorphism**: Modern frosted-glass card effects for a premium feel.
- **Adaptive UI**: Seamless transition between Light and Dark modes.
- **Micro-animations**: Powered by **Reanimated** for an organic, responsive user experience.

---

## ⚙️ Technical Architecture

- **Frontend**: React Native with **Expo SDK 52**.
- **AI Service**: REST API integration with **Gemini Pro Vision** (Flash 2.5).
- **Database**: Real-time synchronization with **Firebase Firestore**.
- **Routing**: Sophisticated file-based routing via **Expo Router**.
- **State Management**: React Hooks (useState/useEffect) with Firebase observers.

---

## � Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go (Mobile) or Android/iOS Emulator
- A Google AI (Gemini) API Key

### Setup
1. **Clone & Install**:
   ```bash
   git clone https://github.com/HeroJakes/PoyoMed.git
   npm install
   ```
2. **Environment Configuration**:
   Create a `.env` file:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
   ```
3. **Launch**:
   ```bash
   npx expo start
   ```

---

## 📂 Repository Roadmap
- `app/`: View layer - modular screens for every core feature.
- `services/`: AI & External API communication layers.
- `utils/`: Business logic, date calculations, and risk algorithms.
- `constants/`: Global style tokens and configuration.
- `components/`: Atomic UI components.

---

## � License & Acknowledgments
PoyoMed is a hackathon project by **HeroJakes**. Developed to showcase the potential of AI in sustainable healthcare.

<p align="center">🌿 <b>Let's heal the world, one dose at a time.</b> 💊</p>
