import { getForecast } from "./api.js";
import { showErrorModal } from "./modal.js";
import { formatTempShort } from "./tempConverter.js";
import { getWeatherIcon, getDayOrNight } from "./weatherIcons.js";

export let weatherData = {
  hourly: [],
  daily: [],
};

export function initForecastToggle() {
  const forecastByHours = document.querySelector(".forecast-by-hours");
  const forecastByDays = document.querySelector(".forecast-by-days");

  if (!forecastByHours || !forecastByDays) {
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

    if (forecastData && forecastData.list) {
      weatherData.hourly = forecastData.list.slice(0, 8);
      weatherData.daily = forecastData.list
        .filter((_, index) => index % 8 === 0)
        .slice(0, 7)
        .map((item) => ({
          day: new Date(item.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        }));

      const hourlyBtn = document.getElementById("hourly-forecast-btn");
      if (hourlyBtn && hourlyBtn.classList.contains("active")) {
        renderHourlyForecast();
      } else {
        renderDailyForecast();
      }
    }
  } catch (error) {
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
  if (!container) {
    return;
  }
  if (!weatherData.hourly || !weatherData.hourly.length) {
    container.innerHTML = '<p class="no-data">No hourly forecast available</p>';
    return;
  }

  container.innerHTML = "";

  weatherData.hourly.forEach((item) => {
    const timeOfDay = getDayOrNight();
    const baseIcon = item.icon.slice(0, 2);
    const currentIcon = baseIcon + timeOfDay;

    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast";
    forecastCard.innerHTML = `
      <p class="hour">${item.time}</p>
      <img
        class="forecast-weather-icon"
       src="${getWeatherIcon(currentIcon, "small")}"
        alt="Weather at ${item.time}"
        loading="lazy"
        width="44"
        height="44"
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
}

export function renderDailyForecast() {
  const container = document.querySelector(".forecast-by-days");
  if (!container) {
    return;
  }

  if (!weatherData.daily || !weatherData.daily.length) {
    container.innerHTML = '<p class="no-data">No daily forecast available</p>';
    return;
  }

  container.innerHTML = "";

  weatherData.daily.forEach((day, index) => {
    const timeOfDay = getDayOrNight();
    const baseIcon = day.icon.slice(0, 2);
    const currentIcon = baseIcon + timeOfDay;

    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast";

    if (index === 0) {
      forecastCard.classList.add("active");
    }

    forecastCard.innerHTML = `
      <p class="day">${day.day}</p>
      <img
        class="forecast-weather-icon"
        src="${getWeatherIcon(currentIcon, "small")}"
        alt="Weather on ${day.day}"
        loading="lazy"
        width="44"
        height="44"
      />
      <p class="temp-by-period">${formatTempShort(day.temp)}</p>
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
}

export function initCarousel() {
  const scrollArrow = document.getElementById("scroll-arrow");

  if (!scrollArrow) {
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
    return;
  }

  const items = container.querySelectorAll(".forecast");

  if (items.length === 0) {
    if (import.meta.env.DEV) console.warn("No forecast items found");
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
