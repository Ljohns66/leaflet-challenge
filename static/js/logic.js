API_KEY ='AIzaSyD3TFEYAvm5ZlPdf7difrQmO4qwiZ2q_AI'

// add overlay layers
let plateLayer = new L.layerGroup();
let earthquakeLayer = new L.layerGroup();

// creating lists
let overlays = {
    Earthquakes: earthquakeLayer,
    "Tectonic Plates": plateLayer
}

// geojson layers for the map background 
let geoLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors'
})

let satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});
 
let topo = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 1,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

// base layers
let baseLayers = {
    Street: geoLayer, 
    Topo: satelliteLayer  
} 

// Creating the map object
let myMap = L.map("map", {
      center: [39.09, -106.71],
  zoom: 5.5,
    // display on load
    layers: [geoLayer, earthquakeLayer]
});

// layer control
L.control.layers(baseLayers, overlays, {
    collapsed: false
  }).addTo(myMap);

// colors for the circles and legend based on depth
function setColor(depth) {
    return depth >= 90 ? "#FF0D0D" :
        depth < 90 && depth >= 70 ? "#FF4E11" :
        depth < 70 && depth >= 50 ? "#FF8E15" :
        depth < 50 && depth >= 30 ? "#FFB92E" :
        depth < 30 && depth >= 10 ? "#ACB334" :
                                    "#69B34C";
}

// drawing the circles
function drawCircle(point, latlng) {
    let mag = point.properties.mag;
    let depth = point.geometry.coordinates[2];
    return L.circle(latlng, {
            fillOpacity: 0.5,
            color: setColor(depth),
            fillColor: setColor(depth),
            // Circle size directly 
            radius: mag * 20000
    })
}

// popup set up
function bindPopUp(feature, layer) {
    layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
}

// GeoJSON data
let url = " https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Getting the GeoJSON data
d3.json(url).then((data) => {
    let features = data.features;

    // creating a GeoJSON layer with the retrieved data
    L.geoJSON(features, {
        pointToLayer: drawCircle,
        onEachFeature: bindPopUp
    }).addTo(earthquakeLayer);

    // setting up the legend
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = () => {
        let div = L.DomUtil.create('div', 'info legend');
        grades = [0, 10, 30, 50, 70, 90];

        // looping through our intervals and generating a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + setColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
})


// gets the tectonic plate boundaries data
let tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(tectonicURL).then((tectData) => {
    L.geoJSON(tectData, {
        color: "rgb(255, 94, 0)",
        weight: 2
    }).addTo(plateLayer);

    plateLayer.addTo(myMap);
})
