var globalMap;
function createMap(){
	//create the map
    const map = L.map('map', {
            center: [37.8, -96],
            zoom: 5,
            minZoom: 4
    });
    globalMap = map;
    //add dark and light OSM base tilelayers
    let controlLayers = L.control.layers().addTo(map);
    var light = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    }).addTo(map);
    var dark  = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    }).addTo(map);
    var thunderforest = L.tileLayer.provider('Thunderforest.MobileAtlas', {apikey:'ecbac3fd50f64532877a7f89024930a9'}).addTo(map);
    //add selection menu for OSM tilelayers
    controlLayers.addBaseLayer(dark, "Dark OSM Map tiles");
    controlLayers.addBaseLayer(light, "Light OSM Map tiles");
    controlLayers.addBaseLayer(thunderforest, "Thunderforest Map tiles");
    //call getData function
    getData(map);

}

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/Top20Rank.geojson", {
          dataType: "json",
          success: function(response){
              //call function to create proportional symbols
              createPropSymbols(response, map);
      }
  });
}
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
          fillOpacity: .85
		};
    //add selection menu for years
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
}
$(document).ready(init);
function init(){
	createMap();
  	//create map home button
  	$("header button").on("click", function(){
    	globalMap.flyTo([37.8, -96], 5); //[lat, lng], zoom
    });
}