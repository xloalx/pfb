// Show the modal on page load
window.onload = function () {
    document.getElementById("myModal").style.display = "block";
}

// Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function (registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(function (error) {
            console.log('Service Worker registration failed:', error);
        });
}

// Import information from other files
import { homeBase, destinations } from "./airports.js";
import { registrations } from "./aircraft.js";
import { weatherIcons, windIcons, runwayIcons } from "./weatherIcons.js";
import { userData, openWeatherAPIKey } from "./user-info.js";

// Extract homeBase information
const homeBaseCity = Object.keys(homeBase)[0];
const homeBaseIATA = homeBase[homeBaseCity].iata;
const homeBaseICAO = homeBase[homeBaseCity].icao;
const homeBaseRunway = homeBase[homeBaseCity].runway;
const homeBaseAllRunway = homeBase[homeBaseCity].allRunway;

// Extract User Data
const userName = userData.userName;
const userCompany = userData.userCompany;

// Function to check if OpenWeather API key is available
function checkOpenWeatherAPIKey() {
    return typeof openWeatherAPIKey !== 'undefined' && openWeatherAPIKey !== '';
}

// Function to get weather data and hourly forecast from OpenWeather API
function getWeatherAndForecast(city) {
    if (!checkOpenWeatherAPIKey()) {
        return Promise.reject('OpenWeather API key is missing');
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherAPIKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${openWeatherAPIKey}&units=metric`;

    const currentWeatherPromise = fetch(currentWeatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Current Weather Data:', data); // Log the raw current weather data

            // Ensure the data structure is correct
            if (data.main && data.weather && data.weather.length > 0) {
                const currentTemp = Math.round(data.main.temp);
                const currDayConditions = data.weather[0].description;
                const icon = data.weather[0].icon;
                const wind = data.wind;
                return { currentTemp, currDayConditions, icon, wind }; // Return an object
            } else {
                throw new Error('Unexpected data structure');
            }
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            return { currentTemp: 'N/A', currDayConditions: 'N/A', icon: 'N/A', wind: { deg: 'N/A', speed: 'N/A' } }; // Return default values in case of error
        });

    const forecastPromise = fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Forecast Data:', data); // Log the raw forecast data

            // Retrieve every data point and stop when we reach 6 lots of data
            const filteredForecasts = data.list.slice(0, 6).map(forecast => ({
                time: forecast.dt_txt,
                temp: Math.round(forecast.main.temp),
                conditions: forecast.weather[0].description,
                icon: forecast.weather[0].icon,
                wind: forecast.wind
            }));

            console.log('Filtered Forecasts:', filteredForecasts); // Log the filtered forecasts

            return filteredForecasts;
        });

    return Promise.all([currentWeatherPromise, forecastPromise])
        .then(([currentWeather, hourlyForecast]) => ({
            currentWeather,
            hourlyForecast
        }))
        .catch(error => {
            console.error(`Error: Unable to retrieve weather and forecast for ${city}`, error);
        });
}

// Function to get registrations for a specific type
function getRegistrationsForType(selectedType) {
    console.log('Getting registrations for type:', selectedType);
    const filteredRegistrations = Object.keys(registrations)
        .filter(key => registrations[key].type === selectedType);
    console.log('Filtered registrations:', filteredRegistrations);
    return filteredRegistrations;
}

// Extract unique types from registrations
const types = [...new Set(Object.values(registrations).map(reg => reg.type))];
console.log('Available types:', types);

// Function to populate the registration dropdown based on the selected type
function populateRegistrations(selectedType) {
    const registrationSelect = document.getElementById('registration');
    registrationSelect.innerHTML = ''; // Clear existing options

    const registrations = getRegistrationsForType(selectedType);
    console.log('Registrations for selected type:', registrations);

    registrations.forEach(registration => {
        const option = document.createElement('option');
        option.value = registration;
        option.text = registration;
        registrationSelect.appendChild(option);
    });
}

        // Function to format radio data into readable divs
function formatRadioData(radioData) {
    function formatData(data, indent = 0) {
        return Object.keys(data).map(key => {
            const paddedKey = key.padEnd(6, ' ');
            const value = data[key];
            if (typeof value === 'object' && value !== null) {
                return `<div style="margin-left: ${indent}px;">${paddedKey}:<div>${formatData(value, indent + 20)}</div></div>`;
            } else {
                return `<div style="margin-left: ${indent}px;">${paddedKey}: ${value}</div>`;
            }
        }).join('');
    }
    return formatData(radioData);
}
        // Function to format time to HH:mm in UTC
function formatTimeToUTC(dateString) {
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    const utcHours = String(date.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${utcHours}:${utcMinutes}`;
}

// Function to round wind direction to the nearest 30 degrees
function roundToNearest30(deg) {
    const roundedDeg = Math.round(deg / 30) * 30;
    const formattedDeg = (roundedDeg === 360) ? '000' : String(roundedDeg).padStart(3, '0');
    return formattedDeg;
}
// Ensure the DOM is fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', function () {
    // Populate the type dropdown
    const typeSelect = document.getElementById('type');
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.text = type;
        typeSelect.appendChild(option);
    });

    // Sort destinations by country and then alphabetically by city name
    const sortedDestinations = Object.keys(destinations).sort((a, b) => {
        if (destinations[a].country === destinations[b].country) {
            return a.localeCompare(b);
        }
        return destinations[a].country.localeCompare(destinations[b].country);
    });

    // Populate the destination dropdown with separators
    const destinationSelect = document.getElementById('destination');
    let currentCountry = '';
    sortedDestinations.forEach(destination => {
        const country = destinations[destination].country;
        if (country !== currentCountry) {
            currentCountry = country;
            const optgroup = document.createElement('optgroup');
            optgroup.label = country;
            destinationSelect.appendChild(optgroup);
        }
        const option = document.createElement('option');
        option.value = destination;
        option.text = destination;
        destinationSelect.lastChild.appendChild(option);
    });

    // Populate the registration dropdown with the first type by default
    if (types.length > 0) {
        populateRegistrations(types[0]);
    }

    // Event listener for submit button
    document.getElementById('submitBtn').addEventListener('click', function () {
        // Clear localStorage to ensure the latest data is updated
        localStorage.clear();

        const selectedDestination = document.getElementById('destination').value;
        const selectedType = document.getElementById('type').value;
        const selectedRegistration = document.getElementById('registration').value;

        // Get IATA and ICAO codes for the selected destination
        const selectedIATA = destinations[selectedDestination].iata;
        const selectedICAO = destinations[selectedDestination].icao;
        const selectedCity = destinations[selectedDestination].city;

        // Format runway as three digits
        function formatRunway(runway) {
            return runway + '0';
        }

        // Save the selected values for later processing
        let selectedData = {
            departure: homeBaseCity,
            destination: selectedDestination,
            type: selectedType,
            registration: selectedRegistration,
            homeIATA: homeBaseIATA,
            homeICAO: homeBaseICAO,
            destIATA: selectedIATA,
            destICAO: selectedICAO,
            city: selectedCity,
            userName: userName, // Add userName
            userComp: userCompany, // Add userCompany
            homeRunway: formatRunway(homeBaseRunway), // Format homeRunway
            homeAllRunway: homeBaseAllRunway,
            destRunway: formatRunway(destinations[selectedDestination].runway), // Format destRunway
            destAllRunway: destinations[selectedDestination].allRunway,
            homeRunwayIcon: runwayIcons[formatRunway(homeBaseRunway)].rwyIcon, // Add homeRunwayIcon
            destRunwayIcon: runwayIcons[formatRunway(destinations[selectedDestination].runway)].rwyIcon, // Add destRunwayIcon
            registrationConf: registrations[selectedRegistration].config, // Add registrationConf
            registrationDOW: registrations[selectedRegistration].dow // Add registrationDOW
        };

        // Dynamically import the destICAO.js file from the routeInfo directory
        import(`./routeInfo/${selectedICAO}.js`)
            .then(module => {
                console.log(`Module for ${selectedICAO} loaded:`, module);
                // Add route and radio information to selectedData
                const data = module[selectedICAO];
                if (data && data.route && data.radio) {
                    selectedData.routeOutbound = data.route.outbound;
                    selectedData.routeInbound = data.route.inbound;
                    selectedData.radioOutbound = formatRadioData(data.radio.outbound);
                    selectedData.radioInbound = formatRadioData(data.radio.inbound);
                } else {
                    throw new Error(`Module for ${selectedICAO} does not have the expected structure`);
                }

                // Get weather data and hourly forecast for the selected destination
                return Promise.all([
                    getWeatherAndForecast(selectedCity),
                    getWeatherAndForecast(homeBaseCity)
                ]);
            })
            .catch(error => {
                console.error(`Error loading module for ${selectedICAO}:`, error);
                // Fallback to VHHH_generic.js if selectedICAO.js is not found
                return import('./routeInfo/VHHH_generic.js')
                    .then(module => {
                        console.log('Fallback module VHHH_generic loaded:', module);
                        // Add route and radio information to selectedData
                        const data = module.generic;
                        if (data && data.route && data.radio) {
                            selectedData.routeOutbound = data.route.outbound;
                            selectedData.routeInbound = data.route.inbound;
                            selectedData.radioOutbound = formatRadioData(data.radio.outbound);
                            selectedData.radioInbound = formatRadioData(data.radio.inbound);
                        } else {
                            throw new Error('Fallback module VHHH_generic does not have the expected structure');
                        }

                        // Get weather data and hourly forecast for the selected destination
                        return Promise.all([
                            getWeatherAndForecast(selectedCity),
                            getWeatherAndForecast(homeBaseCity)
                        ]);
                    });
            })
            .then(([destinationData, homeBaseData]) => {
                selectedData.destCurrentTemp = `${destinationData.currentWeather.currentTemp}°C`; // Change to current temperature
                selectedData.destOverallConditions = destinationData.currentWeather.currDayConditions;
                selectedData.destCurrentIcon = weatherIcons[destinationData.currentWeather.icon];
                selectedData.destCurrentWindDeg = String(destinationData.currentWeather.wind.deg).padStart(3, '0');
                selectedData.destCurrentWindSpeed = Math.round(destinationData.currentWeather.wind.speed * 1.94384) + 'kts';
                selectedData.destCurrentWindIcon = windIcons[roundToNearest30(destinationData.currentWeather.wind.deg)];
                selectedData.destHour00Time = formatTimeToUTC(destinationData.hourlyForecast[0].time);
                selectedData.destHour01 = `${destinationData.hourlyForecast[1].temp}°C`;
                selectedData.destHour01Time = formatTimeToUTC(destinationData.hourlyForecast[1].time);
                selectedData.destHour01Icon = weatherIcons[destinationData.hourlyForecast[1].icon];
                selectedData.destHour01WindDeg = String(destinationData.hourlyForecast[1].wind.deg).padStart(3, '0');
                selectedData.destHour01WindSpeed = Math.round(destinationData.hourlyForecast[1].wind.speed * 1.94384) + 'kts';
                selectedData.destHour01WindIcon = windIcons[roundToNearest30(destinationData.hourlyForecast[1].wind.deg)];
                selectedData.destHour02 = `${destinationData.hourlyForecast[2].temp}°C`;
                selectedData.destHour02Time = formatTimeToUTC(destinationData.hourlyForecast[2].time);
                selectedData.destHour02Icon = weatherIcons[destinationData.hourlyForecast[2].icon];
                selectedData.destHour02WindDeg = String(destinationData.hourlyForecast[2].wind.deg).padStart(3, '0');
                selectedData.destHour02WindSpeed = Math.round(destinationData.hourlyForecast[2].wind.speed * 1.94384) + 'kts';
                selectedData.destHour02WindIcon = windIcons[roundToNearest30(destinationData.hourlyForecast[2].wind.deg)];
                selectedData.destHour03 = `${destinationData.hourlyForecast[3].temp}°C`;
                selectedData.destHour03Time = formatTimeToUTC(destinationData.hourlyForecast[3].time);
                selectedData.destHour03Icon = weatherIcons[destinationData.hourlyForecast[3].icon];
                selectedData.destHour03WindDeg = String(destinationData.hourlyForecast[3].wind.deg).padStart(3, '0');
                selectedData.destHour03WindSpeed = Math.round(destinationData.hourlyForecast[3].wind.speed * 1.94384) + 'kts';
                selectedData.destHour03WindIcon = windIcons[roundToNearest30(destinationData.hourlyForecast[3].wind.deg)];
                selectedData.destHour04 = `${destinationData.hourlyForecast[4].temp}°C`;
                selectedData.destHour04Time = formatTimeToUTC(destinationData.hourlyForecast[4].time);
                selectedData.destHour04Icon = weatherIcons[destinationData.hourlyForecast[4].icon];
                selectedData.destHour04WindDeg = String(destinationData.hourlyForecast[4].wind.deg).padStart(3, '0');
                selectedData.destHour04WindSpeed = Math.round(destinationData.hourlyForecast[4].wind.speed * 1.94384) + 'kts';
                selectedData.destHour04WindIcon = windIcons[roundToNearest30(destinationData.hourlyForecast[4].wind.deg)];
                selectedData.destHour05 = `${destinationData.hourlyForecast[5].temp}°C`;
                selectedData.destHour05Time = formatTimeToUTC(destinationData.hourlyForecast[5].time);
                selectedData.destHour05Icon = weatherIcons[destinationData.hourlyForecast[5].icon];
                selectedData.destHour05WindDeg = String(destinationData.hourlyForecast[5].wind.deg).padStart(3, '0');
                selectedData.destHour05WindSpeed = Math.round(destinationData.hourlyForecast[5].wind.speed * 1.94384) + 'kts';
                selectedData.destHour05WindIcon = windIcons[roundToNearest30(destinationData.hourlyForecast[5].wind.deg)];

                // Add new property for hourly conditions
                selectedData.destHourCond01 = destinationData.hourlyForecast[1].conditions;
                selectedData.destHourCond02 = destinationData.hourlyForecast[2].conditions;
                selectedData.destHourCond03 = destinationData.hourlyForecast[3].conditions;
                selectedData.destHourCond04 = destinationData.hourlyForecast[4].conditions;
                selectedData.destHourCond05 = destinationData.hourlyForecast[5].conditions;

                selectedData.homeCurrentTemp = `${homeBaseData.currentWeather.currentTemp}°C`;
                selectedData.homeOverallConditions = homeBaseData.currentWeather.currDayConditions;
                selectedData.homeCurrentIcon = weatherIcons[homeBaseData.currentWeather.icon];
                selectedData.homeCurrentWindDeg = String(homeBaseData.currentWeather.wind.deg).padStart(3, '0');
                selectedData.homeCurrentWindSpeed = Math.round(homeBaseData.currentWeather.wind.speed * 1.94384) + 'kts';
                selectedData.homeCurrentWindIcon = windIcons[roundToNearest30(homeBaseData.currentWeather.wind.deg)];
                selectedData.homeHour00Time = formatTimeToUTC(homeBaseData.hourlyForecast[0].time);
                selectedData.homeHour01 = `${homeBaseData.hourlyForecast[1].temp}°C`;
                selectedData.homeHour01Time = formatTimeToUTC(homeBaseData.hourlyForecast[1].time);
                selectedData.homeHour01Icon = weatherIcons[homeBaseData.hourlyForecast[1].icon];
                selectedData.homeHour01WindDeg = String(homeBaseData.hourlyForecast[1].wind.deg).padStart(3, '0');
                selectedData.homeHour01WindSpeed = Math.round(homeBaseData.hourlyForecast[1].wind.speed * 1.94384) + 'kts';
                selectedData.homeHour01WindIcon = windIcons[roundToNearest30(homeBaseData.hourlyForecast[1].wind.deg)];
                selectedData.homeHour02 = `${homeBaseData.hourlyForecast[2].temp}°C`;
                selectedData.homeHour02Time = formatTimeToUTC(homeBaseData.hourlyForecast[2].time);
                selectedData.homeHour02Icon = weatherIcons[homeBaseData.hourlyForecast[2].icon];
                selectedData.homeHour02WindDeg = String(homeBaseData.hourlyForecast[2].wind.deg).padStart(3, '0');
                selectedData.homeHour02WindSpeed = Math.round(homeBaseData.hourlyForecast[2].wind.speed * 1.94384) + 'kts';
                selectedData.homeHour02WindIcon = windIcons[roundToNearest30(homeBaseData.hourlyForecast[2].wind.deg)];
                selectedData.homeHour03 = `${homeBaseData.hourlyForecast[3].temp}°C`;
                selectedData.homeHour03Time = formatTimeToUTC(homeBaseData.hourlyForecast[3].time);
                selectedData.homeHour03Icon = weatherIcons[homeBaseData.hourlyForecast[3].icon];
                selectedData.homeHour03WindDeg = String(homeBaseData.hourlyForecast[3].wind.deg).padStart(3, '0');
                selectedData.homeHour03WindSpeed = Math.round(homeBaseData.hourlyForecast[3].wind.speed * 1.94384) + 'kts';
                selectedData.homeHour03WindIcon = windIcons[roundToNearest30(homeBaseData.hourlyForecast[3].wind.deg)];
                selectedData.homeHour04 = `${homeBaseData.hourlyForecast[4].temp}°C`;
                selectedData.homeHour04Time = formatTimeToUTC(homeBaseData.hourlyForecast[4].time);
                selectedData.homeHour04Icon = weatherIcons[homeBaseData.hourlyForecast[4].icon];
                selectedData.homeHour04WindDeg = String(homeBaseData.hourlyForecast[4].wind.deg).padStart(3, '0');
                selectedData.homeHour04WindSpeed = Math.round(homeBaseData.hourlyForecast[4].wind.speed * 1.94384) + 'kts';
                selectedData.homeHour04WindIcon = windIcons[roundToNearest30(homeBaseData.hourlyForecast[4].wind.deg)];
                selectedData.homeHour05 = `${homeBaseData.hourlyForecast[5].temp}°C`;
                selectedData.homeHour05Time = formatTimeToUTC(homeBaseData.hourlyForecast[5].time);
                selectedData.homeHour05Icon = weatherIcons[homeBaseData.hourlyForecast[5].icon];
                selectedData.homeHour05WindDeg = String(homeBaseData.hourlyForecast[5].wind.deg).padStart(3, '0');
                selectedData.homeHour05WindSpeed = Math.round(homeBaseData.hourlyForecast[5].wind.speed * 1.94384) + 'kts';
                selectedData.homeHour05WindIcon = windIcons[roundToNearest30(homeBaseData.hourlyForecast[5].wind.deg)];

                selectedData.homeHourCond01 = homeBaseData.hourlyForecast[1].conditions;
                selectedData.homeHourCond02 = homeBaseData.hourlyForecast[2].conditions;
                selectedData.homeHourCond03 = homeBaseData.hourlyForecast[3].conditions;
                selectedData.homeHourCond04 = homeBaseData.hourlyForecast[4].conditions;
                selectedData.homeHourCond05 = homeBaseData.hourlyForecast[5].conditions;

                // Log all values in the selectedData object
                console.log('Selected Data:', selectedData);
                Object.keys(selectedData).forEach(key => {
                    console.log(`${key}:`, selectedData[key]);
                });

                // Store selectedData in localStorage
                localStorage.setItem('selectedData', JSON.stringify(selectedData));

                // Redirect to output.html
                window.location.href = 'output.html';
            })
            .catch(error => {
                console.error(`Error loading module for ${selectedICAO} or fallback module:`, error);
            });
    });

    // Event listener for type dropdown
    document.getElementById('type').addEventListener('change', function () {
        const selectedType = this.options[this.selectedIndex].text;
        populateRegistrations(selectedType);
    });
});