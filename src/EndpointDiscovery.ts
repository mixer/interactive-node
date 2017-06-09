import { NoInteractiveServersAvailable } from './errors';
import { IRequester } from './Requester';

export interface IInteractiveEndpoint {
    address: string;
}

export class EndpointDiscovery {
    constructor(private requester: IRequester) {}
    /**
     * Retrieves available interactive servers from Mixer's REST API.
     * Game Clients should connect to the first one in the list and use
     * other servers in the list should a connection attempt to the first
     * fail.
     */
    public retrieveEndpoints(endpoint: string = 'https://mixer.com/api/v1/interactive/hosts'): Promise<IInteractiveEndpoint[]> {
        return this.requester.request(endpoint)
        .then(res => {
            if (res.length > 0) {
                return res;
            }
            throw new NoInteractiveServersAvailable('No Interactive servers are available, please try again.');
        });
    }
}
