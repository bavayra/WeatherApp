import { renderSavedCities } from "./cityManager.js";

let listenersInitialized = false;

function showSection(el, opts = {}) {
  if (!el) return;
  el.classList.remove("hidden");
  el.classList.add("visible");
  el.setAttribute("aria-hidden", "false");

  if (opts.focus) {
    setTimeout(() => {
      const target =
        el.querySelector(opts.focus) || document.querySelector(opts.focus);
      if (target && typeof target.focus === "function") target.focus();
    }, opts.focusDelay || 80);
  }
}

function hideSection(el) {
  if (!el) return;
  el.classList.add("hidden");
  el.classList.remove("visible");
  el.setAttribute("aria-hidden", "true");
}

function showOnly(showEl, ...allSections) {
  allSections.forEach((s) => {
    if (s === showEl) {
      showSection(s);
    } else {
      hideSection(s);
    }
  });
}

export function initNavigation() {
  if (listenersInitialized) {
    return;
  }

  const heroSection = document.getElementById("hero-section");
  const citiesSection = document.getElementById("weather-by-cities");
  const mapSection = document.getElementById("weather-map-search");

  if (!heroSection || !citiesSection || !mapSection) {
    return;
  }
  showOnly(heroSection, heroSection, citiesSection, mapSection);

  listenersInitialized = true;
  setupNavigationListeners();
}

function setupNavigationListeners() {
  const heroSection = document.getElementById("hero-section");
  const citiesSection = document.getElementById("weather-by-cities");
  const mapSection = document.getElementById("weather-map-search");

  const mapBtn = document.querySelector(".weather-map");
  const citiesListBtn = document.querySelector(".cities-list");
  const addCityBtn = document.getElementById("add-city-btn");

  const headBackBtn = document.getElementById("head-back-btn");
  const mapBackBtn = document.getElementById("map-back-btn");

  const handleMapClick = () => {
    showOnly(mapSection, heroSection, citiesSection, mapSection);
    setTimeout(() => {
      import("./map.js")
        .then((m) => {
          if (m && typeof m.initializeMap === "function") m.initializeMap();
        })
        .catch((err) => {
          console.error("Failed to load map module:", err);
        });
    }, 100);
  };

  const handleCitiesClick = () => {
    showOnly(citiesSection, heroSection, citiesSection, mapSection);
    renderSavedCities();
  };

  const handleAddCityClick = () => {
    showOnly(citiesSection, heroSection, citiesSection, mapSection);
    setTimeout(() => {
      const searchInput = document.getElementById("search-input");
      if (searchInput) searchInput.focus();
    }, 100);
  };

  const handleHeadBackClick = () => {
    showOnly(heroSection, heroSection, citiesSection, mapSection);
  };

  const handleMapBackClick = () => {
    showOnly(heroSection, heroSection, citiesSection, mapSection);
  };

  if (mapBtn) {
    mapBtn.addEventListener("click", handleMapClick);
  }

  if (citiesListBtn) {
    citiesListBtn.addEventListener("click", handleCitiesClick);
  }

  if (addCityBtn) {
    addCityBtn.addEventListener("click", handleAddCityClick);
  }

  if (headBackBtn) {
    headBackBtn.addEventListener("click", handleHeadBackClick);
  }

  if (mapBackBtn) {
    mapBackBtn.addEventListener("click", handleMapBackClick);
  }
}

export function cleanupNavigation() {
  listenersInitialized = false;
  if (import.meta.env.DEV) console.log("Navigation listeners cleaned up");
}
