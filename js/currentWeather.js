import { getWeatherByCoords, getForecast } from "./api.js";
import { showErrorModal } from "./modal.js";
import {
  renderHourlyForecast,
  renderDailyForecast,
  getWeatherData,
  setWeatherData,
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

async function loadForecastForLocation(lat, lon) {
  try {
    const data = await getForecast(lat, lon);

    if (!data || !data.list || !Array.isArray(data.list)) {
      setWeatherData([], []);
      document.dispatchEvent(new CustomEvent("weatherDataUpdated"));
      return;
    }

    const hourly = data.list.slice(0, 8).map((item) => {
      const date = new Date(item.dt * 1000);
      const hours = date.getHours();
      const period = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const time = String(formattedHours) + period;

      return {
        time,
        temp: Math.round(item.main?.temp ?? 0),
        icon: item.weather?.[0]?.icon ?? "01d",
        description: item.weather?.[0]?.description ?? "",
      };
    });

    const groupedByDay = new Map();

    for (const item of data.list) {
      const date = new Date(item.dt * 1000);
      const dayKey =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0");

      if (!groupedByDay.has(dayKey)) {
        groupedByDay.set(dayKey, []);
      }
      groupedByDay.get(dayKey).push(item);
    }

    const daily = Array.from(groupedByDay.values())
      .slice(0, 7)
      .map((items) => {
        if (!items.length) return null;

        const representative = pickRepresentativeForecastPoint(items);
        const repDate = new Date(representative.dt * 1000);
        const dayName = repDate.toLocaleDateString("en-US", {
          weekday: "short",
        });

        const avgTemp =
          items.reduce((sum, point) => sum + (point.main?.temp ?? 0), 0) /
          items.length;

        return {
          day: dayName,
          temp: Math.round(avgTemp),
          icon: representative.weather?.[0]?.icon ?? "01d",
          description: representative.weather?.[0]?.description ?? "",
        };
      })
      .filter(Boolean);

    setWeatherData(hourly, daily);

    if (import.meta.env.DEV)
      console.log("Processed forecast:", {
        hourly: getWeatherData().hourly.length,
        daily: getWeatherData().daily.length,
      });

    document.dispatchEvent(new CustomEvent("weatherDataUpdated"));
  } catch (error) {
    console.error("Failed to load forecast:", error);
    setWeatherData([], []);
    document.dispatchEvent(new CustomEvent("weatherDataUpdated"));
  }
}

function toLocalDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function pickRepresentativeForecastPoint(items) {
  const targetHour = 12;

  return items.reduce((best, current) => {
    const bestHour = new Date(best.dt * 1000).getHours();
    const currentHour = new Date(current.dt * 1000).getHours();

    const bestDistance = Math.abs(bestHour - targetHour);
    const currentDistance = Math.abs(currentHour - targetHour);

    return currentDistance < bestDistance ? current : best;
  });
}

export function getUserLocation() {
  return userLocation;
}
