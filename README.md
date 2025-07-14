# React URL Shortener Web Application

## 🧩 Overview

This is a fully functional, responsive **React-based URL Shortener Web Application** developed as part of the **Afford Medical Technologies Campus Hiring Evaluation**. The application supports core URL shortening functionality with analytics and logging, all managed on the client side. It ensures a clean user experience with robust error handling, logging middleware, and Material UI integration.

## 🏢 About the Company

**Afford Medical Technologies Private Limited (Affordmed)** is a healthcare technology company committed to improving the accessibility and affordability of medical services through innovation. By developing cutting-edge software solutions and streamlining operational workflows, Affordmed empowers hospitals, diagnostic labs, and healthcare institutions to deliver better patient care. The company believes in leveraging technology to bring transparency, affordability, and efficiency to the medical ecosystem.

## 🚀 Features

- ✅ Shorten up to **5 URLs concurrently**.
- 🔐 Optional **validity period** for each shortened URL (defaults to 30 minutes).
- 🧾 Optional **custom shortcode** (validated and checked for uniqueness).
- 🔄 **Redirection** via client-side routing.
- 📈 Analytics view with:
  - Click counts
  - Timestamps
  - Click sources
  - Coarse geolocation
- 🧰 **Custom logging middleware** used extensively across the app (console logging avoided).
- 🌐 **Runs on** `http://localhost:3000` only.
- 🧩 **Responsive design** using **Material UI**.
- ❌ No external CSS libraries (e.g., ShadCN), only Material UI and native CSS.

## 🧱 Tech Stack

| Technology | Purpose |
|------------|---------|
| React      | Frontend Framework |
| React Router DOM | Client-side Routing |
| Material UI | Styling and UI Components |
| Custom Middleware | Logging |
| LocalStorage | Session Persistence |
| Vite       | Project bundler |
| TypeScript (optional) | Static typing (if used) |

## 📂 Project Structure

```
url_shortener_app/
├── public/
├── src/
│   ├── components/
│   ├── middleware/
│   ├── pages/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── README.md
├── vite.config.js
└── package.json
```

## 🛠 Setup & Running Instructions

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/url-shortener-affordmed.git
cd url-shortener-affordmed
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the application

```bash
npm run dev
```

> The app will be running on **`http://localhost:3000`**

## 📝 Key Design Decisions

### 🌐 Client-Side Routing
- React Router DOM is used to handle redirection and route management.

### 💾 Data Modeling & Persistence
- All shortened URLs and their metadata are stored in **LocalStorage**.

### 🛡 Error Handling
- Validations include URL format, validity period, shortcode uniqueness.
- Friendly error messages are displayed using Material UI components.

### 🧱 Logging Middleware
- A **custom logging middleware** is implemented and integrated.

## 📊 Analytics Simulation

Since there's no real backend, analytics are mocked as follows:
- Each click increments the count and logs timestamp, source, and location.

## 📌 Assumptions

- Geolocation and click tracking are simulated using mocked data.
- Session persistence is limited to the browser's LocalStorage.

## 📍 Disclaimer

This project is part of a confidential hiring assessment for **Afford Medical Technologies Private Limited**. All code and logic are original and created exclusively for this purpose.

## 👨‍💻 Author

**Jayendra Kumar**  
Frontend Developer | React Enthusiast  
