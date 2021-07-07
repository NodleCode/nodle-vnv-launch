export interface LaunchConfig {
	devchain: ChainConfig;
	validatorchain: ChainConfig;
	types: any;
}
export interface ChainConfig {
	bin: string;
	chain: string;
	nodes: {
		name: string;
		wsPort: number;
		port: number;
		basePath?: string;
		flags?: string[];
		key?: string;
		bootnodes?: string;
		bond?: number;
	}[];
	genesis?: JSON;
}

export interface ChainSpec {
	name: string;
	id: string;
	chainType: string;
	bootNodes: string[];
	telemetryEndpoints: null;
	protocolId: string;
	properties: null;
	consensusEngine: null;
	lightSyncState: null;
	genesis: {
		runtime: any; // this can change depending on the versions
		raw: {
			top: {
				[key: string]: string;
			};
		};
	};
}
