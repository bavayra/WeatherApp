import { addCity } from "./cityManager.js";
import { getWeatherByCoords } from "./api.js";

let map = null;
let marker = null;

export async function initializeMap() {
  console.log("Initializing map...");

  const mapContainer = document.getElementById("map");

  if (!mapContainer) {
    console.error("Map container not found");
    return;
  }

  if (map) {
    map.invalidateSize();
    return;
  }

  try {
    const position = await getUserLocation();
    const { latitude, longitude } = position.coords;

    map = L.map("map").setView([latitude, longitude], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup("Your location")
      .openPopup();

    const weatherData = await getWeatherByCoords(latitude, longitude);
    displayWeatherOnMap(weatherData, latitude, longitude);
  } catch (error) {
    console.error("Geolocation error:", error);

    map = L.map("map").setView([51.505, -0.09], 10); //Fallback for the default location

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    alert("Could not get your location. Showing default location.");
  }

  setupMapClickListener();
}

function setupMapClickListener() {
  if (!map) return;

  map.on("click", async (e) => {
    const { lat, lng } = e.latlng;

    try {
      const weatherData = await getWeatherByCoords(lat, lng);
      displayWeatherOnMap(weatherData, lat, lng);
    } catch (error) {
      console.error("Failed to get weather for clicked location:", error);
    }
  });
}

function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("User denied geolocation permission"));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information unavailable"));
            break;
          case error.TIMEOUT:
            reject(new Error("Geolocation request timed out"));
            break;
          default:
            reject(new Error("An unknown error occurred"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

function displayWeatherOnMap(weatherData, lat, lon) {
  if (!map) return;

  if (marker) {
    map.removeLayer(marker);
  }

  const popupContent = `
    <div class="weather-popup">
      <h3>${weatherData.name}, ${weatherData.country}</h3>
      <p><strong>${weatherData.temp}°C</strong></p>
      <p>${weatherData.description}</p>
      <p>Humidity: ${weatherData.humidity}%</p>
      <button class="add-from-popup-btn" data-lat="${lat}" data-lon="${lon}">
        Add to favorites
      </button>
    </div>
  `;

  marker = L.marker([lat, lon]).addTo(map).bindPopup(popupContent).openPopup();
  marker.on("popupopen", () => {
    const addBtn = document.querySelector(".add-from-popup-btn");
    if (addBtn) {
      addBtn.addEventListener("click", async () => {
        const lat = parseFloat(addBtn.dataset.lat);
        const lon = parseFloat(addBtn.dataset.lon);

        try {
          const weatherData = await getWeatherByCoords(lat, lon);
          const success = addCity(weatherData);

          if (success) {
            showErrorModal(`${weatherData.name} was added to favorites!`);
          }
        } catch (error) {
          console.error("Error adding city from map:", error);
          showErrorModal("Failed to add city. Please try again.");
        }
      });
    }
  });
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
