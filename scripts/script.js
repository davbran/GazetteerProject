class Country {
  constructor(name, alpha2Code, area, flag, capital, population, currency, currencySymbol) {
    this.name = name,
    this.alpha2Code = alpha2Code,
    this.area = area || "Not Found", this.flag = flag,
    this.capital = capital || "Not Found",
    this.population = population || "Not Found",
    this.currency = currency || "Not Found",
    this.currencySymbol = currencySymbol || ""
  }


  getCities() {
    cityLayer.clearLayers(),
      $.ajax({
        url: "php/getCityData.php",
        dataType: "json",
        type: "POST",
        data: {
          countryCode: this.alpha2Code
        }
      }
      ).done(result => {
        const marker = L.ExtraMarkers.icon({
          icon: " fa-map-pin",
          markerColor: "#BBDEF0",
          shape: "square",
          svg: !0,
          prefix: "fa"
        }),
          capitalMarker = L.ExtraMarkers.icon({
            icon: " fa-map-pin",
            markerColor: "#2C95C9",
            shape: "star",
            svg: !0,
            prefix: "fa"
          });

        result.data.forEach(city => {
          if ("PPLC" == city.fcode) {
            const newMarker = L.marker([city.lat, city.lng], {
              icon: capitalMarker,
              type: "city",
              name: city.name,
              population: city.population,
              latitude: city.lat,
              longitude: city.lng,
              capital: !0,
              geonameId: city.geonameId
            }).addTo(cityLayer);
            newMarker.on("click", infoPopup)
          }
          else {
            const newMarker = L.marker([city.lat, city.lng], {
              icon: marker,
              type: "city",
              name: city.name,
              population: city.population,
              latitude: city.lat,
              longitude: city.lng,
              geonameId: city.geonameId
            }).addTo(cityLayer);

            newMarker.on("click", infoPopup)
          }
        })
      }).fail(() => {
        $("#modalTitle").html("Error"),
          $("#modalBody").html("Unfortunately there was an error fetching city information. Please try again or select a different country."),
          $("#infoModal").modal()
      })
  }

  getRegions() {
    regionLayer.clearLayers(),
      regionMarkers.clearLayers(regionLayer),
      $.ajax({
        url: "php/getRegions.php",
        dataType: "json",
        type: "POST",
        data: {
          countryCode: this.alpha2Code
        }
      }).done(result => {
        const marker = L.ExtraMarkers.icon({
          icon: "fa-map-pin",
          markerColor: "#AFD5AA",
          shape: "penta",
          svg: !0,
          prefix: "fa"
        });
        result.data.forEach(region => {
          const newMarker = L.marker([region.lat, region.lng], {
            icon: marker,
            name: region.name,
            latitude: region.lat,
            longitude: region.lng,
            type: "region",
            geonameId: region.geonameId
          }).addTo(regionLayer);
          newMarker.on("click", infoPopup)
        }),
          regionMarkers.addLayer(regionLayer)
      }).fail(() => {
        $("#modalTitle").html("Error"),
          $("#infoAccordion").html("Unfortunately there was an error fetching the region data. Please try selecting a different country"),
          $("#infoModal").modal()
      })
  };


  
    getBoundingBox() {
      $('#poiSel').on('change', () =>
        $.ajax({
          url: "php/getBoundingBox.php",
          dataType: "json",
          type: "POST",
          data: {
            countryCode: this.alpha2Code
          }
        }).done(result => {
          const { north: north, south: south, east: east, west: west } = result.data[0];
          this.getPois(north, south, east, west);
        }).fail(() => {
          $("#modalTitle").html("Error"),
            $("#modalBody").html("Unfortunately there was an error fetching the poi data. Please try selecting a different country"),
            $("#infoModal").modal()
        })
     )
    };
  
  
  
    getPois(north, south, east, west) {
  
      poiLayer.clearLayers(),
  
      $.ajax({
          url: "php/getPoiData.php",
          dataType: "json",
          type: "POST",
          data: { 
            north: north, 
            south: south, 
            east: east, 
            west: west,
            kind: $('#poiSel').val() 
        }
      }).done(result => {
        result.data.forEach(poi => {
            const newPoi = L.circleMarker([poi.point.lat, poi.point.lon], {
                color: "#dc3545",
                fillColor: "#9C1C28",
                fillOpacity: .5,
                radius: 2
            }).addTo(poiLayer);
            const wikiLink = 'http://www.wikidata.org/wiki/' + poi.wikidata;
              const popupContent = "<p><b>Name: </b>" + poi.name +
              "<br><a target='_blank' href='" + wikiLink + "'><em>More Info</em></a></p>";
               newPoi.bindPopup(popupContent);
        })
    }).fail(() => {
        $("#modalTitle").html("Error"),
            $("#modalBody").html("Unfortunately there was an error fetching the earthpoi data. Please try selecting a different country"),
            $("#infoModal").modal()
    })
    }
           



  displayInfo() {
    $("#flag").attr('src', this.flag),
    $("#area").html(` ${this.area}`),
    $("#capital").html(` ${this.capital}`),
    $("#currency").html(` ${this.currency} (${this.currencySymbol})`),
    $("#population").html(` ${this.population}`)
  }

}

//Create POI class with methods for displaying information about city and region markers

class Features {
  constructor(latitude, longitude, geonameId, name, population, type) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.geonameId = geonameId;
    this.name = name;
    this.population = population;
    this.type = type;
  }

  //Degrees to radians for getDistancefromLatLon
  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  //Calculate distance based on coordinates
  getDistanceFromLatLonInKm(lat1, lon1) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(this.latitude - lat1);
    const dLon = this.deg2rad(this.longitude - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(this.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    this.distance = d.toFixed();
  }

  //Get wikipedia an dphotos article for the POI and display a short extract
  getWikiDetails() {
    $.ajax({
      url: 'php/getWikiUrl.php',
      dataType: 'json',
      type: 'POST',
      data: {
        geonameId: this.geonameId,
      },
    })
      .then((result) => {
        const data = result['data'];
        this.timeZone = data.timezone.timeZoneId;
        this.wikiUrl = data.wikipediaURL;
        const title = this.wikiUrl.split('/')[2];
        this.displayInfo();
        $.ajax({
          url: 'php/getWikiSummary.php',
          dataType: 'json',
          type: 'POST',
          data: {
            title: title,
          },
        })
          .done((result) => {
            const data = Object.values(result['data'])[0];
            const extract = data['extract'];
            //Extracts have '(listen)' where the wikipedia sound button would be, remove it
            const regex = /\(listen\)/;
            this.cleanExtract = extract.replace(regex, '');
            this.displayWikiDetails();
          })
          .fail(() => {
            this.displayInfo();
            this.wikiFailure();
          });
      })
      .fail(() => {
        this.displayInfo();
        this.wikiFailure();
      });
  }
  //Add wiki details to the modal
  displayWikiDetails() {

    $('#modalBody').html(
      `${this.cleanExtract}<br><a href=https://${this.wikiUrl} target="_blank">Full Article on Wikipedia</a>`);
  }



  //get current time at marker
  getTime() {
    const date = new Date();

    this.time = date.toLocaleString('en-GB', {
      //Pass in the timezone to get the proper time for the coordinates
      timeZone: this.timeZone,
      timeStyle: 'short',
    });
  }

  //If no article is found
  wikiFailure() {
    $('#modalBody').html(
      `No wikipedia article could be found for this ${this.type}.`
    );
  }

  //Get current weather & forecast. Also get current time included in json
  getWeatherInfo() {
    $.ajax({
      url: 'php/getWeatherForecast.php',
      type: 'POST',
      dataType: 'json',
      data: {
        latitude: this.latitude,
        longitude: this.longitude,
      },
    }).done((result) => {
      const data = result.data;
      this.currentWeather = data.current.weather[0];
      this.currentTemp = data.current.temp;
      this.humidity = data.current.humidity;
      this.pressure = data.current.pressure;
      this.dailyWeather = data.daily;
      this.displayWeather();
    });
  }



  //Add weather info to the modal
  displayWeather() {
    // const forecast = [];
    //Set up a counter to be used to set up index of forecast array
    let i = 0;
    this.dailyWeather.forEach((day) => {
      //dt is in seconds so it needs to be converted to milliseconds
      const date = new Date(day.dt * 1000);
      //Make sure the correct day is displayed for the timezone
      const dayOfWeek = date.toLocaleString('en-GB', {
        timeZone: this.timeZone,
        weekday: 'long',
      });

      $(`#forecastImg${i}`).attr(
        'src',
        `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`
      );
      $(`#forecast${i}`).html(
        `<li>${dayOfWeek}</li><li>${day.weather[0].description
        }</li><li>Min Temp:&nbsp;${day.temp.min.toFixed()}&#8451;
        </li><li>Max Temp:&nbsp;${day.temp.max.toFixed()}&#8451;
        </li><li>Humidity:&nbsp;${day.humidity}%;</li>
        </li><li>Wind Speed:&nbsp;${Math.round(day.wind_speed * 2.237)}mph;</li>`
      );

      i++;
    });

    //Display current weather info for location
    $('#weatherImage').attr(
      'src',
      `https://openweathermap.org/img/wn/${this.currentWeather.icon}@2x.png`
    );
    $('#weatherModalList').html(
      `<li>${this.currentWeather.description
      }</li><li>Temperature:&nbsp; ${this.currentTemp.toFixed()
      }&#8451;</li><li>Humidity:&nbsp;
      ${this.humidity
      }%</li><li>Pressure:&nbsp
      ${this.pressure}mb</li>`
    );
  }
}



class Region extends Features {
  constructor(latitude, longitude, geonameId, name) {
    super(latitude, longitude, geonameId, name);
    this.type = 'region';
  }
  //Add general info to the modal then display it
  displayInfo() {
    this.getTime();
    $('#modalTitle').html(`${this.name}`);
    $('#modalInfo').html(
      `<li>Current Time: &nbsp; ${this.time}</li><li>Estimated Population: &nbsp; ${this.population}</li><li>Latitude: &nbsp; ${this.latitude}</li><li>Longitude: &nbsp; ${this.longitude}</li><li>Distance from your location: &nbsp; ${this.distance}km</li>`
    );
    $('#wikiInfo').removeClass('show');
    $('#forecastInfo').removeClass('show');
    $('#weatherInfo').removeClass('show');
    $('#generalInfo').addClass('show');
    $('#infoModal').modal();
  }
};

class City extends Features {
  constructor(latitude, longitude, geonameId, name, population, type) {
    super(latitude, longitude, geonameId, name, population, type);
  }

  displayInfo() {
    this.getTime();
    $('#modalTitle').html(`${this.name}`);
    $('#modalInfo').html(
      `<li>Current Time: &nbsp; ${this.time}</li><li>Estimated Population: &nbsp; ${this.population}</li>
      <li>Latitude: &nbsp; ${this.latitude}</li><li>Longitude: &nbsp; ${this.longitude}</li><li>Distance from your location: &nbsp; ${this.distance}km</li>`
    );
    $('#wikiInfo').removeClass('show');
    $('#forecastInfo').removeClass('show');
    $('#weatherInfo').removeClass('show');
    $('#generalInfo').addClass('show');
    $('#infoModal').modal();
  }
};


//Global variables to store the users coordinates, coutries for the autoselect, and polygon of current country
let userCoords = {};
const countryList = [];
let countryOutline;


//Set details for different map displays
const dark = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }
);
const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    minZoom: 1,
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  }
);

const light = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }
);

const topographicmap = L.tileLayer(
  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  {
    id: 'mapbox.streets',
    tileSize: 512,
    zoomOffset: -1,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

const earthAtNight = L.tileLayer(
  'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
  {
    attribution:
      'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
    maxZoom: 8,
    minZoom: 2,
    format: 'jpg',
    time: '',
    tilematrixset: 'GoogleMapsCompatible_Level',
  }
);
const temperature = L.tileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=adcf651d877266947f5d5edc61315f6e', {
  tileSize: 512,
  zoomOffset: -1,
  layer: 'temp_new',
  minZoom: 2,
});
const precipitation = L.tileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=adcf651d877266947f5d5edc61315f6e', {
  tileSize: 512,
  minZoom: 2,
  zoomOffset: -1,
  layer: 'precipitation_new',
});
const clouds = L.tileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=adcf651d877266947f5d5edc61315f6e', {
  tileSize: 512,
  minZoom: 2,
  zoomOffset: -1,
  layer: 'clouds_new',
});


const map = L.map('map', {
  layers: [light],
  zoomControl: false
});

new L.Control.Zoom({ position: 'topright' }).addTo(map);


const baseMaps = {
  Light: light,
  Dark: dark,
  Topographic: topographicmap,
  Satellite: satellite,
  'Earth At Night': earthAtNight,
};

const weatherOverlays = {
  Temperature: temperature,
  Precipitation: precipitation,
  Clouds: clouds,

};

L.control.layers(baseMaps, weatherOverlays, { position: 'topright' }).addTo(map);


//Initialise the layer groups to be populated with markers
const poiLayer = L.layerGroup();
const cityLayer = L.layerGroup();
const regionLayer = L.layerGroup();
const regionMarkers = L.markerClusterGroup({
  iconCreateFunction: (cluster) => {
    return L.divIcon({
      html: `<div><span>${cluster.getChildCount()}</span></div>`,
      className: 'region marker-cluster marker-cluster',
      iconSize: new L.Point(40, 40),
    });
  },
});


const getCountryList = () => {
  const url = 'php/getCountryList.php';
  $.getJSON(url, (data) => {
    $(data).each((_key, value) => {
      countryList.push(value);
    });
 });
};

//Get info for selected country
const getCountryInfo = (countryCode) => {
  $.ajax({
    url: 'php/getCountryInfo.php',
    dataType: 'json',
    type: 'POST',
    data: {
      countryCode: countryCode,
    },
  }).done((result) => {
    const c = result.data;
    //Use the returned info to create new Country class
    const activeCountry = new Country(
      c.name,
      c.alpha2Code,
      c.area,
      c.flag,
      c.capital,
      c.population,
      c.currencies[0].name,
      c.currencies[0].symbol
    );
    //Display info and fetch & create markers for the cities, regions, and pois
    activeCountry.displayInfo();
    activeCountry.getCities();
    activeCountry.getRegions();
    activeCountry.getBoundingBox();
  });
};

//Handle selection of a new country
//The PHP routines will search the json file by either name or 3-letter code depending on the action that triggered it
//Autocomplete is populated by the json file so the names will always be a match, but other sources names may differ slightly so the code is preferred
const selectNewCountry = (country, type) => {
  const start = Date.now();

  $.ajax({
    url: 'php/getPolygon.php',
    type: 'POST',
    dataType: 'json',
    data: {
      country: country,
      type: type,
    },
  })
    .done((result) => {
      const countryCode = result['properties']['ISO_A3'];
      //If a polygon is already drawn, clear it
      if (countryOutline) {
        countryOutline.clearLayers();
      }
      countryOutline = L.geoJSON(result, {
        style: {
          color: '#ffc107'
          ,
        },
      }).addTo(map);
      map.fitBounds(countryOutline.getBounds());
      getCountryInfo(countryCode);

      console.log(Date.now() - start);
    })
    .fail(() => {
      console.log('Error in selectNewCountry');
    });
};

//Use the users coordinates to get the name of their country
const getCountryFromCoords = (latitude, longitude) => {
  $.ajax({
    url: 'php/getCountryFromCoords.php',
    type: 'POST',
    dataType: 'json',
    data: {
      lat: latitude,
      long: longitude,
    },
  })
    .done((result) => {
      const data = result.data[0].components;
      const alpha3Code = data['ISO_3166-1_alpha-3'];
      //Only change value if a country was found for the location otherwise searchbar empties when ocean is clicked
      if (data.country) {
        $('#countrySearch').val(data.country);
        adjustSearchBarFont(data.country);
        selectNewCountry(alpha3Code, 'code');
      }
    })
    .fail(() => {
      $('#modalTitle').html(`Error`);
      $('#modalBody').html(
        'Unfortunately there was an error finding a country for these coordinates. Please try a different location'
      );
      $('#infoModal').modal();
    });
};

//Find the user location and uses it to locate country on the map
const jumpToUserLocation = () => {
  //Check to see if user's browser supports navigator, although if it doesn't user probably has bigger issues than my app not working
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        //Save the lat & long and pass it to the function to get the country
        const { longitude, latitude } = position.coords;
        //Store the coords in a global to be used later to calculate distances
        userCoords = {
          longitude: longitude,
          latitude: latitude,
        };
        getCountryFromCoords(latitude, longitude);
      },
      (_error) => {
        //If user denies location access, default to UK
        selectNewCountry('GBR', 'code');
        userCoords = {
          longitude: -0.118092,
          latitude: 51.509865,
        };
        alert(
          'Location request denied. Default Location United Kingdom'
        );
      }
    );
  } else {
    selectNewCountry('GBR', 'code');
  }
};

//Event triggered when a country is selected from the searchbar
const handleSearchbarChange = (_event, ui) => {
  const country = ui.item.value;
  adjustSearchBarFont(country);
  selectNewCountry(country, 'name');
};

//Adjust font height to make sure country name fits the searchbar
const adjustSearchBarFont = (country) => {
  if (country.length > 25) {
    $('#countrySearch').css('font-size', '0.6em');
  } else if (country.length > 15) {
    $('#countrySearch').css('font-size', '1em');
  } else {
    $('#countrySearch').css('font-size', '1.3em');
  }
};

//Handle map click
const getCountryFromClick = (event) => {
  const { lat, lng } = event.latlng;
  getCountryFromCoords(lat, lng);
};

//Associate the autocomplete field with the list of countries and set the function to be triggered when a country is selected
$('#countrySearch').autocomplete({
  source: countryList,
  minLength: 0,
  select: handleSearchbarChange,
  position: { my: 'top', at: 'bottom', of: '#countrySearch' },
});

//Create a pop up when a regionmarker is clicked
const infoPopup = (event) => {
  let marker;
  const markerDetails = event.target.options;
  //create either new city or regionobject
  if (markerDetails.type == 'city') {
    marker = new City(
      markerDetails.latitude,
      markerDetails.longitude,
      markerDetails.geonameId,
      markerDetails.name,
      markerDetails.population,
      markerDetails.type
    );
  } else if (markerDetails.type == 'region') {
    marker = new Region(
      markerDetails.latitude,
      markerDetails.longitude,
      markerDetails.geonameId,
      markerDetails.name,
      markerDetails.type
    );
  }
  //Get distance between marker and user
  marker.getDistanceFromLatLonInKm(userCoords.latitude, userCoords.longitude);
  marker.getWikiDetails();
  marker.getWeatherInfo();
};

//Remove Loading Screen
const removeLoader = () => {
  //Check if a country has been loaded, if so then remove loading screen. Otherwise keep checking at short intervals until it has.
  if (countryOutline) {
    $('#preloader')
      .delay(100)
      .fadeOut('slow', () => {
        $(this).remove();
      });
    clearInterval(checkInterval);
  }
};
let checkInterval = setInterval(removeLoader, 50);

//When HTML is rendered...
$(document).ready(() => {
  jumpToUserLocation();

  removeLoader();

  //Populate list of countries
  getCountryList();

  //Clear the searchbar of text when it is clicked for a smoother experience
  $('#countrySearch').click(() => $('#countrySearch').val(''));

  //Change country based on map click
  map.on('click', getCountryFromClick);

  $('#poiSel').change(() => {
    map.removeLayer(cityLayer);
    map.removeLayer(regionMarkers);
    map.addLayer(poiLayer);

  });

  $('#cityBtn').click(() => {
    map.removeLayer(poiLayer);
    map.removeLayer(regionMarkers);
    map.addLayer(cityLayer);
  });

  $('#regionBtn').click(() => {
    map.removeLayer(poiLayer);
    map.removeLayer(cityLayer);
    map.addLayer(regionMarkers);
  });

});
