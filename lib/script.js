//establish global variables
var globalMap;

//createMap builds the map, returns the variable globalMap, and establishes a constant, map
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
};

//getData loads the geoJSON data into a readable format
function getData(map){
  $.getJSON('data/Colorado.geojson', function(data){
    //L.geoJson function is used to parse JSON data and add to map
    L.geoJson(data).addTo(map);  
  });
};

//joinData takes the CSV file and the geojson and joins them together for evaluation

//createPopup creates a popup with the LAI, WI, and CB# displayed for the reader

//setChart creates the chart data visualization

//updateChart is an event listener function to redraw the chart upon a new click.

//when the page loads, AJAX & call createMap to render map tiles and data.
$(document).ready(init);
function init(){
	createMap();
  	//create map home button
  	$("header button").on("click", function(){
    	globalMap.flyTo([38, -105], 5); //[lat, lng], zoom
    });
};

