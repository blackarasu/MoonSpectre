function initializeMap() {
    let bounds = L.latLngBounds([[BOUNDERIES.min.lat, BOUNDERIES.min.lon], [BOUNDERIES.max.lat, BOUNDERIES.max.lon]]); //set bounds for imageOverlay
    const IMAGE_URL = "img/image--000.png";
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
        maxZoom: 6
    });
    L.imageOverlay(IMAGE_URL, bounds).addTo(map);
    map.fitBounds(bounds);
    return map;
}

function clearMap() {
    layers.forEach(layer => {
        layer.layer.remove();
    });
    layers = new Array();
    hashedFeatures = new Array();
}

function addPopup(feature, marker) {
    let prop = feature.properties;
    if (prop && prop.name && prop.diameter && prop.height && prop["name origin"] && prop.terrainType) {
        marker.bindPopup(`[${feature.geometry.coordinates.toString()}]</br>
                            ${prop.terrainType} 
                            ${prop.name}</br>${prop["name origin"]}.</br>Height: 
                            ${prop.height}</br>Diameter: ${prop.diameter}`);
    }
}