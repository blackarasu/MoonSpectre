$(document).ready(function(){
    const COORDINATES = {lon: 360, lat:114}; //span on the map (longtitude 360 degrees, latitude 114 degrees)
    const INITIAL_COORDINATES ={lon: 180,longLetter: 'W', lat:54,latLetter: 'N'}; 
    var map = L.map('map',{
        crs: L.CRS.Simple,
        center: [1249,3224],
        minZoom: 3
    });
    let bounds = [[57,-180],[-57,180]];
    const imageUrl = "res/image--000.png";
    let image = L.imageOverlay(imageUrl,bounds).addTo(map);
    map.fitBounds(bounds);
});
