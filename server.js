const express = require('express');
const hbs = require('hbs');
const axios = require('axios'); // Don't forget to require axios
const path = require('path');
require('dotenv').config(); // Load environment variables from .env

const app = express();

// Set up Handlebars as the view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views')); // Set the views directory

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Define the port
const PORT = process.env.PORT || 3000;

// List of cities for selection
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
        const apiKey = process.env.API_KEY; // Get API key from .env
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        const response = await axios.get(url);
        const data = response.data;

        // Convert temperature from Kelvin to Celsius
        const tempInCelsius = (data.main.temp - 273.15).toFixed(2);
        const feelsLikeInCelsius = (data.main.feels_like - 273.15).toFixed(2);

        // Create a simplified weather report
        const weatherReport = {
            city: data.name,
            temperature: `${tempInCelsius}°C`,
            feels_like: `${feelsLikeInCelsius}°C`,
            condition: data.weather[0].description,
            time: new Date(data.dt * 1000).toLocaleString(),
        };

        return weatherReport;
    } catch (error) {
        console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
        return { error: 'Could not retrieve weather data' };
    }
};

// Route to handle the selected city and render weather data
app.get('/city', async (req, res) => {
    const selectedCity = req.query.city; // Get the selected city from query parameters
    const weatherData = await getWeatherData(selectedCity);

    // Render a result page with the weather data
    res.render('result', { weather: weatherData });
});


// Route to handle current location weather retrieval
app.get('/location', async (req, res) => {
    const { lat, lon } = req.query; // Get latitude and longitude from query parameters

    try {
        const apiKey = process.env.API_KEY; // Get API key from .env
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await axios.get(url); // Use await to get the response
        const data = response.data;

        // Convert temperature from Kelvin to Celsius
        const tempInCelsius = (data.main.temp - 273.15).toFixed(2);
        const feelsLikeInCelsius = (data.main.feels_like - 273.15).toFixed(2);

        // Create a simplified weather report
        const weatherReport = {
            city: data.name,
            temperature: `${tempInCelsius}°C`,
            feels_like: `${feelsLikeInCelsius}°C`,
            condition: data.weather[0].description,
            time: new Date(data.dt * 1000).toLocaleString(),
        };

        // Render the result page with the weather report
        res.render('result', { weather: weatherReport });

    } catch (error) {
        console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
        res.status(500).render('error', { error: 'Could not retrieve weather data' }); // Render an error page if fetching fails
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
