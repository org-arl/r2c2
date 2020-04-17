import {Message, Performative} from './fjage';

export class TestRequest extends Message {
    constructor(params) {
        super(new Message(), Performative.REQUEST);
        this.__clazz__ = 'TestRequest';
        if (params) {
            const keys = Object.keys(params);
            for (let k of keys) {
                this[k] = params[k];
            }
        }
    }
}
