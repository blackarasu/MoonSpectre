/*
 * Load files *locally* (GeoJSON, KML, GPX) into the map
 * using the HTML5 File API.
 *
 * Requires Mapbox's togeojson.js to be in global scope
 * https://github.com/mapbox/togeojson
 */

(function (factory, window) {
    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd && window.toGeoJSON) {
        define(['leaflet'], function (L) {
            factory(L, window.toGeoJSON);
        });
    } else if (typeof module === 'object' && module.exports) {
        // require('LIBRARY') returns a factory that requires window to
        // build a LIBRARY instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined
        module.exports = function (root, L, toGeoJSON) {
            if (L === undefined) {
                if (typeof window !== 'undefined') {
                    L = require('leaflet');
                } else {
                    L = require('leaflet')(root);
                }
            }
            factory(L, toGeoJSON);
            return L;
        };
    } else if (typeof window !== 'undefined' && window.L && window.toGeoJSON) {
        factory(window.L, window.toGeoJSON);
    }
}(function resetLoaderFactory(L, toGeoJSON) {
    var ResetLoader = L.Layer.extend({
        options: {
            layer: L.geoJson,
            layerOptions: {},
        },

        initialize: function (map, options) {
            this._map = map;
            L.Util.setOptions(this, options);
        },
    });

    var ResetLayerLoad = L.Control.extend({
        statics: {
            TITLE: 'Click to reset the map',
            LABEL: '&#8965;'
        },
        options: {
            position: 'topleft',
            fitBounds: false,
            layerOptions: {},
            addToMap: true,
        },

        initialize: function (options) {
            L.Util.setOptions(this, options);
            this.loader = null;
        },

        onAdd: function (map) {
            this.loader = L.ResetLayer.resetLoader(map, this.options);
            // Initialize map control
            return this._initContainer();
        },

        _initContainer: function () {
            var zoomName = 'leaflet-control-filelayer leaflet-control-zoom';
            var barName = 'leaflet-bar';
            var partName = barName + '-part';
            var container = L.DomUtil.create('div', zoomName + ' ' + barName);
            var link = L.DomUtil.create('a', zoomName + '-in ' + partName, container);
            link.innerHTML = L.Control.ResetLayerLoad.LABEL;
            link.href = '#';
            link.title = L.Control.ResetLayerLoad.TITLE;

            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(link, 'click', function (e) {
                reset();
                e.preventDefault();
            });
            return container;
        }
    });

    L.ResetLayer = {};
    L.ResetLayer.ResetLoader = ResetLoader;
    L.ResetLayer.resetLoader = function (map, options) {
        return new L.ResetLayer.ResetLoader(map, options);
    };

    L.Control.ResetLayerLoad = ResetLayerLoad;
    L.Control.resetLayerLoad = function (options) {
        return new L.Control.ResetLayerLoad(options);
    };
}, window));


function reset() {
    clearLocalStorage();
    clearMap();
}