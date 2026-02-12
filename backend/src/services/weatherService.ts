import { logger } from '../utils/logger.js';

export interface WeatherData {
  temperature: number; // Fahrenheit
  feelsLike: number;
  humidity: number;
  windSpeed: number; // mph
  windDirection: string;
  conditions: string;
  icon: string;
  playabilityScore: number; // 1-10
  alerts: string[];
}

export interface ForecastData extends WeatherData {
  date: string;
  high: number;
  low: number;
}

// Weather condition icons mapping
const weatherIcons: Record<string, string> = {
  clear: 'sun',
  sunny: 'sun',
  clouds: 'cloud',
  cloudy: 'cloud',
  overcast: 'cloud',
  rain: 'cloud-rain',
  drizzle: 'cloud-rain',
  thunderstorm: 'cloud-lightning',
  snow: 'snowflake',
  mist: 'cloud-fog',
  fog: 'cloud-fog',
  haze: 'cloud-fog',
};

// Calculate playability score based on weather conditions
function calculatePlayabilityScore(
  temp: number,
  windSpeed: number,
  humidity: number,
  conditions: string
): number {
  let score = 10;

  // Temperature scoring (ideal: 65-80F)
  if (temp < 40 || temp > 100) score -= 4;
  else if (temp < 50 || temp > 95) score -= 3;
  else if (temp < 55 || temp > 90) score -= 2;
  else if (temp < 60 || temp > 85) score -= 1;

  // Wind scoring (ideal: < 10 mph)
  if (windSpeed > 30) score -= 4;
  else if (windSpeed > 20) score -= 3;
  else if (windSpeed > 15) score -= 2;
  else if (windSpeed > 10) score -= 1;

  // Humidity scoring (ideal: 30-60%)
  if (humidity > 90) score -= 2;
  else if (humidity > 80) score -= 1;

  // Weather conditions scoring
  const lowerConditions = conditions.toLowerCase();
  if (lowerConditions.includes('thunderstorm') || lowerConditions.includes('lightning')) {
    score = 1; // Dangerous - don't play
  } else if (lowerConditions.includes('rain') || lowerConditions.includes('snow')) {
    score -= 3;
  } else if (lowerConditions.includes('drizzle')) {
    score -= 2;
  } else if (lowerConditions.includes('fog') || lowerConditions.includes('mist')) {
    score -= 1;
  }

  return Math.max(1, Math.min(10, score));
}

// Get wind direction from degrees
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Get weather icon from conditions
function getWeatherIcon(conditions: string): string {
  const lowerConditions = conditions.toLowerCase();
  for (const [key, icon] of Object.entries(weatherIcons)) {
    if (lowerConditions.includes(key)) {
      return icon;
    }
  }
  return 'sun';
}

export const weatherService = {
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // If no API key, return mock data for development
    if (!apiKey) {
      logger.warn('No OpenWeather API key configured, returning mock data');
      return this.getMockWeather(latitude, longitude);
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`Weather API returned ${response.status}`);
      }

      const data = await response.json();

      const conditions = data.weather[0]?.description || 'Clear';
      const temp = Math.round(data.main.temp);
      const windSpeed = Math.round(data.wind.speed);
      const humidity = data.main.humidity;

      return {
        temperature: temp,
        feelsLike: Math.round(data.main.feels_like),
        humidity,
        windSpeed,
        windDirection: getWindDirection(data.wind.deg || 0),
        conditions: conditions.charAt(0).toUpperCase() + conditions.slice(1),
        icon: getWeatherIcon(conditions),
        playabilityScore: calculatePlayabilityScore(temp, windSpeed, humidity, conditions),
        alerts: [],
      };
    } catch (error) {
      logger.error('Failed to fetch weather data', { error, latitude, longitude });
      return this.getMockWeather(latitude, longitude);
    }
  },

  async getForecast(
    latitude: number,
    longitude: number,
    days: number = 5
  ): Promise<ForecastData[]> {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // If no API key, return mock data
    if (!apiKey) {
      logger.warn('No OpenWeather API key configured, returning mock forecast');
      return this.getMockForecast(days);
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`Weather API returned ${response.status}`);
      }

      const data = await response.json();

      // Group by day and get daily summary
      const dailyForecasts: Map<string, ForecastData> = new Map();

      for (const item of data.list) {
        const date = item.dt_txt.split(' ')[0];

        if (!dailyForecasts.has(date) && dailyForecasts.size < days) {
          const conditions = item.weather[0]?.description || 'Clear';
          const temp = Math.round(item.main.temp);
          const windSpeed = Math.round(item.wind.speed);
          const humidity = item.main.humidity;

          dailyForecasts.set(date, {
            date,
            temperature: temp,
            feelsLike: Math.round(item.main.feels_like),
            humidity,
            windSpeed,
            windDirection: getWindDirection(item.wind.deg || 0),
            conditions: conditions.charAt(0).toUpperCase() + conditions.slice(1),
            icon: getWeatherIcon(conditions),
            playabilityScore: calculatePlayabilityScore(temp, windSpeed, humidity, conditions),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            alerts: [],
          });
        }
      }

      return Array.from(dailyForecasts.values());
    } catch (error) {
      logger.error('Failed to fetch forecast data', { error, latitude, longitude });
      return this.getMockForecast(days);
    }
  },

  // Mock weather data for development/demo
  getMockWeather(latitude: number, longitude: number): WeatherData {
    // Generate deterministic but varied mock data based on coordinates
    const seed = Math.abs(latitude * 1000 + longitude * 100);
    const temp = 65 + (seed % 20); // 65-85F
    const windSpeed = 5 + (seed % 15); // 5-20 mph
    const humidity = 40 + (seed % 30); // 40-70%
    const conditions = ['Clear', 'Partly Cloudy', 'Sunny', 'Few Clouds'][Math.floor(seed) % 4];

    return {
      temperature: Math.round(temp),
      feelsLike: Math.round(temp - 2),
      humidity,
      windSpeed,
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(seed) % 8],
      conditions,
      icon: getWeatherIcon(conditions),
      playabilityScore: calculatePlayabilityScore(temp, windSpeed, humidity, conditions),
      alerts: [],
    };
  },

  getMockForecast(days: number): ForecastData[] {
    const forecasts: ForecastData[] = [];
    const baseDate = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const temp = 68 + ((i * 7) % 15);
      const high = temp + 5;
      const low = temp - 8;
      const windSpeed = 8 + (i % 10);
      const humidity = 45 + (i % 25);
      const conditions = ['Sunny', 'Partly Cloudy', 'Clear', 'Mostly Sunny', 'Few Clouds'][i % 5];

      forecasts.push({
        date: dateStr,
        temperature: Math.round(temp),
        feelsLike: Math.round(temp - 1),
        humidity,
        windSpeed,
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][i % 8],
        conditions,
        icon: getWeatherIcon(conditions),
        playabilityScore: calculatePlayabilityScore(temp, windSpeed, humidity, conditions),
        high: Math.round(high),
        low: Math.round(low),
        alerts: [],
      });
    }

    return forecasts;
  },
};
