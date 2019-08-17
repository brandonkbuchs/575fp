//establish global variables
var globalMap, globalOutput;
var attrArray = ['locIndex', 'geoid10', 'csaName', 'walkIndex'];
var expressed = attrArray[0];

//createMap builds the map, returns the variable globalMap, and establishes a constant, map
function createMap(){
	//create the map
    const map = L.map('map', {
            center: [39, -105],
            zoom: 7,
            minZoom: 4
    });
    globalMap = map;
    //add dark and light OSM base tilelayers
    //let controlLayers = L.control.layers().addTo(map);
    var light = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    }).addTo(map);
    //var dark  = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    //}).addTo(map);
    //var thunderforest = L.tileLayer.provider('Thunderforest.MobileAtlas', {apikey:'ecbac3fd50f64532877a7f89024930a9'}).addTo(map);
    //add selection menu for OSM tilelayers
    //controlLayers.addBaseLayer(light, "Light OSM Map tiles");
    //controlLayers.addBaseLayer(thunderforest, "Thunderforest Map tiles");
    


    //call getData function
    getData(map);
};

//getData loads the geoJSON data into a readable format
function getData(map){
  $.getJSON('data/Colorado.geojson', function(data){
    //L.geoJson function is used to parse JSON data and add to map
    //L.geoJson(data).addTo(map);
    console.log('geojson retrieved');
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
    
            var newChart = function(labels, locData, walkData) {
            var dataLength = labels ? labels.length : 0;
            //console.log('we\'re in newChart', labels, data);
            var backgroundColors = ['rgba(209, 129, 0, 0.9)',
                                    'rgba(23, 85, 255, 0.9)'];
            var colors = [];
            for (var i = 0; i < dataLength; i++) {
                colors.push(backgroundColors[i]);
            };
            //console.log('newChart colors', colors);
            var ctx = document.getElementById("myChart");
            var myChart = new Chart(ctx,{
                    type: 'bar',
                    data: {
                        //labels: ['Affordability | Walkability'],
                        datasets: [{
                            label: 'Affordability',
                            data: locData,
                            backgroundColor: 'rgba(209, 129, 0, 0.9)',
                            borderColor: "#999",
                            borderWidth: 1
                        },{
                            label: 'Walkability',
                            data: walkData,
                            backgroundColor: 'rgba(23, 85, 255, 0.9)',
                            borderColor: "#999",
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive:true,
                        tooltips:{enabled:false},
                        legend:{display:true},
                        title:{display:true,position:'top',text:"Values Per Census Block"},
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero:true
                                }
                            }]
                        }
                    }
                });
        };

            var info = L.control({position: 'bottomleft'});

            info.onAdd = function(map) {
                this._div = L.DomUtil.create('div', 'info');
                this.update();
                return this._div;
            };

            info.update = function(props) {
                if (props) {
                    {
                        var labels = ['Affordability', 'Walkability'];
                        var locData = [props.locIndex];
                        var walkData = [props.walkIndex];
                        //console.log('labels', labels, 'data', locData, walkData);
                        //responsive properties are removed if there will be a popup for polygons
                        /*var indices = '<b>geoID:  </b>' +  props.geoid10 + '<br />' + '<br />' + '<b>OID:  </b>' + props.oid + '<br />';*/
                        var indices = '';
                        indices += '<canvas id="myChart" width="175" height="250"></canvas>';
                        this._div.innerHTML = indices;
                        newChart(labels, locData, walkData);
                    }
                }
            };

            info.addTo(map);

            function getColor(b) {
                return b >= 0 & b < 100 ? '#85c4c9' :
                       b >= 100 & b < 200 ? '#4f90a6':
                       b >= 200 & b < 300 ? '#3b738f':
                       b >= 300 & b < 400 ? '#facba6':
                       b >= 400 & b < 500 ? '#f2855d' :
                       b > 500 ? '#eb4a40':
                                'grey' ;
            }

            function style(feature) {
                var overall = ((feature.properties.walkIndex)*(feature.properties.locIndex+1));
                return {
                    weight: 0.6,
                    opacity: 0.4,
                    color: 'white',
                    fillOpacity: 0.8,
                    //fillColor: getColor(overall)
                    fillColor: 'grey'
                };
            }


            function highlightFeature(e) {
                //console.log('highlightFeature was entered');
                var layer = e.target;

                layer.setStyle({
                    weight: 1.5,
                    color: 'black',
                    dashArray: '',
                    fillOpacity: 0.7
                });

                if (!L.Browser.ie && !L.Browser.opera) {
                    layer.bringToFront();
                }

                info.update(layer.feature.properties);
            }

            var geojson;

            function resetHighlight(e) {
                geojson.resetStyle(e.target);
                info.update();
            }

            function onEachFeature(feature, layer) {
                //console.log('onEachFeature was entered');
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight
                });
            }

            //legend commented out for now
            /*var legend = L.control({position: 'bottomright'});

            legend.onAdd = function (map) {

                var div = L.DomUtil.create('div', 'info legend'),
                    grades = [0, 100, 200, 300, 400, 500],
                    labels = ['<strong>Values</strong>'],
                    from, to;
                var x=1;
                var y=1;
                for (var i = 0; i < grades.length - 1; i++) {
                    from = grades[i];
                    to = grades[i + 1];
                    y++;

                    labels.push(
                        '<i style="background:' + getColor(x,x-0.25) + '"></i> ' + from + (' to ' + to)
                        );
                        x-=0.25;
                }

                div.innerHTML = labels.join('<br>');
                return div;
            };
            legend.addTo(map);*/
     
  d3.queue()
    .defer(d3.csv, 'data/Colorado.csv')
    .defer(d3.json, 'data/Colorado.geojson')
    .await(callback);

    function callback(error, csvData, colorado){
      console.log(csvData);
      console.log(colorado);
      console.log(error);

      //call the joinData function
      //var coloradoData = joinData(colorado, csvData);

      //set up hover events
      handleHover(csvData);
    };
  });
};

//create hover effect function and data acquisition from csv
function handleHover(data){
	document.querySelectorAll("svg path").forEach((path, index) => {
    	let row = data[index],
            locIndex = row.locIndex,
            walkIndex = row.walkIndex,
            geoid10 = row.geoid10;
      	path.setAttribute("data-locIndex", locIndex);
      	path.setAttribute("data-walkIndex", walkIndex);
      	path.setAttribute("data-geoid10", geoid10);
      	path.addEventListener("mouseenter", handleMouseenter);
      	path.addEventListener("mouseleave", handleMouseleave);
    });
}

//function for mouse entering particular path
function handleMouseenter(e){
	e.currentTarget.setAttribute("fill-opacity", "1");
  	let locIndex = e.currentTarget.getAttribute("data-locIndex"),
        walkIndex = e.currentTarget.getAttribute("data-walkIndex"),
        geoid10 = e.currentTarget.getAttribute("data-geoid10");
  	globalOutput.textContent = `Census Block: ${geoid10}, Location Index: ${locIndex}, Walk Index: ${walkIndex}`;
}
//function for mouse leaving particular path
function handleMouseleave(e){
	e.currentTarget.setAttribute("fill-opacity", "0.2");
}

//joinData takes the CSV file and the geojson and joins them together for evaluation (block of code 57-67 embeds data into geoJSON)
// function joinData(colorado, csvData){
//
//   //loop through csv to assign each set of csv attribute values to GeoJSON to match with colorado.geojson
//   for (var i=0; i<csvData.length; i++){
//     var csvCensus = csvData[i]; //current census information
//     var csvKey = csvCensus.oid; //csv primary key
//
//     //loop through colorado.geojson to find correct census block
//     for (var a=0; a<colorado.length; a++){
//       var geojsonProps = colorado[a].properties; //current census block properties
//       var geojsonKey = geojsonProps.oid //geojson primary key
//     }
//
//     //where primary keys match, transfer csv data to geojson properties object
//     if(geojsonKey==csvKey){
//       //assign all attributes and values
//       attrArray.forEach(function(attr){
//         var val = parseFloat(csvCensus[attr]); //get csv attribute value
//         geojsonProps[attr] = val;
//       });
//     };
//   };
// };

//createPopup creates a popup with the LAI, WI, and CB# displayed for the reader

//updateChart is an event listener function to redraw the chart upon a new click.

//when the page loads, AJAX & call createMap to render map tiles and data.
$(document).ready(init);
function init(){
  	globalOutput = document.querySelector("header output");
	createMap();
  	//create map home button
  	$("header button").on("click", function(){
    	globalMap.flyTo([39, -105], 7); //[lat, lng], zoom
    });
};