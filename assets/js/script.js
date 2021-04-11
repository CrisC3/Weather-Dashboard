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


// Runs when loading the website in browser
function onLoad() {
    
    //#region Message to display in developer tools
        console.log("Started onLoad");
    //#endregion
    
    // Function to display the search history from local storage
    loadFromLocalStorage();

    //#region Message to display in developer tools
        console.log("Finished onLoad");
    //#endregion
    
}

function getWeather(searchCity) {

    // IF - checks if the parameter search city has value, if it does, proceeds to the functions of current and forecast weather
    // with the parameter
    if(searchCity != "") {
        currentWeatherData(searchCity);
        weatherForecastData(searchCity);
        txtCityEl.val("");
    }
}


// Adds the current weather data
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

            // Clears out the element, before adding data
            currentWeatherDivEl.empty();

            // Unhides the element
            currentWeatherRow.removeClass("hide");

            // Local variables
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
        
            // Local variables to create document elements
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

            // Adds class to the element
            currentWeatherDivEl.addClass("current-weather");
           
            // Clears out the image content, before adding
            currentWeatherImgEl.empty();

            // Setting attributes to the image element
            imgEl.setAttribute("id", "weather-image-icon");
            imgEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherIcon + ".png");

            // Appending data to different elements
            currentHeading.append(city + ", "  + country + " (" + dateTime + ") ");
            currentWeatherImgEl.append(imgEl);
            temperatureEl.append("Temperature: " + temperature + " °F");
            humidityEl.append("Humidity: " + humidity + " %");
            windSpeedEl.append("Wind Speed: " + windSpeed + " MPH");
            
            // Appending data to the final element
            currentWeatherDivEl.append(currentHeading);
            currentWeatherDivEl.append(temperatureEl);
            currentWeatherDivEl.append(humidityEl);
            currentWeatherDivEl.append(windSpeedEl);

        })
        .catch(function (error) {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

// Function to get forecast weather
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

            // Clears out the elements, before entering the data
            forecastDaysDivEl.empty();
            forecastDivEl.empty();

            // Local variables
            var forecastData = data.list;
            var uviCounter = 0;
            var forecastHeading = document.createElement("h2");
          
            // Unhiding elements
            forecastDivEl.removeClass("hide");
            forecastDaysDivEl.removeClass("hide");

            // Removing the class, which only contains hide in the element
            forecastWeatherRow.removeAttr("class");
       
            // Appending title to the element
            forecastHeading.append("5-Day Forecast:");

            // Appending one element into another
            forecastDivEl.append(forecastHeading);

            // Loop to get the 5 days forecast
            for(var i = 0; i < forecastData.length; i++) {

                // Get all entries which has timestamp of 3pm
                if(forecastData[i].dt_txt.indexOf('15:00:00') != -1) {

                    // Loop > if - local variables
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

                    // Appending data and setting attributes to multiple elements
                    dateHeading.append(localDate);                   
                    imgEl.setAttribute("style", "width:50px;height:50px")
                    imgEl.setAttribute("src", "https://openweathermap.org/img/w/" + weatherIcon + ".png");
                    temperatureEl.append("Temp: " + temperature + " °F");
                    humidityEl.append("Hum: " + humidity + " %");
                    windSpeedEl.append("Wind Spd: " + windSpeed + " MPH");
                    MaxUviSpnEl.setAttribute("id", "uviDay-" + uviCounter);
                    MaxUviTxtEl.append("Max UVI: ");
                    MaxUviTxtEl.appendChild(MaxUviSpnEl);

                    // Adding class to each column
                    dayCol.classList.add("col-lg-5", "col-xl-2", "my-1", "py-2", "mx-1", "card", "bg-primary", "text-white", "rounded-corners");
                    
                    // Appending all data into an element before the final element
                    dayCol.append(dateHeading);
                    dayCol.append(imgEl);
                    dayCol.append(temperatureEl);
                    dayCol.append(humidityEl);
                    dayCol.append(windSpeedEl);
                    dayCol.append(MaxUviTxtEl);
                    
                    // Adding all the data added from the previous day column
                    forecastDaysDivEl.append(dayCol);

                    // Increment counter
                    uviCounter++;
                    
                }
            }

            // Calls function for getting the forecast UVI
            var uvIndex = getForecastUv(longitude, latitude);

        })
        .catch(function (error) {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

// Function to get the current weather UV
function getCurrentUv(lon, lat) {

    var requestUrl = "https://api.openweathermap.org/data/2.5/onecall?lon=" + lon + "&lat=" + lat + apiCall;

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            // Local variables
            var uvIndexEl = document.createElement("p");
            var uvIndexColorEl = document.createElement("span");
            var uvIndex = data.current.uvi;

            // Adding class to element
            uvIndexColorEl.classList.add("btn", "btn-sm");

            // Appending data within elements
            uvIndexEl.append("UV Index: ");
            uvIndexColorEl.append(uvIndex);
            uvIndexEl.appendChild(uvIndexColorEl);

            // Sets the color of the UVI by adding class
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

            // Adding all the data into final element
            currentWeatherDivEl.append(uvIndexEl);
      });
   
}

// Function to add UVI to all forecasts
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

            // Local variables
            var forecastUvi = data;
            var day1Col = $("#uviDay-0");
            var day2Col = $("#uviDay-1");
            var day3Col = $("#uviDay-2");
            var day4Col = $("#uviDay-3");
            var day5Col = $("#uviDay-4");

            // Adding class and appending data to element
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

// Function to save the search in local storage
function saveToLocalStorage(location) {

    // Local variables
    var cities = JSON.parse(window.localStorage.getItem(keyName)) || [];    
    var weatherList = {city: location};

    // Checks if there is JSON data, OR, the current search does not match the last search
    if((cities.length == 0) || (location != cities[0].city)) {
        $("#btn-clear-history").removeClass("hide");
        cities.unshift(weatherList);
        localStorage.setItem("weather", JSON.stringify(cities));
    }
    

}

function loadFromLocalStorage() {

    // Local variable
    var cities = JSON.parse(window.localStorage.getItem(keyName));

    // Check if the JSON data exists
    if(cities != null) {
        // Clear out search history, before entering new cities
        searchHistory.empty();
    
        // Adds all the search history into an element
        for(var i = 0; i < cities.length; i++) {
            var citiesList = document.createElement("li");
            citiesList.setAttribute("id", cities[i].city.replace(", ", "-"));
            
            citiesList.append(cities[i].city);
            searchHistory.append(citiesList);

        }
        
        // Loads the last search city when user loads page
        getWeather(cities[0].city);

        // Unhides element
        $("#btn-clear-history").removeClass("hide");

    }
}

function loadFromSearchClick() {

    // Local variable
    var target = event.target.innerHTML;
    
    // Calls the function, with the target value, to pull all the weather information
    getWeather(target);
}

// Function to clear search history and current display
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

// Event listerner for onclick
$("#btn-search").on("click", function() {
    getWeather(txtCityEl.val());
});

$("#btn-clear-history").on("click", clearHistory);
searchHistory.on("click", loadFromSearchClick);

// If the user presses enter, is the same as clicking on the search button
document.addEventListener("keyup", function(event) {
    if ((txtCityEl.val() != "") && (event.code === 'Enter')) {
        getWeather(txtCityEl.val());
      //alert('Enter is pressed!');
    }
  });
  //#endregion