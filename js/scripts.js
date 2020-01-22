
$(function(){


// *** APIs ***
// clima, previsão 12 horas e previsão 5 dias: https://developer.accuweather.com/apis
// pegar coordenadas geográficas pelo nome da cidade: https://docs.mapbox.com/api/
// pegar coordenadas do IP: http://www.geoplugin.net
// gerar gráficos em JS: https://www.highcharts.com/demo


    var accuweatherApiKey = "5MKfCxAQgGhOjggs3ZsZsAOKAwNJswKG";
    var mapboxToken = "pk.eyJ1IjoiZ2xhdWJlcmJyYWNrIiwiYSI6ImNrNTY5OWtwZjBmaXAzZXBlbmJ0dHQybTcifQ.aY7dew30qmSbSKrPMX8-_A";

    var weatherObject = {
        city: "",
        state: "",
        country: "",
        temperature: "",
        weatherText: "",
        weatherIcon: ""
    }

    function generateChart(hours, temperatures){

        Highcharts.chart('hourly_chart', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Temperature by Hours'
            },
            subtitle: {
                text: 'Source: Accuweather.com'
            },
            xAxis: {
                categories: ['21h', '22h', '23h', '00h', '01h', '02h', '03h', '04h', '05h', '06h', '07h', '08h']
            },
            yAxis: {
                title: {
                    text: 'Temperature (°C)'
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                showInLegend: false,
                data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
            }]
        });

    }

    function getWeatherByHour(localCode){        
        $.ajax({
            url: "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/" + localCode + "?apikey=" + accuweatherApiKey + "&language=pt-br&metric=true",
            type: "GET",
            dataType: "json",
            success: function(data){
                console.log("hourly", data);

                var hours = [];
                var temperatures = [];

                for(var a = 0; a < data.length; a++){

                    var hour = new Date(data[a].DateTime).getHours();
                    hours.push(String(hour) + "h");
                    temperatures.push(data[a].Temperature.Value);

                    generateChart(hours, temperatures);
                    $(".refresh-loader").fadeOut();

                }

            },
            erro: function(){
                generateError("Erro ao obter clima hora a hora");
            }
        });


    }

    function fillWeatherNow(city,state,country, temperature, min, max, weatherText, weatherIcon){

        var localText = city + ", " + state + " - "+ country;
        $("#texto_local").text(localText);
        $("#texto_clima").text(weatherText);
        $("#texto_temperatura").html(String(temperature) + "&deg");
        $("#icone_clima").css("background-image", "url('" + weatherObject.weatherIcon + "')");

    }

    function fill5DaysWeater(predictions){

        $("#info_5dias").html("");
        var weekDays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

        for(var a = 0; a < predictions.length; a++){
            var currentDate = new Date(predictions[a].Date)
            var dayWeek = weekDays[currentDate.getDay()];

            var iconNumer = predictions[a].Day.Icon <= 9 ? "0" + String(predictions[a].Day.Icon) :  String(predictions[a].Day.Icon);

            weatherIcon = "https://developer.accuweather.com/sites/default/files/" + iconNumer + "-s.png";

            var maxTemp = String(predictions[a].Temperature.Maximum.Value);
            var minTemp = String(predictions[a].Temperature.Minimum.Value);

            var HTMLDayElement = '<div class="day col">';
            HTMLDayElement +=      '<div class="day_inner">';
            HTMLDayElement +=       '<div class="dayname">';
            HTMLDayElement +=           dayWeek;
            HTMLDayElement +=        '</div>';
            HTMLDayElement +=         '<div style="background-image: url(\' ' + weatherIcon + ' \')" class="daily_weather_icon"></div>';
            HTMLDayElement +=         '<div class="max_min_temp">';
            HTMLDayElement +=           minTemp + '&deg; / ' + maxTemp + ' &deg;';
            HTMLDayElement +=         '</div>';
            HTMLDayElement +=       '</div>';
            HTMLDayElement +=   '</div>';

            $("#info_5dias").append(HTMLDayElement);
            HTMLDayElement = "";

        }

    }

    function get5DaysWeather(localCode){

        $.ajax({
            url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + localCode + "?apikey=" + accuweatherApiKey + "&language=pt-br&metric=true",
            type: "GET",
            dataType: "json",
            success: function(data){
                console.log("5 days forecast: ", data);

                $("#texto_max_min").html(String(data.DailyForecasts[0].Temperature.Minimum.Value) + "&deg; /" + String(data.DailyForecasts[0].Temperature.Maximum.Value)  + "&deg; /" );
                
                fill5DaysWeater(data.DailyForecasts);
            },
            erro: function(){
                generateError("Erro ao obter clima dos próximos 5 dias");
            }
        });

    }

    function getCurrentWeather(localCode){

        $.ajax({
            url: "http://dataservice.accuweather.com/currentconditions/v1/" + localCode + "?apikey=" + accuweatherApiKey + "&language=pt-br",
            type: "GET",
            dataType: "json",
            success: function(data){
                console.log("current conditions: ", data);

                weatherObject.temperature = data[0].Temperature.Metric.Value;
                weatherObject.weatherText = data[0].WeatherText;

                var iconNumer = data[0].WeatherIcon <= 9 ? "0" + String(data[0].WeatherIcon) :  String(data[0].WeatherIcon);

                weatherObject.weatherIcon = "https://developer.accuweather.com/sites/default/files/" + iconNumer + "-s.png";


                fillWeatherNow(weatherObject.city,weatherObject.state,weatherObject.country, weatherObject.temperature, weatherObject.min, weatherObject.max, weatherObject.weatherText, weatherObject.weatherIcon);
            },
            erro: function(){
                generateError("Erro ao obter clima atual");
            }
        });
    }

    function getCurrentLocalUser(lat,lon){

        $.ajax({
            url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + accuweatherApiKey + "&q=" + lat + "%2C" + lon + "&language=pt-br",
            type: "GET",
            dataType: "json",
            success: function(data){
                console.log("geoposition: ", data)

                try{
                    weatherObject.city = data.ParentCity.LocalizedName;
                }
                catch{
                    weatherObject.city = data.LocalizedName;
                }

                weatherObject.state = data.AdministrativeArea.LocalizedName,
                weatherObject.country = data.Country.LocalizedName;

                var localCode = data.Key;
                getCurrentWeather(localCode);
                get5DaysWeather(localCode);
                getWeatherByHour(localCode);
            },
            erro: function(){
                generateError("Erro em definir latitude e longitude do local");
            }
        });
    }

    function getSearchCoordinates(input){

        input = encodeURI(input);

        $.ajax({
            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + input + ".json?access_token=" + mapboxToken,
            type: "GET",
            dataType: "json",
            success: function(data){
                console.log("mapbox: ", data)
                var long = data.features[0].geometry.coordinates[0];
                var lat = data.features[0].geometry.coordinates[1];
                getCurrentLocalUser(lat,long);

            },
            erro: function(){
                generateError("Erro na pesquisa do local");
            }
        });

    }

    function getIpCoordinates(){

        var standardLatitude = -20.948895; 
        var standerLongitude = -48.481440;

        $.ajax({
            url: "http://www.geoplugin.net/json.gp?ip",
            type: "GET",
            dataType: "json",
            success: function(data){

                if(data.geoplugin_latitude && data.geoplugin_longitude){
                    getCurrentLocalUser(data.geoplugin_latitude,data.geoplugin_longitude);
                }
                else{
                    getCurrentLocalUser(standardLatitude,standerLongitude);
                }
            },
            erro: function(){
                console.log("Erro");
                getCurrentLocalUser(standardLatitude,standerLongitude);
            }
        });

    }

    getIpCoordinates();

    function generateError(message){

        if(!message){
            message = "Erro na solicitação!";
        }

        
        $(".refresh-loader").hide();

        $("#aviso-erro").text(message);
        $("#aviso-erro").slideDown();
        window.setTimeout(function(){
            $("#aviso-erro").slideUp();
        }, 3000)
        
    }
    
    $("#search-button").click(function(){
        $(".refresh-loader").show();
        var local = $("input#local").val();
        if(local){
            getSearchCoordinates(local);
        }else{
            alert('Local inválido');
        }
    });

    $("input#local").on("keypress", function(e){
        if(e.which == 13){
            
            var local = $("input#local").val();
            if(local){
                getSearchCoordinates(local);
            }else{
                alert('Local inválido');
            }
        }
    });



});