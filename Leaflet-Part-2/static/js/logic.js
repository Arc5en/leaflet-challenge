// Basic Map
let baseMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data: &copy;"
});

let map = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3
});

baseMap.addTo(map);

// Fiord Color Base Map
// let secondMap = L.tileLayer(
//     "url", {
//         attribution: "Map data: &copy;"
//     });

// Part 2: Add tectonicPlates & earthquakes variable
let tectonicPlates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

let BaseMaps = {
    'Global Map': baseMap
    // 'Second Map': secondMap
    // Remember to add a comma after "baseMap"
}

let overlays = {
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes
}

L.control.layers(BaseMaps, overlays).addTo(map);

// Variables for Chart
function getColor(depth) {
    if(depth > 90) {
        return "#ea2c2c"
    } else if (depth > 70) {
        return "#ea822c"
    } else if ( depth > 50) {
        return "#ee9c00"
    } else if ( depth > 30) {
        return "#eecc00"
    } else if ( depth > 10) {
        return "#d4ee00"
    }
    else {
        return "#98ee00"
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
     let grades = [-10, 10, 30, 50, 70, 90];
     let colors = ['#98ee00', '#d4ee00', '#eecc00', '#ee9c00', '#ea822c', '#ea2c2c']
     for(let i = 0; i < grades.length; i++) {
        container.innerHTML += `<i style="background: ${colors[i]}"></i> ${grades[i]}+ <br>`
     }
     return container;
    }

    legend.addTo(map);

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData) {
        L.geoJson(plateData, {
            color: "orange",
            width: 3
        }).addTo(tectonicPlates);

        tectonicPlates.addTo(map);
    });

});
