// Weather and Greeting Initialization
async function initWeatherAndGreeting() {
    const greetingEl = document.getElementById('userGreeting');
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherTemp = document.getElementById('weatherTemp');
    
    // Get user info
    const user = auth.currentUser;
    if (user) {
        const name = user.displayName ? user.displayName.split(' ')[0] : 'there';
        greetingEl.textContent = `Hello, ${name}! 👋`;
    }
    
    // Fetch weather
    if (weatherTemp && OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== 'YOUR_OPENWEATHER_API_KEY') {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Lagos,NG&units=metric&appid=${OPENWEATHER_API_KEY}`);
            const data = await response.json();
            weatherTemp.textContent = `${Math.round(data.main.temp)}°C`;
            
            // Update weather icon based on conditions
            const weatherMain = data.weather[0].main.toLowerCase();
            if (weatherMain.includes('rain')) weatherIcon.textContent = '🌧️';
            else if (weatherMain.includes('cloud')) weatherIcon.textContent = '☁️';
            else if (weatherMain.includes('clear')) weatherIcon.textContent = '☀️';
        } catch (error) {
            weatherTemp.textContent = 'Lagos';
        }
    } else {
        weatherTemp.textContent = 'Lagos, NG';
    }
}

// Call on page load
if (auth.currentUser) {
    initWeatherAndGreeting();
}
auth.onAuthStateChanged((user) => {
    if (user) {
        initWeatherAndGreeting();
    }
});
