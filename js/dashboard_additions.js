// Dashboard additions for greeting and weather
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Initialize weather and greeting
function initWeatherAndGreeting() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Update greeting with user name
      const greetingDiv = document.getElementById('userGreeting');
      if (greetingDiv) {
        const userName = user.displayName || user.email?.split('@')[0] || 'User';
        greetingDiv.innerHTML = `Hello! 👋 ${userName};
      }
      
      // Initialize weather
      fetchWeather();
    }
  });
}

// Fetch weather data
async function fetchWeather() {
  const API_KEY = 'ba065545e26fb7893c9dba89f5a8a8a6';
  const weatherDiv = document.getElementById('weather');
  
  if (!weatherDiv) return;
  
  try {
    // Get user's location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Fetch weather data
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          
          if (response.ok) {
            const data = await response.json();
            const temp = Math.round(data.main.temp);
            const weather = data.weather[0].main;
            const location = data.name;
            
            // Get weather icon
            const iconMap = {
              'Clear': '☀️',
              'Clouds': '☁️',
              'Rain': '🌧️',
              'Drizzle': '🌦️',
              'Thunderstorm': '⛈️',
              'Snow': '❄️',
              'Mist': '🌫️',
              'Fog': '🌫️',
              'Haze': '🌫️'
            };
            
            const icon = iconMap[weather] || '🌡️';
            
            weatherDiv.innerHTML = `${icon} ${temp}°C`;
            weatherDiv.title = `${weather} in ${location}`;
          } else {
            weatherDiv.innerHTML = '🌡️';
          }
        },
        (error) => {
          // Fallback to default location (Lagos, Nigeria)
          fetchWeatherByCity('Lagos');
        }
      );
    } else {
      // Fallback to default location
      fetchWeatherByCity('Lagos');
    }
  } catch (error) {
    console.error('Weather fetch error:', error);
    weatherDiv.innerHTML = '🌡️';
  }
}

async function fetchWeatherByCity(city) {
  const API_KEY = 'ba065545e26fb7893c9dba89f5a8a8a6';
  const weatherDiv = document.getElementById('weather');
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    
    if (response.ok) {
      const data = await response.json();
      const temp = Math.round(data.main.temp);
      const weather = data.weather[0].main;
      
      const iconMap = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Haze': '🌫️'
      };
      
      const icon = iconMap[weather] || '🌡️';
      weatherDiv.innerHTML = `${icon} ${temp}°C`;
      weatherDiv.title = `${weather} in ${city}`;
    }
  } catch (error) {
    console.error('Weather fetch error:', error);
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWeatherAndGreeting);
} else {
  initWeatherAndGreeting();
}

// Logout functionality
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const auth = getAuth();

function logout() {
  console.log('Logout button clicked');
  signOut(auth)
    .then(() => {
      console.log('Sign out successful, redirecting to login...');
      window.location.href = 'login.html';
    })
    .catch((error) => {
      console.error('Logout error:', error);
      alert('Logout failed: ' + error.message);
    });
}

// Attach logout event listener
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
  console.log('Logout button listener attached');
} else {
  console.error('Logout button not found!');
}
