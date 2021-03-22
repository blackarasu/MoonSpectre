(function (factory, window) {
    if (typeof define === 'function' && define.amd && window.toGeoJSON) {
        define(['leaflet'], function (L) {
            factory(L);
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = function (root, L) {
            if (L === undefined) {
                if (typeof window !== 'undefined') {
                    L = require('leaflet');
                } else {
                    L = require('leaflet')(root);
                }
            }
            factory(L);
            return L;
        };
    } else if (typeof window !== 'undefined' && window.L) {
        factory(window.L);
    }
}(function buttonLoaderFactory(L) {
    var ButtonLoader = L.Layer.extend({
        options: {
            layer: L.geoJson,
            layerOptions: {},
        },

        initialize: function (map, options) {
            this._map = map;
            L.Util.setOptions(this, options);
        },
    });

    var ButtonLayerLoad = L.Control.extend({
        statics: {
            TITLE: 'Default button text',
            LABEL: '&#8965;'
        },
        options: {
            position: 'topleft',
            fitBounds: false,
            layerOptions: {},
            addToMap: true,
            func: function () {}
        },

        initialize: function (options) {
            L.Util.setOptions(this, options);
            this.loader = null;
        },

        onAdd: function (map) {
            this.loader = L.ButtonLayer.buttonLoader(map, this.options);
            // Initialize map control
            return this._initContainer();
        },

        _initContainer: function () {
            var callback = this.options.func;
            var zoomName = 'leaflet-control-filelayer leaflet-control-zoom';
            var barName = 'leaflet-bar';
            var partName = barName + '-part';
            var container = L.DomUtil.create('div', zoomName + ' ' + barName);
            var link = L.DomUtil.create('a', zoomName + '-in ' + partName, container);
            link.innerHTML = L.Control.ButtonLayerLoad.LABEL;
            link.href = '#';
            link.title = L.Control.ButtonLayerLoad.TITLE;
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(link, 'click', function (e) {
                callback();
                e.preventDefault();
            });
            return container;
        }
    });

    L.ButtonLayer = {};
    L.ButtonLayer.ButtonLoader = ButtonLoader;
    L.ButtonLayer.buttonLoader = function (map, options) {
        return new L.ButtonLayer.ButtonLoader(map, options);
    };

    L.Control.ButtonLayerLoad = ButtonLayerLoad;
    L.Control.buttonLayerLoad = function (options) {
        return new L.Control.ButtonLayerLoad(options);
    };
}, window));