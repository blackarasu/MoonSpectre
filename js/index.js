$(document).ready(function () {
    let map = initializeMap(); //show map
    let control = initializeLoader(map);//show loader on map
});
function initializeLoader(map) {
    L.Control.FileLayerLoad.LABEL = '<img class="icon" src="svg/folder.svg" alt="file icon"/>';
    control = L.Control.fileLayerLoad({
        fitBounds: true,
        layerOptions: {
            pointToLayer: function (data, latlng) {
                return L.marker(latlng);
            },
            onEachFeature: onEachFeature
        }
    });
    control.addTo(map);
    return control;
}

function initializeMap() {
    const SPAN = { lat: 114, lon: 360 };
    /*
     *  +lat => north
     *  -lat => south
     *  +lon => east
     *  -lon => west
    */
    const BOUNDERIES = { min: { lat: 57, lon: -180 }, max: { lat: -57, lon: 180 } };
    let bounds = L.latLngBounds([[BOUNDERIES.min.lat, BOUNDERIES.min.lon], [BOUNDERIES.max.lat, BOUNDERIES.max.lon]]); //set bounds for imageOverlay
    const imageUrl = "res/image--000.png";
    let map = L.map('map', {
        maxBounds: bounds,
        maxBoundsViscosity: 2 / 3,
        wheelPxPerZoomLevel: 80,
        crs: L.CRS.Simple,
        center: [SPAN.lat / 2, SPAN.lon / 2],
        zoom: 3,
        zoomSnap: 0,
        zoomDelta: 0.25,
        minZoom: 2,
        maxZoom: 5
    });
    L.imageOverlay(imageUrl, bounds).addTo(map);
    map.fitBounds(bounds);
    return map;
}
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.name && feature.properties.diameter && feature.properties.height && feature.properties["name origin"] && feature.properties.terrainType) {
        let prop = feature.properties;
        layer.bindPopup(`${prop.terrainType} ${prop.name}</br>${prop["name origin"]}.</br>Height: ${prop.height}</br>Diameter: ${prop.diameter}`);
    }
}

