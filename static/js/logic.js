// Init function
async function init() {
    const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
    const response = await d3.json(queryUrl);
    createFeatures(response.features);
}

init();

// Create map function
function createMap(earthquakes) {

    // Define variables lightmap tile layer
    const light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    // Define variables for dark map tile layer
    const dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Only one base layer can be shown at a time
    const baseMaps = {
        Light: light,
        Dark: dark
    };

    // Overlays that may be toggled on or off
    const overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create map object and set default layers
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 2,
        layers: [light, earthquakes]
    });

    // Pass our map layers into our layer control
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    const legend = createLegend()
    legend.addTo(myMap);
}

// Color function based on magnitude values
function chooseColor(magnitude) {
    if (magnitude >= 5) return '#f54542';
    else if (magnitude >= 4) return '#f56942';
    else if (magnitude >= 3) return '#f59e42';
    else if (magnitude >= 2) return '#f5c542';
    else if (magnitude >= 1) return '#bcf542';
    else return '#72f542';
}

// Create map features
function createFeatures(earthquakeData) {
    // Tooltips showing place, magnitude, and time
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3>Magnitude: <b>" + feature.properties.mag +
            "</b><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Creating a geoJSON layer with the retrieved data and create cirle markers
    const earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: feature.properties.mag * 3,
                fillColor: chooseColor(feature.properties.mag),
                fillOpacity: 0.75,
                weight: 1.5,
                color: "black"
            });
        },
        onEachFeature: onEachFeature
    });
    // Sending earthquakes layer to the createMap function
    createMap(earthquakes);
}

// Create legend function
function createLegend() {
    // Create a legend to define magnitude colors
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create('div', 'info legend');
        labels = [];
        mag_categories = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'];
        mag_categories_color = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];
        var legendInfo = '<strong>Magnitude</strong>'
        div.innerHTML = legendInfo;
        labels = mag_categories.map((val, index) => {
            return "<li style=\"background-color: " + chooseColor(mag_categories_color[index]) +
                "\"> " + val + " </li>"
        })
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };
    return legend;
}