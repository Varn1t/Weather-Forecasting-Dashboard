document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const searchButton = document.querySelector('.search-btn'); // Search button for city input
    const cityInput = document.querySelector('.city-input'); // Input field for city name
    const locationButton = document.querySelector('.location-btn'); // Button to use current location
    const currentWeatherDiv = document.querySelector('.current-weather'); // Div to display current weather
    const weatherCardsDiv = document.querySelector('.weather-cards'); // Div to display 5-day forecast
    const toCelsiusButton = document.getElementById('toCelsius'); // Button to toggle Celsius
    const toFahrenheitButton = document.getElementById('toFahrenheit'); // Button to toggle Fahrenheit

    let currentUnit = 'C'; // Default unit is Celsius
    const API_KEY = "666673f395bbdd38e8026871579d11a5"; // API key for OpenWeather API
    let weatherData = {}; // Object to store weather data

    // Function to create weather card HTML
    const createWeatherCard = (weatherItem, index) => {
        // Convert temperature from Kelvin to Celsius and Fahrenheit
        const tempInCelsius = (weatherItem.main.temp - 273.15).toFixed(2);
        const tempInFahrenheit = ((weatherItem.main.temp - 273.15) * 9/5 + 32).toFixed(2);
        // Determine temperature based on current unit
        const temperature = currentUnit === 'C' ? `${tempInCelsius}°C` : `${tempInFahrenheit}°F`;

        if (index === 0) {
            // Create HTML for current weather
            return `<div class="details">
                        <h2>${weatherData.cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                        <h4>Temperature: ${temperature}</h4>
                        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                    </div>
                    <div class="icon">
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                        <h4>${weatherItem.weather[0].description}</h4>
                    </div>`;
        } else {
            // Create HTML for 5-day forecast card
            return `<li class="card">
                        <h2>(${weatherItem.dt_txt.split(" ")[0]})</h2>
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                        <h4>Temperature: ${temperature}</h4>
                        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                    </li>`;
        }
    }

    // Function to display weather data
    function displayWeatherData() {
        // Set HTML for current weather
        currentWeatherDiv.innerHTML = createWeatherCard(weatherData.currentWeather, 0);
        // Set HTML for 5-day forecast
        weatherCardsDiv.innerHTML = weatherData.fiveDaysForecast.map((item, index) => createWeatherCard(item, index + 1)).join('');
    }

    // Function to fetch weather details
    function getWeatherDetails(cityName, lat, lon) {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

        fetch(WEATHER_API_URL)
            .then(res => res.json())
            .then(data => {
                const uniqueForecastDays = [];
                // Filter unique forecast days for the 5-day forecast
                const fiveDaysForecast = data.list.filter(forecast => {
                    const forecastDate = new Date(forecast.dt_txt).getDate();
                    if (!uniqueForecastDays.includes(forecastDate)) {
                        return uniqueForecastDays.push(forecastDate);
                    }
                });

                // Store fetched data
                weatherData = {
                    cityName,
                    currentWeather: data.list[0],
                    fiveDaysForecast
                };

                // Display the weather data
                displayWeatherData();
            })
            .catch((err) => {
                console.error("Error fetching weather forecast:", err);
                alert("An error occurred while fetching the weather forecast!");
            });
    }

    // Function to get city coordinates from user input
    const getCityCoordinates = () => {
        const cityName = cityInput.value.trim();
        if (!cityName) return;
        const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

        fetch(GEOCODING_API_URL)
            .then(res => res.json())
            .then(data => {
                if (!data.length) return alert(`No coordinates found for ${cityName}`);
                const { name, lat, lon } = data[0];
                // Fetch weather details for the city
                getWeatherDetails(name, lat, lon);
            })
            .catch((err) => {
                console.error("Error fetching coordinates:", err);
                alert("An error occurred while fetching the coordinates!");
            });
    };

    // Function to get user's coordinates
    const getUserCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
                fetch(REVERSE_GEOCODING_URL)
                    .then(res => res.json())
                    .then(data => {
                        const { name } = data[0];
                        // Fetch weather details based on user's location
                        getWeatherDetails(name, latitude, longitude);
                    })
                    .catch((err) => {
                        console.error("Error fetching coordinates:", err);
                        alert("An error occurred while fetching the city!");
                    });
            },
            error => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert("Geolocation request denied. Please reset the location permission to grant access again.");
                }
            }
        );
    }

    // Function to toggle temperature unit
    const toggleTemperatureUnit = (unit) => {
        currentUnit = unit;
        // Update the display with the selected temperature unit
        displayWeatherData();
    };

    // Event listeners
    locationButton.addEventListener('click', getUserCoordinates); // Fetch weather for user's location
    searchButton.addEventListener('click', getCityCoordinates); // Fetch weather for entered city
    cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates()); // Fetch weather on Enter key press
    toCelsiusButton.addEventListener('click', () => toggleTemperatureUnit('C')); // Switch to Celsius
    toFahrenheitButton.addEventListener('click', () => toggleTemperatureUnit('F')); // Switch to Fahrenheit
});
