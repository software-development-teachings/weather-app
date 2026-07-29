// ==========================================================================
// 1. DOM Element Selectors & Global Application State
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
const tempUnitEl = document.getElementById('temp-unit');          // Safely handled if missing
const unitToggleBtn = document.getElementById('unit-toggle');      // Safely handled if missing
const weatherConditionEl = document.getElementById('weather-condition');
const feelsLikeEl = document.getElementById('feels-like');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const pressureEl = document.getElementById('pressure');

// Application State
const state = {
  currentUnit: 'C', // 'C' for Celsius, 'F' for Fahrenheit
  weatherData: null  // Holds active raw payload
};

// API Endpoints (Open-Meteo — Free & Keyless)
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// ==========================================================================
// 2. UI State & Utility Helpers
// ==========================================================================

function showLoadingState() {
  loadingSpinner.classList.remove('hidden');
  weatherCard.classList.add('hidden');
  errorBanner.classList.add('hidden');
}

function hideLoadingState() {
  loadingSpinner.classList.add('hidden');
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.remove('hidden');
  weatherCard.classList.add('hidden');
}

/**
 * Temperature Unit Converter
 * @param {number} celsius - Temperature in Celsius
 * @param {string} unit - Target unit ('C' or 'F')
 * @returns {number} Converted value
 */
function convertTemperature(celsius, unit) {
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/**
 * WMO Weather Code Mapper
 * Translates numerical weather codes into human-readable descriptions and icon IDs
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

async function fetchCityCoordinates(city) {
  try {
    const response = await fetch(
      `${GEOCODING_API_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}. Please try again later.`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`City "${city}" not found. Please check spelling.`);
    }

    const { latitude, longitude, name, country } = data.results[0];
    return { latitude, longitude, name, country };
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Network connection failure. Please check internet connection.');
    }
    throw error;
  }
}

async function fetchWeatherData(lat, lon) {
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code',
      timezone: 'auto'
    });

    const response = await fetch(`${WEATHER_API_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data (${response.status}).`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Unable to reach weather servers.');
    }
    throw error;
  }
}

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
// 4. Dynamic DOM Rendering & Unit Updates
// ==========================================================================

function renderWeatherUI() {
  if (!state.weatherData) return;

  const { location, current, units } = state.weatherData;
  const { description, icon } = getWeatherConditionMeta(current.weather_code);

  cityNameEl.textContent = location;
  currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Apply active unit conversion
  const tempVal = convertTemperature(current.temperature_2m, state.currentUnit);
  const feelsLikeVal = convertTemperature(current.apparent_temperature, state.currentUnit);

  temperatureEl.textContent = tempVal;

  // Safe checks so missing optional elements won't crash execution
  if (tempUnitEl) tempUnitEl.textContent = `°${state.currentUnit}`;
  if (unitToggleBtn) unitToggleBtn.textContent = `°${state.currentUnit === 'C' ? 'F' : 'C'}`;

  weatherConditionEl.textContent = description;

  feelsLikeEl.textContent = `${feelsLikeVal}°${state.currentUnit}`;
  humidityEl.textContent = `${current.relative_humidity_2m}${units.relative_humidity_2m}`;
  windSpeedEl.textContent = `${current.wind_speed_10m} ${units.wind_speed_10m}`;
  pressureEl.textContent = `${Math.round(current.surface_pressure)} ${units.surface_pressure}`;

  // Update image source & ensure the icon element is fully unhidden
  if (weatherIconEl) {
    weatherIconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIconEl.alt = description;
    weatherIconEl.hidden = false;
    weatherIconEl.classList.remove('hidden');
  }

  // Display weather card container
  weatherCard.classList.remove('hidden');
}

// ==========================================================================
// 5. Event Listeners
// ==========================================================================

// Search Form Listener
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  if (!query) {
    showError('Please enter a city name to search.');
    return;
  }

  showLoadingState();

  try {
    const data = await getCityWeather(query);
    state.weatherData = data; // Store raw payload in state
    renderWeatherUI();
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoadingState();
  }
});

// Unit Toggle Listener (only attached if element exists in HTML)
if (unitToggleBtn) {
  unitToggleBtn.addEventListener('click', () => {
    state.currentUnit = state.currentUnit === 'C' ? 'F' : 'C';
    renderWeatherUI();
  });
}