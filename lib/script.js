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
            minZoom: 6,
            zoomControl: false
    });

    var mapControlsContainer = document.getElementsByClassName('leaflet-control')[0];
    var logoContainer = document.getElementById('logoContainer');

    mapControlsContainer.appendChild(logoContainer);
    
    //add zoom control with your options
    const zoom = L.control.zoom({
             position:'topright'
        }).addTo(map);

    globalMap = map;
    //add dark and light OSM base tilelayers
    //let controlLayers = L.control.layers().addTo(map);
    var light = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    }).addTo(map);   
        //call getData function
        getData(map);
    };

//getData loads the geoJSON data into a readable format
function getData(map){
  $.getJSON('data/Colorado.geojson', function(data){

    //style each census tract with the appropriate color and outline properties
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    //default layer style for each census tract
    function style(feature) {
        return {
            weight: 0.6,
            opacity: 0.8,
            color: 'white',
            fillOpacity: getOpacity(feature.properties.walkIndex),
            fillColor: getColor(feature.properties.locIndex)
        };
    };
    
    //choropleth color map based on locIndex (reversed to accurately portray affordability)
    function getColor(b){
        return 100 - b >=0.0 & 100 - b <= 12.0 ? '#08589E':
               100 - b >=12.01 & 100 - b <=25.00 ? '#2B8CBE':
               100 - b >=25.01 & 100 - b <=41.00 ? '#4EB3D3':
               100 - b >=41.01 & 100 - b <=100.0 ? '#7BCCC4':
               '#A8DDB5';               
    
    };
    
    //opacity is determined on walkIndex with greater walkability being more opaque
    function getOpacity(o){
        return o >= 0.0 & o <=5.0 ?  0.3:
               o >= 5.1 & o <= 10.0 ? 0.5:
               o >= 10.01 & o <= 15.0 ? 0.7:
               o >= 15.01 & o <= 100 ? 0.9:
               0.5;   
    };

    //iterate through each feature in the geoJSON
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    };
    
    //set the highlight on the map
    function highlightFeature(e) {


        var layer = e.target;
        layer.setStyle({fillOpacity: 1.0});

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        };

        info.update(layer.feature.properties);
    };

    function resetHighlight(e) {
        geojson.setStyle(style);

        info.update();
    };
    
    //build chart for the map
    var newChart = function(labels, locData, walkData,blockID) {
    var dataLength = labels ? labels.length : 0;
    var backgroundColors = ['#08589E',
                            '#7BCCC4'];
    var colors = [];
    for (var i = 0; i < dataLength; i++) {
        colors.push(backgroundColors[i]);
    };
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx,{
            type: 'bar',
            data: {
                //labels: ['Affordability | Walkability'],
                datasets: [{
                    label: 'Affordability: ' + (Number(locData).toFixed(0)),
                    data: locData,
                    backgroundColor: backgroundColors[0],
                    borderColor: "#999",
                    borderWidth: 1
                },{
                    label: 'Walkability: ' + walkData,
                    data: walkData,
                    backgroundColor: backgroundColors[1],
                    borderColor: "#999",
                    borderWidth: 1
                }]
            },
        //set chart options
            options: {
                responsive:true,
                tooltips:{enabled:false},
                legend:{display:true},
                title:{display:true,position:'top',text:["Values for Census Block",blockID]},
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
    //set graph to bottom left of L.map div
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
                var locData = [100 - props.locIndex];                
                var walkData = [props.walkIndex];
                var blockID = [props.geoid10];
                var indices = '';
                indices += '<canvas id="myChart" width="175" height="250"></canvas>';
                this._div.innerHTML = indices;
                newChart(labels, locData, walkData,blockID);
            }
        }
    };

    info.addTo(map);

   d3.queue()
    .defer(d3.csv, 'data/Colorado.csv')
    .defer(d3.json, 'data/Colorado.geojson')
    .await(callback);

    function callback(error, csvData, colorado){

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
    });
};

    createMap();
  	//create map home button
  	$("header button").on("click", function(){
    	globalMap.flyTo([39, -105], 7); //[lat, lng], zoom
    });
