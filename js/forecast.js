export const weatherData = {
  hourly: [
    { time: "12AM", temp: 19, icon: "moon-cloud-rain-sm.svg" },
    { time: "1AM", temp: 18, icon: "moon-cloud-rain-sm.svg" },
    { time: "2AM", temp: 17, icon: "moon-cloud-sm.svg" },
    { time: "3AM", temp: 16, icon: "moon-cloud-sm.svg" },
    { time: "4AM", temp: 15, icon: "moon-sm.svg" },
    { time: "5AM", temp: 15, icon: "moon-sm.svg" },
    { time: "6AM", temp: 16, icon: "sun-sm.svg" },
    { time: "7AM", temp: 17, icon: "sun-sm.svg" },
  ],
  weekly: [
    { day: "MON", temp: 23, icon: "sun-cloud-rain-sm.svg" },
    { day: "TUE", temp: 17, icon: "moon-cloud-rain-sm.svg" },
    { day: "WED", temp: 20, icon: "sun-cloud-sm.svg" },
    { day: "THU", temp: 22, icon: "sun-sm.svg" },
    { day: "FRI", temp: 19, icon: "cloud-rain-sm.svg" },
    { day: "SAT", temp: 18, icon: "cloud-sm.svg" },
    { day: "SUN", temp: 21, icon: "sun-sm.svg" },
  ],
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
    createForecastButtons();
  }

  renderHourlyForecast();
  setupForecastListeners();
}

function createForecastButtons() {
  const homeIndicator = document.querySelector(".home-indicator");
  if (!homeIndicator) return;

  homeIndicator.innerHTML = `
    <div class="forecast-toggle">
      <button id="hourly-forecast-btn" class="forecast-btn active" aria-pressed="true">
        Hourly Forecast
      </button>
      <button id="weekly-forecast-btn" class="forecast-btn" aria-pressed="false">
        Weekly Forecast
      </button>
      <div id="shape-toggle" class="toggle-indicator"></div>
    </div>
  `;
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

    if (shapeToggle) {
      shapeToggle.style.transform = "translateX(0)";
    }

    renderHourlyForecast();
  });

  // Обработчик для кнопки "Weekly Forecast"
  weeklyBtn.addEventListener("click", () => {
    weeklyBtn.setAttribute("aria-pressed", "true");
    weeklyBtn.classList.add("active");
    hourlyBtn.setAttribute("aria-pressed", "false");
    hourlyBtn.classList.remove("active");

    weeklyForecast.classList.remove("visually-hidden");
    hourlyForecast.classList.add("visually-hidden");

    if (shapeToggle) {
      shapeToggle.style.transform = "translateX(100%)";
    }

    renderWeeklyForecast();
  });
}
