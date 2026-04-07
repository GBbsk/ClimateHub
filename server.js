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

app.use(express.json());
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
            
            if (!city || city.length < 3) {
                return res.status(400).json({ error: 'Digite pelo menos 3 caracteres' });
            };

            const nameResponse = await fetch(`${process.env.API_URL}/geo/1.0/direct?q=${city}&limit=25&appid=${process.env.API_KEY}`);

            const geoData = await nameResponse.json();

            if (!geoData || geoData.length === 0) {
                return res.status(404).json({ error: 'Cidade não encontrada' });
            };
        
            console.log(geoData[0]);

            return res.json({
                cidade: geoData.map(city => ({
                    nome: city.name,
                    pais: city.country,
                    estado: city.state || "N/A",
                    lat: city.lat,
                    lon: city.lon
                }))
            });

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar cidade' });
        }
    });


    app.post(`/api/clima`, async (req, res) => {
        try {   
            const { lat, lon, nome, pais, estado, unidade } = req.body;
            console.log(req.body)

            if (!lat || !lon) {
                return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
            }   

            const weatherResponse = await fetch(`${process.env.API_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&lang=pt_br&units=${unidade}`);
             // atualizacoes futuras `https://${process.env.API_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&lang=pt_br&units=${units}`

            if (!weatherResponse.ok) {
                return res.status(weatherResponse.status).json({ error: 'Falha ao obter dados do provedor de clima' });
            }
            
            const weatherData = await weatherResponse.json();
            
            const descricao = weatherData.weather[0].description;
            
            // console.log(weatherData);

            return res.json({
                cidade: {
                    nome: nome,
                    pais: pais,
                    estado: estado || "N/A",
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
        };
    }),

    app.get(`/geo/ip`, async (req, res) => {
        try {
            const localizacao = await fetch(`http://ip-api.com/json/`)

            if(!localizacao.ok){
                throw new Error("Erro ao buscar localização!")
            }

            const response = await localizacao.json()

            if (response.status === 'fail') {
                throw new Error(response.message || 'Falha ao obter localização')
            }

            console.log('Localização obtida:', response)

            return res.json ({
                nameCity: response.city
            })
        } catch (error) {
            console.error('Erro no endpoint /geo/ip:', error.message)

            return res.status(500).json({ 
            error: 'Não foi possível obter a localização',
            details: error.message
            })
        }
    })

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));