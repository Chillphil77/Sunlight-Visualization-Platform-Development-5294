// Location service with OpenStreetMap Nominatim API
class LocationService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org';
    this.cache = new Map();
  }

  async searchLocations(query) {
    if (!query || query.length < 3) return [];
    
    // Check cache first
    if (this.cache.has(query)) {
      return this.cache.get(query);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search?format=json&limit=10&q=${encodeURIComponent(query)}&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      
      const locations = data.map(item => ({
        id: item.place_id,
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || 'location',
        address: {
          city: item.address?.city || item.address?.town || item.address?.village,
          state: item.address?.state,
          country: item.address?.country,
          postcode: item.address?.postcode
        }
      }));

      // Cache results
      this.cache.set(query, locations);
      
      return locations;
    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  }

  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `${this.baseUrl}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      
      return {
        id: data.place_id,
        name: data.display_name,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        address: {
          city: data.address?.city || data.address?.town || data.address?.village,
          state: data.address?.state,
          country: data.address?.country,
          postcode: data.address?.postcode
        }
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Get current location using browser geolocation
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location = await this.reverseGeocode(latitude, longitude);
          resolve(location || {
            id: 'current',
            name: 'Current Location',
            lat: latitude,
            lng: longitude
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}

export default new LocationService();