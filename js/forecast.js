import { getForecast } from "./api.js";

export let weatherData = {
  hourly: [],
  daily: [],
};

export function initForecastToggle() {
  console.log("Initializing forecast toggle...");

  const forecastByHours = document.querySelector(".forecast-by-hours");
  const forecastByDays = document.querySelector(".forecast-by-days");

  if (!forecastByHours || !forecastByDays) {
    console.error("Forecast containers not found in HTML");
    return;
  }

  setupForecastListeners();

  document.addEventListener("weatherDataUpdated", () => {
    const hourlyBtn = document.getElementById("hourly-forecast-btn");
    if (hourlyBtn && hourlyBtn.getAttribute("aria-pressed") === "true") {
      renderHourlyForecast();
    } else {
      renderDailyForecast();
    }
  });
}

export async function updateForecastForCity(lat, lon) {
  try {
    const forecastData = await getForecast(lat, lon);

    if (forecastData) {
      weatherData.hourly = forecastData.hourly;
      weatherData.daily = forecastData.daily;

      console.log("Weather data updated:", weatherData);

      const hourlyBtn = document.getElementById("hourly-forecast-btn");
      if (hourlyBtn && hourlyBtn.classList.contains("active")) {
        renderHourlyForecast();
      } else {
        renderDailyForecast();
      }
    }
  } catch (error) {
    console.error("Failed to update forecast:", error);
  }
}

function setupForecastListeners() {
  const hourlyBtn = document.getElementById("hourly-forecast-btn");
  const dailyBtn = document.getElementById("daily-forecast-btn");

  if (!hourlyBtn || !dailyBtn) {
    console.error("Forecast buttons not found");
    return;
  }

  const hourlyForecast = document.querySelector(".forecast-by-hours");
  const dailyForecast = document.querySelector(".forecast-by-days");

  hourlyBtn.addEventListener("click", () => {
    hourlyBtn.setAttribute("aria-pressed", "true");
    hourlyBtn.classList.add("active");
    dailyBtn.setAttribute("aria-pressed", "false");
    dailyBtn.classList.remove("active");

    hourlyForecast.classList.remove("visually-hidden");
    dailyForecast.classList.add("visually-hidden");

    renderHourlyForecast();
  });

  dailyBtn.addEventListener("click", () => {
    dailyBtn.setAttribute("aria-pressed", "true");
    dailyBtn.classList.add("active");
    hourlyBtn.setAttribute("aria-pressed", "false");
    hourlyBtn.classList.remove("active");

    dailyForecast.classList.remove("visually-hidden");
    hourlyForecast.classList.add("visually-hidden");

    renderDailyForecast();
  });
}

export function renderHourlyForecast() {
  const container = document.querySelector(".forecast-by-hours");
  if (!container) return;

  container.innerHTML = "";
  console.log("Rendering hourly forecast:", weatherData.hourly.length, "items");

  weatherData.hourly.forEach((item) => {
    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast";
    forecastCard.innerHTML = `
      <p class="hour">${item.time}</p>
      <img
        class="forecast-weather-icon"
        src="/icons-weather/${item.icon}"
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

export function renderDailyForecast() {
  const container = document.querySelector(".forecast-by-days");
  if (!container) return;

  container.innerHTML = "";

  console.log("Rendering daily forecast:", weatherData.daily.length, "items");

  weatherData.daily.forEach((item, index) => {
    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast";

    if (index === 0) {
      forecastCard.classList.add("active");
    }

    forecastCard.innerHTML = `
      <p class="day">${item.day}</p>
      <img
        class="forecast-weather-icon"
        src="/icons-weather/${item.icon}"
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

  console.log("Daily forecast rendered", weatherData.daily);
}
