const App = {
    data() {
        return {
            placeholderString: 'Введіть назву міста',
            city: '',
            error: "",
            info: null,
            chart: null,
            days: '16',
            commits: null
        }
    },

    created() {
        // отримання даних при ініціалізації
        this.fetchData(),
        this.fetchIP()
      },

    methods: {

        getWeatherPosition() {

            document.querySelector("#chartReport").innerHTML = '<hr><canvas id="myChart"></canvas><hr><div id="map" style="width: 100%;" ></div>';

            navigator.geolocation.getCurrentPosition(position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                initMap(pos.lat, pos.lng);

                if(this.days > 3) {
                    drawChart_1(pos.lat, pos.lng, this.days)    
                } else {
                    drawChart_2(pos.lat, pos.lng, this.days) 
                } 
            });

            
        },


        getWeather() {

            if(this.city.trim().length < 2) {
                this.error = "Потрібна назва більше одного символу :)"
                return false
            }

            document.querySelector("#chartReport").innerHTML = '<hr><canvas id="myChart"></canvas><hr><div id="map" style="width: 100%;" ></div>';
            

            this.error = ""

            infoCity(this.city, this.days)
        },

        async fetchData() {
            const url = 'https://api.coindesk.com/v1/bpi/currentprice.json';
            this.commits = await (await fetch(url)).json();           
        },

        async fetchIP() {
            const url = 'https://ipinfo.io?token=11d31f4d927834';
            const cityIP = await (await fetch(url)).json();
            this.city = cityIP.city;         
        },

        formatDate(v) {
            return v.replace(/T|Z/g, ' ')
          }
    },
    
    computed: {
        cityName() {
            return this.city
        },     
    }
}

Vue.createApp(App).mount('#app');


function infoCity(city, days){
    
    const urlCity = "https://geocoding-api.open-meteo.com/v1/search?name="+city+"&count=1&language=en&format=json";
    fetch(urlCity)
    .then(data => data.json())
    .then(json => infoURL(json))
    
    function infoURL(json) {                
        
        const lat = json.results[0].latitude;
        const long = json.results[0].longitude;

        // Initialize and add the map
        

        initMap(lat, long);
        
        // Отримайте максимальну та мінімальну температуру

        if(days > 3) {
            drawChart_1(lat, long, days)    
        } else {
            drawChart_2(lat, long, days) 
        }                
    }
};

let map;

    async function initMap(lat, long) {
        // The location of Uluru
        const position = { lat: lat, lng: long };
        // Request needed libraries.
        //@ts-ignore
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerView } = await google.maps.importLibrary("marker");

        // The map, centered at Uluru
        map = new Map(document.getElementById("map"), {
            zoom: 10,
            center: position,
            mapId: "4504f8b37365c3d0",
        });

        const contentString = '<p><b>Широта: ' + lat + '</b></p> <b>Довгота: ' + long + '</b>';

        const infowindow = new google.maps.InfoWindow({
            content: contentString,
            ariaLabel: "Uluru",
        });

        // The marker, positioned at Uluru
        const marker = new AdvancedMarkerView({
            map: map,
            position: position,
            title: "Місце знаходження",
        });

        marker.addListener("click", () => {
            infowindow.open({
              anchor: marker,
              map,
            });
          });
    };

function drawChart_1(lat, long, days){

    let url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + long + '&daily=temperature_2m_max,temperature_2m_min,rain_sum,snowfall_sum,&forecast_days=' + days;

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
};

function drawChart_2(lat, long, days){
    let url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + long + '&hourly=temperature_2m,rain,snowfall&forecast_days=' + days;

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
};




