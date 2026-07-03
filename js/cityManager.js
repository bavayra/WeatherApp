import { getWeatherByCity, getWeatherByCoords, searchCities } from "./api.js";

import { showErrorModal, showConfirmModal } from "./modal.js";
import { formatTempShort, getCurrentUnit } from "./tempConverter.js";
import { getWeatherIcon, getDayOrNight } from "./weatherIcons.js";

function getTemplate() {
  return document.getElementById("weather-card-template");
}
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
  loadSavedCities();

  document.addEventListener("tempUnitChanged", () => {
    renderSavedCities();
  });

  const searchInput = document.getElementById("search-input");
  const manageBtn = document.getElementById("manage-list-btn");
  const searchBtn = document.getElementById("search-btn");

  if (!searchInput) {
    console.error("Search input not found");
    return;
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
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

    filterCities(query.toLowerCase());
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = e.target.value.trim();

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

    if (query.length >= 3) {
      searchNewCities(query);
    }
  });
}

async function searchNewCities(query) {
  if (import.meta.env.DEV) console.log("Searching for:", query);

  try {
    if (currentSearchController) {
      currentSearchController.abort();
    }
    currentSearchController = new AbortController();
    const cities = await searchCities(query, currentSearchController.signal);
    displaySearchResults(cities);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    showErrorModal("Failed to search cities. Please try again.");
    return;
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
    const noEl = document.createElement("p");
    noEl.className = "no-results";
    noEl.textContent = "No cities found";
    searchResults.appendChild(noEl);
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
      await addCityFromSearch(city.lat, city.lon);
    });

    searchResults.appendChild(cityBtn);
  });

  searchResults.style.display = "block";
}

async function addCityFromSearch(lat, lon) {
  if (savedCities.length >= maxCities) {
    showErrorModal(
      `Maximum ${maxCities} cities allowed. Remove a city to add a new one.`,
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
    showErrorModal("Could not load city data. Please try again.");
    return;
  }
}

function filterCities(query) {
  const weatherCards = document.querySelectorAll(
    "#weather-widget .weather-card",
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
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        throw new Error("savedCities has invalid format (not an array)");
      }
      savedCities = parsed
        .map((c) => {
          if (!c || !c.name) return null;
          return {
            name: c.name,
            country: c.country || "",
            lat: Number(c.lat),
            lon: Number(c.lon),
            temp: c.temp ?? null,
            description: c.description ?? "",
            humidity: c.humidity ?? null,
            icon: c.icon ?? "",
          };
        })
        .filter(Boolean);
      if (savedCities.length === 0) {
        savedCities = [];
      }

      await updateAllCitiesWeather();
    } catch (err) {
      console.warn("Failed to parse savedCities from localStorage:", err);
      localStorage.removeItem("savedCities");
      savedCities = [];
    }
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
  const results = await Promise.allSettled(
    savedCities.map((city) => getWeatherByCoords(city.lat, city.lon)),
  );

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      savedCities[i] = result.value;
    } else {
      console.error(
        `Failed to update weather for ${savedCities[i].name}:`,
        result.reason,
      );
    }
  });

  saveCitiesToStorage();
  renderSavedCities();
}

function saveCitiesToStorage() {
  localStorage.setItem("savedCities", JSON.stringify(savedCities));
}

export function renderSavedCities() {
  const widget = document.getElementById("weather-widget");
  if (!widget) {
    return;
  }

  widget.innerHTML = "";

  if (savedCities.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "No saved cities yet. Add your first city!";
    widget.appendChild(emptyMessage);
    return;
  }

  const fragment = document.createDocumentFragment();

  savedCities.forEach((city, index) => {
    const card = createWeatherCard(city, index);

    if (card) {
      fragment.appendChild(card);
    } else {
      if (import.meta.env.DEV)
        console.warn(`Skipped invalid city at index ${index}:`, city);
    }
  });

  widget.appendChild(fragment);

  if (import.meta.env.DEV) console.log(`Rendered ${savedCities.length} cities`);
}

function createWeatherCard(city, index) {
  if (!city || !city.icon) {
    console.error("Invalid city data:", city);
    return null;
  }

  const tpl = getTemplate();
  if (!tpl) {
    console.error("weather-card-template not found in DOM");
    return null;
  }

  const el = tpl.content.firstElementChild.cloneNode(true);
  el.dataset.index = index;

  const timeOfDay = getDayOrNight();
  const baseIcon = String(city.icon).slice(0, 2);
  const currentIcon = baseIcon + timeOfDay;

  const iconImg = el.querySelector(".weather-icon img");
  if (iconImg) {
    iconImg.src = getWeatherIcon(currentIcon, "large");
    iconImg.alt = `Current weather in ${city.name}`;
  }

  const tempValueEl = el.querySelector(".city-temp .temp-value");
  if (tempValueEl) tempValueEl.textContent = formatTempShort(city.temp);

  const tempUnitEl = el.querySelector(".city-temp .temp-unit");
  if (tempUnitEl)
    tempUnitEl.textContent = getCurrentUnit() === "F" ? "°F" : "°C";

  const humEl = el.querySelector(".weather-hum");
  if (humEl) humEl.textContent = `Humidity: ${city.humidity ?? 0}%`;

  const cityEl = el.querySelector(".weather-city-country");
  if (cityEl) cityEl.textContent = `${city.name}, ${city.country}`;

  el.setAttribute(
    "aria-label",
    `Weather for ${city.name}, ${city.country}. Temperature ${city.temp} degrees, humidity ${city.humidity} percent`,
  );

  if (isManageMode) {
    const btn = el.querySelector(".delete-city-btn");
    if (btn) {
      btn.hidden = false;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeCity(index);
      });
    }
  }

  return el;
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
  if (
    !cityData ||
    !cityData.name ||
    cityData.lat == null ||
    cityData.lon == null
  ) {
    showErrorModal("Invalid city data");
    return false;
  }

  const lat = Number(cityData.lat);
  const lon = Number(cityData.lon);

  if (isNaN(lat) || isNaN(lon)) {
    showErrorModal("Invalid coordinates");
    return false;
  }

  const validation = validateCoordinates(lat, lon);
  if (!validation.valid) {
    showErrorModal(validation.error);
    return false;
  }

  if (savedCities.length >= maxCities) {
    showErrorModal(`Maximum ${maxCities} cities allowed`);
    return false;
  }

  const isDuplicate = savedCities.some((city) => {
    const existingLat = Number(city.lat);
    const existingLon = Number(city.lon);
    const newLat = Number(lat);
    const newLon = Number(lon);
    const latMatch = Math.abs(existingLat - newLat) < 0.01;
    const lonMatch = Math.abs(existingLon - newLon) < 0.01;
    return latMatch && lonMatch;
  });

  if (isDuplicate) {
    showErrorModal(`${cityData.name} is already in your list`);
    return false;
  }

  const newCity = {
    name: cityData.name,
    country: cityData.country,
    lat,
    lon,
    temp: cityData.temp,
    description: cityData.description,
    humidity: cityData.humidity,
    icon: cityData.icon,
  };

  savedCities.push(newCity);
  saveCitiesToStorage();
  renderSavedCities();
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
