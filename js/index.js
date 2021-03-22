const SPAN = { lat: 114, lon: 360 };
/*
    *  +lat => north
    *  -lat => south
    *  +lon => east
    *  -lon => west
*/
const LOCAL_STORAGE = new Object({ FEATURES: 'features' });
var layers = new Array();
var hashedFeatures = new Array();
const BOUNDERIES = { min: { lat: 57, lon: -180 }, max: { lat: -57, lon: 180 } };
(function (window) {
    window.addEventListener('load', function () {
        let map = initializeMap(); //show map
        loadFromLocalStorage(map);//load features from local storage;
        let control = initializeFileLoader(map);//show loader on map
        let resetControl = initializeResetLoader(map);
    });
}(window));

function loadFromLocalStorage(map) {
    hashedFeatures = localStorage.getObj(LOCAL_STORAGE.FEATURES) || new Array();
    let features = new Array();
    hashedFeatures.forEach(hashedFeature => {
        features.push(hashedFeature.feature);
    });
    if (features.length > 0) {
        var geoJsonLayer = L.geoJSON(features, {
            pointToLayer: function (geoJsonPoint, latlng) {
                return L.marker(latlng);
            },
            onEachFeature: onEachFeature
        }).addTo(map);
        layers.push(new Object({ layer: geoJsonLayer, name: LOCAL_STORAGE.FEATURES}));
        function onEachFeature(feature, layer) {//don't delete it or it will use leaflet.fileloader scope
            addPopup(feature, layer);
        }
    }
}

function initializeResetLoader(map){
    L.Control.ResetLayerLoad.LABEL = '<img class="icon" src="img/reset.svg" alt="reset icon"/>';
    let control = L.Control.resetLayerLoad({position: 'topright'}).addTo(map);
    return control;
}