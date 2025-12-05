<template>
  <UnifiedCard 
    title="Current Time & Weather" 
    description="System timezone and weather information"
    :icon="ClockIcon" 
    iconVariant="info" 
    variant="elevated"
  >
    <template #headerActions>
      <button 
        @click="refreshData"
        :disabled="loading"
        class="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
      >
        <ArrowPathIcon :class="['w-4 h-4 mr-1', loading ? 'animate-spin' : '']" />
        Refresh
      </button>
    </template>

    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-2xl font-bold text-gray-900">{{ currentTime }}</div>
          <div class="text-sm text-gray-600">{{ currentDate }}</div>
        </div>
        <div class="text-right">
          <div class="text-sm font-medium text-blue-700">{{ timezoneName }}</div>
          <div class="text-xs text-gray-500">{{ timezoneOffset }}</div>
        </div>
      </div>
    </div>

    <div v-if="weather" class="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="text-3xl">{{ getWeatherIcon(weather.condition) }}</div>
          <div>
            <div class="text-lg font-semibold text-gray-900">{{ weather.temperature }}°{{ weather.unit }}</div>
            <div class="text-sm text-gray-600">{{ weather.condition }}</div>
          </div>
        </div>
        <div class="text-right text-sm text-gray-600">
          <div>Humidity: {{ weather.humidity }}%</div>
          <div>Wind: {{ weather.windSpeed }} {{ weather.windUnit }}</div>
        </div>
      </div>
      
      <div v-if="weather.location" class="mt-3 pt-3 border-t border-gray-200">
        <div class="flex items-center text-sm text-gray-500">
          <MapPinIcon class="w-4 h-4 mr-1" />
          {{ weather.location }}
        </div>
      </div>
    </div>

    <!-- Weather Loading/Error State -->
    <div v-else-if="weatherError" class="bg-yellow-50 rounded-xl p-4 text-center">
      <div class="text-yellow-600 text-sm">
        <ExclamationTriangleIcon class="w-5 h-5 mx-auto mb-2" />
        Weather data unavailable
      </div>
    </div>

    <div v-else class="bg-gray-50 rounded-xl p-4 text-center">
      <div class="text-gray-500 text-sm">
        <div class="animate-pulse">Loading weather...</div>
      </div>
    </div>
  </UnifiedCard>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import UnifiedCard from '@/Components/UI/UnifiedCard.vue';
import {
  ClockIcon,
  ArrowPathIcon,
  MapPinIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  systemTimezone: {
    type: String,
    default: 'UTC'
  },
  weatherApiKey: {
    type: String,
    default: '31340efcae6547a7aee150722250512'
  },
  location: {
    type: String,
    default: 'Chicago'
  }
});

const loading = ref(false);
const currentTime = ref('');
const currentDate = ref('');
const timezoneName = ref('');
const timezoneOffset = ref('');
const weather = ref(null);
const weatherError = ref(false);
let timeInterval = null;

const updateTime = () => {
  const now = new Date();
  
  // Format time
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  // Format date
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get timezone info
  timezoneName.value = props.systemTimezone || 'UTC';
  
  // Get timezone offset
  const offset = now.getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? '+' : '-';
  timezoneOffset.value = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

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

const fetchWeather = async () => {
  if (!props.weatherApiKey) {
    weatherError.value = true;
    return;
  }
  
  try {
    // Fetch weather data from WeatherAPI
    const weatherResponse = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${props.weatherApiKey}&q=${props.location}&aqi=no`
    );
    
    if (!weatherResponse.ok) {
      throw new Error('Weather API request failed');
    }
    
    const weatherData = await weatherResponse.json();
    
    // Fetch timezone data from WeatherAPI
    const timezoneResponse = await fetch(
      `https://api.weatherapi.com/v1/timezone.json?key=${props.weatherApiKey}&q=${props.location}`
    );
    
    if (!timezoneResponse.ok) {
      throw new Error('Timezone API request failed');
    }
    
    const timezoneData = await timezoneResponse.json();
    
    weather.value = {
      temperature: Math.round(weatherData.current.temp_c),
      unit: 'C',
      condition: weatherData.current.condition.text,
      humidity: weatherData.current.humidity,
      windSpeed: Math.round(weatherData.current.wind_kph),
      windUnit: 'km/h',
      location: `${weatherData.location.name}, ${weatherData.location.country}`
    };
    
    // Update timezone info from API
    timezoneName.value = timezoneData.timezone.tz_id;
    const offset = timezoneData.timezone.utc_offset_hours;
    const sign = offset >= 0 ? '+' : '';
    timezoneOffset.value = `UTC${sign}${offset}`;
    
    weatherError.value = false;
  } catch (error) {
    console.error('Weather/Timezone fetch error:', error);
    weatherError.value = true;
  }
};



const refreshData = async () => {
  loading.value = true;
  updateTime();
  await fetchWeather();
  loading.value = false;
};

onMounted(() => {
  updateTime();
  fetchWeather();
  
  // Update time every second
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>