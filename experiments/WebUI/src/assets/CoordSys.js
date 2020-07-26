class CoordSys {

    constructor(oriLat, oriLong) {
        this.mplat = null;
        this.mplong = null;
        this.latOrigin = oriLat;
        this.longOrigin = oriLong;
        this.computeCoordSys();
    }

    computeCoordSys() {
        // given the latitude, work out meters per latitude and longitude
        // (adapted from http://164.214.12.145/calc/degree.html)
        const rlat = this.latOrigin * Math.PI / 180;
        this.mplat = 111132.92 - 559.82 * Math.cos(2 * rlat) + 1.175
            * Math.cos(4 * rlat) - 0.0023 * Math.cos(6 * rlat);
        this.mplong = 111412.84 * Math.cos(rlat) - 93.5 * Math.cos(3 * rlat) + 0.118
            * Math.cos(5 * rlat);
    }

    updateOrigin(oriLat, oriLong) {
        this.latOrigin = oriLat;
        this.longOrigin = oriLong;
        this.computeCoordSys();
    }

    //Convert latitude to local positioning
    lat2locy(y) {
        return (y - this.latOrigin) * this.mplat;
    }

    long2locx(x) {
        return (x - this.longOrigin) * this.mplong;
    }

    //Convert local positioning to  latitude
    locy2lat(y) {
        return (y / this.mplat) + this.latOrigin;
    }

    locx2long(x) {
        return (x / this.mplong) + this.longOrigin;
    }
}

export default CoordSys;
