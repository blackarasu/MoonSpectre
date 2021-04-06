var icon = new Object({
    blackIcon: new L.Icon({
        iconUrl: 'img/icon/black-icon.png',
        shadowUrl: 'img/icon/shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    blueIcon: new L.Icon({
        iconUrl: 'img/icon/blue-icon.png',
        shadowUrl: 'img/icon/shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    greenIcon: new L.Icon({
        iconUrl: 'img/icon/green-icon.png',
        shadowUrl: 'img/icon/shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }),
    violetIcon: new L.Icon({
        iconUrl: 'img/icon/violet-icon.png',
        shadowUrl: 'img/icon/shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    })
});

function initializeFileLoader(map) {
    L.Control.FileLayerLoad.LABEL = '<img class="icon" src="img/folder.svg" alt="file icon"/>';
    let control = L.Control.fileLayerLoad(new Object({
        fitBounds: false, // so you can remove layer without worrying errors from leafletjs
        layerOptions: {
            pointToLayer: function (_geoJsonPoint, latlng) {
                return chooseGeometry(latlng, _geoJsonPoint);
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

function chooseGeometry(latlng, geoJsonPoint) {
    switch (geoJsonPoint.properties.pointType) {
        case 'Point':
            return new L.marker(latlng, new Object({
                alt: geoJsonPoint.properties.name || '',
                icon: chooseIcon(geoJsonPoint.properties.terrainType || ""),
                riseOnHover: true,
                title: geoJsonPoint.properties.name || '',
                zIndexOffset: 1000,
            }));
        case 'Label':
            return new L.Marker(latlng, new Object({
                icon: L.divIcon({
                    className: 'label',
                    html: `<div class="center-label text-labels">${geoJsonPoint.properties.name || ''}</div>`
                }),
                riseOnHover: true,
                title: geoJsonPoint.properties.name || '',
                zIndexOffset: 1000,
            }));
        default:
            return new L.marker(latlng, new Object({
                alt: geoJsonPoint.properties.name || '',
                icon: chooseIcon(geoJsonPoint.properties.terrainType || ""),
                title: geoJsonPoint.properties.name || '',
                zIndexOffset: 1000,
            }));
    }
}

function chooseIcon(terrainType) {
    switch (terrainType.toString().toLowerCase()) {
        case "mountain": return icon.greenIcon;
        case "mountain range": return icon.violetIcon;
        case "mare": return icon.blueIcon;
        case "sea": return icon.blueIcon;
        default: return icon.blackIcon;
    }
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
