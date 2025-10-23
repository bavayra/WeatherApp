let savedCities = [];
let isManageMode = false;

export function initCityManagement() {
  console.log("Initializing city management...");

  loadSavedCities();

  const searchInput = document.getElementById("search-input");
  const manageBtn = document.getElementById("manage-list-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      filterCities(query);
    });
  }

  if (manageBtn) {
    manageBtn.addEventListener("click", () => {
      isManageMode = !isManageMode;
      toggleManageMode();
    });
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
  if (confirm("Do you want to delete this city from favorites?")) {
    savedCities.splice(index, 1);
    saveCitiesToStorage();
    renderSavedCities();
  }
}

function deleteCity(index) {
  if (confirm("Удалить этот город из избранного?")) {
    savedCities.splice(index, 1);
    saveCitiesToStorage();
    renderSavedCities();
  }
}

// Добавление города
export function addCity(cityData) {
  const exists = savedCities.some(
    (city) => city.name === cityData.name && city.country === cityData.country
  );

  if (!exists) {
    savedCities.push(cityData);
    saveCitiesToStorage();
    renderSavedCities();
    alert(`${cityData.name} добавлен в избранное!`);
  } else {
    alert(`${cityData.name} уже в избранном!`);
  }
}
