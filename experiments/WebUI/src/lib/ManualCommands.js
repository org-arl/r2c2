import { FjageHelper } from "./fjageHelper.js";
import { Message, Performative } from './fjage.js';

export class CustomRequest extends Message {
    constructor(type, params) {
        super(new Message(), Performative.REQUEST);
        this.__clazz__ = type;
        if (params) {
            const keys = Object.keys(params);
            for (let k of keys) {
                this[k] = params[k];
            }
        }
    }
}

class ManualCommands {

	constructor(hostname, port) {
		this.gateway = FjageHelper.getGateway();

		this.captainAgentId = null;
		this.engineRoomAgentId = null;

		this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.VEHICLESTATUS'));
		
		this.gateway.agentForService('org.arl.jc2.enums.C2Services.CAPTAIN').then((aid) => {
			this.captainAgentId = aid;
		}).catch((ex) => {
			console.log('Could not find Captain: '+ex);
		});

		this.gateway.agentForService('org.arl.jc2.enums.C2Services.EngineRoom').then((aid) => {
			this.engineRoomAgentId = aid;
		}).catch((ex) => {
			console.log('Could not find Engine Room Agent: '+ex);
		});

		this.vehicleStatus = null;
		
	}

	sendRequest(customRequest){
		this.gateway.request(customRequest, 5000)
		.then(function (operatorCmdRsp) {
			console.log(operatorCmdRsp);
		}).catch((ex) => {
			console.log('Could not send request: '+ex);
		});
	}

	// float newThrust
	changeThrust(newThrust){
		const customRequest = new CustomRequest('org.arl.jc2.messages.EngineRoomReq', 
		{
			recipient: this.engineRoomAgentId,
			isSpeedControl: false,
			thrust: newThrust
		});
		this.sendRequest(customRequest);
	}

	enableThrust(){
		const customRequest = new CustomRequest('org.arl.jc2.messages.OperatorCmdReq', 
		{
			recipient: this.captainAgentId,
			cmd: 'ENABLE_THRUST'
		});
		this.sendRequest(customRequest);
	}

	disableThrust(){
		const customRequest = new CustomRequest('org.arl.jc2.messages.OperatorCmdReq', 
		{
			recipient: this.captainAgentId,
			cmd: 'DISABLE_THRUST'
		});
		this.sendRequest(customRequest);
	}

	// float newDepth
	changeDepth(newDepth){
		const customRequest = new CustomRequest('org.arl.jc2.messages.DivingOfficerReq', 
		{
			recipient: this.engineRoomAgentId,
			isAltitudeControl: false,
			depth: newDepth
		});
		this.sendRequest(customRequest);
	}

	// float newBearing
	changeBearing(newBearing){
		const CustomRequest = new CustomRequest('org.arl.jc2.messages.HelmsmanReq', 
		{
			recipient: this.engineRoomAgentId,
			bearing: newBearing
		});
		this.sendRequest(CustomRequest);
	}

	getVehicleStatus(){
		this.gateway.addMessageListener((msg) => {
			if (msg.__clazz__ === 'org.arl.jc2.messages.VehicleStatus') {
				// this.vehicleStatus = msg;
				console.log(msg);
			}
		});
	}

}

export default ManualCommands;