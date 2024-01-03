const App = {
    data() {
        return {
            placeholderString: 'Введіть назву міста',
            city: 'Krakow',
            error: "",
            info: null,
            chart: null,
            days: 16,
            commits: null,
        }
    },

    created() {
        // отримання даних при ініціалізації
        this.fetchData()
      },

    methods: {
        getWeather() {

            if(this.city.trim().length < 2) {
                this.error = "Потрібна назва більше одного символу :)"
                return false
            }

            document.querySelector("#chartReport").innerHTML = '<canvas id="myChart"></canvas>';

            this.error = ""

            const urlCity = "https://geocoding-api.open-meteo.com/v1/search?name="+this.city+"&count=1&language=en&format=json";
            fetch(urlCity)
            .then(data => data.json())
            .then(json => infoURL(json))
            const days = this.days;
            
            function infoURL(json) {                
                
                const lat = json.results[0].latitude;
                const long = json.results[0].longitude;

                // Initialize and add the map
                let map;

                async function initMap() {
                    // The location of Uluru
                    const position = { lat: lat, lng: long };
                    // Request needed libraries.
                    //@ts-ignore
                    const { Map } = await google.maps.importLibrary("maps");
                    const { AdvancedMarkerView } = await google.maps.importLibrary("marker");

                    // The map, centered at Uluru
                    map = new Map(document.getElementById("map"), {
                        zoom: 5,
                        center: position,
                        mapId: "DEMO_MAP_ID",
                    });

                    // The marker, positioned at Uluru
                    const marker = new AdvancedMarkerView({
                        map: map,
                        position: position,
                        title: "Uluru",
                    });
                }

                initMap();
                
// Отримайте максимальну та мінімальну температуру

                if(days > 3) {

                    let url;

                    url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + long + '&daily=temperature_2m_max,temperature_2m_min,rain_sum,snowfall_sum,&forecast_days=' + days;

                    fetch(url)
                    .then(data => data.json())
                    .then(json => drawChart(json))

                    function drawChart(json) {

                        Chart.defaults.font.size = 16;
    
                        const mydata = {
                            labels: json.daily.time,
                            datasets: [{
                                label: 'Найвища температура,°C',
                                data: json.daily.temperature_2m_max,
                                borderColor: 'rgb(192, 75, 75)',
                            },{ 
                                label: 'Найнижча температура,°C',
                                data: json.daily.temperature_2m_min,
                                borderColor: 'rgb(75, 75, 192)', 
                            },{
                                type: 'bar',
                                label: 'Дощ, mm',
                                data: json.daily.rain_sum,
                                backgroundColor: 'rgb(0, 255, 0)',
                            },{
                                type: 'bar',
                                label: 'Сніг, mm',
                                data: json.daily.snowfall_sum,
                                backgroundColor: 'rgb(0, 255, 255)',
                            }]
                        };
    
                        new Chart(document.getElementById('myChart'), {
                            type: 'line',
                            data: mydata,
                        });
                    }
                    
                        
                } else {
                    url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + long + '&hourly=temperature_2m,rain,snowfall&forecast_days=' + days;

                    fetch(url)
                    .then(data => data.json())
                    .then(json => drawChart(json))

                    function drawChart(json) {

                        Chart.defaults.font.size = 16;
    
                        const mydata = {
                            labels: json.hourly.time,
                            datasets: [{
                                label: 'Температура,°C',
                                data: json.hourly.temperature_2m,
                                borderColor: 'rgb(192, 75, 75)',
                            },{
                                type: 'bar',
                                label: 'Дощ, mm',
                                data: json.hourly.rain,
                                backgroundColor: 'rgb(0, 255, 0)',
                            },{
                                type: 'bar',
                                label: 'Сніг, mm',
                                data: json.hourly.snowfall,
                                backgroundColor: 'rgb(0, 255, 255)',
                            }]
                        };
    
                        new Chart(document.getElementById('myChart'), {
                            type: 'line',
                            data: mydata,
                        });
                    }
                }                
            }
        },

        async fetchData() {

            function formatDate(date) {

                var dd = date.getDate();
                if (dd < 10) dd = '0' + dd;
              
                var mm = date.getMonth() + 1;
                if (mm < 10) mm = '0' + mm;
              
                var yy = date.getFullYear();
              
                return yy + '-' + mm + '-' + dd;
            };

            var d = new Date();
            var d_Start = new Date(); 
            d_Start.setDate(d_Start.getDate() - 3 );

            const url = 'https://newsapi.ai/api/v1/article/getArticles?query=%7B%22%24query%22%3A%7B%22%24and%22%3A%5B%7B%22keyword%22%3A%22%D0%B2%D1%96%D0%B9%D0%BD%D0%B0%20%D0%B2%20%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%96%22%2C%22keywordLoc%22%3A%22body%22%7D%2C%7B%22dateStart%22%3A%22' + formatDate(d_Start) + '%22%2C%22dateEnd%22%3A%22' + formatDate(d) + '%22%7D%5D%7D%7D&resultType=articles&articlesSortBy=date&apiKey=e7be1d69-c189-4255-99bc-300ee6f74dfd';
            this.commits = await (await fetch(url)).json()
        },
    },
    
    computed: {
        cityName() {
            return this.city
        },     
    }
}


Vue.createApp(App).mount('#app')




