// ==========================================================================
// 1. DOM Element Selectors
// ==========================================================================
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const errorBanner = document.getElementById('error-banner');
const loadingSpinner = document.getElementById('loading-spinner');
const weatherCard = document.getElementById('weather-card');

// API Endpoints (Open-Meteo — Free & Keyless)
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// ==========================================================================
// 2. Async Data Handlers
// ==========================================================================

/**
 * Step 1: Geocode city name to lat/lon coordinates
 * @param {string} city - The name of the city to search
 * @returns {Promise<Object>} Object containing lat, lon, name, and country
 */
async function fetchCityCoordinates(city) {
  const response = await fetch(
    `${GEOCODING_API_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );

  // Check if network request was successful
  if (!response.ok) {
    throw new Error(`Geocoding server error (${response.status})`);
  }

  const data = await response.json();

  // Handle case where city isn't found
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" not found. Please check spelling.`);
  }

  const { latitude, longitude, name, country } = data.results[0];
  return { latitude, longitude, name, country };
}

/**
 * Step 2: Fetch current weather metrics using latitude & longitude
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather metrics payload
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
 * @param {string} city 
 */
async function getCityWeather(city) {
  try {
    console.log(`🔍 Searching weather for: ${city}`);

    // Step A: Convert city string to coordinates
    const location = await fetchCityCoordinates(city);
    console.log('📍 Coordinates resolved:', location);

    // Step B: Fetch weather payload using coordinates
    const weatherData = await fetchWeatherData(location.latitude, location.longitude);
    
    // Log consolidated payload to inspect structure in DevTools
    const consolidatedPayload = {
      location: `${location.name}, ${location.country}`,
      coordinates: { lat: location.latitude, lon: location.longitude },
      current: weatherData.current,
      units: weatherData.current_units
    };

    console.log('🌤️ Consolidated API Payload:', consolidatedPayload);
    return consolidatedPayload;

  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
    throw error;
  }
}

// ==========================================================================
// 3. Event Listeners (Form Submission Test)
// ==========================================================================
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  if (!query) return;

  try {
    const data = await getCityWeather(query);
    alert(`Success! Fetched data for ${data.location}. Open Console (F12) to inspect object.`);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});