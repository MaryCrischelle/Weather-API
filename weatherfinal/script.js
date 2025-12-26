
// FREE WEATHER API (NO KEY)
// https://open-meteo.com/

const chart = document.getElementById('chart');
const forecastEl = document.getElementById('forecast');

async function fetchWeatherByCoords(lat, lon, locationName = null) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();

  const locName = locationName || 'Your Location';
  // Display location with just the city name
  document.getElementById('location').textContent = locName;
  document.getElementById('temp').textContent = `${Math.round(data.current_weather.temperature)}°C`;
  document.getElementById('condition').textContent = getWeatherDescription(data.current_weather.weathercode);
  document.getElementById('wind').textContent = `Wind: ${data.current_weather.windspeed} km/h`;
  
  // Get humidity from hourly data (first hour)
  let humidity = '--';
  if (data.hourly && data.hourly.relativehumidity_2m && data.hourly.relativehumidity_2m.length > 0) {
    humidity = data.hourly.relativehumidity_2m[0];
  }
  document.getElementById('humidity').textContent = `Humidity: ${humidity}%`;

  // Store weather data for tab switching
  window.weatherData = data;

  // Render temperature chart by default
  renderTemperatureChart(data);

  // 7-day forecast
  forecastEl.innerHTML = '';
  data.daily.temperature_2m_max.forEach((max, i) => {
    const min = data.daily.temperature_2m_min[i];
    const day = document.createElement('div');
    day.className = 'day';
    day.innerHTML = `
      <div>${new Date(data.daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' })}</div>
      <img src="https://cdn-icons-png.flaticon.com/512/1163/1163661.png" />
      <div class="temps">${Math.round(max)}° ${Math.round(min)}°</div>
    `;
    forecastEl.appendChild(day);
  });
}

function formatHour12(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).split(' ')[0] + ' ' + date.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1];
}

function renderTemperatureChart(data) {
  chart.innerHTML = '';
  const now = new Date();
  const currentHour = now.getHours();
  
  // Start from current hour and show next 8 hours
  data.hourly.temperature_2m.slice(currentHour, currentHour + 8).forEach((t, i) => {
    const time = new Date(data.hourly.time[currentHour + i]);
    const hour12 = formatHour12(time);
    const isCurrentHour = time.getHours() === currentHour;
    
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.backgroundColor = '#ff9800';
    bar.style.height = `${Math.max(t * 2, 5)}px`;
    bar.style.border = isCurrentHour ? '3px solid #d17600' : 'none';
    bar.style.boxSizing = 'border-box';
    bar.innerHTML = `<span>${Math.round(t)}°</span>`;
    
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.bottom = '-25px';
    label.style.left = '0';
    label.style.right = '0';
    label.style.fontSize = '12px';
    label.style.color = isCurrentHour ? '#ff9800' : '#5f6368';
    label.style.fontWeight = isCurrentHour ? '600' : 'normal';
    label.style.textAlign = 'center';
    label.textContent = hour12;
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.flex = '1';
    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    
    chart.appendChild(wrapper);
  });
}

function renderPrecipitationChart(data) {
  chart.innerHTML = '';
  const now = new Date();
  const currentHour = now.getHours();
  
  const slicedData = data.hourly.precipitation.slice(currentHour, currentHour + 8);
  const maxPrecip = Math.max(...slicedData, 1);
  
  slicedData.forEach((prec, i) => {
    const time = new Date(data.hourly.time[currentHour + i]);
    const hour12 = formatHour12(time);
    const isCurrentHour = time.getHours() === currentHour;
    
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.backgroundColor = '#4caf50';
    bar.style.height = `${Math.max((prec / maxPrecip) * 100, 2)}px`;
    bar.style.border = isCurrentHour ? '3px solid #388e3c' : 'none';
    bar.style.boxSizing = 'border-box';
    bar.innerHTML = `<span>${prec} mm</span>`;
    
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.bottom = '-25px';
    label.style.left = '0';
    label.style.right = '0';
    label.style.fontSize = '12px';
    label.style.color = isCurrentHour ? '#4caf50' : '#5f6368';
    label.style.fontWeight = isCurrentHour ? '600' : 'normal';
    label.style.textAlign = 'center';
    label.textContent = hour12;
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.flex = '1';
    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    
    chart.appendChild(wrapper);
  });
}

function renderWindChart(data) {
  chart.innerHTML = '';
  const now = new Date();
  const currentHour = now.getHours();
  
  const slicedData = data.hourly.windspeed_10m.slice(currentHour, currentHour + 8);
  const maxWind = Math.max(...slicedData, 1);
  
  slicedData.forEach((wind, i) => {
    const time = new Date(data.hourly.time[currentHour + i]);
    const hour12 = formatHour12(time);
    const isCurrentHour = time.getHours() === currentHour;
    
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.backgroundColor = '#2196f3';
    bar.style.height = `${Math.max((wind / maxWind) * 100, 2)}px`;
    bar.style.border = isCurrentHour ? '3px solid #1565c0' : 'none';
    bar.style.boxSizing = 'border-box';
    bar.innerHTML = `<span>${Math.round(wind)} km/h</span>`;
    
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.bottom = '-25px';
    label.style.left = '0';
    label.style.right = '0';
    label.style.fontSize = '12px';
    label.style.color = isCurrentHour ? '#2196f3' : '#5f6368';
    label.style.fontWeight = isCurrentHour ? '600' : 'normal';
    label.style.textAlign = 'center';
    label.textContent = hour12;
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.flex = '1';
    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    
    chart.appendChild(wrapper);
  });
}

function getWeatherDescription(code) {
  switch (code) {
    case 0: return 'Clear sky';
    case 1: return 'Mainly clear';
    case 2: return 'Partly cloudy';
    case 3: return 'Overcast';
    case 45: return 'Fog';
    case 48: return 'Rime fog';
    case 51: return 'Light drizzle';
    case 53: return 'Moderate drizzle';
    case 55: return 'Dense drizzle';
    case 61: return 'Slight rain';
    case 63: return 'Moderate rain';
    case 65: return 'Heavy rain';
    case 71: return 'Slight snow';
    case 73: return 'Moderate snow';
    case 75: return 'Heavy snow';
    case 80: return 'Rain showers';
    case 81: return 'Heavy rain showers';
    case 95: return 'Thunderstorm';
    default: return 'Unknown';
  }
}

async function searchCity() {
  const input = document.getElementById('searchInput').value.trim();
  if (!input) {
    alert('Please enter a city name');
    return;
  }

  try {
    // Geocode city name to get lat/lon
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(input)}&count=1`;
    const geoRes = await fetch(geoURL);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      alert('City not found');
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    const locationName = `${name}, ${country}`;
    
    await fetchWeatherByCoords(latitude, longitude, locationName);
    document.getElementById('suggestions').classList.remove('show');
  } catch (error) {
    console.error(error);
    alert('Error fetching weather data');
  }
}

async function fetchSuggestions(query) {
  if (!query || query.length < 2) {
    document.getElementById('suggestions').classList.remove('show');
    return;
  }

  try {
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`;
    const geoRes = await fetch(geoURL);
    const geoData = await geoRes.json();

    const suggestionsEl = document.getElementById('suggestions');
    suggestionsEl.innerHTML = '';

    if (!geoData.results || geoData.results.length === 0) {
      suggestionsEl.classList.remove('show');
      return;
    }

    geoData.results.forEach(result => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.textContent = `${result.name}, ${result.country || result.admin1 || ''}`;
      item.onclick = () => {
        document.getElementById('searchInput').value = item.textContent;
        suggestionsEl.classList.remove('show');
        loadWeatherFromSuggestion(result);
      };
      suggestionsEl.appendChild(item);
    });

    suggestionsEl.classList.add('show');
  } catch (error) {
    console.error(error);
  }
}

async function loadWeatherFromSuggestion(result) {
  const locationName = `${result.name}, ${result.country || ''}`;
  await fetchWeatherByCoords(result.latitude, result.longitude, locationName);
}

// Add event listener for live search
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchSuggestions(e.target.value);
    }, 300);
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchCity();
    }
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
      document.getElementById('suggestions').classList.remove('show');
    }
  });

  // Tab switching
  const tabs = document.querySelectorAll('.tabs span');
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (!window.weatherData) return;

      if (index === 0) {
        renderTemperatureChart(window.weatherData);
      } else if (index === 1) {
        renderPrecipitationChart(window.weatherData);
      } else if (index === 2) {
        renderWindChart(window.weatherData);
      }
    });
  });
});

// Load weather for user's current location on page load
navigator.geolocation.getCurrentPosition(async pos => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  
  try {
    // Get location name from coordinates (reverse geocode)
    const geoURL = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`;
    const geoRes = await fetch(geoURL);
    const geoData = await geoRes.json();
    
    let locationName = 'Your Location';
    if (geoData.results && geoData.results.length > 0) {
      const result = geoData.results[0];
      // Use city/town name with country
      const city = result.name || result.city || result.admin1 || 'Unknown';
      const country = result.country || '';
      locationName = country ? `${city}, ${country}` : city;
    }
    
    await fetchWeatherByCoords(lat, lon, locationName);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Fallback: just use coordinates without name
    await fetchWeatherByCoords(lat, lon, 'Your Location');
  }
}, () => {
  // Fallback: geolocation denied, show message
  console.warn('Geolocation not available');
  document.getElementById('location').textContent = 'Please search for a location';
});
