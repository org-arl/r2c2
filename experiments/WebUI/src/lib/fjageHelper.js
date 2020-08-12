import {Gateway} from "./fjage";

const development = (process.env.NODE_ENV === 'development');

export const FjageHelper = {

    getGateway: function () {
        if (development) {
            return new Gateway('localhost', 8888);
        } else {
            return new Gateway();
        }
    }
};
