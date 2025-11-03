import { getCurrentWeather, getWeatherByCoords, getForecast } from "./api.js";
import { showErrorModal } from "./modal.js";
import {
  renderHourlyForecast,
  renderDailyForecast,
  weatherData,
} from "./forecast.js";
import {
  formatTempShort,
  toggleUnit,
  getCurrentUnit,
} from "./tempConverter.js";

let userLocation = null;
let currentWeatherData = null;

export function initCurrentWeather() {
  console.log("Initializing current weather...");

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        userLocation = { lat, lon };

        await loadCurrentWeather(lat, lon);
        await loadForecastForLocation(lat, lon);
      },

      async (error) => {
        console.warn("Geolocation denied or unavailable:", error.message);
        const defaultLat = 45.5017;
        const defaultLon = -73.5673;
        userLocation = { lat: defaultLat, lon: defaultLon };

        await loadCurrentWeather(defaultLat, defaultLon);
        await loadForecastForLocation(defaultLat, defaultLon);
      }
    );
  } else {
    console.warn("Geolocation not supported");
    showErrorModal(
      "Geolocation is not supported by your browser. Using default location (Montreal)."
    );
    const defaultLat = 45.5017;
    const defaultLon = -73.5673;
    userLocation = { lat: defaultLat, lon: defaultLon };

    loadCurrentWeather(defaultLat, defaultLon);
    loadForecastForLocation(defaultLat, defaultLon);
  }
  setupTempToggle();
  document.addEventListener("tempUnitChanged", () => {
    if (currentWeatherData) {
      updateCurrentWeatherDisplay(currentWeatherData);
    }
  });
}

function setupTempToggle() {
  const currentTemp = document.querySelector(".current-temp");

  if (!currentTemp) {
    console.warn("Current temp element not found");
    return;
  }

  currentTemp.style.cursor = "pointer";
  currentTemp.setAttribute("role", "button");
  currentTemp.setAttribute("aria-label", "Toggle temperature unit");
  currentTemp.setAttribute("tabindex", "0");

  currentTemp.addEventListener("click", () => {
    const newUnit = toggleUnit();
    console.log(`Temperature unit changed to: ${newUnit}`);
  });

  currentTemp.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleUnit();
    }
  });
}

async function loadCurrentWeather(lat, lon) {
  const currentCity = document.querySelector(".current-city");
  const currentTemp = document.querySelector(".current-temp");
  const currentDesc = document.querySelector(".current-desc");
  const currentHum = document.querySelector(".current-hum");

  if (currentCity) currentCity.textContent = "Loading...";
  if (currentTemp) currentTemp.textContent = "--°";
  if (currentDesc) currentDesc.textContent = "--";
  if (currentHum) currentHum.textContent = "Humidity: --%";

  const weather = await getCurrentWeather(lat, lon);

  if (weather) {
    currentWeatherData = weather;
    updateCurrentWeatherDisplay(weather);
    console.log("Current weather loaded:", weather);
  } else {
    if (currentCity) currentCity.textContent = "Error";
    if (currentTemp) currentTemp.textContent = "--°";
    if (currentDesc) currentDesc.textContent = "Unable to load weather";
    if (currentHum) currentHum.textContent = "Humidity: --%";
  }
}

function updateCurrentWeatherDisplay(weather) {
  const currentCity = document.querySelector(".current-city");
  const currentTemp = document.querySelector(".current-temp");
  const currentDesc = document.querySelector(".current-desc");
  const currentHum = document.querySelector(".current-hum");

  if (currentCity) currentCity.textContent = weather.name;
  if (currentTemp) currentTemp.innerHTML = formatTempShort(weather.temp);
  if (currentDesc)
    currentDesc.textContent = capitalizeFirstLetter(weather.description);
  if (currentHum) currentHum.textContent = `Humidity: ${weather.humidity}%`;
}

async function loadForecastForLocation(lat, lon) {
  try {
    console.log("Loading forecast for location:", lat, lon);
    const data = await getForecast(lat, lon);

    console.log("Raw forecast data:", data);
    console.log("data.list exists?", !!data?.list);
    console.log("data.list length:", data?.list?.length);

    if (!data || !data.list || !Array.isArray(data.list)) {
      console.error("Invalid forecast data structure!");
      weatherData.hourly = [];
      weatherData.daily = [];
      renderHourlyForecast();
      renderDailyForecast();
      return;
    }

    weatherData.hourly = data.list.slice(0, 8).map((item) => {
      const date = new Date(item.dt * 1000);
      let hours = date.getHours();

      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${hours}${period}`;

      return {
        time: time,
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon + ".svg",
        description: item.weather[0].description,
      };
    });

    weatherData.daily = data.list
      .filter((item, index) => index % 8 === 4)
      .slice(0, 5)
      .map((item) => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        return {
          day: dayName,
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon + ".svg",
          description: item.weather[0].description,
        };
      });

    console.log("Processed forecast:", {
      hourly: weatherData.hourly.length,
      daily: weatherData.daily.length,
    });

    renderHourlyForecast();
    renderDailyForecast();

    console.log("Forecast rendered!");
  } catch (error) {
    console.error("Failed to load forecast:", error);
    weatherData.hourly = [];
    weatherData.daily = [];
    renderHourlyForecast();
    renderDailyForecast();
  }
}

export function getUserLocation() {
  return userLocation;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
