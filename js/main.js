/*import { initCurrentWeather } from "./currentWeather.js";
import { initForecastToggle, initCarousel } from "./forecast.js";
import { initNavigation } from "./navigation.js";
import { initCityManagement } from "./cityManager.js";
import { showErrorModal } from "./modal.js";*/

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

    const runDeferred = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            initCurrentWeather();
            initForecastToggle();
            initCarousel();
            initCityManagement();
            initNavigation();
          },
          async () => {
            const [
              { initCurrentWeather },
              { initForecastToggle, initCarousel },
              { initCityManagement },
              { initNavigation },
            ] = await Promise.all([
              import("./currentWeather.js"),
              import("./forecast.js"),
              import("./cityManager.js"),
              import("./navigation.js"),
            ]);

            initCurrentWeather();
            initForecastToggle();
            initCarousel();
            initCityManagement();
            initNavigation();
          },
          { timeout: 2000 }
        );
      } else {
        setTimeout(() => {
          initCurrentWeather();
          initForecastToggle();
          initCarousel();
          initCityManagement();
          initNavigation();
        }, 200);
        setTimeout(async () => {
          const [
            { initCurrentWeather },
            { initForecastToggle, initCarousel },
            { initCityManagement },
            { initNavigation },
          ] = await Promise.all([
            import("./currentWeather.js"),
            import("./forecast.js"),
            import("./cityManager.js"),
            import("./navigation.js"),
          ]);

          initCurrentWeather();
          initForecastToggle();
          initCarousel();
          initCityManagement();
          initNavigation();
        }, 200);
      }
    };

    requestAnimationFrame(runDeferred);

    console.log("Core UI prepared, deferred modules scheduled");
  } catch (error) {
    console.error("Error initializing app:", error);
  }
});
