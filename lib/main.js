var globalMap;

function createMap(){
	//create the map
    const map = L.map('map', {
            center: [38, -105],
            zoom: 4,
            minZoom: 4
    });
    globalMap = map;

    //add OSM base tilelayer
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            attribution: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL'
    }).addTo(map);

    //call getData function
    getData(map);
}

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/Colorado.geojson", {
          dataType: "json",
          success: function(response){
              //call function to create proportional symbols
              createPropSymbols(response, map);
        }
    });
}/*

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = .015;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
}
//function to create proportional symbols
function createPropSymbols(data, map){
    //create marker options

    var geojsonMarkerOptions = {
          radius: 5,
          fillColor: "#DAA520",
          color: "#FFFFFF",
          weight: .80,
          opacity: 1,
          fillOpacity: .60
		};

    let controlLayers = L.control.layers().addTo(map);

    for (let year=2012; year<=2018; year++){
        let attribute = "YR" + year;
    	//create a Leaflet GeoJSON layer and add it to the map
        let layer = L.geoJson(data, {
            pointToLayer: function (feature, latlng) {

                var attValue = Number(feature.properties[attribute]);

                geojsonMarkerOptions.radius = calcPropRadius(attValue);

                //create circle markers
                return L.circleMarker(latlng, geojsonMarkerOptions).bindPopup(feature.properties.COUNTY_NAM + "<br />" + year + " Housing Unit Totals: " + attValue);
            }
        }).addTo(map);

        controlLayers.addBaseLayer(layer, year);
    }

    //timeline();

}

function timeline(){
    let layers = $(".leaflet-control-layers-selector"),
        checkedIndex, triggered = false;
    layers.each(function(index, layer){
        if (triggered) return;
        if ($(layer).is(":checked")) checkedIndex = index;
        if (index === checkedIndex + 1){
            layer.click();
            $("h1").text(layer.nextElementSibling.textContent);
            triggered = true;
        }
    });
    if (!triggered){
        layers.eq(0).click();
        $("h1").text("2012");
    }
    setTimeout(timeline, 1000);
}*/

$(document).ready(createMap);
        </script>
    </head>
    <body>
        <div id="map"></div>
        <h1>Top 20 Fastest Growing Counties in the U.S. <br />
        2012 - 2018</h1>
    </body>
</html>
