class Country {
  constructor(name, alpha2Code, area, flag, capital, population, currency, currencySymbol) {
      this.name = name, 
      this.alpha2Code = alpha2Code, 
      this.area = area || "Not Found", this.flag = flag, 
      this.capital = capital || "Not Found", 
      this.population = population || "Not Found", 
      this.currency = currency || "Not Found", 
      this.currencySymbol = currencySymbol || ""
  } getCities() {
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
                  icon: " fa-location-arrow",
                  markerColor: "#BBDEF0",
                  shape: "square",
                  svg: !0,
                  prefix: "fa"
              }),
                  capitalMarker = L.ExtraMarkers.icon({
                      icon: " fa-location-arrow",
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

  getAirports() {
      airportLayer.clearLayers(),
          airportMarkers.clearLayers(airportLayer),
          $.ajax({
              url: "php/getAirports.php",
              dataType: "json",
              type: "POST",
              data: {
                  countryCode: this.alpha2Code
              }
          }).done(result => {
              const marker = L.ExtraMarkers.icon({
                  icon: "fa-binoculars",
                  markerColor: "#AFD5AA",
                  shape: "penta",
                  svg: !0,
                  prefix: "fa"
              });
              result.data.forEach(airport => {
                  const newMarker = L.marker([airport.lat, airport.lng], {
                      icon: marker,
                      name: airport.name,
                      latitude: airport.lat,
                      longitude: airport.lng,
                      type: "airport",
                      geonameId: airport.geonameId
                  }).addTo(airportLayer);
                  newMarker.on("click", infoPopup)
              }),
                  airportMarkers.addLayer(airportLayer)
          }).fail(() => {
              $("#modalTitle").html("Error"),
                  $("#modalBody").html("Unfortunately there was an error fetching the airport data. Please try selecting a different country"),
                  $("#infoModal").modal()
          })
  }

  getEarthquakes(north, south, east, west) {
      earthquakeLayer.clearLayers(),
          $.ajax({
              url: "php/getEarthquakes.php",
              dataType: "json",
              type: "POST",
              data: { north: north, south: south, east: east, west: west }
          }).done(result => {
              result.data.forEach(quake => {
                  const newQuake = L.circle([quake.lat, quake.lng], {
                      color: "#dc3545",
                      fillColor: "#9C1C28",
                      fillOpacity: .5,
                      radius: 500 * Math.pow(quake.magnitude, 3)
                  }).addTo(earthquakeLayer);
                  newQuake.bindPopup(`Magnitude: ${quake.magnitude} <br> Date: ${quake.datetime}`)
              })
          }).fail(() => {
              $("#modalTitle").html("Error"),
                  $("#modalBody").html("Unfortunately there was an error fetching the earthquake data. Please try selecting a different country"),
                  $("#infoModal").modal()
          })
  }

  getBoundingBox() {
      $.ajax({
          url: "php/getBoundingBox.php",
          dataType: "json",
          type: "POST",
          data: {
              countryCode: this.alpha2Code
            }
      }).done(result => {
          const { north: north, south: south, east: east, west: west } = result.data[0];
          this.getEarthquakes(north, south, east, west)
      }).fail(() => {
          $("#modalTitle").html("Error"),
              $("#modalBody").html("Unfortunately there was an error fetching the earthquake data. Please try selecting a different country"),
              $("#infoModal").modal()
      })
  }

  getCovdiData(){
    $.ajax({
      url: 'php/getCovidData.php',
      dataType: 'json',
      type: 'POST',
      data: {
        countryCode: this.countryCode,
      },
    }).done((result) => {
      const covidData = result.data;
      
      const covidPopup = new L.popup(
        covidData.confirmed,
        covidData.recovered,
        covidData.critical,
        covidData.deaths,
        covidData.lastUpdate);

    
    }
    )}

  
  

   
  

  displayInfo() {
          $("#flag").attr("src", this.flag),
          $("#area").html(` ${this.area}`),
          $("#capital").html(` ${this.capital}`),
          $("#currency").html(` ${this.currency} (${this.currencySymbol})`),
          $("#population").html(` ${this.population}`)
  }



  }
