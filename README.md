# 🌾 Agriweather-AI

**Live demo:** [your-netlify-url.netlify.app](https://your-netlify-url.netlify.app)  
**Repository:** [https://github.com/TristanBrian/Agriweather-AI.git](https://github.com/TristanBrian/Agriweather-AI.git)

A production‑grade weather dashboard for precision agriculture, powered by the [Weather AI](https://weather-ai.co/docs) API. Click any location on the interactive map to get a 7‑day forecast with AI summaries, dive into 48 hours of hourly data, and monitor your API usage in real time — all behind a secure, cache‑optimised serverless proxy.

---

## ✨ Features

- **Interactive Map** – Leaflet + OpenStreetMap; click anywhere to fetch forecasts.
- **7‑Day Forecast** – daily highs/lows, conditions, and Gemini AI summaries.
- **48‑Hour Hourly Breakdown** – temperature, precipitation, wind, and humidity.
- **Geolocation** – “Use my location” button via Weather AI’s IP endpoint.
- **Live Usage Bar** – plan info, request counts, quota reset date; updates after every API call.
- **Dark / Light Mode** – toggle that persists across sessions (localStorage).
- **API Proxy Layer** – all Weather AI calls go through Next.js API routes:
  - 10‑minute in‑memory cache (ready for Redis/Upstash)
  - Per‑IP rate limiting (10 req/min)
  - Cache invalidation to keep usage data fresh
  - No API key exposed to the browser
- **Responsive & Accessible** – works on mobile, tablet, and desktop.

---

## 🔗 API Integration

| Weather AI Endpoint | App Route            | Purpose                       | Caching | AI usage          |
|---------------------|----------------------|-------------------------------|---------|-------------------|
| `/v1/forecast`      | `/api/weather`       | 7‑day daily forecast           | 10 min  | Yes (summaries)   |
| `/v1/weather-geo`   | `/api/weather/geo`   | Auto‑detect location forecast  | 10 min  | No (saves quota)  |
| `/v1/hourly`        | `/api/hourly`        | 48‑hour granular breakdown     | 10 min  | No               |
| `/v1/usage`         | `/api/usage`         | Plan, quota, billing period    | 15 sec* | N/A               |

> *Usage route caches for 15 seconds to prevent hitting our own rate limiter while staying near‑real‑time.

All responses are **normalised** in the proxy — e.g., the nested `/v1/usage` response is flattened before reaching the client.

---

## 🧠 Architecture & Scaling

- **Server‑side Proxy** – API key never touches the browser; caching + rate limiting applied in one place.
- **Caching** – Weather data cached for 10 minutes (matches API update interval). Usage data cached for 15 seconds with **cache invalidation** triggered after every successful weather request.
- **Rate Limiting** – Per‑IP sliding window (10 req/min). For multi‑instance deployments, swap to `@upstash/ratelimit`.
- **Production Swap** – The in‑memory cache (`src/lib/cache.ts`) can be replaced with **Upstash Redis** without changing the interface.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- A **Weather AI API key** from [weather-ai.co](https://weather-ai.co) → Dashboard → API Keys

### 1. Clone & Install
```bash
git clone https://github.com/TristanBrian/Agriweather-AI.git
cd Agriweather-AI
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your key:
```
WEATHER_AI_API_KEY=wai_your_actual_key
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🚢 Deploy to Netlify

### One‑click Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/TristanBrian/Agriweather-AI)

After clicking the button, set the environment variable:
- **Key:** `WEATHER_AI_API_KEY`
- **Value:** your Weather AI key

Netlify will automatically detect the Next.js build settings — no extra configuration needed.

### Manual Deployment
1. Push the repo to GitHub.
2. Go to [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Connect the repository.
4. In the site settings, add the environment variable `WEATHER_AI_API_KEY`.
5. Deploy! (Netlify uses `next build` by default.)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── weather/         # GET forecast
│   │   ├── weather/geo/     # GET IP‑based forecast
│   │   ├── hourly/          # GET hourly data
│   │   └── usage/           # GET usage & quota
│   ├── layout.tsx           # Root layout, theme provider
│   └── page.tsx             # Main dashboard
├── components/
│   ├── Map.tsx              # Interactive Leaflet map
│   ├── WeatherDisplay.tsx   # Current + 7‑day cards
│   ├── HourlyPanel.tsx      # 48‑hour scrollable view
│   ├── UsageBar.tsx         # Quota bars & plan info
│   ├── Tabs.tsx             # Forecast / Hourly tabs
│   └── ThemeToggle.tsx      # Dark/light mode button
├── lib/
│   ├── weather-ai.ts        # Axios client, auth, error handling
│   ├── cache.ts             # In‑memory TTL cache + invalidation
│   └── rate-limiter.ts      # Per‑IP sliding window
└── types/
    └── index.ts             # Shared TypeScript interfaces
```

---

## 🧪 How to Test

1. **Forecast tab** – click the map or **Use my location** → 7‑day forecast appears.
2. **Hour‑by‑hour tab** – 48 hours of granular weather data loads for the same location.
3. **Theme toggle** (top‑right corner) – switches between light and dark mode; preference saved.
4. **Usage bar** (top of page) – updates after every weather request to show live quota.

---

## 📦 Tech Stack

| Layer       | Technology |
|-------------|------------|
| Framework   | Next.js 14 (App Router) |
| Language    | TypeScript |
| Styling     | Tailwind CSS (`darkMode: 'class'`) |
| HTTP Client | Axios |
| Map         | Leaflet + react‑leaflet |
| Deployment  | Netlify |
| Caching     | In‑memory (swap to Redis/Upstash) |

---

## 📄 License

MIT — use freely for your own Weather AI integrations.

---

## 👨‍🌾 About

Made with ☕ by **Brian Kioko** — built for the Weather AI engineering challenge.

*For questions about the architecture or to discuss scaling further, feel free to reach out.*
```