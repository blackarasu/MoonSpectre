const LOCAL_STORAGE = new Object({ FEATURES: 'features' });
var layers = new Array();
var hashedFeatures = new Array();
(function (window) {
    window.addEventListener('load', function () {
        let map = initializeMap(); //show map
        loadFromLocalStorage(map);//load features from local storage;
        let saveControl = initializeSaveLoader(map);//show save loader on map
        let fileControl = initializeFileLoader(map);//show file loader on map
        let addControl = initializeAddLoader(map);//show add feature on map
        let resetControl = initializeResetLoader(map);//show reset loader on map
    });
}(window));

function loadFromLocalStorage(map) {
    hashedFeatures = localStorage.getObj(LOCAL_STORAGE.FEATURES) || new Array();
    let features = extractFeatures(hashedFeatures);
    if (features.length > 0) {
        addFeaturesToMap(features, map, LOCAL_STORAGE.FEATURES);
    }
}

function addFeaturesToMap(features, map, layerName) {
    var geoJsonLayer = L.geoJSON(features, {
        pointToLayer: function (_geoJsonPoint, latlng) {
            return L.marker(latlng);
        },
        onEachFeature: onEachFeature
    }).addTo(map);
    layers.push(new Object({ layer: geoJsonLayer, name: layerName }));
    function onEachFeature(feature, layer) {
        addPopup(feature, layer);
    }
}

function extractFeatures(hashedFeatures) {
    let features = new Array();
    hashedFeatures.forEach(hashedFeature => {
        features.push(hashedFeature.feature);
    });
    return features;
}

function reset() {
    clearLocalStorage();
    clearMap();
}

function initializeSaveLoader(map) {
    L.Control.ButtonLayerLoad.LABEL = '<img class="icon" src="img/save.svg" alt="save icon"/>';
    L.Control.ButtonLayerLoad.TITLE = "Save markers to a geojson file.";
    let control = L.Control.buttonLayerLoad(new Object({
        position: 'topleft',
        func: function () {
            let features = extractFeatures(hashedFeatures);
            if (features !== new Array() && features.length > 0) {
                var file = new File([JSON.stringify(features)],
                    "map.geojson", { type: "application/json;charset=utf-8" });
                saveAs(file);
            }
            else {
                alert("There's nothing to write");
            }
        }
    })).addTo(map);
    return control;
}

function initializeAddLoader(map) {
    L.Control.ButtonLayerLoad.LABEL = '<img class="icon" data-toggle="modal" data-target="#addFeatureModal" src="img/add.svg" alt="add icon"/>';
    L.Control.ButtonLayerLoad.TITLE = "Add a feature to a map menu.";
    let control = L.Control.buttonLayerLoad(new Object({
        position: 'topright'
    })).addTo(map);
    return control;
}

function initializeResetLoader(map) {
    L.Control.ButtonLayerLoad.LABEL = '<img class="icon" src="img/reset.svg" alt="reset icon"/>';
    L.Control.ButtonLayerLoad.TITLE = "Clean a map";
    let control = L.Control.buttonLayerLoad(new Object({
        position: 'topright',
        func: function () { reset(); }
    })).addTo(map);
    return control;
}