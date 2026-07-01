import { addCity } from "./cityManager.js";
import { getWeatherByCoords } from "./api.js";
import { formatTempShort } from "./tempConverter.js";
import { showErrorModal } from "./modal.js";

let map = null;
let marker = null;
let tempUnitListener = null;
let clickTimeout = null;
let mapClickHandlerAttached = false;

function ensureLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);

    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    const existing = document.querySelector(`script[src="${src}"]`);

    if (existing) {
      if (window.L) {
        return resolve(window.L);
      }

      existing.addEventListener("load", () => resolve(window.L));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        setTimeout(() => resolve(window.L), 50);
      }
    };
    s.onerror = (err) => {
      console.error("Failed to load Leaflet:", err);
      reject(err);
    };
    document.head.appendChild(s);
  });
}

export async function initializeMap() {
  try {
    await ensureLeaflet();
  } catch (error) {
    console.error("Failed to load Leaflet library:", error);
    return;
  }

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

      try {
        const weatherData = await getWeatherByCoords(lat, lon);
        const success = addCity(weatherData);

        if (success) {
          alert(`${weatherData.name} was added to favorites!`);
          if (marker) marker.closePopup();
        }
      } catch (error) {
        showErrorModal("Failed to add city");
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
      },
    );
  });
}

function displayWeatherOnMap(weatherData, lat, lon) {
  if (!map) {
    return;
  }

  if (marker) {
    map.removeLayer(marker);
  }

  function createPopupContent(weatherData, lat, lon) {
    const wrapper = document.createElement("div");
    wrapper.className = "weather-popup";

    const title = document.createElement("h3");
    title.textContent = `${weatherData.name}, ${weatherData.country}`;

    const temp = document.createElement("p");
    temp.innerHTML = `<strong>${formatTempShort(weatherData.temp)}</strong>`;

    const desc = document.createElement("p");
    desc.textContent = weatherData.description;

    const hum = document.createElement("p");
    hum.textContent = `Humidity: ${weatherData.humidity}%`;

    const btn = document.createElement("button");
    btn.className = "add-from-popup-btn";
    btn.textContent = "Add to favorites";
    btn.dataset.lat = lat;
    btn.dataset.lon = lon;

    wrapper.append(title, temp, desc, hum, btn);
    return wrapper;
  }

  marker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup(createPopupContent(weatherData, lat, lon))
    .openPopup();

  marker.on("popupopen", function () {
    setTimeout(function () {
      const addBtn = document.querySelector(".add-from-popup-btn");

      if (!addBtn) {
        if (import.meta.env.DEV)
          console.log(
            "Popup HTML:",
            document.querySelector(".leaflet-popup-content")?.innerHTML,
          );
        return;
      }

      if (import.meta.env.DEV)
        console.log("Button attributes:", {
          lat: addBtn.getAttribute("data-lat"),
          lon: addBtn.getAttribute("data-lon"),
          class: addBtn.className,
        });

      if (addBtn.hasAttribute("data-listener-attached")) {
        return;
      }

      addBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        e.stopPropagation();

        addBtn.disabled = true;
        addBtn.textContent = "Adding...";

        const btnLat = parseFloat(addBtn.getAttribute("data-lat"));
        const btnLon = parseFloat(addBtn.getAttribute("data-lon"));

        if (isNaN(btnLat) || isNaN(btnLon)) {
          alert("Invalid coordinates");
          addBtn.disabled = false;
          addBtn.textContent = "Add to favorites";
          return;
        }

        try {
          const freshWeatherData = await getWeatherByCoords(btnLat, btnLon);

          if (!freshWeatherData || !freshWeatherData.name) {
            throw new Error("Invalid weather data");
          }
          if (import.meta.env.DEV)
            console.log("Type of addCity:", typeof addCity);

          const success = addCity(freshWeatherData);
          if (success) {
            alert(`${freshWeatherData.name} was added to favorites!`);
            marker.closePopup();
          } else {
            if (import.meta.env.DEV)
              console.log("City not added (duplicate or limit)");
          }
        } catch (error) {
          showErrorModal("Failed to add city: " + error.message);
        } finally {
          addBtn.disabled = false;
          addBtn.textContent = "Add to favorites";
        }
      });

      addBtn.setAttribute("data-listener-attached", "true");
    }, 100);
  });

  marker.on("popupclose", function () {
    if (import.meta.env.DEV) console.log("Popup closed");
  });
}
