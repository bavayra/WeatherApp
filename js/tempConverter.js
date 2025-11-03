let currentUnit = localStorage.getItem("tempUnit") || "C";

export function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

export function fahrenheitToCelsius(fahrenheit) {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

export function getCurrentUnit() {
  return currentUnit;
}

export function toggleUnit() {
  currentUnit = currentUnit === "C" ? "F" : "C";
  localStorage.setItem("tempUnit", currentUnit);

  const event = new CustomEvent("tempUnitChanged", {
    detail: { unit: currentUnit },
  });
  document.dispatchEvent(event);

  return currentUnit;
}

export function formatTemp(celsius) {
  if (currentUnit === "F") {
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${celsius}°C`;
}

export function formatTempShort(celsius) {
  if (currentUnit === "F") {
    return `${celsiusToFahrenheit(celsius)}<span class="temp-unit">°F</span>`;
  }
  return `${celsius}<span class="temp-unit">°С</span>`;
}

export function convertStoredTemp(temp) {
  if (currentUnit === "F") {
    return celsiusToFahrenheit(temp);
  }
  return temp;
}
