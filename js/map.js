const SPAN = { lat: 114, lon: 360 };
const BOUNDARIES = { min: { lat: 57.00, lon: -180.00 }, max: { lat: -57.00, lon: 180.00 } };

function initializeMap() {
    let bounds = L.latLngBounds([[BOUNDARIES.min.lat, BOUNDARIES.min.lon], [BOUNDARIES.max.lat, BOUNDARIES.max.lon]]); //set bounds for imageOverlay
    let maxBounds = L.latLngBounds([[BOUNDARIES.min.lat + 25.0, BOUNDARIES.min.lon - 5.0], [BOUNDARIES.max.lat, BOUNDARIES.max.lon + 10.0]]); //set maxBounds
    const IMAGE_URL = "img/image--000.png";
    let map = L.map('map', {
        maxBounds: maxBounds,
        maxBoundsViscosity: 2 / 3,
        wheelPxPerZoomLevel: 80,
        crs: L.CRS.Simple,
        center: [(SPAN.lat) / 2, SPAN.lon / 2],
        zoom: 3,
        zoomSnap: 0,
        zoomDelta: 0.25,
        minZoom: 2.8,
        maxZoom: 7.5
    });
    L.imageOverlay(IMAGE_URL, bounds).addTo(map);
    map.fitBounds(bounds);
    map.setMinZoom(2);
    $(".leaflet-control-attribution>a").click(function () {
        this.target = "_blank";
    });
    return map;
}

function clearMap() {
    layers.forEach(layer => {
        layer.layer.remove();
    });
    layers = new Array();
    hashedFeatures = new Array();
}

function addPopup(feature, marker, map) {
    let prop = feature.properties;
    if (prop && prop.name && feature.geometry.coordinates) {
        let buttonLayer = L.Control.buttonLayerLoad(new Object({
            position: 'topright'
        }))
        let container = buttonLayer._initPopupContainer();
        marker.bindPopup(container);
        L.Control.ButtonLayerLoad.LABEL = `<img class="icon" data-toggle="modal" data-target="#editFeatureModal" data-hash=${generateHash(feature)} src="img/edit.svg" alt="edit icon"/>`;
        L.Control.ButtonLayerLoad.TITLE = `"Edit a ${prop.name} marker!`;
        container = buttonLayer._addButton(container, function () {
            let modal = $(`#editFeatureModal`);
            setModalFields(modal, feature);
            let button = $('#editFeatureButton')
            button.click(function () {
                onClickEditButton(modal, button);
            })
            resetStatesOnCloseModal(modal, button);
        });
        L.Control.ButtonLayerLoad.LABEL = '<img class="icon" data-toggle="modal" data-target="#removeFeatureModal" src="img/remove.svg" alt="remove icon"/>';
        L.Control.ButtonLayerLoad.TITLE = `Remove a ${prop.name} marker!`;
        container = buttonLayer._addButton(container, function () {
            onClickRemoveButton();
        });
        container = buttonLayer._addPropertyInfo(container, propertyInfo())
    }
    else {
        criticalError(`${prop.name + ' ' || ''}Marker does not have mandatory fields. Please check your map file or contact with a computer Wizard. :-)`);
        console.error(`${prop.name + ' ' || ''}Marker does not have mandatory fields. Please check your map file or contact with a computer Wizard. :-)`);
    }

    function onClickEditButton(modal, button) {
        resetErrors(modal);
        let newFeature = getModalFields(modal);
        newFeature.geometry = feature.geometry;
        if (isFeatureValid(newFeature)) {
            removeFeature(feature, marker);
            addFeaturesToMap(newFeature, map, "User");
            localStorage.setObj(LOCAL_STORAGE.FEATURES, hashedFeatures);
            modal.modal('hide');
            button.prop("onclick", null).off("click");
            restoreState(modal);
        }
        else {
            let element = modal.find('.alert-danger');
            printMessage(element, "Something went wrong! Please check if coordinates are correct and Name field is not empty.");
        }

        function resetErrors(modal) {
            restoreInput(modal.find('longitude'));
            restoreInput(modal.find('latitude'));
            restoreInput(modal.find('name'));
        }
    }

    function onClickRemoveButton() {
        $('#removeFeatureInformation').html(`Are you sure you want to remove <b>${prop.name}</b> from map?`);
        let button = $('#removeFeatureButton');
        button.click(function () {
            removeFeature(feature, marker);
            $('#removeFeatureModal').modal('hide');
            button.prop("onclick", null).off("click");
        });
    }

    function propertyInfo() {
        return `${convertLatLngToEWSN(feature.geometry.coordinates).reverse().toString().replace(',', ' ')}</br>
                                ${getProperty(prop.terrainType, "Mountain")} 
                                ${getProperty(prop.name)}</br>${getProperty(prop["name origin"], " ", "</br>")}Height: 
                                ${getProperty(prop.height, "-")}</br>Diameter: ${getProperty(prop.diameter, "-")}`;
    }
}

function resetStatesOnCloseModal(modal, button) {
    modal.find('.close-button').click(function () {
        button.prop("onclick", null).off("click");
    });
}

/*
    *   [lon, lat]
    *  +lat => north
    *  -lat => south
    *  +lon => east
    *  -lon => west
*/
function convertEWSNToLatLng(coordinates) {
    let latLong = new Array();
    latLong[0] = convertEWToLng(coordinates[0]);
    latLong[1] = convertSNToLat(coordinates[1]);
    return latLong;
}

function convertSNToLat(sn) {
    let lat = sn.toString().toUpperCase().includes("S") == true ? (parseFloat(sn) * (-1.0)) : parseFloat(sn);
    return lat;
}

function convertEWToLng(ew) {
    let lon = ew.toString().toUpperCase().includes("W") == true ? (parseFloat(ew) * (-1.0)) : parseFloat(ew);
    return lon;
}

function convertLatLngToEWSN(coordinates) {
    let ewsn = new Array();
    ewsn[0] = convertLngToEW(coordinates[0]);
    ewsn[1] = convertLatToSN(coordinates[1]);
    return ewsn;
}

function convertLatToSN(lat) {
    return lat < 0 ? (lat * (-1)).toString() + '&#176;S' : lat.toString() + '&#176;N';
}

function convertLngToEW(lon) {
    return lon < 0 ? (lon * (-1)).toString() + '&#176;W' : lon.toString() + '&#176;E';
}

function deleteLayerFromLayersContains(feature) {
    for (let i = 0; i < layers.length; i++) {
        for (key in layers[i].layer._layers) {
            if (layers[i].layer._layers[`${key}`].feature === feature) {
                delete layers[i].layer._layers[`${key}`];
            }
        }
    }
}

function deleteLayerIfEmpty() {
    for (let i = 0; i < layers.length; i++) {
        if (Object.keys(layers[i].layer._layers) == 0) {
            layers.splice(i, 1);
        }
    }
}

function getModalFields(modal, isAdd) {
    let ewsn = new Array();
    ewsn[0] = getFieldIn(modal, "longitude");
    ewsn[1] = getFieldIn(modal, "latitude");
    let feature = new Object({
        type: "Feature",
        properties: new Object(),
        geometry: new Object({
            type: "Point"
        })
    });
    feature.properties.pointType = setProperty(getFieldIn(modal, "point-type"), "Point");
    if (isAdd == true) {
        if (isValidCoordinate(ewsn, modal)) {
            feature.geometry.coordinates = convertEWSNToLatLng(ewsn);
        }
    }
    let name = setProperty(getFieldIn(modal, "name"));
    if (!isEmpty(name)) {
        feature.properties.name = name;
    }
    feature.properties.terrainType = setProperty(getFieldIn(modal, "terrainType"), "Mountain");
    feature.properties["name origin"] = setProperty(getFieldIn(modal, "name-origin"));
    feature.properties.height = setBinaryProperty(setProperty(getFieldIn(modal, "height") + " " + getUnit(getFieldIn(modal, "height-unit").toLowerCase())));
    feature.properties.diameter = setBinaryProperty(setProperty(getFieldIn(modal, "diameter") + " " + getUnit(getFieldIn(modal, "diameter-unit").toLowerCase())));
    return feature;
}

function getFieldIn(modal, fieldClass, defaultValue) {
    return modal.find(`.${fieldClass}`).val() || (defaultValue || '');
}

function setFieldIn(modal, fieldClass, property) {
    return modal.find(`.${fieldClass}`).val(property);
}

function setModalFields(modal, feature) {
    let props = feature.properties;
    let ewsn = convertLatLngToEWSN(feature.geometry.coordinates);
    let height = isNaN(parseFloat(props.height)) ? "0" : props.height;
    let diameter = isNaN(parseFloat(props.diameter)) ? "0" : props.diameter;
    setFieldIn(modal, "point-type", getProperty(props.pointType, "Point"));
    setFieldIn(modal, "longitude", removeSymbol(ewsn[0]));
    setFieldIn(modal, "latitude", removeSymbol(ewsn[1]));
    setFieldIn(modal, "name", getProperty(props.name));
    setFieldIn(modal, "terrainType", getProperty(props.terrainType, "Mountain"));
    setFieldIn(modal, "name-origin", getProperty(props["name origin"]));
    setFieldIn(modal, "height", getProperty(parseFloat(height), "0"));
    setFieldIn(modal, "height-unit", getProperty(height.toString().toLowerCase().split(" ")[1], "km"));
    setFieldIn(modal, "diameter", getProperty(parseFloat(diameter), "0"));
    setFieldIn(modal, "diameter-unit", getProperty(diameter.toString().toLowerCase().split(" ")[1], "km"));
}

function getProperty(property, defaultValue, additionalConstance) {
    return !isUndfefinable(property) ? (property + (additionalConstance || '')) : defaultValue || '';
}

function setProperty(field, defaultValue) {
    return (isUndfefinable(field) == true ? defaultValue || '' : field.split(" ")[0] == "0" ? '-' : field);
}

function getUnit(likelyUnit) {
    switch (likelyUnit) {
        case "km":
        case "m":
            return likelyUnit;
        default:
            return "km";
    }
}

function isEmpty(property) {
    return (property == undefined || property == null || !property || property.length === 0 || property.trim().length === 0 || !property.trim());
}

function isFeatureValid(feature) {
    return feature.geometry.coordinates != undefined
        && feature.properties.name != undefined;
}

function isUndfefinable(property) {
    return property == undefined || property == null || property == "";
}

function isValidCoordinate(ewsn, modal) {
    let longitude = isValidLongitude(ewsn[0]);
    let latitude = isValidLatitude(ewsn[1]);
    return longitude && latitude;

    function isValidLatitude(likelyLat) {
        let validation = !isEmpty(likelyLat) && (likelyLat.toUpperCase().includes("S") || likelyLat.toUpperCase().includes("N"))
            && convertSNToLat(likelyLat) >= BOUNDARIES.max.lat
            && convertSNToLat(likelyLat) <= BOUNDARIES.min.lat;
        if (validation == false) {
            let latitude = modal.find(".latitude");
            invalidationPopoverMessage(latitude,
                `Latitude need to be between ${convertLatToSN(BOUNDARIES.min.lat)} and ${convertLatToSN(BOUNDARIES.max.lat)}`);
        }
        return validation;
    }
    function isValidLongitude(likelyLon) {
        let validation = !isEmpty(likelyLon) && (likelyLon.toUpperCase().includes("E") || likelyLon.toUpperCase().includes("W"))
            && convertEWToLng(likelyLon) >= BOUNDARIES.min.lon
            && convertEWToLng(likelyLon) <= BOUNDARIES.max.lon;
        if (validation == false) {
            let longitude = modal.find(".longitude");
            invalidationPopoverMessage(longitude,
                `Longitude need to be between ${convertLngToEW(BOUNDARIES.min.lon)} and ${convertLngToEW(BOUNDARIES.max.lon)}`)
        }
        return validation;
    }
}

function invalidationPopoverMessage(element, message) {
    element.addClass("is-invalid")
        .popover({ content: message, html: true });
}

function printMessage(element, message) {
    element.show().html(message);
}

function removeFeature(feature, marker) {
    let hash = generateHash(feature);
    deleteLayerFromLayersContains(feature);
    removeHashFromHashedFeatures(hash);
    deleteLayerIfEmpty();
    localStorage.setObj(LOCAL_STORAGE.FEATURES, hashedFeatures);
    marker.remove();
}

function removeHashFromHashedFeatures(hash) {
    hashedFeatures = hashedFeatures.filter(function (value, index, arr) {
        return value.hash != hash;
    });
}

function removeSymbol(ewsn) {
    return ewsn.replace("&#176;", "");
}

function restoreInput(input) {
    input.popover('dispose');
    input.removeClass('is-invalid');
}

function restoreState(modal) {
    let alertDanger = modal.find(".alert-danger");
    alertDanger.hide();
    let latitude = modal.find('.latitude');
    restoreInput(latitude);
    let longitude = modal.find('.longitude');
    restoreInput(longitude);
    resetInput(modal.find('.name'));
    resetInput(modal.find('.name-origin'));
    resetInput(modal.find('.height'));
    resetInput(modal.find('.diameter'));
    //restoreInput(modal.find('.terrainType'));//delete "//" if you want to restore to default terrainType input every successfull creation/edit
    function resetInput(input) {
        input.val("");
    }
}

function setBinaryProperty(property) {
    let first = property.split(" ")[0];
    return first == "" ? "-" : property;
}
