function setDynamicBackground() {
  const currentHour = new Date().getHours();
  const bgImage = document.getElementById("hero-bg-image");

  if (!bgImage) {
    console.error("Hero background image not found");
    return;
  }

  if (currentHour >= 6 && currentHour < 19) {
    bgImage.src = "icons-base/bg-sky.webp";
  } else {
    bgImage.src = "icons-base/bg.svg";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (import.meta.env.DEV) console.log("Weather App initialized");

  try {
    setDynamicBackground();

    const runDeferred = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
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
          { timeout: 500 }
        );
      } else {
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

    if (import.meta.env.DEV)
      console.log("Core UI prepared, deferred modules scheduled");
  } catch (error) {
    console.error("Error initializing app:", error);
  }
});
