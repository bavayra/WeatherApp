import { getForecast } from "./api.js";
import { showErrorModal } from "./modal.js";
import { formatTempShort } from "./tempConverter.js";
import { getWeatherIcon, getDayOrNight } from "./weatherIcons.js";

let weatherData = {
  hourly: [],
  daily: [],
};

export function getWeatherData() {
  return weatherData;
}

export function setWeatherData(hourly, daily) {
  weatherData.hourly = Array.isArray(hourly) ? hourly : [];
  weatherData.daily = Array.isArray(daily) ? daily : [];
}

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

    if (
      !forecastData ||
      !Array.isArray(forecastData.list) ||
      forecastData.list.length === 0
    ) {
      setWeatherData([], []);
      document.dispatchEvent(new CustomEvent("weatherDataUpdated"));
      return;
    }

    const hourly = forecastData.list.slice(0, 8).map((item) => {
      const date = new Date(item.dt * 1000);
      const hours = date.getHours();
      const period = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;

      return {
        time: String(formattedHours) + period,
        temp: Math.round(item.main?.temp ?? 0),
        icon: item.weather?.[0]?.icon ?? "01d",
        description: item.weather?.[0]?.description ?? "",
      };
    });

    const grouped = new Map();
    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000);
      const key =
        date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    }

    const daily = Array.from(grouped.values())
      .slice(0, 7)
      .map((items) => {
        const representative = items.reduce((best, current) => {
          const bestHour = new Date(best.dt * 1000).getHours();
          const currHour = new Date(current.dt * 1000).getHours();
          return Math.abs(currHour - 12) < Math.abs(bestHour - 12)
            ? current
            : best;
        }, items[0]);

        const avgTemp =
          items.reduce((sum, p) => sum + (p.main?.temp ?? 0), 0) / items.length;

        const repDate = new Date(representative.dt * 1000);
        const dayName = repDate.toLocaleDateString("en-US", {
          weekday: "short",
        });

        return {
          day: dayName,
          temp: Math.round(avgTemp),
          icon: representative.weather?.[0]?.icon ?? "01d",
          description: representative.weather?.[0]?.description ?? "",
        };
      });

    setWeatherData(hourly, daily);
    document.dispatchEvent(new CustomEvent("weatherDataUpdated"));
  } catch (error) {
    showErrorModal("Failed to load weather forecast. Please try again later.");
    console.error("updateForecastForCity error:", error);
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

  const data = getWeatherData().hourly;
  if (!data || data.length === 0) {
    container.innerHTML = '<p class="no-data">No hourly forecast available</p>';
    return;
  }

  container.innerHTML = "";

  data.forEach((item) => {
    const timeOfDay = getDayOrNight();
    const baseIcon = String(item.icon).slice(0, 2);
    const currentIcon = baseIcon + timeOfDay;

    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast";

    const hourP = document.createElement("p");
    hourP.className = "hour";
    hourP.textContent = item.time || "";

    const img = document.createElement("img");
    img.className = "forecast-weather-icon";
    img.src = getWeatherIcon(currentIcon, "small");
    img.alt = `Weather at ${item.time || ""}`;
    img.loading = "lazy";
    img.width = 44;
    img.height = 44;

    const tempP = document.createElement("p");
    tempP.className = "temp-by-period";
    tempP.textContent = formatTempShort(item.temp);

    forecastCard.appendChild(hourP);
    forecastCard.appendChild(img);
    forecastCard.appendChild(tempP);

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

  const data = getWeatherData().daily;
  if (!data || data.length === 0) {
    container.innerHTML = '<p class="no-data">No daily forecast available</p>';
    return;
  }

  container.innerHTML = "";

  data.forEach((day, index) => {
    const timeOfDay = getDayOrNight();
    const baseIcon = String(day.icon).slice(0, 2);
    const currentIcon = baseIcon + timeOfDay;

    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast";
    if (index === 0) forecastCard.classList.add("active");

    const dayP = document.createElement("p");
    dayP.className = "day";
    dayP.textContent = day.day || "";

    const img = document.createElement("img");
    img.className = "forecast-weather-icon";
    img.src = getWeatherIcon(currentIcon, "small");
    img.alt = `Weather on ${day.day || ""}`;
    img.loading = "lazy";
    img.width = 44;
    img.height = 44;

    const tempP = document.createElement("p");
    tempP.className = "temp-by-period";
    tempP.textContent = formatTempShort(day.temp);

    forecastCard.appendChild(dayP);
    forecastCard.appendChild(img);
    forecastCard.appendChild(tempP);

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
    isHourly ? ".forecast-by-hours" : ".forecast-by-days",
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
