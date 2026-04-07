import { Controller } from './controllers/Controller.js';
import { Model } from './models/Model.js';
import { View } from './views/View.js';
import { CityService } from './services/cityService.js';
import { WeatherService } from './services/weatherService.js'
import { CacheService } from './services/cacheService.js';
import { GeolocationService } from './services/geoService.js';


document.addEventListener('DOMContentLoaded', () => {
    const cityService = new CityService();
    const weatherService = new WeatherService();
    const cacheService = new CacheService();
    const geoService = new GeolocationService();

    const model = new Model();
    const view = new View(
        ".search-bar", ".currentTime", 
        ".display-city", ".currentClimate", 
        ".thermal-sensation", ".thermal-sensation-temperature", 
        ".currentTemperature", ".symbolTemperature", 
        ".humidity-value", ".wind-value", 
        ".visibility-value", ".pressure-value", 
        ".sunrise-display",".sunset-display",
        ".tempUnitSwitch", ".btnSearch",
        ".loading-screen", ".resultadoBusca",
        ".forecast-card");

    const controler = new Controller(model, view, cityService, weatherService, cacheService, geoService);

    controler.init()
});