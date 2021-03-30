String.prototype.hashCode = function () {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function generateHash(feature) {
  let prop = feature.properties;
  let hash = `${prop.terrainType.toString().toLowerCase()} 
              ${prop.name.toString().toLowerCase()} 
              ${prop["name origin"].toString().toLowerCase()} 
              ${prop.height.toString().toLowerCase()} 
              ${prop.diameter.toString().toLowerCase()}`;
  return hash.hashCode();
}