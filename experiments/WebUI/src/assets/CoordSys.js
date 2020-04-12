class CoordSys {

	//NOTE !!!
	//coordinates that are displayed can be change to different system, but the coordinates in the mission file is always in loc sys.

	//latlong - coordinate in latitude and longitude in decimal degrees
	//llds - coordinate in latlong but in degree, minute and second format
	//loc - coordinate in local frame (in meters) from the origin
	//mploc - coordinate in the image(map image)'s position (in pixels)
	//locLeft=x1, locTop=y1, locRight=x2, locBtm=y2


	constructor(oriLat, oriLong, llTop, llLeft, llRight, llBtm) {
		this.mplat = null;
		this.mplong = null;

		this.width = this.height = this.ofsx = this.ofsy = this.vSelection = this.hSelection = 0;
		this.latOrigin = oriLat;
		this.longOrigin = oriLong;
		const latlongTop = llTop;
		const latlongRight = llRight;
		const latlongLeft = llLeft;
		const latlongBtm = llBtm;
		this.computeCoordSys();
		this.locLeft = this.long2locx(latlongLeft);
		this.locTop = this.lat2locy(latlongTop);
		this.locRight = this.long2locx(latlongRight);
		this.locBtm = this.lat2locy(latlongBtm);
		this.coordheight = this.locBtm - this.locTop;
		this.coordWidth = this.locRight - this.locLeft;

	}

	computeCoordSys(){
		// given the latitude, work out meters per latitude and longitude
		// (adapted from http://164.214.12.145/calc/degree.html)
		const rlat = this.latOrigin * Math.PI / 180;
		this.mplat = 111132.92 - 559.82 * Math.cos(2 * rlat) + 1.175
		* Math.cos(4 * rlat) - 0.0023 * Math.cos(6 * rlat);
		this.mplong = 111412.84 * Math.cos(rlat) - 93.5 * Math.cos(3 * rlat) + 0.118
		* Math.cos(5 * rlat);

	}

	updateOrigin(oriLat, oriLong){
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
		return (y/this.mplat) + this.latOrigin;
	}

	locx2long(x) {
		return (x/this.mplong) + this.longOrigin;
	}

	//Convert the local position to map's position
	locx2mplocx(x) {
		return Math.round((x - this.locLeft) * this.width / this.coordWidth) + this.ofsx - this.hSelection;
	}

	locy2mplocy(y) {
		return (this.height - Math.round((this.locBtm - y) * this.height / this.coordheight) + this.ofsy - this.vSelection);
	}

	//Convert the map's position (pixel point) into local position
	mplocx2locx(x) {
		return this.locLeft + (x - this.ofsx + this.hSelection) / this.width * this.coordWidth;
	}

	mplocy2locy(y) {
		return this.locBtm - (this.height - (y - this.ofsy + this.vSelection)) / this.height * this.coordheight;
	}

	//Convert the map's position (pixel point) into latlong
	mplocx2long(x){
		return this.locx2long(this.mplocx2locx(x));
	}

	mplocy2lat(y) {
		return this.locy2lat(this.mplocy2locy(y));
	}

	long2mplocx(x) {
		return this.locx2mplocx(this.long2locx(x));
	}

	lat2mplocy(y) {
		return this.locy2mplocy(this.lat2locy(y));
	}

// ..........................................

	toDecMinSec(degdec){
		var deg = parseInt(degdec, 10);
		var frac = degdec - deg;

		frac *= 60.0;

		var min = parseInt(frac, 10);

		frac -= min;

		var sec = frac * 60.0;
		if(sec >= 60.0)
		{
			min++;
			sec -= 60.0;
		}

		// return deg + "\u00b0" + min + "'" + df2.format(sec) + "\"";
		return deg + "\u00b0" + min + "'" + sec.toFixed(2) + "\"";
	}

	mplocx2longds(x){
		return this.toDecMinSec(this.locx2long(this.mplocx2locx(x)));
	}

	mplocy2latds(y){
		return this.toDecMinSec(this.locy2lat(this.mplocy2locy(y)));
	}

	locx2longds(x){
		return this.toDecMinSec(this.locx2long(x));
	}

	locy2latds(y){
		return this.toDecMinSec(this.locy2lat(y));
	}

	todegdec(arg){
		var tokens = arg.split("[\u00b0'\"]");
		var degdec = parseFloat(tokens[0]) + ((parseFloat(tokens[1]) + (parseFloat(tokens[2]) / 60.0)) / 60.0) ;
		return degdec;
	}

	todegdec(deg, min, sec){
		var degdec = deg + ((min + (sec / 60.0)) / 60.0) ;
		return degdec;
	}

	longds2mplocx(arg){
		return this.locx2mplocx(this.long2locx(this.todegdec(arg)));
	}

	latds2mplocy(arg){
		return this.locy2mplocy(this.lat2locy(this.todegdec(arg)));
	}

	//from whatever the current unit is to the desired coordinate system (0=Cartesian(def),1=degdec,2=degmindec)
	mplocx2Display(x, displayMode){
		switch (displayMode) {
		case 0:
			return this.mplocx2locx(x).toFixed(2);
		case 1:
			return this.mplocx2long(x).toFixed(5);
		case 2:
			return this.mplocx2longds(x);
		default:
			return this.mplocx2locx(x).toFixed(2);
		}
	}

	mplocy2Display(y, displayMode){
		switch (displayMode) {
		case 0:
			return this.mplocy2locy(y).toFixed(2);
		case 1:
			return this.mplocy2lat(y).toFixed(5);
		case 2:
			return this.mplocy2latds(y);
		default:
			return this.mplocy2locy(y).toFixed(2);
		}
	}

	locx2Display(x, displayMode){
		switch (displayMode) {
		case 0:
			return x.toFixed(2);
		case 1:
			return this.locx2long(x).toFixed(5);
		case 2:
			return this.locx2longds(x);
		default:
			return x.toFixed(2);
		}
	}
	locy2Display(y, displayMode){
		switch (displayMode) {
		case 0:
			return y.toFixed(2);
		case 1:
			return this.locy2lat(y).toFixed(5);
		case 2:
			return this.locy2latds(y);
		default:
			return y.toFixed(2);
		}
	}

	//from whatever the current coordinate system is to missionFile loc unit
	toLocx(x, displayMode){
		switch(displayMode) {
		case 0:
			return x;
		case 1:
			return this.long2locx(x);
		default:
			return x;
		}
	}

	toLocx(longds, displayMode){
		if (displayMode == 0)
			return parseFloat(longds);
		else if (displayMode == 1)
			return this.long2locx(parseFloat(longds));
		else
			return this.long2locx(this.todegdec(longds));
	}

	toLocy(y, displayMode){
		switch(displayMode) {
		case 0:
			return y;
		case 1:
			return this.lat2locy(y);
		default:
			return y;
		}
	}

	toLocy(latds, displayMode){
		if (displayMode == 0)
			return parseFloat(latds);
		else if (displayMode == 1)
			return this.lat2locy(parseFloat(latds));
		else
			return this.lat2locy(this.todegdec(latds));
	}

}

export default CoordSys;
