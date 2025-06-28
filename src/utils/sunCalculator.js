import SunCalc from 'suncalc';

class SunCalculator {
  constructor() {
    this.cache = new Map();
  }

  // Get precise sun position using SunCalc library
  getSunPosition(lat, lng, date) {
    const cacheKey = `${lat}_${lng}_${date.getTime()}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const position = SunCalc.getPosition(date, lat, lng);
    
    const result = {
      azimuth: this.radiansToDegrees(position.azimuth + Math.PI), // Convert to 0-360 degrees
      elevation: this.radiansToDegrees(position.altitude), // Solar elevation angle
      altitude: this.radiansToDegrees(position.altitude),
      declination: this.calculateDeclination(date)
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  // Get all sun times for a given location and date
  getSunTimes(lat, lng, date) {
    const times = SunCalc.getTimes(date, lat, lng);
    
    return {
      sunrise: times.sunrise,
      sunset: times.sunset,
      solarNoon: times.solarNoon,
      nadir: times.nadir,
      dawn: times.dawn,
      dusk: times.dusk,
      nauticalDawn: times.nauticalDawn,
      nauticalDusk: times.nauticalDusk,
      nightEnd: times.nightEnd,
      night: times.night,
      goldenHourEnd: times.goldenHourEnd,
      goldenHour: times.goldenHour,
      blueHourStart: times.blueHourStart,
      blueHourEnd: times.blueHourEnd,
      dayLength: this.calculateDayLength(times.sunrise, times.sunset)
    };
  }

  // Calculate sun path for the entire day
  getSunPath(lat, lng, date) {
    const path = [];
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    // Calculate positions every 10 minutes for smooth path
    for (let minutes = 0; minutes < 24 * 60; minutes += 10) {
      const currentTime = new Date(baseDate.getTime() + minutes * 60000);
      const position = this.getSunPosition(lat, lng, currentTime);
      
      if (position.elevation > -18) { // Include civil twilight
        path.push({
          time: currentTime,
          timeString: currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          ...position
        });
      }
    }

    return path;
  }

  // Calculate shadow length based on sun elevation
  calculateShadowLength(objectHeight, sunElevation) {
    if (sunElevation <= 0) return Infinity;
    return objectHeight / Math.tan(this.degreesToRadians(sunElevation));
  }

  // Calculate shadow direction based on sun azimuth
  calculateShadowDirection(sunAzimuth) {
    // Shadow points opposite to sun direction
    return (sunAzimuth + 180) % 360;
  }

  // Helper functions
  radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  calculateDeclination(date) {
    const dayOfYear = this.getDayOfYear(date);
    return 23.45 * Math.sin(this.degreesToRadians(360 * (284 + dayOfYear) / 365));
  }

  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  calculateDayLength(sunrise, sunset) {
    if (!sunrise || !sunset) return 0;
    return (sunset - sunrise) / (1000 * 60 * 60); // Hours
  }

  formatTime(date) {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
}

export default new SunCalculator();