////global variable for user coordinates, list of countries for search bar, current country polygon
let userCoordinates = {};
const countryList = [];
let countryBorder;


//////map tile options
const mobile_atlas = L.tileLayer('https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey={apikey}', {
	attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	apikey: '3155abbaf2a94acd9ee6e3c487fd8c0f',
  maxZoom: 22
});

const atlas = L.tileLayer('https://{s}.tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey={apikey}', {
	attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	apikey: '3155abbaf2a94acd9ee6e3c487fd8c0f',
  maxZoom: 22
});

const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    minZoom: 1,
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  }
);

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

/////weather overlay options
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

////interest overlays
const WaymarkedTrails_hiking = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://waymarkedtrails.org">waymarkedtrails.org</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
const WaymarkedTrails_cycling = L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://waymarkedtrails.org">waymarkedtrails.org</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
const WaymarkedTrails_mtb = L.tileLayer('https://tile.waymarkedtrails.org/mtb/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://waymarkedtrails.org">waymarkedtrails.org</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
const WaymarkedTrails_slopes = L.tileLayer('https://tile.waymarkedtrails.org/slopes/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://waymarkedtrails.org">waymarkedtrails.org</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
const WaymarkedTrails_riding = L.tileLayer('https://tile.waymarkedtrails.org/riding/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://waymarkedtrails.org">waymarkedtrails.org</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


/////create map with default layer
const map = L.map('map', {
  layers: [mobile_atlas],
  zoomControl: false
});

////add zoom control to map in top right corner
new L.Control.Zoom({ position: 'bottomright'}).addTo(map);

//////add tile layers to control button and specify position

const baseMaps = {
  Default: mobile_atlas,
  Atlas: atlas,
  Satellite: satellite,
  'Earth At Night': earthAtNight,
};

const overlays = {
  Temperature: temperature,
  Precipitation: precipitation,
  Clouds: clouds,
  Hiking: WaymarkedTrails_hiking,
  Cycling: WaymarkedTrails_cycling,
  MTB: WaymarkedTrails_mtb,
  Slopes: WaymarkedTrails_slopes,
  Riding: WaymarkedTrails_riding,
  
}

L.control.layers(baseMaps, overlays, { position:'bottomright' }).addTo(map);

L.control.scale({position:'bottomleft'}).addTo(map);


/////initialise layer groups
const poiLayer = L.layerGroup();
const cityLayer = L.layerGroup();
const cityMarkers = L.markerClusterGroup({
  
  iconCreateFunction: (cluster) => {
    const count = cluster.getChildCount();
    const digits = (count + '').length;
    return L.divIcon({
      html: count,
      className: 'cluster digits-' + digits,
      iconSize: new L.Point(40, 40),
    });
  },
});

const regionLayer = L.layerGroup();
const regionMarkers = L.markerClusterGroup({
  
  iconCreateFunction: (cluster) => {
    const count = cluster.getChildCount();
    const digits = (count + '').length;
    return L.divIcon({
      html: count,
      className: 'cluster digits-' + digits,
      iconSize: new L.Point(40, 40),
    });
  },
});

const cityButton = L.easyButton(
  
  {
  id: 'city-marker-toggle',
  position: 'topright',
  states: [{
    stateName: 'add-markers',
    icon: '<strong>Cities</strong>',
    title: 'Show Cities',
    onClick: function(control) {
      map.removeLayer(poiLayer);
      map.removeLayer(regionMarkers);
      map.addLayer(cityMarkers);
      control.state('remove-markers');
    }
  
  }]
});
cityButton.addTo(map);

const regionButton = L.easyButton(
  
  {
  id: 'region-marker-toggle',
  position: 'topright',
  states: [{
    stateName: 'add-markers',
    icon: '<strong>Regions</strong>',
    title: 'Show Regions',
    onClick: function(control) {
      map.removeLayer(poiLayer);
      map.removeLayer(cityMarkers);
      map.addLayer(regionMarkers);
      control.state('remove-markers');
    }
 
  }]
});
regionButton.addTo(map);

const infoButton = L.easyButton(
  {
  id: 'country-info-toggle',
  position: 'topright',
  states: [{
    icon: 'fa fa-info',
    title: 'Show Country Info',
    onClick: function(control) {
     $('#details').modal("show");
    }
  }]
}
);

infoButton.addTo(map);


/////populate list of countries from countryBorders.geo.json
const getCountryList = () => {
let select = $('#countrySelect');

select.empty();

select.append('<option selected="true" disabled>Choose Country</option>');
select.prop('selectedIndex, 1');

const url = 'php/getCountryList.php';

$.getJSON(url, function (data) {
  console.log(data);
  $.each(data.results, function (key, entry) {
    countryList.push(entry);
    select.append($('<option></option>').attr('value', entry.name).text(entry.name));
  })
});
}; 



//////get info on selected country from https://restcountries.eu
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

    const activeCountry = new Country(
      c.name,
      c.alpha2Code,
      c.flag,
      c.area,
      c.capital, 
      c.currencies[0].name,
      c.currencies[0].symbol,
      c.population,
      c.region,
      c.subregion,
      c.borders,
      c.nativeName,
      c.languages[0].name
    );

    activeCountry.displayInfo();
    activeCountry.getCities();
    activeCountry.getRegions();
    activeCountry.getBoundingBox();
  });
};

//////retrieve country from selection using either country name or isoA3 code
const selectNewCountry = (country, type) => {

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
      const countryCode = result.properties.iso_a3;

      if (countryBorder) {
        countryBorder.clearLayers();
      }
      countryBorder = L.geoJSON(result, {
        style: {
          color: '#ed254e',
        },
      }).addTo(map);
      map.fitBounds(countryBorder.getBounds());
      getCountryInfo(countryCode);

    })
    .fail(() => {
      console.log('Error in selectNewCountry');
    });
};

/////////retrieve country name from users coordinates
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

      if (data.country) {
        $('#countrySelect').val(data.country);
        selectNewCountry(alpha3Code, 'code');
      }
    })
    .fail(() => {
      $('#modalHeader').html(`Error`);
      $('#modalBody').html(
        'Error finding a country for these coordinates. Please try a different location'
      );
      $('#infoModal').modal();
    });
};

//////////detect and jump to users current location, save coordinates as a variable
const jumpToUserLocation = () => {

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {

        const { longitude, latitude } = position.coords;

        userCoordinates = {
          longitude: longitude,
          latitude: latitude,
        };
        getCountryFromCoords(latitude, longitude);
      },
      (_error) => {

        selectNewCountry('GBR', 'code');
        userCoordinates = {
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


const handleSearchbarChange = () => {
  let country = $('#countrySelect').val();
  selectNewCountry(country, 'name');
};


const getCountryFromClick = (event) => {
  const { lat, lng } = event.latlng;
  getCountryFromCoords(lat, lng);
};


///////////info popup with either city or region data
const infoPopup = (event) => {
  let marker;
  const markerDetails = event.target.options;
  //create either new city or region object
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

  marker.getDistanceFromLatLonInKm(userCoordinates.latitude, userCoordinates.longitude);
  marker.getWikiDetails();
  marker.getWeatherInfo();
};

///////remove loader once html has rendered
const removeLoader = () => {
  if (countryBorder) {
    $('#preloader')
      .delay(100)
      .fadeOut('slow', () => {
        $(this).remove();
      });
    clearInterval(checkInterval);
  }
};

let checkInterval = setInterval(removeLoader, 50);

/////////once html rendered( document.ready) instigate following code
$(document).ready(() => {
  jumpToUserLocation();

  removeLoader();

  getCountryList();

  $('#countrySelect').change(() => $('#countrySelect').val());

  map.on('click', getCountryFromClick);
  

  $('#poiSel').change(() => {
    map.removeLayer(cityMarkers);
    map.removeLayer(regionMarkers);
    map.addLayer(poiLayer);
  });


  $('#countrySelect').change(() => {
    handleSearchbarChange($('#countrySelect').val());
  })

});

////Create country class 

class Country {
  constructor(name, alpha2Code, flag, area, capital, currency, currencySymbol, population, region, subregion, borders, nativeName, languages) {
    this.name = name,
      this.alpha2Code = alpha2Code,
      this.flag = flag;
      this.area = area || "Not Found",
      this.capital = capital || "Not Found",
      this.currency = currency || "Not Found",
      this.currencySymbol = currencySymbol || "",
      this.population = population || "Not Found",
      this.region= region,
      this.subregion = subregion,
      this.borders = borders || "Not Found",
      this.nativeName = nativeName || "Not Found",
      this.languages = languages || "Not Found";

   }

  getCities() {
    cityLayer.clearLayers(),
      cityMarkers.clearLayers(cityLayer),
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
          icon: " fa-city",
          markerColor: "#011936",
          shape: "circle",
          svg: !0,
          prefix: "fa"
        }),
          capitalMarker = L.ExtraMarkers.icon({
            icon: " fa-city",
            markerColor: "#011936",
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
            newMarker.on("click", infoPopup);
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

            newMarker.on("click", infoPopup);
          }
        });
        cityMarkers.addLayer(cityLayer);
      }).fail(() => {
        $("#modalHeader").html("Error"),
          $("#modalBody").html("Error fetching city information. Please try again or select a different country."),
          $("#infoModal").modal();
      });
  }
//// get regional data from geonames api, display in a marker cluster group
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
          markerColor: "#011936",
          shape: "circle",
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
          newMarker.on("click", infoPopup);
        }),
          regionMarkers.addLayer(regionLayer);
      }).fail(() => {
        $("#modalHeader").html("Error"),
          $("#infoAccordion").html("Error fetching the region data. Please try selecting a different country"),
          $("#infoModal").modal();
      });
  }

//////get bounding box for each country to use with opentripmap api
  getBoundingBox() {
    $.ajax({
      url: "php/getBoundingBox.php",
      dataType: "json",
      type: "POST",
      data: {
        countryCode: this.alpha2Code
      }
    }).done(result => {
      const {
        north: north,
        south: south,
        east: east,
        west: west } = result.data[0];
      this.getPois(north, south, east, west);
    }).fail(() => {
      $("#modalHeader").html("Error"),
        $("#modalBody").html("Error fetching the poi data. Please try selecting a different country"),
        $("#infoModal").modal();
    });

  }

//////get points of interest from opentripmap.io api with id, then get more info from second api
//////with wiki data and photos and display in modal.
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
          const newPoi = L.circleMarker([poi.point.lat, poi.point.lon],
            {
              radius: 5,
              color: '#011936',
              fillOpacity: 0.5,
            })
            .addTo(poiLayer);

          newPoi.on('click', () => {
            $.ajax({
              url: "php/getXidData.php",
              dataType: "json",
              type: "POST",
              data: {
                xid: poi.xid,
              }

            }).done(result => {
              const data = result.data;
              const wikiLink = data.wikipedia;
              const image = data.preview.source;

              $("#poiModalHeader").html(data.name),
                $("#poiModalBody").html("<img src='" + image + "' alt='" + data.name + "'>" +
                  "</br>" + data.wikipedia_extracts.html +
                  "</br><button class='btn btn-info'><a target='_blank' href='" + wikiLink + "'><em>More Info on Wikipedia</em></a></button</p>");
              $("#poiInfoModal").modal();


            }).fail(() => {
              $("#poiModalHeader").html("Error"),
                $("#poiModalBody").html("Error fetching the poi data. Please try selecting a different country"),
                $("#poiInfoModal").modal();
            })
          }
          );
        });
      });
  }

  ////display country statistics
  displayInfo() { 
    
    $('#countryName').html(`${this.name}`),
      $("#flag").attr('src', this.flag),
      $("#area").html(` ${(this.area).toLocaleString()}`),
      $("#capital").html(` ${this.capital}`),
      $("#currency").html(` ${this.currency} (${this.currencySymbol})`),
      $("#population").html(` ${(this.population).toLocaleString()}`),
      $("#region").html(` ${this.region}`),
      $("#subregion").html(` ${this.subregion}`),
      $("#borders").html(` ${this.borders}`),
      $("#nativeName").html(` ${this.nativeName}`),
      $("#languages").html(` ${this.languages}`);
  }




}

/////Create class for city and region features with data for markers

class Features {
  constructor(latitude, longitude, geonameId, name, population, type) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.geonameId = geonameId;
    this.name = name;
    this.population = population;
    this.type = type;
  }


  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

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
    const d = R * c;
    this.distance = d.toFixed();
  }

  ////get wikipedia summary for chosen feature and display on modal
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
        const data = result.data;
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
            const data = Object.values(result.data)[0];
            const extract = data.extract;

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

  displayWikiDetails() {

    $('#modalBody').html(
      `${this.cleanExtract}<br><a href=https://${this.wikiUrl} target="_blank">Full Article on Wikipedia</a>`);
  }



  //// current time at feature
  getTime() {
    const date = new Date();

    this.time = date.toLocaleString('en-GB', {

      timeZone: this.timeZone,
      timeStyle: 'short',
    });
  }


  wikiFailure() {
    $('#modalBody').html(
      `No wikipedia article could be found for this ${this.type}.`
    );
  }

  /////get current weather and 5 day forecast for current feature and add data to modal
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



  displayWeather() {

    let i = 0;
    this.dailyWeather.forEach((day) => {

      const date = new Date(day.dt * 1000);

      const dayOfWeek = date.toLocaleString('en-GB', {
        timeZone: this.timeZone,
        weekday: 'long',
      });

      $(`#forecastImg${i}`).attr(
        'src',
        `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`
      );
      $(`#forecast${i}`).html(
        `<ul><li>${dayOfWeek}</li>
        <li>${day.weather[0].description}</li>
        <li><b>${day.temp.max.toFixed()}&#8451;</b></li>
        <li>${day.temp.min.toFixed()}&#8451;</li>
        <li>${day.humidity}%;</li>
        <li>${Math.round(day.wind_speed * 2.237)}mph;</li><ul>`
      );

      i++;
    });


    $('#weatherImage').attr(
      'src',
      `https://openweathermap.org/img/wn/${this.currentWeather.icon}@2x.png`
    );
    $('#weatherModalList').html(
      `<ul><li>${this.currentWeather.description}</li>
      <li>${this.currentTemp.toFixed()}&#8451;</li>
      <li>${this.humidity}%</li>
      <li>${this.pressure}mb</li></ul>`
    );
  }
}


////Region Feature class with general info
class Region extends Features {
  constructor(latitude, longitude, geonameId, name) {
    super(latitude, longitude, geonameId, name);
  }

  displayInfo() {
    this.getTime();
    $('#modalHeader').html(`${this.name}`);
    $('#modalInfo').html(
      `<table class="table table-striped table-responsive">
      
        <tr>
          <th scope="row">Current Time</th>
          <td>${this.time}</td>
        </tr>
        <tr>
          <th scope="row">Latitude</th>
          <td>${this.latitude}</td>
        </tr>
        <tr>
          <th scope="row">Longitude</th>
          <td>${this.longitude}</td>
        </tr>
        <tr>
          <th scope="row">Distance from your location</th>
          <td>${this.distance}km</td>
        </tr>
      </tbody>
    </table>
    
  </div>`
      
    );
    $('#wikiInfo').removeClass('show');
    $('#forecastInfo').removeClass('show');
    $('#weatherInfo').removeClass('show');
    $('#generalInfo').addClass('show');
    $('#infoModal').modal();
  }
}

////city feature class with general info
class City extends Features {
  constructor(latitude, longitude, geonameId, name, population, type) {
    super(latitude, longitude, geonameId, name, population, type);
  }

  displayInfo() {
    this.getTime();
    $('#modalHeader').html(`${this.name}`);
    $('#modalInfo').html(
      `<table class="table table-striped table-responsive">
      
        <tr>
          <th scope="row">Current Time</th>
          <td>${this.time}</td>
        </tr>
        <tr>
          <th scope="row">Population</th>
          <td>${(this.population).toLocaleString()}</td>
        </tr>
        <tr>
          <th scope="row">Latitude</th>
          <td>${this.latitude}</td>
        </tr>
        <tr>
          <th scope="row">Longitude</th>
          <td>${this.longitude}</td>
        </tr>
        <tr>
          <th scope="row">Distance from your location</th>
          <td>${this.distance}km</td>
        </tr>
      </tbody>
    </table>
    
  </div>`
  );
    $('#wikiInfo').removeClass('show');
    $('#forecastInfo').removeClass('show');
    $('#weatherInfo').removeClass('show');
    $('#generalInfo').addClass('show');
    $('#infoModal').modal();
  }
}
