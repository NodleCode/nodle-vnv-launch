#!/usr/bin/env node

import {
	startNode,
	startValidators,
	generateChainSpec,
	generateChainSpecRaw,
} from "./spawn";

// import { connect, registerParachain, setBalance } from "./rpc";

import { checkConfig } from "./check";

import {
	clearAuthorities,
	addAuthority,
	clearNodleStakers,
	addStakers,
	clearStakingInvulnerables,
	addInvulnerables,
} from "./spec";

// import { parachainAccount } from "./parachain";
// import { ApiPromise } from "@polkadot/api";

import { resolve } from "path";
import fs from "fs";
import { LaunchConfig } from "./types";

function loadTypeDef(types: string | object): object {
	if (typeof types === "string") {
		// Treat types as a json file path
		try {
			const rawdata = fs.readFileSync(types, { encoding: "utf-8" });
			return JSON.parse(rawdata);
		} catch {
			console.error("failed to load parachain typedef file");
			process.exit(1);
		}
	} else {
		return types;
	}
}

export async function run(config_dir: string, config: LaunchConfig) {
	if (config.devchain) {
		// Verify that the `config.json` has all the expected properties.
		if (!checkConfig(config)) {
			return;
		}

		const validator_chain_bin = resolve(config_dir, config.devchain.bin);
		if (!fs.existsSync(validator_chain_bin)) {
			console.error("Relay chain binary does not exist: ", validator_chain_bin);
			process.exit();
		}
		const chain = config.devchain.chain;
		await generateChainSpec(validator_chain_bin, chain);
		// // -- Start Chain Spec Modify --
		// clearAuthorities(`${chain}.json`);
		// clearNodleStakers(`${chain}.json`);
		// clearStakingInvulnerables(`${chain}.json`);
		// for (const node of config.devchain.nodes) {
		// 	await addAuthority(`${chain}.json`, node.name);
		// 	if (node.bond) {
		// 		await addStakers(`${chain}.json`, node.name, node.bond);
		// 		await addInvulnerables(`${chain}.json`, node.name);
		// 	}
		// }
		// // -- End Chain Spec Modify --
		await generateChainSpecRaw(validator_chain_bin, chain);
		const spec = resolve(`${chain}-raw.json`);

		// First we launch each of the nodes in devchain.
		for (const node of config.devchain.nodes) {
			const { name, wsPort, port, basePath, flags, key, bootnodes } = node;
			console.log(`Starting ${name}...`);
			// We spawn a `child_process` starting a node, and then wait until we
			// able to connect to it using PolkadotJS in order to know its running.
			startNode(
				validator_chain_bin,
				name,
				wsPort,
				port,
				spec,
				basePath,
				flags,
				key,
				bootnodes
			);
		}

		console.log("🚀 POLKADOT DEV NODE LAUNCH COMPLETE 🚀");
	}

	// Launch all external validators
	if (config.validatorchain) {
		const validator_chain_bin = resolve(config_dir, config.validatorchain.bin);
		if (!fs.existsSync(validator_chain_bin)) {
			console.error("Relay chain binary does not exist: ", validator_chain_bin);
			process.exit();
		}

		const chain = config.validatorchain.chain;
		const spec = resolve(`${chain}-raw.json`);

		for (const node of config.validatorchain.nodes) {
			const { name, wsPort, port, basePath, flags, key, bootnodes } = node;
			console.log(`Starting ${name}...`);
			// We spawn a `child_process` starting a node, and then wait until we
			// able to connect to it using PolkadotJS in order to know its running.
			startValidators(
				validator_chain_bin,
				name,
				wsPort,
				port,
				spec,
				basePath,
				flags,
				key,
				bootnodes
			);
		}

		console.log("🚀 POLKADOT VALIDATOR NODE LAUNCH COMPLETE 🚀");
	}

	// // Connect to the first relay chain node to submit the extrinsic.
	// let relayChainApi: ApiPromise = await connect(
	// 	config.validatorchain.nodes[0].wsPort,
	// 	loadTypeDef(config.types)
	// );
}
