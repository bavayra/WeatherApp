import { getWeatherByCoords, getForecast } from "./api.js";
import { showErrorModal } from "./modal.js";
import {
  renderHourlyForecast,
  renderDailyForecast,
  weatherData,
} from "./forecast.js";
import { formatTempShort, toggleUnit } from "./tempConverter.js";
import { getDayOrNight } from "./weatherIcons.js";

let userLocation = null;
let currentWeatherData = null;

export function initCurrentWeather() {
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
        if (import.meta.env.DEV)
          console.warn("Geolocation denied or unavailable:", error.message);
        const defaultLat = 45.5017;
        const defaultLon = -73.5673;
        userLocation = { lat: defaultLat, lon: defaultLon };

        await loadCurrentWeather(defaultLat, defaultLon);
        await loadForecastForLocation(defaultLat, defaultLon);
      },
    );
  } else {
    showErrorModal(
      "Geolocation is not supported by your browser. Using default location (Montreal).",
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
    return;
  }

  currentTemp.style.cursor = "pointer";
  currentTemp.setAttribute("role", "button");
  currentTemp.setAttribute("aria-label", "Toggle temperature unit");
  currentTemp.setAttribute("tabindex", "0");

  currentTemp.addEventListener("click", () => {
    const newUnit = toggleUnit();
    if (import.meta.env.DEV)
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

  try {
    const data = await getWeatherByCoords(lat, lon);

    if (!data || !data.name) {
      throw new Error("Invalid current weather data from API");
    }

    const timeOfDay = getDayOrNight();
    if (data.icon && typeof data.icon === "string") {
      const baseIcon = data.icon.slice(0, 2);
      data.icon = baseIcon + timeOfDay;
    } else {
      data.icon = "01" + timeOfDay;
    }

    currentWeatherData = data;
    updateCurrentWeatherDisplay(currentWeatherData);
  } catch (error) {
    showErrorModal("Failed to load current weather. Using placeholders.");
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
    const data = await getForecast(lat, lon);

    if (!data || !data.list || !Array.isArray(data.list)) {
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
      const formattedHours = hours % 12 || 12;
      const time = `${formattedHours}${period}`;

      return {
        time: time,
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description,
      };
    });

    weatherData.daily = data.list
      .filter((_, index) => index % 8 === 0)
      .slice(0, 7)
      .map((item) => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        return {
          day: dayName,
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        };
      });

    if (import.meta.env.DEV)
      console.log("Processed forecast:", {
        hourly: weatherData.hourly.length,
        daily: weatherData.daily.length,
      });

    renderHourlyForecast();
    renderDailyForecast();
  } catch (error) {
    console.error("Failed to load forecast:", error);
    weatherData.hourly = [];
    weatherData.daily = [];
  }
}

export function getUserLocation() {
  return userLocation;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
