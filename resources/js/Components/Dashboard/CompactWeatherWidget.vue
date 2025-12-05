<template>
  <div class="flex items-center space-x-4 text-sm">
    <!-- Weather Info -->
    <div v-if="weather" class="flex items-center space-x-2">
      <span class="text-lg">{{ getWeatherIcon(weather.condition) }}</span>
      <div class="hidden sm:block">
        <div class="font-medium">{{ weather.temperature }}°C</div>
        <div class="text-xs opacity-75">{{ weather.condition }}</div>
      </div>
    </div>

    <!-- Timezone & Time Info -->
    <div class="border-l border-gray-300 dark:border-gray-600 pl-4">
      <div class="font-medium">{{ timezoneName }}</div>
      <div class="text-xs opacity-75">{{ currentTime }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  weatherApiKey: {
    type: String,
    default: '31340efcae6547a7aee150722250512'
  }
});

const weather = ref(null);
const timezoneName = ref('UTC');
const currentTime = ref('');
const location = ref('Chicago');
let timeInterval = null;

const getWeatherIcon = (condition) => {
  const icons = {
    'clear': '☀️',
    'sunny': '☀️',
    'clouds': '☁️',
    'partly cloudy': '⛅',
    'cloudy': '☁️',
    'overcast': '☁️',
    'rain': '🌧️',
    'drizzle': '🌦️',
    'snow': '❄️',
    'thunderstorm': '⛈️',
    'fog': '🌫️',
    'mist': '🌫️',
    'haze': '🌫️',
    'default': '🌤️'
  };
  
  const key = condition.toLowerCase();
  return icons[key] || icons['default'];
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const fetchAdminSettings = async () => {
  try {
    const response = await axios.get('/api/admin/settings');
    if (response.data?.company_location) {
      location.value = response.data.company_location;
    }
    if (response.data?.company_timezone) {
      timezoneName.value = response.data.company_timezone;
    }
  } catch (error) {
    console.error('Failed to fetch admin settings:', error);
  }
};

const fetchWeather = async () => {
  if (!props.weatherApiKey) return;
  
  try {
    const weatherResponse = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${props.weatherApiKey}&q=${location.value}&aqi=no`
    );
    
    if (!weatherResponse.ok) throw new Error('Weather API failed');
    
    const weatherData = await weatherResponse.json();
    
    const timezoneResponse = await fetch(
      `https://api.weatherapi.com/v1/timezone.json?key=${props.weatherApiKey}&q=${location.value}`
    );
    
    if (!timezoneResponse.ok) throw new Error('Timezone API failed');
    
    const timezoneData = await timezoneResponse.json();
    
    weather.value = {
      temperature: Math.round(weatherData.current.temp_c),
      condition: weatherData.current.condition.text
    };
    
    timezoneName.value = timezoneData.timezone.tz_id;
  } catch (error) {
    console.error('Weather fetch error:', error);
  }
};

onMounted(async () => {
  updateTime();
  await fetchAdminSettings();
  await fetchWeather();
  timeInterval = setInterval(updateTime, 60000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});
</script>
