import { initCurrentWeather } from "./currentWeather.js";
import { initForecastToggle } from "./forecast.js";
import { initNavigation } from "./navigation.js";
import { initCityManagement } from "./cityManager.js";

function setDynamicBackground() {
  const currentHour = new Date().getHours();
  const background = document.getElementById("hero-bg");

  if (currentHour >= 6 && currentHour < 19) {
    background.classList.add("daytime-bg");
    console.log("Daytime background applied");
  } else {
    background.classList.remove("daytime-bg");
    console.log("Nighttime background applied");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Weather App initialized");

  try {
    setDynamicBackground();
    initCurrentWeather();
    initForecastToggle();
    initCityManagement();
    initNavigation();

    console.log("All modules loaded successfully");
  } catch (error) {
    console.error("Error initializing app:", error);
  }
});
