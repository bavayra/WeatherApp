import {
  getForecast,
  getWeatherByCity,
  getWeatherByCoords,
  searchCities,
} from "./api.js";

import { showErrorModal, showConfirmModal } from "./modal.js";
import { formatTempShort } from "./tempConverter.js";

const maxCities = 5;

let savedCities = [];
let isManageMode = false;
let currentSearchController = null;

function validateCoordinates(lat, lon) {
  const latNum = Number(lat);
  const lonNum = Number(lon);

  if (isNaN(latNum) || isNaN(lonNum)) {
    return { valid: false, error: "Coordinates must be numbers" };
  }

  if (latNum < -90 || latNum > 90) {
    return { valid: false, error: "Latitude must be between -90 and 90" };
  }

  if (lonNum < -180 || lonNum > 180) {
    return { valid: false, error: "Longitude must be between -180 and 180" };
  }

  return { valid: true, lat: latNum, lon: lonNum };
}

export function initCityManagement() {
  console.log("Initializing city management...");

  loadSavedCities();

  document.addEventListener("tempUnitChanged", () => {
    renderSavedCities();
  });

  const searchInput = document.getElementById("search-input");
  const manageBtn = document.getElementById("manage-list-btn");
  const searchBtn = document.getElementById("search-btn"); /**/

  if (!searchInput) {
    console.error("Search input not found");
    return;
  }

  if (searchInput) {
    let searchTimeout;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);

      const query = e.target.value.trim();

      if (query.length >= 3) {
        searchTimeout = setTimeout(() => {
          searchNewCities(query);
        }, 500);
      } else {
        const searchResults = document.getElementById("search-results");
        if (searchResults) {
          searchResults.remove();
        }
      }

      console.log("Search input:", query);

      filterCities(query.toLowerCase());
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = e.target.value.trim();
        console.log("Enter pressed, searching for:", query);

        if (query.length >= 3) {
          searchNewCities(query);
        }
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      console.log("Search button clicked:", query);

      if (query.length >= 3) {
        searchNewCities(query);
      }
    });
  }

  if (manageBtn) {
    manageBtn.addEventListener("click", () => {
      isManageMode = !isManageMode;
      toggleManageMode();
    });
  }
  renderSavedCities();
}

async function searchNewCities(query) {
  console.log("Searching for:", query);

  try {
    if (currentSearchController) {
      currentSearchController.abort();
    }
    currentSearchController = new AbortController();
    const cities = await searchCities(query, currentSearchController.signal);
    displaySearchResults(cities);
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Search cancelled");
      return;
    }
    console.error("Error searching cities:", error);
    showErrorModal("Failed to search cities. Please try again.");
  }
}

function displaySearchResults(cities) {
  let searchResults = document.getElementById("search-results");

  if (!searchResults) {
    searchResults = document.createElement("div");
    searchResults.id = "search-results";
    searchResults.className = "search-results";

    const searchBar = document.getElementById("search-bar");
    if (searchBar && searchBar.parentElement) {
      searchBar.parentElement.appendChild(searchResults);
    }
  }

  searchResults.innerHTML = "";

  if (cities.length === 0) {
    searchResults.innerHTML = '<p class="no-results">No cities found</p>';
    searchResults.style.display = "block";
    return;
  }

  const resultsTitle = document.createElement("h3");
  resultsTitle.textContent = "Search results:";
  resultsTitle.className = "search-results-title";
  searchResults.appendChild(resultsTitle);

  cities.forEach((city) => {
    const cityBtn = document.createElement("button");
    cityBtn.className = "search-result-item";
    cityBtn.textContent = `${city.name}, ${city.country}${
      city.state ? ` (${city.state})` : ""
    }`;

    cityBtn.addEventListener("click", async () => {
      console.log("City clicked:", city.name, "Coords:", city.lat, city.lon);
      await addCityFromSearch(city.lat, city.lon);
    });

    searchResults.appendChild(cityBtn);
  });

  searchResults.style.display = "block";
}

async function addCityFromSearch(lat, lon) {
  if (savedCities.length >= maxCities) {
    showErrorModal(
      `Maximum ${maxCities} cities allowed. Remove a city to add a new one.`
    );
    return;
  }
  try {
    const weatherData = await getWeatherByCoords(lat, lon);

    if (weatherData) {
      const success = addCity(weatherData);

      if (success) {
        const searchResults = document.getElementById("search-results");
        if (searchResults) searchResults.remove();

        const searchInput = document.getElementById("search-input");
        if (searchInput) searchInput.value = "";
      }
    }
  } catch (error) {
    console.error("Error adding city:", error);
    showErrorModal("Could not load city data. Please try again.");
  }
}

function filterCities(query) {
  const weatherCards = document.querySelectorAll(
    "#weather-widget .weather-card"
  );

  weatherCards.forEach((card) => {
    const cityElement = card.querySelector(".weather-city-country");
    if (cityElement) {
      const cityName = cityElement.textContent.toLowerCase();
      card.style.display = cityName.includes(query) ? "block" : "none";
    }
  });
}

async function loadSavedCities() {
  const saved = localStorage.getItem("savedCities");
  if (saved) {
    savedCities = JSON.parse(saved);
    await updateAllCitiesWeather();
  } else {
    savedCities = [];
    try {
      const montrealWeather = await getWeatherByCity("Montreal");
      const torontoWeather = await getWeatherByCity("Toronto");
      if (montrealWeather) addCity(montrealWeather);
      if (torontoWeather) addCity(torontoWeather);
    } catch (error) {
      console.error("Failed to load default cities:", error);
    }
  }
}

async function updateAllCitiesWeather() {
  for (let i = 0; i < savedCities.length; i++) {
    const city = savedCities[i];
    try {
      const weatherData = await getWeatherByCity(city.name);
      savedCities[i] = weatherData;
    } catch (error) {
      console.error(`Failed to update weather for ${city.name}:`, error);
    }
  }
  saveCitiesToStorage();
  renderSavedCities();
}

function saveCitiesToStorage() {
  localStorage.setItem("savedCities", JSON.stringify(savedCities));
}

export function renderSavedCities() {
  const widget = document.getElementById("weather-widget");
  if (!widget) {
    console.error("Weather widget not found");
    return;
  }

  widget.innerHTML = "";

  if (savedCities.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "No saved cities yet. Add your first city!";
    widget.appendChild(emptyMessage);
    console.log("No cities to render");
    return;
  }

  const fragment = document.createDocumentFragment();

  savedCities.forEach((city, index) => {
    const card = createWeatherCard(city, index);

    if (card) {
      fragment.appendChild(card);
    } else {
      console.warn(`Skipped invalid city at index ${index}:`, city);
    }
  });

  widget.appendChild(fragment);

  console.log(`Rendered ${savedCities.length} cities`);
}

function createWeatherCard(city, index) {
  const card = document.createElement("div");
  card.className = "weather-card";
  card.dataset.index = index;

  card.setAttribute("role", "article");
  card.setAttribute(
    "aria-label",
    `Weather for ${city.name}, ${city.country}. Temperature ${city.temp} degrees, humidity ${city.humidity} percent`
  );

  card.innerHTML = `
    <div class="weather-card-bg">
      <img
        src="icons-base/Rectangle-3.svg"
        role="presentation"
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
    </div>
    <div class="weather-icon">
      <img
        src="./icons-weather/${city.icon}.svg"
        alt="Current weather in ${city.name}"
        loading="lazy"
      />
    </div>
    <div class="city-temp">
      <p>${formatTempShort(city.temp)}</p>
    </div>
    <div class="weather-desc">
      <p class="weather-hum">Humidity: ${city.humidity}%</p>
      <p class="weather-city-country">${city.name}, ${city.country}</p>
    </div>
    ${
      isManageMode
        ? '<button class="delete-city-btn" aria-label="Delete city">×</button>'
        : ""
    }
  `;

  if (isManageMode) {
    const deleteBtn = card.querySelector(".delete-city-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeCity(index);
    });
  }

  return card;
}

function toggleManageMode() {
  const manageBtn = document.getElementById("manage-list-btn");

  if (manageBtn) {
    if (isManageMode) {
      manageBtn.classList.add("active");
      manageBtn.setAttribute("aria-pressed", "true");
    } else {
      manageBtn.classList.remove("active");
      manageBtn.setAttribute("aria-pressed", "false");
    }
  }
  renderSavedCities();
}

export function addCity(cityData) {
  console.log("addCity called with:", cityData);

  if (!cityData || !cityData.name || !cityData.lat || !cityData.lon) {
    console.error("Invalid city data:", cityData);
    showErrorModal("Invalid city data");
    return false;
  }

  const lat = Number(cityData.lat);
  const lon = Number(cityData.lon);

  if (isNaN(lat) || isNaN(lon)) {
    showErrorModal("Invalid coordinates");
    return false;
  }

  const validation = validateCoordinates(cityData.lat, cityData.lon);
  if (!validation.valid) {
    showErrorModal(validation.error);
    return false;
  }

  if (savedCities.length >= maxCities) {
    showErrorModal(`Maximum ${maxCities} cities allowed`);
    return false;
  }

  const isDuplicate = savedCities.some((city) => {
    const latMatch = Math.abs(city.lat - cityData.lat) < 0.01;
    const lonMatch = Math.abs(city.lon - cityData.lon) < 0.01;
    return latMatch && lonMatch;
  });

  if (isDuplicate) {
    showErrorModal(`${cityData.name} is already in your list`);
    return false;
  }

  const newCity = {
    name: cityData.name,
    country: cityData.country,
    lat: cityData.lat,
    lon: cityData.lon,
    temp: cityData.temp,
    description: cityData.description,
    humidity: cityData.humidity,
    icon: cityData.icon,
  };

  savedCities.push(newCity);
  saveCitiesToStorage();
  renderSavedCities();

  console.log("City added successfully:", newCity);
  return true;
}

function removeCity(index) {
  const cityName = savedCities[index].name;

  showConfirmModal(`Do you want to delete ${cityName}?`, () => {
    const cards = document.querySelectorAll(".weather-card");
    const cardToRemove = cards[index];

    if (cardToRemove) {
      cardToRemove.classList.add("removing");

      setTimeout(() => {
        savedCities.splice(index, 1);
        saveCitiesToStorage();
        renderSavedCities();
      }, 400);
    } else {
      savedCities.splice(index, 1);
      saveCitiesToStorage();
      renderSavedCities();
    }
  });
}

document.addEventListener("clearSearch", () => {
  filterCities("");
});
