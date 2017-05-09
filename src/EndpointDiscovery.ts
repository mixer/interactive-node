import { NoInteractiveServersAvailable } from './errors';
import { IRequester } from './Requester';

export interface IInteractiveEndpoint {
    address: string;
}

const endpoint = `https://beam.pro/api/v1/interactive/hosts`;

export class EndpointDiscovery {
    constructor(private requester: IRequester) {}
    /**
     * Retrieves available interactive servers from Beam's REST API.
     * Game Clients should connect to the first one in the list and use
     * other servers in the list should a connection attempt to the first
     * fail.
     */
    public retrieveEndpoints(): Promise<IInteractiveEndpoint[]> {
        return this.requester.request(endpoint)
        .then(res => {
            if (res.length > 0) {
                return res;
            }
            return new NoInteractiveServersAvailable('No Interactive servers are available, please try again.');
        });
    }
}
