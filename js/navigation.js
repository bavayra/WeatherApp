import { renderSavedCities } from "./cityManager.js";
import { initializeMap } from "./map.js";

export function initNavigation() {
  console.log("Initializing navigation...");

  const heroSection = document.getElementById("hero-section");
  const citiesSection = document.getElementById("weather-by-cities");
  const mapSection = document.getElementById("weather-map-search");

  // Проверяем наличие секций
  if (!heroSection || !citiesSection || !mapSection) {
    console.error("One or more sections not found");
    return;
  }
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

  if (mapBtn) {
    mapBtn.addEventListener("click", () => {
      console.log("Opening map...");
      heroSection.style.display = "none";
      citiesSection.style.display = "none";
      mapSection.style.display = "block";
      setTimeout(() => initializeMap(), 100);
    });
  }

  if (citiesListBtn) {
    citiesListBtn.addEventListener("click", () => {
      console.log("Opening cities list...");
      heroSection.style.display = "none";
      citiesSection.style.display = "block";
      mapSection.style.display = "none";
      renderSavedCities();
    });
  }

  if (addCityBtn) {
    addCityBtn.addEventListener("click", () => {
      console.log("Opening add city...");
      heroSection.style.display = "none";
      citiesSection.style.display = "block";
      mapSection.style.display = "none";
      setTimeout(() => {
        const searchInput = document.getElementById("search-input");
        if (searchInput) searchInput.focus();
      }, 100);
    });
  }

  if (headBackBtn) {
    headBackBtn.addEventListener("click", () => {
      console.log("Going back to hero...");
      citiesSection.style.display = "none";
      heroSection.style.display = "block";
      mapSection.style.display = "none";
    });
  }

  if (mapBackBtn) {
    mapBackBtn.addEventListener("click", () => {
      console.log("Going back from map...");
      mapSection.style.display = "none";
      heroSection.style.display = "block";
      citiesSection.style.display = "none";
    });
  }
}
