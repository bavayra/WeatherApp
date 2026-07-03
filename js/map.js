import { addCity } from "./cityManager.js";
import { getWeatherByCoords } from "./api.js";
import { formatTempShort } from "./tempConverter.js";
import { showErrorModal } from "./modal.js";

let map = null;
let marker = null;
let tempUnitListener = null;
let clickTimeout = null;
let mapClickHandlerAttached = false;

function showInfo(message, timeout = 2500) {
  try {
    const id = `map-toast-${Date.now()}`;
    const el = document.createElement("div");
    el.id = id;
    el.className = "map-toast";
    el.style.cssText =
      "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#222;color:#fff;padding:8px 12px;border-radius:6px;z-index:9999;opacity:0.95;font-size:13px";
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => document.body.removeChild(el), timeout);
  } catch (ignored) {
    if (import.meta.env.DEV) console.warn("showInfo fallback error", ignored);
  }
}

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

    showErrorModal("Could not get your location. Showing default location.");
  }

  setupMapClickListener();

  if (!mapClickHandlerAttached) {
    document.addEventListener("click", async function (e) {
      const btn = e.target.closest && e.target.closest(".add-from-popup-btn");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = "Adding...";

      const lat = parseFloat(btn.dataset.lat);
      const lon = parseFloat(btn.dataset.lon);

      if (isNaN(lat) || isNaN(lon)) {
        showErrorModal("Invalid coordinates");
        btn.disabled = false;
        btn.textContent = originalText;
        return;
      }

      try {
        const weatherData = await getWeatherByCoords(lat, lon);
        if (!weatherData || !weatherData.name) {
          showErrorModal("Invalid weather data");
          btn.disabled = false;
          btn.textContent = originalText;
          return;
        }

        const success = addCity(weatherData);
        if (success) {
          showInfo(`${weatherData.name} added to favorites`);
          if (marker && typeof marker.closePopup === "function")
            marker.closePopup();
        } else {
          if (import.meta.env.DEV)
            console.log("City was not added (duplicate/limit).");
          showInfo("City was not added (maybe duplicate or limit reached)");
        }
      } catch (err) {
        showErrorModal("Failed to add city: " + (err?.message || err));
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });

    mapClickHandlerAttached = true;
  }

  if (tempUnitListener) {
    document.removeEventListener("tempUnitChanged", tempUnitListener);
  }

  tempUnitListener = () => {
    if (marker && marker.isPopupOpen && marker.isPopupOpen()) {
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
        showErrorModal("Failed to load weather. Please try again.");
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
    title.textContent = `${weatherData.name || "Unknown"}, ${weatherData.country || ""}`;

    const tempP = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = formatTempShort(weatherData.temp);
    tempP.appendChild(strong);

    const desc = document.createElement("p");
    desc.textContent = weatherData.description || "";

    const hum = document.createElement("p");
    hum.textContent = `Humidity: ${Number(weatherData.humidity ?? 0)}%`;

    const btn = document.createElement("button");
    btn.className = "add-from-popup-btn";
    btn.type = "button";
    btn.textContent = "Add to favorites";
    btn.dataset.lat = String(lat);
    btn.dataset.lon = String(lon);
    btn.setAttribute(
      "aria-label",
      `Add ${weatherData.name || "city"} to favorites`,
    );

    wrapper.append(title, tempP, desc, hum, btn);
    return wrapper;
  }

  marker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup(createPopupContent(weatherData, lat, lon))
    .openPopup();

  marker.on("popupopen", function () {
    if (import.meta.env.DEV) {
      console.log("Popup opened for", weatherData?.name);
    }
  });

  marker.on("popupclose", function () {
    if (import.meta.env.DEV) console.log("Popup closed");
  });
}
