// Enhanced map service with proper 3D building support
class MapService {
  constructor() {
    this.cache = new Map();
    this.nominatimBase = 'https://nominatim.openstreetmap.org';
    this.overpassBase = 'https://overpass-api.de/api/interpreter';
  }

  // Enhanced location search with better accuracy
  async searchLocations(query) {
    if (!query || query.length < 3) return [];

    const cacheKey = `search_${query}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(
        `${this.nominatimBase}/search?` +
        new URLSearchParams({
          format: 'json',
          limit: '10',
          q: query,
          addressdetails: '1',
          extratags: '1',
          namedetails: '1'
        })
      );

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      
      const locations = data.map(item => ({
        id: item.place_id,
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        bbox: item.boundingbox ? item.boundingbox.map(Number) : null,
        type: item.type || 'location',
        category: item.category || 'place',
        importance: item.importance || 0,
        address: {
          house_number: item.address?.house_number,
          road: item.address?.road,
          suburb: item.address?.suburb,
          city: item.address?.city || item.address?.town || item.address?.village,
          county: item.address?.county,
          state: item.address?.state,
          country: item.address?.country,
          postcode: item.address?.postcode
        },
        extratags: item.extratags || {}
      }));

      // Sort by importance and type relevance
      locations.sort((a, b) => {
        const typeScore = (loc) => {
          if (loc.type === 'city' || loc.type === 'town') return 3;
          if (loc.type === 'suburb' || loc.type === 'neighbourhood') return 2;
          if (loc.type === 'house' || loc.type === 'building') return 1;
          return 0;
        };
        
        return (typeScore(b) - typeScore(a)) || (b.importance - a.importance);
      });

      this.cache.set(cacheKey, locations);
      return locations;
    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  }

  // Get building data for 3D visualization
  async getBuildingData(lat, lng, radius = 500) {
    const cacheKey = `buildings_${lat}_${lng}_${radius}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Overpass query for buildings with height data
      const query = `
        [out:json][timeout:25];
        (
          way["building"](around:${radius},${lat},${lng});
          relation["building"](around:${radius},${lat},${lng});
        );
        out geom;
      `;

      const response = await fetch(this.overpassBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (!response.ok) throw new Error('Building data fetch failed');
      
      const data = await response.json();
      
      const buildings = data.elements
        .filter(element => element.type === 'way' && element.geometry)
        .map(building => ({
          id: building.id,
          coordinates: building.geometry.map(point => [point.lon, point.lat]),
          tags: building.tags || {},
          height: this.estimateHeight(building.tags),
          type: building.tags.building || 'building'
        }));

      this.cache.set(cacheKey, buildings);
      return buildings;
    } catch (error) {
      console.error('Building data error:', error);
      return [];
    }
  }

  // Estimate building height from tags
  estimateHeight(tags) {
    // Try explicit height first
    if (tags.height) {
      const height = parseFloat(tags.height);
      if (!isNaN(height)) return height;
    }

    // Try building:levels
    if (tags['building:levels']) {
      const levels = parseFloat(tags['building:levels']);
      if (!isNaN(levels)) return levels * 3.5; // Assume 3.5m per level
    }

    // Estimate by building type
    const buildingType = tags.building || '';
    const estimates = {
      'house': 6,
      'residential': 8,
      'apartments': 15,
      'commercial': 12,
      'retail': 8,
      'office': 20,
      'industrial': 10,
      'warehouse': 8,
      'hospital': 15,
      'school': 8,
      'church': 12,
      'skyscraper': 100
    };

    return estimates[buildingType] || 8; // Default 8m
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
          
          try {
            const location = await this.reverseGeocode(latitude, longitude);
            resolve(location || {
              id: 'current',
              name: 'Current Location',
              lat: latitude,
              lng: longitude
            });
          } catch (error) {
            resolve({
              id: 'current',
              name: 'Current Location',
              lat: latitude,
              lng: longitude
            });
          }
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    });
  }

  // Reverse geocoding for coordinates
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `${this.nominatimBase}/reverse?` +
        new URLSearchParams({
          format: 'json',
          lat: lat.toString(),
          lon: lng.toString(),
          addressdetails: '1'
        })
      );

      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      
      return {
        id: data.place_id,
        name: data.display_name,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        address: {
          house_number: data.address?.house_number,
          road: data.address?.road,
          suburb: data.address?.suburb,
          city: data.address?.city || data.address?.town || data.address?.village,
          county: data.address?.county,
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

  // Get map style URL for MapLibre
  getMapStyle() {
    // Using OpenStreetMap with Protomaps for 3D buildings
    return {
      version: 8,
      sources: {
        'osm': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        },
        'buildings': {
          type: 'vector',
          tiles: [
            'https://data.source.coop/vida/google-microsoft-open-buildings/pmtiles/{z}/{x}/{y}.mvt'
          ],
          maxzoom: 14
        }
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm'
        },
        {
          id: 'buildings-fill',
          type: 'fill-extrusion',
          source: 'buildings',
          'source-layer': 'buildings',
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.8
          }
        }
      ]
    };
  }
}

export default new MapService();