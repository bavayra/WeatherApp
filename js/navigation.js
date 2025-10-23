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
  createNavigationButtons();
  setupNavigationListeners();
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

  // Кнопки для weather-head-container
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

  // Кнопка поиска
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
