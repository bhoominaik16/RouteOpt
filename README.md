# 📍 RouteOpt: The Secure Commute Ecosystem

> **A closed-network carpooling platform designed exclusively for organizations.** > *Secure. Verified. Sustainable.*

---

## 📖 Overview
Traffic congestion and unsafe public commuting are major issues for students and employees. Existing solutions like Uber are expensive, while WhatsApp groups are inefficient and unregulated.

**RouteOpt** is a multi-platform (Web & Mobile) solution that restricts access to verified organizational emails (e.g., `@ves.ac.in`). It uses **Geospatial Polyline logic** to match riders along a driver's specific route path, not just start/end points, and incentivizes eco-friendly behavior through a gamified "Eco-Loop."

## 🚀 Key Features (Why We Win)

### 🔒 1. Domain-Locked Security
* **Zero External Intrusion:** Access is strictly gated by institutional email domains.
* **Auto-Segmentation:** Users from "College A" can never see rides from "Company B."

### 🗺️ 2. Polyline Route Intelligence
* **Beyond Endpoints:** We don't just match `Start` and `End`. Our algorithm buffers the driver's **actual route path** to find passengers along the way (Deviation Logic).
* **Visual Mapping:** Real-time route visualization using Mapbox/Google Maps.

### 🌱 3. The "Eco-Loop" Gamification
* **Carbon Calculator:** Real-time tracking of CO₂ emissions saved.
* **Rewards:** "Green Points" are awarded per km saved, redeemable for campus perks (Canteen coupons, Priority parking).

### 🚨 4. Real-Time Safety
* **SOS Integration:** One-tap emergency alert sharing live coordinates with campus security.
* **Live Tracking:** WebSocket-based real-time driver tracking with <200ms latency.

---

## 🛠️ Tech Stack

### **Unified Cross-Platform Ecosystem**

| Component | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend (Web)** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React.js** | Admin Dashboard & Desktop User View |
| **Frontend (Mobile)**| ![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB) **React Native** | Rider/Driver Mobile App (via Expo) |
| **Styling** | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) **Tailwind / NativeWind** | Rapid UI Development |
| **Backend** | ![Node](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) **Express.js** | Custom API Logic & Middleware |
| **Database & Auth** | ![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat&logo=Firebase&logoColor=white) **Firestore** | Real-time DB, Auth, & Security Rules |
| **Maps** | **Mapbox GL / Google Maps** | Polyline Decoding & Geocoding |

---