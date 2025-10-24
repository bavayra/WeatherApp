import { getForecast } from "./api.js";

export let weatherData = {
  hourly: [],
  weekly: [],
};

export function initForecastToggle() {
  console.log("Initializing forecast toggle...");

  const forecastByHours = document.querySelector(".forecast-by-hours");
  const forecastByDays = document.querySelector(".forecast-by-days");

  if (!forecastByHours || !forecastByDays) {
    console.error("Forecast containers not found in HTML");
    return;
  }

  const homeIndicator = document.querySelector(".home-indicator");

  if (!homeIndicator) {
    console.warn("Home indicator not found, creating buttons...");
  }

  setupForecastListeners();

  document.addEventListener("weatherDataUpdated", () => {
    const hourlyBtn = document.getElementById("hourly-forecast-btn");
    if (hourlyBtn && hourlyBtn.getAttribute("aria-pressed") === "true") {
      renderHourlyForecast();
    } else {
      renderWeeklyForecast();
    }
  });
}

export async function updateForecastForCity(lat, lon) {
  const forecastData = await getForecast(lat, lon);

  if (forecastData) {
    weatherData = forecastData;

    const hourlyBtn = document.getElementById("hourly-forecast-btn");
    if (hourlyBtn && hourlyBtn.classList.contains("active")) {
      renderHourlyForecast();
    } else {
      renderWeeklyForecast();
    }
  }
}

function setupForecastListeners() {
  const hourlyBtn = document.getElementById("hourly-forecast-btn");
  const weeklyBtn = document.getElementById("weekly-forecast-btn");

  if (!hourlyBtn || !weeklyBtn) {
    console.error("Forecast buttons not found");
    return;
  }

  const hourlyForecast = document.querySelector(".forecast-by-hours");
  const weeklyForecast = document.querySelector(".forecast-by-days");
  const shapeToggle = document.getElementById("shape-toggle");

  hourlyBtn.addEventListener("click", () => {
    hourlyBtn.setAttribute("aria-pressed", "true");
    hourlyBtn.classList.add("active");
    weeklyBtn.setAttribute("aria-pressed", "false");
    weeklyBtn.classList.remove("active");

    hourlyForecast.classList.remove("visually-hidden");
    weeklyForecast.classList.add("visually-hidden");

    renderHourlyForecast();
  });

  weeklyBtn.addEventListener("click", () => {
    weeklyBtn.setAttribute("aria-pressed", "true");
    weeklyBtn.classList.add("active");
    hourlyBtn.setAttribute("aria-pressed", "false");
    hourlyBtn.classList.remove("active");

    weeklyForecast.classList.remove("visually-hidden");
    hourlyForecast.classList.add("visually-hidden");

    renderWeeklyForecast();
  });
}

export function renderHourlyForecast() {
  const container = document.querySelector(".forecast-by-hours");
  if (!container) return;

  container.innerHTML = "";

  weatherData.hourly.forEach((item) => {
    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast";
    forecastCard.innerHTML = `
      <p class="hour">${item.time}</p>
      <img
        class="forecast-weather-icon"
        src="icons-weather/${item.icon}"
        alt="Weather at ${item.time}"
        loading="lazy"
        width="44"
        height="44"
         onerror="this.style.display='none'"
      />
      <p class="temp-by-period">${item.temp}°</p>
    `;
    container.appendChild(forecastCard);
  });

  console.log("Hourly forecast rendered");
}

export function renderWeeklyForecast() {
  const container = document.querySelector(".forecast-by-days");
  if (!container) return;

  container.innerHTML = "";

  weatherData.weekly.forEach((item) => {
    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast";
    forecastCard.innerHTML = `
      <p class="day">${item.day}</p>
      <img
        class="forecast-weather-icon"
        src="icons-weather/${item.icon}"
        alt="Weather on ${item.day}"
        loading="lazy"
        width="44"
        height="44"
         onerror="this.style.display='none'"
      />
      <p class="temp-by-period">${item.temp}°</p>
    `;
    container.appendChild(forecastCard);
  });

  console.log("Weekly forecast rendered");
}
