// Sun position calculations using astronomical formulas
class SunCalculations {
  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Convert radians to degrees
  toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  // Calculate Julian day number
  getJulianDay(date) {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;
    
    return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  // Calculate solar position for given location, date and time
  getSolarPosition(lat, lng, date) {
    const jd = this.getJulianDay(date);
    const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    
    // Solar calculations
    const n = jd - 2451545.0;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = this.toRadians((357.528 + 0.9856003 * n) % 360);
    const lambda = this.toRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
    
    // Declination
    const delta = Math.asin(Math.sin(this.toRadians(23.439)) * Math.sin(lambda));
    
    // Hour angle
    const H = this.toRadians(15 * (hour - 12));
    
    // Convert to radians
    const latRad = this.toRadians(lat);
    
    // Calculate elevation
    const elevation = Math.asin(
      Math.sin(delta) * Math.sin(latRad) + 
      Math.cos(delta) * Math.cos(latRad) * Math.cos(H)
    );
    
    // Calculate azimuth
    const azimuth = Math.atan2(
      Math.sin(H),
      Math.cos(H) * Math.sin(latRad) - Math.tan(delta) * Math.cos(latRad)
    );
    
    return {
      elevation: Math.max(0, this.toDegrees(elevation)),
      azimuth: (this.toDegrees(azimuth) + 180) % 360,
      declination: this.toDegrees(delta)
    };
  }

  // Calculate sunrise and sunset times
  getSunTimes(lat, lng, date) {
    const jd = this.getJulianDay(date);
    const n = jd - 2451545.0;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = this.toRadians((357.528 + 0.9856003 * n) % 360);
    const lambda = this.toRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
    
    const delta = Math.asin(Math.sin(this.toRadians(23.439)) * Math.sin(lambda));
    const latRad = this.toRadians(lat);
    
    // Hour angle for sunrise/sunset
    const cosH = -Math.tan(latRad) * Math.tan(delta);
    
    if (Math.abs(cosH) > 1) {
      // Polar day or night
      return {
        sunrise: null,
        sunset: null,
        solarNoon: 12,
        dayLength: Math.abs(cosH) > 1 ? (cosH > 1 ? 0 : 24) : 0
      };
    }
    
    const H = Math.acos(cosH);
    const hourAngle = this.toDegrees(H) / 15;
    
    const sunrise = 12 - hourAngle;
    const sunset = 12 + hourAngle;
    
    return {
      sunrise: this.formatTime(sunrise),
      sunset: this.formatTime(sunset),
      solarNoon: this.formatTime(12),
      dayLength: hourAngle * 2,
      goldenHourMorning: this.formatTime(sunrise + 0.5),
      goldenHourEvening: this.formatTime(sunset - 0.5),
      blueHourMorning: this.formatTime(sunrise - 0.5),
      blueHourEvening: this.formatTime(sunset + 0.5)
    };
  }

  // Format time from decimal hours to HH:MM
  formatTime(decimalHours) {
    if (decimalHours === null) return null;
    
    const hours = Math.floor(decimalHours);
    const minutes = Math.floor((decimalHours - hours) * 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Get sun path data for the entire day
  getSunPath(lat, lng, date) {
    const path = [];
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);
    
    // Calculate positions every 15 minutes
    for (let hour = 0; hour < 24; hour += 0.25) {
      const currentTime = new Date(baseDate.getTime() + hour * 3600000);
      const position = this.getSolarPosition(lat, lng, currentTime);
      
      if (position.elevation > 0) {
        path.push({
          time: this.formatTime(hour),
          ...position,
          timestamp: currentTime.getTime()
        });
      }
    }
    
    return path;
  }
}

export default new SunCalculations();