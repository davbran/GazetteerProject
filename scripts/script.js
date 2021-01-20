class Country {
  constructor(name, alpha2Code, area, flag, capital, population, currency, currencySymbol) {
    this.name = name,
      this.alpha2Code = alpha2Code,
      this.area = area || "Not Found",
      this.capital = capital || "Not Found",
      this.population = population || "Not Found",
      this.currency = currency || "Not Found",
      this.currencySymbol = currencySymbol || "",
      this.flag = flag
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
          shape: "circle",
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
        $("#modalHeader").html("Error"),
        $("#modalBody").html("Error fetching city information. Please try again or select a different country."),
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
          newMarker.on("click", infoPopup)
        }),
          regionMarkers.addLayer(regionLayer)
      }).fail(() => {
        $("#modalHeader").html("Error"),
        $("#infoAccordion").html("Error fetching the region data. Please try selecting a different country"),
        $("#infoModal").modal()
      })
  };


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
      $("#infoModal").modal()
    })

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
          const newPoi = L.circleMarker([poi.point.lat, poi.point.lon],
            {
              radius: 5,
              color: '#874831',
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
              const data = result['data'];
              const wikiLink = data.wikipedia;
              const image = data.preview.source;

              $("#poiModalHeader").html(data.name),
              $("#poiModalBody").html("<img src='" + image + "' alt='" + data.name + "'>" +
                  "</br>" + data.wikipedia_extracts.html +
                  "</br><button class='btn btn-warning'><a target='_blank' href='" + wikiLink + "'><em>More Info on Wikipedia</em></a></button</p>");
              $("#poiInfoModal").modal()


            }).fail(() => {
              $("#poiModalHeader").html("Error"),
                $("#poiModalBody").html("Error fetching the poi data. Please try selecting a different country"),
                $("#poiInfoModal").modal()
            })
            }
            )
        })
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



class Features {
  constructor(latitude, longitude, geonameId, name, population, type) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.geonameId = geonameId;
    this.name = name;
    this.population = population;
    this.type = type;
  }


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
        `<li>${dayOfWeek}</li><li>${day.weather[0].description
        }</li><li>Min Temp:&nbsp;${day.temp.min.toFixed()}&#8451;
        </li><li>Max Temp:&nbsp;${day.temp.max.toFixed()}&#8451;
        </li><li>Humidity:&nbsp;${day.humidity}%;</li>
        </li><li>Wind Speed:&nbsp;${Math.round(day.wind_speed * 2.237)}mph;</li>`
      );

      i++;
    });


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

  displayInfo() {
    this.getTime();
    $('#modalHeader').html(`${this.name}`);
    $('#modalInfo').html(
      `<li>Current Time: &nbsp; ${this.time}</li><li>Estimated Population: &nbsp; ${this.population}</li><li>Latitude: &nbsp; ${this.latitude}</li><li>Longitude: &nbsp; ${this.longitude}</li>`
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
    $('#modalHeader').html(`${this.name}`);
    $('#modalInfo').html(
      `<li>Current Time: &nbsp; ${this.time}</li><li>Estimated Population: &nbsp; ${this.population}</li>
      <li>Latitude: &nbsp; ${this.latitude}</li><li>Longitude: &nbsp; ${this.longitude}</li>`
    );
    $('#wikiInfo').removeClass('show');
    $('#forecastInfo').removeClass('show');
    $('#weatherInfo').removeClass('show');
    $('#generalInfo').addClass('show');
    $('#infoModal').modal();
  }
};



let userCoordinates = {};
const countryList = [];
let countryBorder;



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

const topoMap = L.tileLayer(
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
  Topographic: topoMap,
  Satellite: satellite,
  'Earth At Night': earthAtNight,
};

const weatherOverlays = {
  Temperature: temperature,
  Precipitation: precipitation,
  Clouds: clouds,

};

L.control.layers(baseMaps, weatherOverlays, { position: 'topright' }).addTo(map);



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
      c.area,
      c.flag,
      c.capital,
      c.population,
      c.currencies[0].name,
      c.currencies[0].symbol
    );

    activeCountry.displayInfo();
    activeCountry.getCities();
    activeCountry.getRegions();
    activeCountry.getBoundingBox();
  });
};

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
      const countryCode = result['properties']['ISO_A3'];

      if (countryBorder) {
        countryBorder.clearLayers();
      }
      countryBorder = L.geoJSON(result, {
        style: {
          color: '#ffc107'
          ,
        },
      }).addTo(map);
      map.fitBounds(countryBorder.getBounds());
      getCountryInfo(countryCode);

    })
    .fail(() => {
      console.log('Error in selectNewCountry');
    });
};

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
        $('#countrySearch').val(data.country);
        adjustSearchBarFont(data.country);
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


const handleSearchbarChange = (event, ui) => {
  const country = ui.item.value;
  adjustSearchBarFont(country);
  selectNewCountry(country, 'name');
};

const adjustSearchBarFont = (country) => {
  if (country.length > 25) {
    $('#countrySearch').css('font-size', '0.6em');
  } else if (country.length > 15) {
    $('#countrySearch').css('font-size', '1em');
  } else {
    $('#countrySearch').css('font-size', '1.3em');
  }
};


const getCountryFromClick = (event) => {
  const { lat, lng } = event.latlng;
  getCountryFromCoords(lat, lng);
};


$('#countrySearch').autocomplete({
  source: countryList,
  minLength: 0,
  select: handleSearchbarChange,
  position: { my: 'top', at: 'bottom', of: '#countrySearch' },
});


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

  marker.getWikiDetails();
  marker.getWeatherInfo();
};

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

$(document).ready(() => {
  jumpToUserLocation();

  removeLoader();

  getCountryList();

  $('#countrySearch').click(() => $('#countrySearch').val(''));

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
