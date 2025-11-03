import { renderSavedCities } from "./cityManager.js";
import { initializeMap } from "./map.js";

let listenersInitialized = false;

export function initNavigation() {
  console.log("Initializing navigation...");

  if (listenersInitialized) {
    console.log("Navigation already initialized, skipping...");
    return;
  }

  const heroSection = document.getElementById("hero-section");
  const citiesSection = document.getElementById("weather-by-cities");
  const mapSection = document.getElementById("weather-map-search");

  if (!heroSection || !citiesSection || !mapSection) {
    console.error("One or more sections not found");
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
    console.log("Opening map...");
    heroSection.style.display = "none";
    citiesSection.style.display = "none";
    mapSection.style.display = "block";
    setTimeout(() => initializeMap(), 100);
  };

  const handleCitiesClick = () => {
    console.log("Opening cities list...");
    heroSection.style.display = "none";
    citiesSection.style.display = "block";
    mapSection.style.display = "none";
    renderSavedCities();
  };

  const handleAddCityClick = () => {
    console.log("Opening add city...");
    heroSection.style.display = "none";
    citiesSection.style.display = "block";
    mapSection.style.display = "none";
    setTimeout(() => {
      const searchInput = document.getElementById("search-input");
      if (searchInput) searchInput.focus();
    }, 100);
  };

  const handleHeadBackClick = () => {
    console.log("Going back to hero...");
    citiesSection.style.display = "none";
    heroSection.style.display = "block";
    mapSection.style.display = "none";
  };

  const handleMapBackClick = () => {
    console.log("Going back from map...");
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
  console.log("Navigation listeners cleaned up");
}
