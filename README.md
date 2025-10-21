# ☀️ Weather App

A mobile weather forecast application designed for ,mobile devices.

## 🎨 Design

The design is based on a Figma mockup with base dimensions of 390×844px (iPhone 12 Pro).

**View the design:**

Design is available upon request.

## ✨ Features

- 📱 **Mobile-first design** - optimized for 320-420px screens
- 🎯 **Responsive layout** - from iPhone SE to iPhone 14 Pro Max
- ♿ **Accessibility** - ARIA labels, semantic HTML
- ⚡ **Performance** - optimized loading
- 📦 **Clean code** - no frameworks, pure HTML/CSS

## 📊 Lighthouse Score

- ⚡ Performance: **96/100**
- ♿ Accessibility: **99/100**
- ✅ Best Practices: **100/100**
- 🔍 SEO: **100/100**

## 🚀 Technologies

- **HTML5** - semantic markup
- **CSS3** - CSS Variables, Logical Properties, Media Queries
- **JavaScript** (planned) - for dynamic data loading
- **Vanilla** - no frameworks or libraries

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

## 📂 Project Structure

```
WeatherApp/
├── index.html              # Main page
├── index.css              # Import all styles
├── styles/
│   ├── base.css           # Global variables and styles
│   ├── hero-base.css      # Background elements for main screen
│   ├── current-w.css      # Current weather
│   ├── forecasts.css      # Forecasts (hourly/weekly)
│   ├── home-indicator.css # Forecast toggle
│   ├── footer.css         # Footer with buttons
│   ├── cities-w-base.css  # Base styles for cities page
│   └── cities-w.css       # Weather cards for cities
├── icons-base/            # Base icons (SVG)
├── icons-weather/         # Weather icons (SVG)
└── images/
    └── favicon/           # Favicons
```

## 🎨 CSS Architecture

- **Modular structure** - each component in a separate file
- **CSS Variables** - centralized color and typography management
- **Logical Properties** - `inline-size`, `block-size` for future internationalization
- **rem units** - scalability and accessibility
- **Mobile-first** - mobile version first, then desktop

## 🔧 Optimizations

- ✅ Unitless line-height for proper scaling
- ✅ Preload for LCP image
- ✅ Explicit width/height for all images
- ✅ Lazy loading for images outside viewport
- ✅ Optimized selectors (merged duplicates)
- ✅ Minimized render-blocking resources

## 📝 TODO

- [ ] Weather API integration
- [ ] Dynamic city add/remove
- [ ] User geolocation
- [ ] LocalStorage data persistence
- [ ] Transition animations between screens
- [ ] PWA functionality (offline mode)
- [ ] Image compression (WebP)
- [ ] Service Worker for caching

## 🚀 Getting Started

### Local Server

```bash
# Using VS Code Live Server
# Or using Python:
python -m http.server 3000

# Or using Node.js:
npx serve .
```

Open http://localhost:3000 in your browser.

## 📸 Screenshots

Will be released later on.

## 🌐 Demo

🔗 [View Live Version](https://bavayra.github.io/WeatherApp)

## 👨‍💻 Author

**x.bavayra**

- GitHub: [@bavayra](https://github.com/bavayra)

## 📄 License

This project was created for educational purposes.

---

⭐ If you like this project, give it a star!
