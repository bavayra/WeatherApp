import { addCity } from "./cityManager.js";
import { getWeatherByCoords } from "./api.js";

let map = null;
let marker = null;

export function initializeMap() {
  console.log("Initializing map...");

  const mapContainer = document.getElementById("map-container");

  if (!mapContainer) {
    console.error("Map container not found");
    return;
  }

  if (map) {
    map.invalidateSize();
    return;
  }

  try {
    map = L.map("map-container").setView([45.5017, -73.5673], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;

      if (marker) {
        map.removeLayer(marker);
      }

      marker = L.marker([lat, lng]).addTo(map);
      await showWeatherInfo(lat, lng);
    });

    console.log("Map initialized successfully");
  } catch (error) {
    console.error("Error initializing map:", error);
  }
}

async function showWeatherInfo(lat, lng) {
  const weatherInfo = document.getElementById("map-weather-info");

  if (!weatherInfo) {
    console.error("Map weather info container not found");
    return;
  }

  weatherInfo.classList.remove("hidden");
  weatherInfo.innerHTML = "<p>Loading weather...</p>";

  const weatherData = await getWeatherByCoords(lat, lng);

  if (!weatherData) {
    weatherInfo.innerHTML =
      '<p style="padding: 20px; color: #f00;">❌ Weather loading error /p>';
    return;
  }

  weatherInfo.innerHTML = `
      <div class="map-weather-card">
        <h3>Weather at this location</h3>
        <p>Coordinates: ${lat.toFixed(2)}, ${lng.toFixed(2)}</p>
        <p>Temperature: 18°C</p>
        <p>Humidity: 65%</p>
        <p>Description: Overcast</p>
        <button id="add-from-map" class="add-city-from-map-btn">
          Add to favorites
        </button>
      </div>
    `;

  const addBtn = document.getElementById("add-from-map");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const cityData = {
        name: weatherData.name,
        country: weatherData.country,
        temp: weatherData.temp,
        humidity: weatherData.humidity,
        icon: weatherData.icon,
      };
      addCity(cityData);
      alert(`${weatherData.name} was added to favorites!`);
    });
  }
}
