import { addCity } from "./cityManager.js";
import { getWeatherByCoords } from "./api.js";
import { formatTempShort } from "./tempConverter.js";

let map = null;
let marker = null;
let tempUnitListener = null;
let clickTimeout = null;
let mapClickHandlerAttached = false;

export async function initializeMap() {
  const mapContainer = document.getElementById("map");

  if (!mapContainer) {
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

  if (!mapClickHandlerAttached) {
    document.addEventListener("click", async function (e) {
      if (!e.target.classList.contains("add-from-popup-btn")) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const btn = e.target;
      btn.disabled = true;
      btn.textContent = "Adding...";

      const lat = parseFloat(btn.getAttribute("data-lat"));
      const lon = parseFloat(btn.getAttribute("data-lon"));

      console.log("Coordinates:", { lat, lon });

      try {
        const weatherData = await getWeatherByCoords(lat, lon);
        const success = addCity(weatherData);

        if (success) {
          alert(`${weatherData.name} was added to favorites!`);
          if (marker) marker.closePopup();
        }
      } catch (error) {
        alert("Failed to add city");
      } finally {
        btn.disabled = false;
        btn.textContent = "Add to favorites";
      }
    });

    mapClickHandlerAttached = true;
  }

  if (tempUnitListener) {
    document.removeEventListener("tempUnitChanged", tempUnitListener);
  }

  tempUnitListener = () => {
    if (marker && marker.isPopupOpen()) {
      const lat = marker.getLatLng().lat;
      const lon = marker.getLatLng().lng;

      getWeatherByCoords(lat, lon).then((weatherData) => {
        displayWeatherOnMap(weatherData, lat, lon);
      });
    }
  };
  document.addEventListener("tempUnitChanged", tempUnitListener);
}

function setupMapClickListener() {
  if (!map) return;

  map.on("click", async (e) => {
    const { lat, lng } = e.latlng;

    clearTimeout(clickTimeout);

    clickTimeout = setTimeout(async () => {
      try {
        const weatherData = await getWeatherByCoords(lat, lng);
        displayWeatherOnMap(weatherData, lat, lng);
      } catch (error) {
        alert("Failed to load weather. Please try again.");
      }
    }, 300);
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
  console.log("City:", weatherData.name);

  if (!map) {
    return;
  }

  if (marker) {
    map.removeLayer(marker);
  }

  const popupContent = `
    <div class="weather-popup">
      <h3>${weatherData.name}, ${weatherData.country}</h3>
      <p><strong>${formatTempShort(weatherData.temp)}</strong></p>
      <p>${weatherData.description}</p>
      <p>Humidity: ${weatherData.humidity}%</p>
      <button class="add-from-popup-btn" data-lat="${lat}" data-lon="${lon}">
        Add to favorites
      </button>
    </div>
  `;

  marker = L.marker([lat, lon]).addTo(map).bindPopup(popupContent).openPopup();

  marker.on("popupopen", function () {
    setTimeout(function () {
      const addBtn = document.querySelector(".add-from-popup-btn");

      if (!addBtn) {
        console.log(
          "Popup HTML:",
          document.querySelector(".leaflet-popup-content")?.innerHTML
        );
        return;
      }

      console.log("Button attributes:", {
        lat: addBtn.getAttribute("data-lat"),
        lon: addBtn.getAttribute("data-lon"),
        class: addBtn.className,
      });

      if (addBtn.hasAttribute("data-listener-attached")) {
        return;
      }

      addBtn.addEventListener("click", async function (e) {
        console.log("Event:", e);

        e.preventDefault();
        e.stopPropagation();

        addBtn.disabled = true;
        addBtn.textContent = "Adding...";

        const btnLat = parseFloat(addBtn.getAttribute("data-lat"));
        const btnLon = parseFloat(addBtn.getAttribute("data-lon"));

        console.log("Extracted coordinates:", { btnLat, btnLon });

        if (isNaN(btnLat) || isNaN(btnLon)) {
          alert("Invalid coordinates");
          addBtn.disabled = false;
          addBtn.textContent = "Add to favorites";
          return;
        }

        try {
          console.log("Fetching weather data...");
          const freshWeatherData = await getWeatherByCoords(btnLat, btnLon);

          if (!freshWeatherData || !freshWeatherData.name) {
            throw new Error("Invalid weather data");
          }
          console.log("Type of addCity:", typeof addCity);

          const success = addCity(freshWeatherData);
          if (success) {
            alert(`${freshWeatherData.name} was added to favorites!`);
            marker.closePopup();
          } else {
            console.log("City not added (duplicate or limit)");
          }
        } catch (error) {
          alert("Failed to add city: " + error.message);
        } finally {
          addBtn.disabled = false;
          addBtn.textContent = "Add to favorites";
        }
      });

      addBtn.setAttribute("data-listener-attached", "true");
    }, 100);
  });

  marker.on("popupclose", function () {
    console.log("Popup closed");
  });
}
