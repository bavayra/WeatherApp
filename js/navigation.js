import { renderSavedCities } from "./cityManager.js";
/*import { initializeMap } from "./map.js";*/

let listenersInitialized = false;

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
    heroSection.style.display = "none";
    citiesSection.style.display = "none";
    mapSection.style.display = "block";
    setTimeout(() => {
      import("./map.js")
        .then((m) => m.initializeMap())
        .catch((err) => {
          console.error("Failed to load map module:", err);
        });
    }, 100);
  };

  const handleCitiesClick = () => {
    heroSection.style.display = "none";
    citiesSection.style.display = "block";
    mapSection.style.display = "none";
    renderSavedCities();
  };

  const handleAddCityClick = () => {
    heroSection.style.display = "none";
    citiesSection.style.display = "block";
    mapSection.style.display = "none";
    setTimeout(() => {
      const searchInput = document.getElementById("search-input");
      if (searchInput) searchInput.focus();
    }, 100);
  };

  const handleHeadBackClick = () => {
    citiesSection.style.display = "none";
    heroSection.style.display = "block";
    mapSection.style.display = "none";
  };

  const handleMapBackClick = () => {
    mapSection.style.display = "none";
    heroSection.style.display = "block";
    citiesSection.style.display = "none";
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
