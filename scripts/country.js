/* //Initialise the layer groups to be populated with markers
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
    )};
 */


/*   getPois(north, south, east, west) {
    
    poiLayer.clearLayers(),
      $.ajax({
        url: "php/poiInfo.php",
        dataType: "json",
        type: "POST",
        data: {
          west: west,
          east: east,
          south: south,
          north: north,
          kind: $('#poiSel').val(),
        },

      }).done(result => {
        result.data.forEach(poi => {
          const lat = poi.point.lat;
          const lng = poi.point.lon;
          const newPoi = L.circleMarker([lat, lng], {
            radius: 2,
            color: '#031233'

          }).addTo(poiLayer);

          const wikiLink = 'http://www.wikidata.org/wiki/' + poi.wikidata;

          let popupContent = "<p><b>Name: </b>" + poi.name +
            "<br><a target='_blank' href='" + wikiLink + "'><em>More Info</em></a></p>";

          newPoi.bindPopup(popupContent);
        })
      }).fail(() => {
        $("#modalTitle").html("Error"),
          $("#modalBody").html("Unfortunately there was an error fetching the poi data. Please try selecting a different country"),
          $("#infoModal").modal()
      })
  };
 
}*/



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
      })
        .done(result => {

          result.data.forEach(poi => {
            const lat = poi.point.lat;
            const lng = poi.point.lon;
            const newPoi = L.circleMarker([lat, lng], {
              radius: 6,
              color: '#031233'
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
                const height = data.preview.height;
                const width = data.preview.width;
          
                const poiPopup = L.popup({
                  minWidth: width,
                  maxHeight: height + 20,
                  keepInView: true,
                  className: poiPopup,
                })
                const popupContent = 
                "<p id='popupContent'><b>Name: " + data.name +
                  "</br><img src='" + image + "' alt='" + data.name +"' style='width:"+width+"vmin;height:"+height+"vmi;'>" +
                  "</br>" + data.wikipedia_extracts.html +
                  "</br><a target='_blank' href='" + wikiLink + "'><em>More Info on Wikipedia</em></a></p>";

                newPoi.bindPopup(popupContent).openPopup;
              })
            });

            }).fail(() => {
              $("#modalTitle").html("Error"),
                $("#modalBody").html("Unfortunately there was an error fetching the poi data. Please try selecting a different country"),
                $("#infoModal").modal()
             })
            }).fail(() => {
                $("#modalTitle").html("Error"),
                  $("#modalBody").html("Unfortunately there was an error fetching the poi data. Please try selecting a different country"),
                  $("#infoModal").modal()
               })
            }
          

          

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

  

  displayInfo() {
    $("#flag").attr("src", this.flag),
    $("#area").html(` ${this.area}`),
    $("#capital").html(` ${this.capital}`),
    $("#currency").html(` ${this.currency} (${this.currencySymbol})`),
    $("#population").html(` ${this.population}`)
}

};


