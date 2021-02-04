$(document).ready(function(){
    const SPAN= {lat: 114, lon: 360}
    /*
     *  +lat => north 
     *  -lat => south
     *  +lon => east
     *  -lon => west
    */
    const BOUNDERIES= {min:{lat: 57,lon:-180},max:{lat: -57, lon: 180}};
    let bounds = L.latLngBounds([[BOUNDERIES.min.lat,BOUNDERIES.min.lon],[BOUNDERIES.max.lat,BOUNDERIES.max.lon]]); //set bounds for imageOverlay
    const imageUrl = "res/image--000.png";
    var map = L.map('map',{
        maxBounds: bounds,
        maxBoundsViscosity: 2/3,
        wheelPxPerZoomLevel: 80,
        crs: L.CRS.Simple,
        center: [SPAN.lat/2,SPAN.lon/2],
        zoom: 3,
        zoomSnap: 0,
        zoomDelta: 0.25,
        minZoom: 2,
        maxZoom: 5
    });
    let image = L.imageOverlay(imageUrl,bounds).addTo(map);
    map.fitBounds(bounds); //show map
});
