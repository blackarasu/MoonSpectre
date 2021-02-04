$(document).ready(function(){
    const SPAN= {lat: 114, lon: 360}
    const BOUNDERIES= {min:{lat: 57,lon:-180},max:{lat: -57, lon: 180}};
    var map = L.map('map',{
        zoomSnap: 0,
        zoomDelta: 0.25,
        wheelPxPerZoomLevel: 80,
        crs: L.CRS.Simple,
        center: [SPAN.lat/2,SPAN.lon/2],
        minZoom: 2,
        maxZoom: 5
    });
    let bounds = [[BOUNDERIES.min.lat,BOUNDERIES.min.lon],[BOUNDERIES.max.lat,BOUNDERIES.max.lon]]; //set bounds for imageOverlay
    const imageUrl = "res/image--000.png";
    let image = L.imageOverlay(imageUrl,bounds).addTo(map);
    map.fitBounds(bounds); //show map
    map.setZoom(3);
});
