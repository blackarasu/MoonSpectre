const SPAN = { lat: 114, lon: 360 };
const BOUNDERIES = { min: { lat: 57, lon: -180 }, max: { lat: -57, lon: 180 } };

function initializeMap() {
    let bounds = L.latLngBounds([[BOUNDERIES.min.lat, BOUNDERIES.min.lon], [BOUNDERIES.max.lat, BOUNDERIES.max.lon]]); //set bounds for imageOverlay
    const IMAGE_URL = "img/image--000.png";
    let map = L.map('map', {
        maxBounds: bounds,
        maxBoundsViscosity: 2/3,
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
        marker.bindPopup(`${convertLatLongToEastWestSouthNorth(feature.geometry.coordinates).toString().replace(',',' ')}</br>
                            ${prop.terrainType} 
                            ${prop.name}</br>${prop["name origin"]}.</br>Height: 
                            ${prop.height}</br>Diameter: ${prop.diameter}`);
    }
}

/*
    *  +lat => north
    *  -lat => south
    *  +lon => east
    *  -lon => west
*/
function convertLatLongToEastWestSouthNorth(coordinates){
    let ewsn = new Array();
    ewsn[0] = coordinates[0] < 0 ? (coordinates[0]*(-1)).toString() +'&#176;W' : coordinates[0].toString() +'&#176;E';
    ewsn[1] = coordinates[1] < 0 ? (coordinates[1]*(-1)).toString() +'&#176;S' : coordinates[1].toString() +'&#176;N';
    return ewsn;
}

function convertEastWestSouthNorthToLatLong(coordinates){
    let latLong = new Array();
    latLong[0] = coordinates[0].toString().toLowerCase().includes("w") == true ? parseFloat(coordinates[0])*(-1) : parseFloat(coordinates[0]);
    latLong[1] = coordinates[1].toString().toLowerCase().includes("s") == true ? parseFloat(coordinates[1])*(-1) : parseFloat(coordinates[1]);
    return latLong;
}
