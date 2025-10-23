import { getForecast } from "./api.js";

let savedCities = [];
let isManageMode = false;

export function initCityManagement() {
  console.log("Initializing city management...");

  loadSavedCities();

  const searchInput = document.getElementById("search-input");
  const manageBtn = document.getElementById("manage-list-btn");

  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      filterCities(query.toLowerCase());

      clearTimeout(searchTimeout);
      if (query.length >= 3) {
        searchTimeout = setTimeout(() => {
          searchNewCities(query);
        }, 500);
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

  if (results.length > 0) {
    displaySearchResults(results);
  }
}

function displaySearchResults(cities) {
  const widget = document.getElementById("weather-widget");
  if (!widget) return;

  let searchSection = document.getElementById("search-results");
  if (!searchSection) {
    searchSection = document.createElement("div");
    searchSection.id = "search-results";
    searchSection.style.marginBottom = "20px";
    widget.insertBefore(searchSection, widget.firstChild);
  }

  searchSection.innerHTML = `
    <h3 style="color: #fff; margin-bottom: 10px;">Search results:</h3>
    ${cities
      .map(
        (city) => `
      <button 
        class="search-result-btn" 
        data-city="${city.name}" 
        data-country="${city.country}"
        data-lat="${city.lat}"
        data-lon="${city.lon}"
        style="
          display: block;
          width: 100%;
          padding: 12px;
          margin-bottom: 8px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 8px;
          color: #fff;
          text-align: left;
          cursor: pointer;
        "
      >
        📍 ${city.name}, ${city.country} ${city.state ? `(${city.state})` : ""}
      </button>
    `
      )
      .join("")}
  `;

  searchSection.querySelectorAll(".search-result-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const cityName = btn.dataset.city;
      await addCityFromSearch(cityName);
    });
  });
}

async function addCityFromSearch(cityName) {
  const weatherData = await getWeatherByCity(cityName);

  if (weatherData) {
    addCity(weatherData);

    const searchResults = document.getElementById("search-results");
    if (searchResults) searchResults.remove();

    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";
  } else {
    alert("Could not load city data");
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

function loadSavedCities() {
  const saved = localStorage.getItem("savedCities");
  if (saved) {
    savedCities = JSON.parse(saved);
  } else {
    savedCities = [
      {
        name: "Montreal",
        country: "Canada",
        temp: 19,
        humidity: 50,
        icon: "moon-cloud-wind-lg.svg",
      },
      {
        name: "Toronto",
        country: "Canada",
        temp: 20,
        humidity: 70,
        icon: "sun-cloud-rain-lg.svg",
      },
    ];
    saveCitiesToStorage();
  }
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
      '<p style="text-align: center; padding: 20px; color: #666;">Нет сохраненных городов</p>';
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
      deleteCity(index);
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

function deleteCity(index) {
  if (confirm("Удалить этот город из избранного?")) {
    savedCities.splice(index, 1);
    saveCitiesToStorage();
    renderSavedCities();
  }
}

export function addCity(cityData) {
  const exists = savedCities.some(
    (city) => city.name === cityData.name && city.country === cityData.country
  );

  if (!exists) {
    savedCities.push(cityData);
    saveCitiesToStorage();
    renderSavedCities();
    alert(`${cityData.name} is added to your favorites!`);
  } else {
    alert(`${cityData.name} is already on the favorites list`);
  }
}
