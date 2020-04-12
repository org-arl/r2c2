import L from 'leaflet';

const mapPin = new L.Icon({
    iconUrl: require('./img/map-pin-solid.svg'),
    iconSize: new L.Point(10, 10)
});

const readyMarker = new L.Icon({
    iconUrl: require('./img/map-marker-alt-solid.svg'),
    iconSize: new L.Point(20, 20)
});

const notReadyMarker = new L.Icon({
    iconUrl: require('./img/map-marker-solid.svg'),
    iconSize: new L.Point(20, 20)
});

export { mapPin, readyMarker, notReadyMarker };
