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

function addFeaturesToMap(features, map, layerName) {
    var geoJsonLayer = L.geoJSON(features, {
        pointToLayer: function (_geoJsonPoint, latlng) {
            return chooseGeometry(latlng, _geoJsonPoint);
        },
        onEachFeature: function (feature, layer) {
            onEachFeature(feature, layer, map);
        }
    }).addTo(map);
    cleanMarkersWithoutPopup(geoJsonLayer);
    if (Object.entries(geoJsonLayer._layers).length > 0) {
        layers.push(new Object({ layer: geoJsonLayer, name: layerName }));
        return [true, geoJsonLayer];
    }
    else {
        return false;
    }
}

function extractFeatures(hashedFeatures) {
    let features = new Array();
    hashedFeatures.forEach(hashedFeature => {
        features.push(hashedFeature.feature);
    });
    return features;
}

function initializeAddLoader(map) {
    L.Control.ButtonLayerLoad.LABEL = '<img class="icon" data-toggle="modal" data-target="#addFeatureModal" src="img/add.svg" alt="add icon"/>';
    L.Control.ButtonLayerLoad.TITLE = "Add a feature to a map menu.";
    let control = L.Control.buttonLayerLoad(new Object({
        position: 'topright',
        func: function () {
            let modal = $(`#addFeatureModal`);
            let button = $('#addFeatureButton');
            button.click(function () {
                onClickAddButton(modal, button);
            });
            resetStatesOnCloseModal(modal, button);
        }
    })).addTo(map);
    return control;

    function onClickAddButton(modal, button) {
        restoreInputs(modal);
        let newFeature = getModalFields(modal, true);
        if (isFeatureValid(newFeature)) {
            [isAdded, geoJsonLayer] = addFeaturesToMap(newFeature, map, "User")
            if (isAdded) {
                localStorage.setObj(LOCAL_STORAGE.FEATURES, hashedFeatures);
                modal.modal('hide');
                button.prop("onclick", null).off("click");
                restoreState(modal);
                map.fitBounds(geoJsonLayer.getBounds());
            }
            else {
                let element = modal.find('.alert-danger');
                printMessage(element, "Features have to be distinguished in whole scope. Please change name or other field that can be optional.");
            }
        }
        else {
            let element = modal.find('.alert-danger');
            printMessage(element, "Something went wrong! Please check if coordinates are correct and Name field is not empty.");
        }

        function restoreInputs(modal) {
            restoreInput(modal.find('longitude'));
            restoreInput(modal.find('latitude'));
            restoreInput(modal.find('name'));
        }
    }
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

function loadFromLocalStorage(map) {
    let features = localStorage.getObj(LOCAL_STORAGE.FEATURES) || new Array();
    features = extractFeatures(features);
    if (features.length > 0) {
        addFeaturesToMap(features, map, LOCAL_STORAGE.FEATURES);
    }
}

function reset() {
    clearLocalStorage();
    clearMap();
}