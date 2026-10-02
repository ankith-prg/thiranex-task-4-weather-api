const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');

// DOM Elements for Metrics
const displayCity = document.getElementById('display-city');
const tempVal = document.getElementById('temp-val');
const humidityVal = document.getElementById('humidity-val');
const windVal = document.getElementById('wind-val');

// Event Listener for the search functionality
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

// Asynchronous function to fetch and process REST API data
async function getWeatherData(city) {
    try {
        // Hide previous results and errors while loading
        weatherCard.classList.add('hidden');
        errorMessage.classList.add('hidden');

        // STEP 1: Fetch Geocoding Data (Convert city name to Latitude/Longitude)
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        
        // Comprehensive error handling for failed network requests
        if (!geoResponse.ok) {
            throw new Error('Failed to connect to the geocoding service.');
        }

        const geoData = await geoResponse.json();

        // Check if the city was actually found in the JSON response
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found. Please check the spelling and try again.');
        }

        // Parse nested JSON objects to get coordinates and formatted name
        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
        const resolvedCityName = `${geoData.results[0].name}, ${geoData.results[0].country}`;

        // STEP 2: Fetch Live Weather Data using the retrieved coordinates
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
        
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data for this location.');
        }

        const weatherData = await weatherResponse.json();

        // STEP 3: Dynamically render the accurate, live weather metrics
        displayCity.textContent = resolvedCityName;
        tempVal.textContent = `${weatherData.current.temperature_2m}°C`;
        humidityVal.textContent = `${weatherData.current.relative_humidity_2m}%`;
        windVal.textContent = `${weatherData.current.wind_speed_10m} km/h`;

        // Reveal the weather dashboard
        weatherCard.classList.remove('hidden');

    } catch (error) {
        // Render the error message to the DOM if any step fails
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    }
}