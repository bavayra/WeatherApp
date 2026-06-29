const GEO_API_BASE = "https://api.openweathermap.org/geo/1.0";
const API_BASE = "https://api.openweathermap.org/data/2.5";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

if (!API_KEY) {
  console.error("Make sure you created .env file with VITE_WEATHER_API_KEY");
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  const { signal: externalSignal, ...restOptions } = options;

  for (let i = 0; i < retries; i++) {
    try {
      const timeoutSignal = AbortSignal.timeout(10000);
      const signal = externalSignal
        ? AbortSignal.any([externalSignal, timeoutSignal])
        : timeoutSignal;

      const response = await fetch(url, { ...restOptions, signal });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Try again later.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (error.name === "AbortError") throw error; // не повторяем при отмене
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

export async function getCurrentWeather(lat, lon) {
  if (!navigator.onLine) {
    throw new Error("No internet connection");
  }
  try {
    const response = await fetchWithRetry(
      `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    );

    const data = await response.json();

    return formatWeatherData(data);
  } catch (error) {
    console.error("Weather fetch failed:", error);
    throw error;
  }
}

export async function getWeatherByCoords(lat, lon) {
  try {
    const response = await fetchWithRetry(
      `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    );

    const data = await response.json();
    return formatWeatherData(data);
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    throw error;
  }
}

export async function getForecast(lat, lon) {
  try {
    const response = await fetchWithRetry(
      `${API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch forecast:", error);
    throw error;
  }
}

export async function searchCities(query, signal) {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await fetchWithRetry(
      `${GEO_API_BASE}/direct?q=${encodeURIComponent(
        query,
      )}&limit=5&appid=${API_KEY}`,
      { signal },
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("City search failed:", error);
    return [];
  }
}

export async function getWeatherByCity(cityName) {
  try {
    const response = await fetchWithRetry(
      `${API_BASE}/weather?q=${encodeURIComponent(
        cityName,
      )}&appid=${API_KEY}&units=metric`,
    );

    const data = await response.json();
    return formatWeatherData(data);
  } catch (error) {
    console.error("Failed to fetch weather by city name:", error);
    throw error;
  }
}

function formatWeatherData(data) {
  return {
    name: data.name,
    country: data.sys.country,
    temp: Math.round(data.main.temp),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    lat: data.coord.lat,
    lon: data.coord.lon,
    icon: data.weather[0].icon,
  };
}
