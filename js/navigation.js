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
  createNavigationButtons();
}

function createNavigationButtons() {
  const footerBack = document.getElementById("footer-back");
  const footerCenter = document.getElementById("footer-center");

  if (footerBack && !footerBack.innerHTML.trim()) {
    footerBack.innerHTML = `
      <button class="weather-map" aria-label="Open weather map">
        <img src="icons-base/map-icon.svg" alt="" width="24" height="24" />
      </button>
    `;
  }

  if (footerCenter && !footerCenter.innerHTML.trim()) {
    footerCenter.innerHTML = `
      <button id="add-city-btn" class="add-city-btn" aria-label="Add city">
        <span>+</span>
      </button>
      <button class="cities-list" aria-label="View cities list">
        <img src="icons-base/list-icon.svg" alt="" width="24" height="24" />
      </button>
    `;
  }

  const weatherHead = document.getElementById("weather-head-container");
  if (weatherHead && !weatherHead.innerHTML.trim()) {
    weatherHead.innerHTML = `
      <button id="head-back-btn" aria-label="Go back">
        <span>←</span>
      </button>
      <h2>Weather</h2>
      <button id="manage-list-btn" aria-label="Manage cities">
        <span>⋮</span>
      </button>
    `;
  }

  const searchBar = document.getElementById("search-bar");
  if (searchBar && !searchBar.innerHTML.trim()) {
    searchBar.innerHTML = `
      <input 
        type="search" 
        id="search-input" 
        placeholder="Search for cities..."
        aria-label="Search cities"
      />
    `;
  }
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
