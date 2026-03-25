const express = require('express');
const path = require('path');
const livereload = require('livereload');
const connectLiveReload = require('connect-livereload');

require('dotenv').config(); // 👈 aqui

const app = express();
const PORT = 3000;

const liveReloadServer = livereload.createServer();
liveReloadServer.watch([
    path.join(__dirname, 'public'),
    path.join(__dirname, 'src')
]);

app.use(connectLiveReload());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));


    const formatarTime = (timestamp, timezone) => {
        if (!timestamp) return "N/A";
        const date = new Date((timestamp + timezone) * 1000);
        return date.toLocaleTimeString('pt-BR', { 
            timeZone: 'UTC', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    app.get('/api/cidade', async (req, res) => {
        try {
            const city = req.query.city;
            const unitMedida = req.query.units

            const nameResponse = await fetch(
                `${process.env.API_URL}/geo/1.0/direct?q=${city}&limit=5&appid=${process.env.API_KEY}`
            );

            const geoData = await nameResponse.json();

            if (!geoData || geoData.length === 0) {
                return res.status(404).json({ error: 'Cidade não encontrada' });
            };

            const { lat, lon, name, country, state } = geoData[0];

            const weatherResponse = await fetch(
            `${process.env.API_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&lang=pt_br&units=${unitMedida}`
            );

            const weatherData = await weatherResponse.json();

            const descricao = weatherData.weather[0].description;

            console.log(geoData);
            console.log(weatherData);

            return res.json({
                cidade: {
                    nome: name,
                    pais: country,
                    estado: state || "N/A",
                },
                clima: {
                    temperatura: Math.round(weatherData.main.temp),
                    tempMax: Math.round(weatherData.main.temp_max),
                    tempMin: Math.round(weatherData.main.temp_min),
                    sensacaoTermica: Math.round(weatherData.main.feels_like),
                    pressao: weatherData.main.pressure,
                    humidade: weatherData.main.humidity,

                    nascerDoSol: formatarTime(weatherData.sys.sunrise, weatherData.timezone),
                    porDoSol: formatarTime(weatherData.sys.sunset, weatherData.timezone ),

                    visibilidade: new Intl.NumberFormat("pt-BR").format(
                    weatherData.visibility
                    ),

                    climaAtual: descricao.charAt(0).toUpperCase() + descricao.slice(1),

                    climaAtualIcon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,

                    vento: weatherData.wind.speed,
            },
            });

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar cidade' });
        }
    });

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));