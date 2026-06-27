export function getDayOrNight() {
  const currentHour = new Date().getHours();
  return currentHour >= 6 && currentHour < 19 ? "d" : "n";
}

export function getWeatherIcon(iconCode, size = "small") {
  const timeOfDay = getDayOrNight();
  if (!iconCode) {
    return `icons-weather/${size}/01${timeOfDay}-${
      size === "small" ? "sm" : "lg"
    }.svg`;
  }

  const suffix = size === "small" ? "sm" : "lg";
  return `icons-weather/${size}/${iconCode}-${suffix}.svg`;
}
