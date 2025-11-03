# 🌦️ Weather App

A modern weather forecast application with real-time data, city search, and interactive map.

## 🎨 Design

The design is based on a Figma mockup with base dimensions of 390×844px (iPhone 12 Pro).

**View the design:**

Design is available upon request.

## ✨ Features

- 📱 **Mobile-first design** - optimized for 320-420px screens
- 🎯 **Responsive layout** - from iPhone SE to iPhone 14 Pro Max
- 🗺️ **Interactive map** - weather anywhere with Leaflet.js
- 🔍 **City search** - find and save favorite cities
- 📊 **Forecasts** - hourly and daily weather predictions
- 🌡️ **Temperature units** - switch between Celsius and Fahrenheit
- ♿ **Accessibility** - ARIA labels, semantic HTML, keyboard navigation
- ⚡ **Performance** - optimized loading with Vite
- 💾 **LocalStorage** - save your favorite cities
- 🔐 **Secure** - API key hidden in environment variables

## 📊 Lighthouse Score

- ⚡ Performance: **96/100**
- ♿ Accessibility: **99/100**
- ✅ Best Practices: **100/100**
- 🔍 SEO: **100/100**

## 🚀 Technologies

- **HTML5** - semantic markup
- **CSS3** - CSS Variables, Logical Properties, Media Queries
- **JavaScript (ES6+)** - modules, async/await
- **Vite** - build tool and dev server
- **Leaflet.js** - interactive maps
- **OpenWeatherMap API** - real-time weather data
- **Vanilla** - no frontend frameworks

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or yarn
- **OpenWeatherMap API key** (free)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/bavayra/WeatherApp.git
cd WeatherApp
```

2. **Install dependencies**

```bash
npm install
```

3. **Get your API key**

   - Go to [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key
   - ⏰ Wait 10-15 minutes for key activation

4. **Create `.env` file**

```bash
# Copy the example file
cp .env.example .env

# Or create manually in the root folder
```

5. **Add your API key to `.env`**

```env
VITE_WEATHER_API_KEY=your_actual_api_key_here
```

⚠️ **IMPORTANT:** Never commit `.env` file to Git! It's already in `.gitignore`.

6. **Run development server**

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Built files will be in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 📂 Project Structure

```
WeatherApp/
├── .env                    # ❌ Secret API key (not in Git)
├── .env.example            # ✅ Example for other developers
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── index.html              # Main page
├── index.css              # Import all styles
├── js/
│   ├── api.js             # API calls to OpenWeatherMap
│   ├── main.js            # Entry point
│   ├── cityManager.js     # City management logic
│   ├── currentWeather.js  # Current weather display
│   ├── forecast.js        # Forecast rendering
│   ├── map.js             # Leaflet map integration
│   ├── modal.js           # Modal dialogs
│   ├── navigation.js      # Screen navigation
│   └── tempConverter.js   # Temperature unit conversion
├── styles/
│   ├── base.css           # Global variables and styles
│   ├── hero-base.css      # Background elements
│   ├── current-w.css      # Current weather styles
│   ├── forecasts.css      # Forecast styles
│   ├── home-indicator.css # Toggle button
│   ├── footer.css         # Footer navigation
│   ├── cities-w-base.css  # Cities page base
│   ├── cities-w.css       # Weather cards
│   └── map.css            # Map styles
├── icons-base/            # Base icons (SVG)
├── icons-weather/         # Weather icons (SVG)
└── images/
    └── favicon/           # Favicons
```

## 📱 Supported Devices

- iPhone SE (320px)
- iPhone 12/13/14 (390px) - base size
- iPhone 12/13/14 Pro Max (428px)
- Responsive layout for all intermediate sizes

## 🎯 Responsive Strategy

- **320-389px**: scales to 100% width
- **390px**: fixed width 390px (base design)
- **430px+**: fixed width 390px, centered
- **845px+ (height)**: hero-section limited to 844px max height

## 🎨 CSS Architecture

- **Modular structure** - each component in a separate file
- **CSS Variables** - centralized color and typography management
- **Logical Properties** - `inline-size`, `block-size` for internationalization
- **rem units** - scalability and accessibility
- **Mobile-first** - mobile version first, then desktop

## 🔧 Optimizations

- ✅ Unitless line-height for proper scaling
- ✅ Preload for LCP image
- ✅ Explicit width/height for all images
- ✅ Lazy loading for images outside viewport
- ✅ Optimized selectors (merged duplicates)
- ✅ Minimized render-blocking resources
- ✅ Environment variables for API keys
- ✅ Vite for fast HMR and optimized builds

## 🌐 Deploy to GitHub Pages

### Option A: Using GitHub Actions (Recommended)

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          VITE_WEATHER_API_KEY: ${{ secrets.VITE_WEATHER_API_KEY }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. Add API key to GitHub Secrets:

   - Go to your repo → Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `VITE_WEATHER_API_KEY`
   - Value: your API key
   - Save

3. Enable GitHub Pages:

   - Settings → Pages
   - Source: GitHub Actions

4. Push to main branch - automatic deploy! 🚀

### Option B: Manual Deploy

```bash
# Build
npm run build

# Deploy dist/ folder to gh-pages branch
# (use gh-pages package or manually)
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start dev server with HMR
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Environment Variables

Create `.env` file with:

```env
VITE_WEATHER_API_KEY=your_api_key_here
```

All environment variables must start with `VITE_` to be accessible in the app.

## 📝 API Usage

This app uses [OpenWeatherMap API](https://openweathermap.org/api):

- Current Weather Data
- 5 Day / 3 Hour Forecast
- Geocoding API (city search)

Free tier limits:

- 60 calls/minute
- 1,000,000 calls/month

## 🐛 Troubleshooting

### `401 Unauthorized` error

- API key not activated yet (wait 10-15 minutes)
- Wrong API key in `.env`
- API key expired or deleted

### `npm run dev` not working on Windows PowerShell

```powershell
# Fix execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or use CMD instead of PowerShell
```

### Map not loading

- Check if Leaflet CDN is accessible
- Check browser console for errors
- Verify internet connection

### Cities not saving

- Check if localStorage is enabled in browser
- Check browser console for errors

## 📸 Screenshots

Will be released later on.

## 🌐 Demo

🔗 [View Live Version](https://bavayra.github.io/WeatherApp)

## 👨‍💻 Author

**Alix (x.bavayra)**

- GitHub: [@bavayra](https://github.com/bavayra)

## 📄 License

This project was created for educational purposes.

## 🙏 Acknowledgments

- Weather data from [OpenWeatherMap](https://openweathermap.org/)
- Maps powered by [Leaflet](https://leafletjs.com/)
- Icons from design mockup

---

⭐ If you like this project, give it a star!

## 📋 TODO

- [x] Real-time weather data
- [x] City search and favorites
- [x] Interactive map
- [x] Temperature unit switching
- [x] LocalStorage persistence
- [x] Secure API key storage
- [ ] Transition animations between screens
- [ ] PWA functionality (offline mode)
- [ ] Service Worker for caching
- [ ] Dark mode toggle
- [ ] Geolocation by IP fallback
- [ ] Weather alerts
- [ ] Multiple language support
