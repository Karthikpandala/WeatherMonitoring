const express = require('express');
const hbs = require('hbs');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// Set up Handlebars as the view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Define the port
const PORT = process.env.PORT || 3000;

// List of cities for selection
const cities = [
    'Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad',
    'Pune', 'Jaipur', 'Ahmedabad', 'Surat', 'Kanpur', 'Lucknow',
    'Nagpur', 'Visakhapatnam', 'Bhopal', 'Indore', 'Coimbatore',
    'Mysore', 'Patna', 'Vadodara', 'Nashik', 'Agra', 'Aurangabad',
    'Ranchi', 'Thane', 'Kochi', 'Tiruchirappalli', 'Dehradun',
    'Vijayawada', 'Jodhpur', 'Rajkot', 'Guwahati', 'Srinagar', 'Amritsar',
    'Dharamshala'
];

// Home route to render the main page with cities
app.get('/', (req, res) => {
    res.render('home', { cities });
});

// Function to fetch weather data from OpenWeatherMap API
const getWeatherData = async (city) => {
    try {
        const apiKey = process.env.API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        const response = await axios.get(url);
        const data = response.data;

        // Convert temperature from Kelvin to Celsius
        const tempInCelsius = (data.main.temp - 273.15).toFixed(2);
        const feelsLikeInCelsius = (data.main.feels_like - 273.15).toFixed(2);

        // Create a simplified weather report
        return {
            city: data.name,
            temperature: `${tempInCelsius}°C`,
            feels_like: `${feelsLikeInCelsius}°C`,
            condition: data.weather[0].description,
            time: new Date(data.dt * 1000).toLocaleString(),
        };
    } catch (error) {
        console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
        return { error: 'Could not retrieve weather data' };
    }
};

// Function to fetch past weather data (dummy implementation)
const getPastWeatherData = async (city) => {
    // You would normally replace this with actual API calls or data retrieval logic
    const pastWeather = [];
    for (let i = 0; i < 10; i++) {
        pastWeather.push({
            date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toLocaleDateString(),
            temperature: `${Math.floor(Math.random() * 35)}°C`, // Dummy temperature
            feels_like: `${Math.floor(Math.random() * 35)}°C`, // Dummy feels like
            condition: "Clear sky" // Dummy condition
        });
    }
    return pastWeather;
};

// Route to handle the selected city and render weather data
app.get('/current-weather', async (req, res) => {
    const selectedCity = req.query.city;
    const currentWeather = await getWeatherData(selectedCity);
    const weatherHistory = await getPastWeatherData(selectedCity); // Fetch past weather data

    res.render('result', {
        city: selectedCity,
        currentWeather,
        weatherHistory
    });
});

// Route to handle the selected city for past weather data
app.get('/past-weather', async (req, res) => {
    const selectedCity = req.query.city;
    const weatherHistory = await getPastWeatherData(selectedCity);

    res.render('result', {
        city: selectedCity,
        weatherHistory
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
