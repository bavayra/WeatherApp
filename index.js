import { initMap, showWeatherInfo } from "./js/map.js";
import { setupNavigation } from "./js/navigation.js";
import { getWeatherByCoords } from "./js/weather.js";

document.addEventListener("DOMContentLoaded", function () {
  console.log("App loaded");

  setupNavigation(initMap);

  window.showWeatherInfo = showWeatherInfo;
  window.getWeatherByCoords = getWeatherByCoords;
});
