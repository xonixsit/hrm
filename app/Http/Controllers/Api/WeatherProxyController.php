<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WeatherProxyController extends Controller
{
    /**
     * Get weather data through backend proxy
     */
    public function getWeather(Request $request)
    {
        $location = $request->query('location', 'Chicago');
        $apiKey = config('services.weather.api_key', '31340efcae6547a7aee150722250512');

        try {
            $response = Http::get('https://api.weatherapi.com/v1/current.json', [
                'key' => $apiKey,
                'q' => $location,
                'aqi' => 'no'
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Weather API failed'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get timezone data through backend proxy
     */
    public function getTimezone(Request $request)
    {
        $location = $request->query('location', 'Chicago');
        $apiKey = config('services.weather.api_key', '31340efcae6547a7aee150722250512');

        try {
            $response = Http::get('https://api.weatherapi.com/v1/timezone.json', [
                'key' => $apiKey,
                'q' => $location
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Timezone API failed'], 500);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
