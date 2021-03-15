const SPAN = { lat: 114, lon: 360 };
/*
    *  +lat => north
    *  -lat => south
    *  +lon => east
    *  -lon => west
*/
var layers = new Array();
var features = new Array();
const BOUNDERIES = { min: { lat: 57, lon: -180 }, max: { lat: -57, lon: 180 } };
(function (window) {
    window.addEventListener('load', function () {
        let map = initializeMap(); //show map
        let control = initializeLoader(map);//show loader on map
    });
}(window));

function initializeLoader(map) {
    L.Control.FileLayerLoad.LABEL = '<img class="icon" src="img/folder.svg" alt="file icon"/>';
    let control = L.Control.fileLayerLoad({
        fitBounds: false,
        layerOptions: {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng);;
            },
            onEachFeature: onEachFeature
        }
    }).addTo(map);
    control.loader.on('data:loaded', function (event) {
        for (const key in event.layer._layers) {
            if (event.layer._layers[`${key}`]._popupHandlersAdded == undefined) {//remove layer which doesnt have a popup
                event.layer._layers[`${key}`].removeFrom(event.layer);
            }
        }
        if (Object.entries(event.layer._layers).length > 0) {
            layers.push(new Object({ layer: event.layer, name: event.filename }));
            map.fitBounds(event.layer.getBounds());
        }
        else {
            event.layer.removeFrom(map);//no markers has been added to a layer so the layer is useless
        }
    });
    control.loader.on('data:error', function (error) {
        console.error(`${error.error.fileName}:${error.error.lineNumber} - ${error.error.message} - Please send an error message and scrreenshot to the developer via link in the footer.`);
    });
    return control;
}

function generateHash(feature) {
    let prop = feature.properties;
    let hash = `${prop.terrainType.toString().toLowerCase()} 
                ${prop.name.toString().toLowerCase()} 
                ${prop["name origin"].toString().toLowerCase()} 
                ${prop.height.toString().toLowerCase()} 
                ${prop.diameter.toString().toLowerCase()}`;
    return hash.hashCode();
}

function addToFeatures(feature) {//returns true if feature was added succesfully otherwise function returns false
    let hash = generateHash(feature);
    for (let i = 0; i < features.length; i++) {
        if (features[i].hash == hash) {
            return [false, hash];
        }
    }
    features.push(new Object({ feature: feature, hash: hash }));
    return [true, hash];
}

function onEachFeature(feature, layer) {
    let [isAdded] = addToFeatures(feature);
    if (isAdded == true) {
        let prop = feature.properties;
        if (prop && prop.name && prop.diameter && prop.height && prop["name origin"] && prop.terrainType) {
            layer.bindPopup(`[${feature.geometry.coordinates.toString()}]</br>
                            ${prop.terrainType} 
                            ${prop.name}</br>${prop["name origin"]}.</br>Height: 
                            ${prop.height}</br>Diameter: ${prop.diameter}`);
        }
    }
}

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
    features = new Array();
}

function clearLocalStorage() {
    localStorage.clear();
}

function reset() {
    clearLocalStorage();
    clearMap();
}