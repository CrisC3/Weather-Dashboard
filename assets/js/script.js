var txtCityEl = $("#tbx-city");
var cityLocationDivEl = $("#city-location");
var currentWeatherRow = $("#current-weather-container");
var currentWeatherDivEl = $("#current-weather");
var currentWeatherImgEl = $("#current-weather-img");
var forecastDivEl = $("#forecast");
var forecastDaysDivEl = $("#forecast-days");

var baseUrlCurrentWeather = "https://api.openweathermap.org/data/2.5/weather?q="
var baseUrlForecastWeather = "https://api.openweathermap.org/data/2.5/forecast?q="

var appId = "&appid=";
var apiKey = "c9a9ed03a355403f4cb9a36e931c0b4a";
var apiCall = appId + apiKey;

function onLoad() {
    
    //#region Message to display in developer tools
        console.log("Started onLoad");
    //#endregion
    
    //#region Message to display in developer tools
        console.log("Finished onLoad");
    //#endregion
    
}

function getWeather() {

    currentWeatherData();
    weatherForecastData();
}

function currentWeatherData() {
    
    var requestUrl = baseUrlCurrentWeather + txtCityEl.val() + "&units=imperial" + apiCall;

    fetch(requestUrl)
        .then(function (response) {
            if ((response.ok) || (response.status == 200)) {
                return response.json();
            }
            else {
                throw new Error();
            }
        })
        .then(function (data) {

            cityLocationDivEl.empty();
            currentWeatherRow.removeClass("hide");

            var cityName = data.name;
            var cityCountry = data.sys.country;
            var dateTime = new Date(data.dt * 1000).toLocaleDateString();
            var weatherIcon = data.weather[0].icon
            var temperature = data.main.temp;
            var humidity = data.main.humidity;
            var windSpeed = data.wind.speed;
            var longitude = data.coord.lon;
            var latitude = data.coord.lat;
            var uvIndex = getCurrentWeatherUv(longitude, latitude);
        
            var pCurrentSearchEl = document.createElement("p");
            var pEl = document.createElement("p");
            var currentHeading = document.createElement("h2");
            var imgEl = document.createElement("img");
            var temperatureEl = document.createElement("p");
            var humidityEl = document.createElement("p");
            var windSpeedEl = document.createElement("p");

            pCurrentSearchEl.append("Current search location:")
            pEl.append("** " + cityName + ", " + cityCountry)

            cityLocationDivEl.append(pCurrentSearchEl);
            cityLocationDivEl.append(pEl);


            currentWeatherDivEl.addClass("current-weather");
           
            imgEl.setAttribute("id", "weather-image-icon");
            imgEl.setAttribute("src", "http://openweathermap.org/img/wn/" + weatherIcon + ".png");

            currentHeading.append(cityName + " (" + dateTime + ") ");
            //currentHeading.appendChild(imgEl);

            currentWeatherImgEl.append(imgEl);
            
            temperatureEl.append("Temperature: " + temperature + " °F");
            humidityEl.append("Humidity: " + humidity + " %");
            windSpeedEl.append("Wind Speed: " + windSpeed + " MPH");
            
            currentWeatherDivEl.append(currentHeading);
            currentWeatherDivEl.append(temperatureEl);
            currentWeatherDivEl.append(humidityEl);
            currentWeatherDivEl.append(windSpeedEl);
            


        })
        .catch(function (error) {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

function weatherForecastData() {
    
    var requestUrl = baseUrlForecastWeather + txtCityEl.val() + "&units=imperial" + apiCall;

    fetch(requestUrl)
        .then(function (response) {
            if ((response.ok) || (response.status == 200)) {
                return response.json();
            }
            else {
                throw new Error();
            }
        })
        .then(function (data) {

            var forecastData = data.list;
            console.log(forecastData);
            
            forecastDivEl.empty();

            var forecastHeading = document.createElement("h2");
            
            forecastHeading.append("5-Day Forecast:");

            forecastDivEl.append(forecastHeading);
            
            for(var i = 0; i < forecastData.length; i++) {
                
                if(forecastData[i].dt_txt.indexOf('18:00:00') != -1) {

                    console.log(forecastData[i].dt_txt.indexOf('18:00:00').length);

                    var localDate = new Date(forecastData[i].dt_txt).toLocaleDateString();

                    var dayCol = document.createElement("div");
                    var dateHeading = document.createElement("h5");
                    
                    dateHeading.append(localDate);
                    
                    dayCol.classList.add("col-sm", "py-2", "mx-1", "card", "bg-primary", "text-white");


                    dayCol.append(dateHeading);

                    forecastDaysDivEl.append(dayCol);
                    
                }
            }

        })
        .catch(function (error) {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

function getCurrentWeatherUv(lon, lat) {

    var requestUrl = "http://api.openweathermap.org/data/2.5/uvi?lon=" + lon + "&lat=" + lat + apiCall;
    var dataValue;

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            var uvIndexEl = document.createElement("p");
            var uvIndexColorEl = document.createElement("span");
            var uvIndex = data.value;

            uvIndexColorEl.classList.add("btn", "btn-sm");

            uvIndexEl.append("UV Index: ");
            uvIndexColorEl.append(uvIndex);
            uvIndexEl.appendChild(uvIndexColorEl);

            switch (uvIndex) {
                case uvIndex < 3:
                    uvIndexColorEl.classList.add("btn-success");
                    break;
                case uvIndex < 7:
                    uvIndexColorEl.classList.add("btn-warning");
                    break;
                default:
                    uvIndexColorEl.classList.add("btn-danger");
            }


            currentWeatherDivEl.append(uvIndexEl);
      });
   
}

function test() {
   
    console.log("For testing purposes");
}

//#region Application starts
window.onload = onLoad;
$("#btn-search").on("click", getWeather);
document.addEventListener("keyup", function(event) {
    if ((txtCityEl.val() != "") && (event.code === 'Enter')) {
        getWeather();
      //alert('Enter is pressed!');
    }
  });
  //#endregion