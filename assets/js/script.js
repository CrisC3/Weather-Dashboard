var txtCityEl = $("#tbx-city");
var searchHistory = $("#cities-history");
var cityLocationDivEl = $("#city-location");
var currentWeatherRow = $("#current-weather-container");
var currentWeatherDivEl = $("#current-weather");
var currentWeatherImgEl = $("#current-weather-img");
var forecastWeatherRow = $("#forecast-weather-container");
var forecastDivEl = $("#forecast");
var forecastDaysDivEl = $("#forecast-days");

var baseUrlCurrentWeather = "https://api.openweathermap.org/data/2.5/weather?q="
var baseUrlForecastWeather = "https://api.openweathermap.org/data/2.5/forecast?q="
var appId = "&appid=";
var apiKey = "c9a9ed03a355403f4cb9a36e931c0b4a";
var apiCall = appId + apiKey;
var keyName = "weather";

var longitude;
var latitude;

function onLoad() {
    
    //#region Message to display in developer tools
        console.log("Started onLoad");
    //#endregion
    
    loadFromLocalStorage();

    //#region Message to display in developer tools
        console.log("Finished onLoad");
    //#endregion
    
}

function getWeather(searchCity) {

    if(searchCity != "") {
        currentWeatherData(searchCity);
        weatherForecastData(searchCity);
        txtCityEl.val("");
    }
}

function currentWeatherData(citySearch) {
    
    var requestUrl = baseUrlCurrentWeather + citySearch + "&units=imperial" + apiCall;

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

            currentWeatherDivEl.empty();
            currentWeatherRow.removeClass("hide");

            var city = data.name;
            var country = data.sys.country;
            var cityCountry = city + ", " + country;
            var dateTime = new Date(data.dt * 1000).toLocaleDateString();
            var weatherIcon = data.weather[0].icon
            var temperature = data.main.temp;
            var humidity = data.main.humidity;
            var windSpeed = data.wind.speed;
            longitude = data.coord.lon;
            latitude = data.coord.lat;
            var uvIndex = getCurrentUv(longitude, latitude);
        
            var citiesList = document.createElement("li");
            var currentHeading = document.createElement("h2");
            var imgEl = document.createElement("img");
            var temperatureEl = document.createElement("p");
            var humidityEl = document.createElement("p");
            var windSpeedEl = document.createElement("p");

            // If - prevents the city to be added on the search history again if the user last search for it last time
            if((searchHistory[0].children.length == 0) || (cityCountry != searchHistory[0].children[0].innerHTML)) {
                citiesList.setAttribute("id", city + "-" + country);
                saveToLocalStorage(cityCountry);
                citiesList.append(cityCountry);
                searchHistory.prepend(citiesList);
            }

            currentWeatherDivEl.addClass("current-weather");
           
            currentWeatherImgEl.empty();
            imgEl.setAttribute("id", "weather-image-icon");
            imgEl.setAttribute("src", "http://openweathermap.org/img/wn/" + weatherIcon + ".png");

            currentHeading.append(city + ", "  + country + " (" + dateTime + ") ");
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

function weatherForecastData(citySearch) {
    
    var requestUrl = baseUrlForecastWeather + citySearch + "&units=imperial" + apiCall;

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

            forecastDaysDivEl.empty();

            var forecastData = data.list;
                        
            forecastDivEl.empty();
            forecastDivEl.removeClass("hide");
            forecastDaysDivEl.removeClass("hide");
            forecastWeatherRow.removeAttr("class");

            var forecastHeading = document.createElement("h2");
            var uviCounter = 0;
            
            forecastHeading.append("5-Day Forecast:");

            forecastDivEl.append(forecastHeading);

            for(var i = 0; i < forecastData.length; i++) {

                if(forecastData[i].dt_txt.indexOf('15:00:00') != -1) {

                    var localDate = new Date(forecastData[i].dt_txt).toLocaleDateString();
                    var temperature = forecastData[i].main.temp;
                    var weatherIcon = forecastData[i].weather[0].icon;
                    var humidity = forecastData[i].main.humidity;
                    var windSpeed = forecastData[i].wind.speed;

                    var dayCol = document.createElement("div");
                    var dateHeading = document.createElement("h5");
                    var imgEl = document.createElement("img");
                    var temperatureEl = document.createElement("p");
                    var humidityEl = document.createElement("p");
                    var windSpeedEl = document.createElement("p");
                    var MaxUviTxtEl = document.createElement("p");
                    var MaxUviSpnEl = document.createElement("span");
                                        
                    dateHeading.append(localDate);                   
                    imgEl.setAttribute("style", "width:50px;height:50px")
                    imgEl.setAttribute("src", "http://openweathermap.org/img/w/" + weatherIcon + ".png");
                    temperatureEl.append("Temp: " + temperature + " °F");
                    humidityEl.append("Hum: " + humidity + " %");
                    windSpeedEl.append("Wind Spd: " + windSpeed + " MPH");
                    MaxUviSpnEl.setAttribute("id", "uviDay-" + uviCounter);
                    MaxUviTxtEl.append("Max UVI: ");
                    MaxUviTxtEl.appendChild(MaxUviSpnEl);

                    dayCol.classList.add("col-lg-5", "col-xl-2", "my-1", "py-2", "mx-1", "card", "bg-primary", "text-white", "rounded-corners");
                    dayCol.append(dateHeading);
                    dayCol.append(imgEl);
                    dayCol.append(temperatureEl);
                    dayCol.append(humidityEl);
                    dayCol.append(windSpeedEl);
                    dayCol.append(MaxUviTxtEl);
                    
                    forecastDaysDivEl.append(dayCol);

                    uviCounter++;
                    
                }
            }

            var uvIndex = getForecastUv(longitude, latitude);

        })
        .catch(function (error) {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

function getCurrentUv(lon, lat) {

    var requestUrl = "https://api.openweathermap.org/data/2.5/onecall?lon=" + lon + "&lat=" + lat + apiCall;

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            var uvIndexEl = document.createElement("p");
            var uvIndexColorEl = document.createElement("span");
            var uvIndex = data.current.uvi;

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

function getForecastUv(lon, lat) {

    var requestUrl = "https://api.openweathermap.org/data/2.5/onecall?lon=" + lon + "&lat=" + lat + "&exclude=current,minutely,hourly,alerts" + apiCall;

    fetch(requestUrl)
        .then(function (response) {
            if ((response.ok) || (response.status == 200)) {
                return response.json();
            }
            else {
                throw new Error('Response get failed');
            }
        })
        .then(function (data) {

            var forecastUvi = data;
            var day1Col = $("#uviDay-0");
            var day2Col = $("#uviDay-1");
            var day3Col = $("#uviDay-2");
            var day4Col = $("#uviDay-3");
            var day5Col = $("#uviDay-4");

            day1Col.addClass("btn btn-sm btn-danger");
            day1Col.append(forecastUvi.daily[0].uvi);

            day2Col.addClass("btn btn-sm btn-danger");
            day2Col.append(forecastUvi.daily[1].uvi);

            day3Col.addClass("btn btn-sm btn-danger");
            day3Col.append(forecastUvi.daily[2].uvi);

            day4Col.addClass("btn btn-sm btn-danger");
            day4Col.append(forecastUvi.daily[3].uvi);

            day5Col.addClass("btn btn-sm btn-danger");
            day5Col.append(forecastUvi.daily[4].uvi);

        })
        .catch(function (error) {
            console.error('There has been a problem with your fetch operation:', error);
        });


}

function saveToLocalStorage(location) {

    var cities = JSON.parse(window.localStorage.getItem(keyName)) || [];    
    var weatherList = {city: location};

    if((cities.length == 0) || (location != cities[0].city)) {
        $("#btn-clear-history").removeClass("hide");
        cities.unshift(weatherList);
        localStorage.setItem("weather", JSON.stringify(cities));

    }
    

}

function loadFromLocalStorage() {

    var cities = JSON.parse(window.localStorage.getItem(keyName));

    if(cities != null) {
        // Clear out search history, before entering new cities
        searchHistory.empty();
    
        for(var i = 0; i < cities.length; i++) {
            var citiesList = document.createElement("li");
            citiesList.setAttribute("id", cities[i].city.replace(", ", "-"));
            
            citiesList.append(cities[i].city);
            searchHistory.append(citiesList);

        }
        
        // Loads the last search city when user loads page
        getWeather(cities[0].city);

        $("#btn-clear-history").removeClass("hide");

    }
}

function loadFromSearchClick() {

    var target = event.target.innerHTML;
    
    getWeather(target);
}

function clearHistory() {
    searchHistory.empty();
    localStorage.removeItem(keyName);
    $("#btn-clear-history").addClass("hide");
    currentWeatherDivEl.empty();
    currentWeatherRow.addClass("hide");
    currentWeatherImgEl.empty();
    forecastWeatherRow.addClass("hide");
    forecastDivEl.addClass("hide");
    forecastDaysDivEl.addClass("hide");
}


//#region Application starts
window.onload = onLoad;

$("#btn-search").on("click", getWeather(txtCityEl.val()));
$("#btn-clear-history").on("click", clearHistory);
searchHistory.on("click", loadFromSearchClick);

document.addEventListener("keyup", function(event) {
    if ((txtCityEl.val() != "") && (event.code === 'Enter')) {
        getWeather(txtCityEl.val());
      //alert('Enter is pressed!');
    }
  });
  //#endregion