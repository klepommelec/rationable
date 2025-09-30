/**
 * Service de géolocalisation pour détecter le pays de l'utilisateur
 */

export interface GeoLocationData {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
}

class GeoLocationService {
  private static readonly STORAGE_KEY = 'rationable_geo_location';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

  /**
   * Détecte le pays de l'utilisateur via une API de géolocalisation
   */
  static async detectCountry(): Promise<string | null> {
    try {
      // Vérifier le cache d'abord
      const cached = this.getCachedLocation();
      if (cached) {
        console.log('🌍 Using cached location:', cached.country);
        return cached.country;
      }

      // Utiliser une API de géolocalisation gratuite
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const geoData: GeoLocationData = {
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region,
        city: data.city,
      };

      // Mettre en cache
      this.setCachedLocation(geoData);

      console.log('🌍 Detected location:', geoData);
      return geoData.country;

    } catch (error) {
      console.warn('⚠️ Failed to detect location:', error);
      return null;
    }
  }

  /**
   * Vérifie si l'utilisateur est en France
   */
  static async isInFrance(): Promise<boolean> {
    const country = await this.detectCountry();
    return country === 'France';
  }

  /**
   * Récupère la localisation mise en cache
   */
  private static getCachedLocation(): GeoLocationData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      const now = Date.now();

      // Vérifier si le cache est encore valide
      if (data.timestamp && (now - data.timestamp) < this.CACHE_DURATION) {
        return data.location;
      }

      // Cache expiré, le supprimer
      localStorage.removeItem(this.STORAGE_KEY);
      return null;

    } catch (error) {
      console.warn('⚠️ Failed to read cached location:', error);
      return null;
    }
  }

  /**
   * Met en cache la localisation
   */
  private static setCachedLocation(location: GeoLocationData): void {
    try {
      const data = {
        location,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Failed to cache location:', error);
    }
  }

  /**
   * Force la détection de la localisation (ignore le cache)
   */
  static async forceDetectCountry(): Promise<string | null> {
    localStorage.removeItem(this.STORAGE_KEY);
    return this.detectCountry();
  }
}

export default GeoLocationService;
