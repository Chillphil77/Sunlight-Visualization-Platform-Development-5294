// Enhanced weather service with OpenWeatherMap integration
class WeatherService {
  constructor() {
    // Demo API key - replace with actual key in production
    this.apiKey = process.env.VITE_OPENWEATHER_API_KEY || 'demo';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
  }

  async getCurrentWeather(lat, lng, units = 'metric') {
    const cacheKey = `current_${lat}_${lng}_${units}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      let weatherData;
      
      if (this.apiKey === 'demo') {
        // Enhanced mock data for demo
        weatherData = this.generateRealisticMockWeather(lat, lng, units);
      } else {
        const response = await fetch(
          `${this.baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=${units}`
        );
        
        if (!response.ok) {
          throw new Error('Weather API request failed');
        }
        
        const data = await response.json();
        weatherData = this.parseWeatherData(data, units);
      }

      this.cache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('Weather fetch error:', error);
      return this.generateRealisticMockWeather(lat, lng, units);
    }
  }

  async getHourlyForecast(lat, lng, units = 'metric') {
    try {
      let forecastData;
      
      if (this.apiKey === 'demo') {
        forecastData = this.generateMockHourlyForecast(units);
      } else {
        const response = await fetch(
          `${this.baseUrl}/forecast?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=${units}`
        );
        
        if (!response.ok) {
          throw new Error('Forecast API request failed');
        }
        
        const data = await response.json();
        forecastData = this.parseHourlyForecast(data, units);
      }

      return forecastData;
    } catch (error) {
      console.error('Forecast fetch error:', error);
      return this.generateMockHourlyForecast(units);
    }
  }

  generateRealisticMockWeather(lat, lng, units) {
    const now = new Date();
    const hour = now.getHours();
    const season = this.getSeason(now);
    const climate = this.getClimateZone(lat);
    
    // Generate realistic temperature based on location, time, and season
    let baseTemp = this.getBaseTemperature(lat, season, climate);
    const dailyVariation = this.getDailyTemperatureVariation(hour);
    const temperature = Math.round(baseTemp + dailyVariation);
    
    // Generate weather conditions
    const conditions = this.generateWeatherConditions(lat, season, hour);
    
    return {
      temperature: units === 'metric' ? temperature : Math.round(temperature * 9/5 + 32),
      condition: conditions.main,
      description: conditions.description,
      humidity: Math.round(40 + Math.random() * 40), // 40-80%
      windSpeed: Math.round((2 + Math.random() * 8) * (units === 'metric' ? 1 : 2.237)), // 2-10 m/s or mph
      windDirection: Math.round(Math.random() * 360),
      cloudCover: conditions.cloudCover,
      uvIndex: this.calculateUVIndex(lat, now, conditions.cloudCover),
      visibility: Math.round((8 + Math.random() * 7) * (units === 'metric' ? 1 : 0.621)), // 8-15 km or miles
      pressure: Math.round(1000 + Math.random() * 40), // 1000-1040 hPa
      dewPoint: Math.round(temperature - (100 - conditions.humidity) / 5),
      icon: conditions.icon,
      sunrise: this.calculateSunrise(lat, lng, now),
      sunset: this.calculateSunset(lat, lng, now),
      location: {lat, lng}
    };
  }

  generateMockHourlyForecast(units) {
    const forecast = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() + i * 3600000);
      const hourOfDay = hour.getHours();
      
      // Simulate temperature curve
      const tempVariation = Math.sin((hourOfDay - 6) * Math.PI / 12) * 8;
      const baseTemp = 20; // Base temperature in Celsius
      const temp = Math.round(baseTemp + tempVariation + (Math.random() - 0.5) * 4);
      
      forecast.push({
        time: hour.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          hour12: true 
        }),
        timestamp: hour.getTime(),
        temp: units === 'metric' ? temp : Math.round(temp * 9/5 + 32),
        condition: this.getHourlyCondition(hourOfDay),
        icon: this.getWeatherIcon(this.getHourlyCondition(hourOfDay), hourOfDay),
        humidity: Math.round(50 + Math.random() * 30),
        windSpeed: Math.round((1 + Math.random() * 5) * (units === 'metric' ? 1 : 2.237)),
        cloudCover: Math.round(Math.random() * 60),
        precipitation: Math.random() > 0.8 ? Math.round(Math.random() * 5) : 0
      });
    }
    
    return forecast;
  }

  // Helper methods for realistic weather generation
  getSeason(date) {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  getClimateZone(lat) {
    const absLat = Math.abs(lat);
    if (absLat < 23.5) return 'tropical';
    if (absLat < 35) return 'subtropical';
    if (absLat < 50) return 'temperate';
    if (absLat < 66.5) return 'subarctic';
    return 'arctic';
  }

  getBaseTemperature(lat, season, climate) {
    const seasonTemps = {
      tropical: { spring: 28, summer: 30, autumn: 28, winter: 26 },
      subtropical: { spring: 22, summer: 28, autumn: 24, winter: 16 },
      temperate: { spring: 15, summer: 22, autumn: 16, winter: 5 },
      subarctic: { spring: 5, summer: 15, autumn: 8, winter: -10 },
      arctic: { spring: -5, summer: 5, autumn: -2, winter: -20 }
    };
    
    return seasonTemps[climate][season];
  }

  getDailyTemperatureVariation(hour) {
    // Temperature variation throughout the day
    const minHour = 6; // Coldest at 6 AM
    const maxHour = 14; // Warmest at 2 PM
    
    if (hour <= minHour) {
      return -5;
    } else if (hour <= maxHour) {
      return -5 + ((hour - minHour) / (maxHour - minHour)) * 10;
    } else {
      return 5 - ((hour - maxHour) / (24 - maxHour)) * 10;
    }
  }

  generateWeatherConditions(lat, season, hour) {
    const conditions = [
      { main: 'Clear', description: 'clear sky', cloudCover: 5, icon: hour >= 6 && hour <= 18 ? '01d' : '01n' },
      { main: 'Sunny', description: 'sunny', cloudCover: 10, icon: '01d' },
      { main: 'Partly Cloudy', description: 'few clouds', cloudCover: 25, icon: hour >= 6 && hour <= 18 ? '02d' : '02n' },
      { main: 'Cloudy', description: 'scattered clouds', cloudCover: 50, icon: hour >= 6 && hour <= 18 ? '03d' : '03n' },
      { main: 'Overcast', description: 'overcast clouds', cloudCover: 85, icon: '04d' }
    ];
    
    // Weight conditions based on season and location
    const weights = this.getWeatherWeights(lat, season);
    const randomValue = Math.random();
    
    let cumulativeWeight = 0;
    for (let i = 0; i < conditions.length; i++) {
      cumulativeWeight += weights[i];
      if (randomValue <= cumulativeWeight) {
        return conditions[i];
      }
    }
    
    return conditions[0]; // Default to clear
  }

  getWeatherWeights(lat, season) {
    // Simplified weather probability weights
    // [clear, sunny, partly cloudy, cloudy, overcast]
    const baseWeights = [0.3, 0.25, 0.25, 0.15, 0.05];
    
    // Adjust for latitude (more clouds in higher latitudes)
    const latFactor = Math.abs(lat) / 90;
    baseWeights[0] *= (1 - latFactor * 0.3); // Less clear weather
    baseWeights[3] *= (1 + latFactor * 0.5); // More cloudy weather
    baseWeights[4] *= (1 + latFactor * 0.3); // More overcast
    
    return baseWeights;
  }

  calculateUVIndex(lat, date, cloudCover) {
    const hour = date.getHours();
    
    // UV index is highest at solar noon, zero at night
    if (hour < 6 || hour > 18) return 0;
    
    // Base UV calculation (simplified)
    const solarElevation = Math.sin((hour - 12) * Math.PI / 6); // Simplified solar elevation
    let baseUV = Math.max(0, solarElevation * 10);
    
    // Adjust for latitude
    const latFactor = 1 - Math.abs(lat) / 90;
    baseUV *= latFactor;
    
    // Adjust for cloud cover
    const cloudReduction = cloudCover / 100 * 0.6;
    baseUV *= (1 - cloudReduction);
    
    return Math.round(Math.max(0, baseUV));
  }

  calculateSunrise(lat, lng, date) {
    // Simplified sunrise calculation - in production use SunCalc
    const baseHour = 6 + Math.sin(lat * Math.PI / 180) * 2;
    const sunrise = new Date(date);
    sunrise.setHours(Math.floor(baseHour), (baseHour % 1) * 60, 0, 0);
    return sunrise.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  calculateSunset(lat, lng, date) {
    // Simplified sunset calculation - in production use SunCalc
    const baseHour = 18 - Math.sin(lat * Math.PI / 180) * 2;
    const sunset = new Date(date);
    sunset.setHours(Math.floor(baseHour), (baseHour % 1) * 60, 0, 0);
    return sunset.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getHourlyCondition(hour) {
    if (hour >= 6 && hour <= 8) return 'partly-cloudy';
    if (hour >= 9 && hour <= 15) return 'sunny';
    if (hour >= 16 && hour <= 18) return 'partly-cloudy';
    return 'clear';
  }

  getWeatherIcon(condition, hour) {
    const isDay = hour >= 6 && hour <= 18;
    
    const iconMap = {
      'clear': isDay ? '01d' : '01n',
      'sunny': '01d',
      'partly-cloudy': isDay ? '02d' : '02n',
      'cloudy': isDay ? '03d' : '03n',
      'overcast': '04d',
      'rain': isDay ? '10d' : '10n'
    };
    
    return iconMap[condition] || '01d';
  }

  parseWeatherData(data, units) {
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      windDirection: data.wind.deg || 0,
      cloudCover: data.clouds.all,
      uvIndex: data.uvi || 0,
      visibility: Math.round((data.visibility || 10000) / (units === 'metric' ? 1000 : 1609)),
      pressure: data.main.pressure,
      dewPoint: Math.round(data.main.temp - ((100 - data.main.humidity) / 5)),
      icon: data.weather[0].icon,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString()
    };
  }

  parseHourlyForecast(data, units) {
    return data.list.slice(0, 24).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        hour12: true 
      }),
      timestamp: item.dt * 1000,
      temp: Math.round(item.main.temp),
      condition: item.weather[0].main.toLowerCase(),
      icon: item.weather[0].icon,
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed),
      cloudCover: item.clouds.all,
      precipitation: item.rain ? item.rain['3h'] : 0
    }));
  }
}

export default new WeatherService();