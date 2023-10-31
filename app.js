const App = {
    data() {
        return {
            placeholderString: 'Введіть назву міста',
            city: 'Krakow',
            error: "",
            info: null,
            chart: null,
        }
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
            
            function infoURL(json) {                
                
                const lat = json.results[0].latitude;
                const long = json.results[0].longitude;
                const tz = json.results[0].timezone;

// Отримайте максимальну та мінімальну температуру

                const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + long + '8&daily=temperature_2m_max,temperature_2m_min&timezone=' + tz;

                fetch(url)
                .then(data => data.json())
                .then(json => drawChart(json))
               

                function drawChart(json) {
                    
                    const mydata = {
                    labels: json.daily.time,
                    datasets: [{
                        label: 'Найвища температура',
                        data: json.daily.temperature_2m_max,
                        borderColor: 'rgb(192, 75, 75)',
                    },{
                        label: 'Найнижча температура',
                        data: json.daily.temperature_2m_min,
                        borderColor: 'rgb(75, 75, 192)',
                    }]
                    };

                    new Chart(document.getElementById('myChart'), {
                        type: 'line',
                        data: mydata,
                    });

                }
            }

        },

    },
    computed: {
        cityName() {
            return this.city
        },
    },
}


Vue.createApp(App).mount('#app')




