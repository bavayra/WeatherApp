import { addCity } from "./cityManager.js";

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

  setTimeout(() => {
    weatherInfo.innerHTML = `
      <div class="map-weather-card">
        <h3>Погода в этой точке</h3>
        <p>Координаты: ${lat.toFixed(2)}, ${lng.toFixed(2)}</p>
        <p>Температура: 18°C</p>
        <p>Влажность: 65%</p>
        <p>Описание: Облачно</p>
        <button id="add-from-map" class="add-city-from-map-btn">
          Добавить в избранное
        </button>
      </div>
    `;

    const addBtn = document.getElementById("add-from-map");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const cityData = {
          name: `Location ${lat.toFixed(2)}`,
          country: `${lng.toFixed(2)}`,
          temp: 18,
          humidity: 65,
          icon: "cloud-lg.svg",
        };
        addCity(cityData);
      });
    }
  }, 500);
}
