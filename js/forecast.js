import { getForecast } from "./api.js";
import { showErrorModal } from "./modal.js";
import { formatTempShort } from "./tempConverter.js";

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

  document.addEventListener("tempUnitChanged", () => {
    const hourlyBtn = document.getElementById("hourly-forecast-btn");
    if (hourlyBtn && hourlyBtn.getAttribute("aria-pressed") === "true") {
      renderHourlyForecast();
    } else {
      renderDailyForecast();
    }
  });

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
    showErrorModal("Failed to load weather forecast. Please try again later.");
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

  weatherData.hourly.forEach((item, index) => {
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
      <p class="temp-by-period">${formatTempShort(item.temp)}</p>
    `;

    forecastCard.addEventListener("click", () => {
      forecastCard.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    });

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
      <p class="temp-by-period">${formatTempShort(item.temp)}</p>
    `;

    forecastCard.addEventListener("click", () => {
      forecastCard.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    });

    container.appendChild(forecastCard);
  });

  console.log("Daily forecast rendered", weatherData.daily);
}

export function initCarousel() {
  const scrollArrow = document.getElementById("scroll-arrow");

  if (!scrollArrow) {
    console.warn("Scroll arrow button not found");
    return;
  }

  scrollArrow.addEventListener("click", handleCarouselScroll);
}

function handleCarouselScroll() {
  const hourlyBtn = document.getElementById("hourly-forecast-btn");
  const isHourly =
    hourlyBtn && hourlyBtn.getAttribute("aria-pressed") === "true";

  const container = document.querySelector(
    isHourly ? ".forecast-by-hours" : ".forecast-by-days"
  );

  if (!container) {
    console.warn("Forecast container not found");
    return;
  }

  const items = container.querySelectorAll(".forecast");

  if (items.length === 0) {
    console.warn("No forecast items found");
    return;
  }

  const itemWidth = items[0].offsetWidth;
  const gap = parseInt(getComputedStyle(container).gap) || 16;
  const scrollStep = itemWidth + gap;
  const currentScroll = container.scrollLeft;
  const maxScroll = container.scrollWidth - container.clientWidth;

  if (currentScroll >= maxScroll - 10) {
    container.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  } else {
    container.scrollTo({
      left: currentScroll + scrollStep,
      behavior: "smooth",
    });
  }
}
