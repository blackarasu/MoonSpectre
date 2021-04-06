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
  let optionals = new Object({
    terrainType: getProperty(prop.terrainType, "Mountain"),
    nameOrigin: getProperty(prop["name origin"], ""),
    height: setBinaryProperty(setProperty(parseFloat(prop.height) + " " + getUnit(prop.height.toString().toLowerCase().split(" ")[1]))),
    diameter: setBinaryProperty(setProperty(parseFloat(prop.diameter) + " " + getUnit(prop.diameter.toString().toLowerCase().split(" ")[1])))
});
let hash = `${optionals.terrainType.toString().toLowerCase()} 
              ${prop.name.toString().toLowerCase()} 
              ${optionals.nameOrigin.toString().toLowerCase()} 
              ${optionals.height.toString().toLowerCase()} 
              ${optionals.diameter.toString().toLowerCase()}`;
return hash.hashCode();
}