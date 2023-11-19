const GRADES = [10, 30, 50, 70, 90];
const COLORS = ['#98ee00', '#d4ee00', '#eecc00', '#ee9c00', '#ea822c', '#ea2c2c']
const TECT_PLATES_URL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Base Layers and Map
let streetMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

let map = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3
});

// Part 2: Add tectonicPlates & earthquakes variable aka Overlay Datasets
let tectonicPlates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

let BaseMaps = {
    'Global Map': streetMap,
    'Topographical Map': topoMap
}

let overlays = {
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes
}

L.control.layers(BaseMaps, overlays, {
    collapsed: false
  }).addTo(map);

// Variables for Chart
function getColor(depth) {
    if(depth > GRADES[4]) {
        return COLORS[5]
    } else if (depth > GRADES[3]) {
        return COLORS[4]
    } else if ( depth > GRADES[2]) {
        return COLORS[3]
    } else if ( depth > GRADES[1]) {
        return COLORS[2]
    } else if ( depth > GRADES[0]) {
        return COLORS[1]
    }
    else {
        return COLORS[0]
    }
}

function getRadius(magnitude) {
    if(magnitude == 0) {
        return 1
    }
    return magnitude * 4
}

// Data Integrated into Visualization on Map and Legend
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
    console.log(data);
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.6
        }
    }

    L.geoJson(data, {
     pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
     },
     style: styleInfo,
     onEachFeature: function(feature, layer) {
         layer.bindPopup(`
             Magnitude: ${feature.properties.mag} <br>
             Depth: ${feature.geometry.coordinates[2]} <br>
             Location: ${feature.properties.place}
         `);
     }
    }).addTo(earthquakes);

    earthquakes.addTo(map);



    let legend = L.control({
     position: "bottomright"
    });

    legend.onAdd = function(){
        let container = L.DomUtil.create("div", "info legend");
        container.innerHTML = "";
        container.innerHTML += `<i style="background: ${COLORS[0]}">&emsp;</i> <${GRADES[0]}<br>`;
        for(let i = 0; i < GRADES.length - 1; i++) {
            container.innerHTML += `<i style="background: ${COLORS[i+1]}">&emsp;</i> ${GRADES[i]} - ${GRADES[i+1]}<br>`;
        }
        container.innerHTML += `<i style="background: ${COLORS[COLORS.length-1]}">&emsp;</i> >${GRADES[GRADES.length-1]}<br>`;
        return container;
    }

    legend.addTo(map);

    d3.json(TECT_PLATES_URL).then(function(plateData) {
        L.geoJson(plateData, {
            color: "orange",
            width: 3
        }).addTo(tectonicPlates);

        tectonicPlates.addTo(map);
    });

});
