var icon = new L.Icon({
    iconUrl: 'img/icon/icon.png',
    shadowUrl: 'img/icon/shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function initializeFileLoader(map) {
    L.Control.FileLayerLoad.LABEL = '<img class="icon" src="img/folder.svg" alt="file icon"/>';
    let control = L.Control.fileLayerLoad(new Object({
        fitBounds: false, // so you can remove layer without worrying errors from leafletjs
        layerOptions: {
            pointToLayer: function (geoJsonPoint, latlng) {
                return L.marker(latlng, new Object({ icon: icon }));
            },
            onEachFeature: function (feature, layer) {
                onEachFeature(feature, layer, map);
            }
        }
    })).addTo(map);
    control.loader.on('data:loaded', function (event) {
        cleanMarkersWithoutPopup(event.layer);
        if (Object.entries(event.layer._layers).length > 0) {
            map.fitBounds(event.layer.getBounds());
            layers.push(new Object({ layer: event.layer, name: event.filename }));
            localStorage.setObj(LOCAL_STORAGE.FEATURES, hashedFeatures);
        }
        else {
            event.layer.removeFrom(map);//no markers has been added to a layer so the layer is useless
        }
    });
    control.loader.on('data:error', function (error) {
        criticalError(
            `<p>>If you see this error me probably made an oopsie in code again.</br>
                <span>Please send an error message and scrreenshot to the developer via link in the footer and describe what you have done that the error appeared.</br> ${error.error.fileName}:${error.error.lineNumber} - ${error.error.message}</span>
            </p>`
        );
    });
    return control;
}

function addToFeatures(feature) {//returns true if feature was added succesfully otherwise function returns false
    let hash = generateHash(feature);
    for (let i = 0; i < hashedFeatures.length; i++) {
        if (hashedFeatures[i].hash == hash) {
            return [false, hash];
        }
    }
    hashedFeatures.push(new Object({ feature: feature, hash: hash }));
    return [true, hash];
}

function cleanMarkersWithoutPopup(layer) {
    for (const key in layer._layers) {
        if (layer._layers[`${key}`]._popupHandlersAdded == undefined) { //remove layer which doesnt have a popup
            layer._layers[`${key}`].removeFrom(layer);
        }
    }
}

function criticalError(message) {
    let errorsContainer = $('#main-errors-container');
    let collapseContainer = errorsContainer.find('.collapse-error');
    collapseContainer.append(
        `<div class="card card-body">
                ${message}
            </div>`
    );
    errorsContainer.addClass('show');
}

function onEachFeature(feature, layer, map) {
    let [isAdded] = addToFeatures(feature);
    if (isAdded == true) {
        addPopup(feature, layer, map);
    }
}
