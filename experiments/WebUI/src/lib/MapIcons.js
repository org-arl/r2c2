import L from 'leaflet';

const mapPin = new L.Icon({
    iconUrl: require('../assets/img/map-pin-solid.svg'),
    iconSize: new L.Point(10, 10)
});

const mapPinSelected = new L.Icon({
    iconUrl: require('../assets/img/map-pin-selected.svg'),
    iconSize: new L.Point(10, 10)
});

const readyMarker = new L.Icon({
    iconUrl: require('../assets/img/map-marker-alt-solid.svg'),
    iconSize: new L.Point(20, 20)
});

const notReadyMarker = new L.Icon({
    iconUrl: require('../assets/img/map-marker-solid.svg'),
    iconSize: new L.Point(20, 20)
});

export { mapPin, mapPinSelected, readyMarker, notReadyMarker };
