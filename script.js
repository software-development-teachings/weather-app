// ==========================================================================
// 1. DOM Element Selectors
// ==========================================================================
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const errorBanner = document.getElementById('error-banner');
const loadingSpinner = document.getElementById('loading-spinner');
const weatherCard = document.getElementById('weather-card');

// Dynamic Display Elements
const cityNameEl = document.getElementById('city-name');
const currentDateEl = document.getElementById('current-date');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const weatherConditionEl = document.getElementById('weather-condition');
const feelsLikeEl = document.getElementById('feels-like');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const pressureEl = document.getElementById('pressure');

// API Endpoints (Open-Meteo — Free & Keyless)
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// ==========================================================================
// 2. WMO Weather Code Mapper Utility
// ==========================================================================

/**
 * Maps WMO weather interpretation codes to readable descriptions and OpenWeather icon codes
 * @param {number} code - WMO weather code
 * @returns {Object} { description, icon }
 */
function getWeatherConditionMeta(code) {
  const weatherMap = {
    0: { description: 'Clear sky', icon: '01d' },
    1: { description: 'Mainly clear', icon: '02d' },
    2: { description: 'Partly cloudy', icon: '02d' },
    3: { description: 'Overcast', icon: '04d' },
    45: { description: 'Foggy', icon: '50d' },
    48: { description: 'Depositing rime fog', icon: '50d' },
    51: { description: 'Light drizzle', icon: '09d' },
    53: { description: 'Moderate drizzle', icon: '09d' },
    55: { description: 'Dense drizzle', icon: '09d' },
    61: { description: 'Slight rain', icon: '10d' },
    63: { description: 'Moderate rain', icon: '10d' },
    65: { description: 'Heavy rain', icon: '10d' },
    71: { description: 'Slight snow fall', icon: '13d' },
    73: { description: 'Moderate snow fall', icon: '13d' },
    75: { description: 'Heavy snow fall', icon: '13d' },
    80: { description: 'Slight rain showers', icon: '09d' },
    81: { description: 'Moderate rain showers', icon: '09d' },
    82: { description: 'Violent rain showers', icon: '09d' },
    95: { description: 'Thunderstorm', icon: '11d' }
  };

  return weatherMap[code] || { description: 'Unknown conditions', icon: '03d' };
}

// ==========================================================================
// 3. Async Data Handlers
// ==========================================================================

/**
 * Step 1: Geocode city name to lat/lon coordinates
 */
async function fetchCityCoordinates(city) {
  const response = await fetch(
    `${GEOCODING_API_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );

  if (!response.ok) {
    throw new Error(`Geocoding server error (${response.status})`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" not found. Please check spelling.`);
  }

  const { latitude, longitude, name, country } = data.results[0];
  return { latitude, longitude, name, country };
}

/**
 * Step 2: Fetch current weather metrics using latitude & longitude
 */
async function fetchWeatherData(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code',
    timezone: 'auto'
  });

  const response = await fetch(`${WEATHER_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Weather data server error (${response.status})`);
  }

  return await response.json();
}

/**
 * Orchestrator function connecting Geocoding + Weather Fetching
 */
async function getCityWeather(city) {
  const location = await fetchCityCoordinates(city);
  const weatherData = await fetchWeatherData(location.latitude, location.longitude);
  
  return {
    location: `${location.name}, ${location.country}`,
    current: weatherData.current,
    units: weatherData.current_units
  };
}

// ==========================================================================
// 4. Dynamic DOM Rendering
// ==========================================================================

/**
 * Maps parsed weather object onto DOM nodes
 * @param {Object} data - Processed weather payload
 */
function renderWeatherUI(data) {
  const { location, current, units } = data;
  const { description, icon } = getWeatherConditionMeta(current.weather_code);

  // Update text nodes
  cityNameEl.textContent = location;
  currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  temperatureEl.textContent = Math.round(current.temperature_2m);
  weatherConditionEl.textContent = description;

  // Secondary metrics with unit formatting
  feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}${units.apparent_temperature}`;
  humidityEl.textContent = `${current.relative_humidity_2m}${units.relative_humidity_2m}`;
  windSpeedEl.textContent = `${current.wind_speed_10m} ${units.wind_speed_10m}`;
  pressureEl.textContent = `${Math.round(current.surface_pressure)} ${units.surface_pressure}`;

  // Weather icon mapping
  weatherIconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  weatherIconEl.alt = description;
  weatherIconEl.hidden = false;

  // Make weather card visible
  weatherCard.classList.remove('hidden');
}

// ==========================================================================
// 5. Event Listeners
// ==========================================================================
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  if (!query) return;

  try {
    const data = await getCityWeather(query);
    renderWeatherUI(data);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});