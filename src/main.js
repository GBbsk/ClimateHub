import { Controller } from './controllers/Controller.js';
import { Model } from './models/Model.js';
import { View } from './views/View.js';

document.addEventListener('DOMContentLoaded', () => {
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
    const controler = new Controller(model, view);

    controler.init()
});