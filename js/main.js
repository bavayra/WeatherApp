import { initCurrentWeather } from "./currentWeather.js";
import { initForecastToggle } from "./forecast.js";
import { initNavigation } from "./navigation.js";
import { initCityManagement } from "./cityManager.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Weather App initialized");

  try {
    initCurrentWeather();
    initForecastToggle();
    initCityManagement();
    initNavigation();

    console.log("All modules loaded successfully");
  } catch (error) {
    console.error("Error initializing app:", error);
  }
});
