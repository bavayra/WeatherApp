import {
  getForecast,
  getWeatherByCity,
  getWeatherByCoords,
  searchCities,
} from "./api.js";

const maxCities = 5;

let savedCities = [];
let isManageMode = false;

export function initCityManagement() {
  console.log("Initializing city management...");

  loadSavedCities();

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
      const query = e.target.value.trim();

      console.log("Search input:", query);

      filterCities(query.toLowerCase());

      clearTimeout(searchTimeout);

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

  const results = await searchCities(query);

  console.log("Search results:", results);

  if (results.length > 0) {
    displaySearchResults(results);
  } else {
    displaySearchResults([]);
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
    widget.innerHTML =
      '<p style="text-align: center; padding: 20px; color: #666;">No favorite cities</p>';
    return;
  }

  savedCities.forEach((city, index) => {
    const card = createWeatherCard(city, index);
    widget.appendChild(card);
  });

  console.log(`Rendered ${savedCities.length} cities`);
}

function createWeatherCard(city, index) {
  const card = document.createElement("div");
  card.className = "weather-card";
  card.dataset.index = index;

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
        src="icons-weather/${city.icon}"
        alt="Current weather in ${city.name}"
        loading="lazy"
      />
    </div>
    <div class="city-temp">
      <p>${city.temp}°</p>
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
  if (savedCities.length >= maxCities) {
    showErrorModal(
      `You can only save up to ${maxCities} cities. Please remove a city first.`
    );
    return false;
  }

  const exists = savedCities.some(
    (city) => city.name === cityData.name && city.country === cityData.country
  );

  if (!exists) {
    savedCities.push(cityData);
    saveCitiesToStorage();
    renderSavedCities();
    return true;
  } else {
    showErrorModal(`${cityData.name} is already on the favorites list`);
    return false;
  }
}

function removeCity(index) {
  if (!confirm("Do you want to delete this city?")) return;
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
}

function showErrorModal(message) {
  let modal = document.getElementById("error-modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "error-modal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <p class="modal-message"></p>
        <button class="modal-ok-btn">OK</button>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".modal-close");
    const okBtn = modal.querySelector(".modal-ok-btn");

    closeBtn.addEventListener("click", () => hideErrorModal());
    okBtn.addEventListener("click", () => hideErrorModal());

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideErrorModal();
      }
    });
  }

  const messageEl = modal.querySelector(".modal-message");
  messageEl.textContent = message;
  modal.classList.add("show");
}

function hideErrorModal() {
  const modal = document.getElementById("error-modal");
  if (modal) {
    modal.classList.remove("show");
  }
}
