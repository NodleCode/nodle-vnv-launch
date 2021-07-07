import { Keyring } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { encodeAddress } from "@polkadot/util-crypto";
import { ChainSpec } from "./types";
const fs = require("fs");

function nameCase(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Get authority keys from within chainSpec data
function getAuthorityKeys(chainSpec: ChainSpec) {
	// Check runtime_genesis_config key for rococo compatibility.
	const runtimeConfig =
		chainSpec.genesis.runtime.runtime_genesis_config ||
		chainSpec.genesis.runtime;
	if (runtimeConfig && runtimeConfig.palletSession) {
		return runtimeConfig.palletSession.keys;
	}
}

// Remove all existing keys from `session.keys`
export function clearAuthorities(spec: string) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec;
	try {
		chainSpec = JSON.parse(rawdata);
	} catch {
		console.error("failed to parse the chain spec");
		process.exit(1);
	}

	let keys = getAuthorityKeys(chainSpec);
	if (keys) {
		keys.length = 0;

		let data = JSON.stringify(chainSpec, null, 2);
		fs.writeFileSync(spec, data);
		console.log(`\n🧹 Starting with a fresh authority set...`);
	} else {
		console.log(`\n🧹 No Valid authority set...`);
	}
}

// Add additional authorities to chain spec in `session.keys`
export async function addAuthority(spec: string, name: string) {
	await cryptoWaitReady();

	const sr_keyring = new Keyring({ type: "sr25519" });
	const sr_account = sr_keyring.createFromUri(`//${nameCase(name)}`);
	const sr_stash = sr_keyring.createFromUri(`//${nameCase(name)}//stash`);

	const ed_keyring = new Keyring({ type: "ed25519" });
	const ed_account = ed_keyring.createFromUri(`//${nameCase(name)}`);

	let key = [
		sr_stash.address,
		sr_stash.address,
		{
			babe: sr_account.address,
			grandpa: ed_account.address,
			im_online: sr_account.address,
			authority_discovery: sr_account.address,
		},
	];

	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);

	let keys = getAuthorityKeys(chainSpec);
	if (keys) {
		keys.push(key);

		let data = JSON.stringify(chainSpec, null, 2);
		fs.writeFileSync(spec, data);
		console.log(`  👤 Added Genesis Authority ${name}`);
	} else {
		console.log(`  👤 Genesis Authority ${name} not added`);
	}
}

// Get nodle stakers from within chainSpec data
function getNodleStakers(chainSpec: ChainSpec) {
	const runtimeConfig =
		chainSpec.genesis.runtime.runtime_genesis_config ||
		chainSpec.genesis.runtime;
	if (runtimeConfig && runtimeConfig.palletNodleStaking) {
		return runtimeConfig.palletNodleStaking.stakers;
	}
}

// Remove all existing stakers from staking pallet
export function clearNodleStakers(spec: string) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec;
	try {
		chainSpec = JSON.parse(rawdata);
	} catch {
		console.error("failed to parse the chain spec");
		process.exit(1);
	}

	let stakers = getNodleStakers(chainSpec);
	if (stakers) {
		stakers.length = 0;

		let data = JSON.stringify(chainSpec, null, 2);
		fs.writeFileSync(spec, data);
		console.log(`\n🧹 Starting with a fresh stakers set...`);
	} else {
		console.log(`\n🧹 No stakers set...`);
	}
}

// Add validator info to pallet-nodle-staking stakers list
export async function addStakers(spec: string, name: string, endow: number) {
	await cryptoWaitReady();

	const sr_keyring = new Keyring({ type: "sr25519" });
	const sr_stash = sr_keyring.createFromUri(`//${nameCase(name)}//stash`);

	let validator_info = [sr_stash.address, null, endow];

	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);

	let stakers = getNodleStakers(chainSpec);
	if (stakers) {
		stakers.push(validator_info);

		let data = JSON.stringify(chainSpec, null, 2);
		fs.writeFileSync(spec, data);
		console.log(`  👤 Added Staker ${name}`);
	} else {
		console.log(`  👤 No Stakers in Genesis Config Staker ${name} not added`);
	}
}

// Get nodle invulnerables from within chainSpec data
function getStakingInvulnerables(chainSpec: ChainSpec) {
	const runtimeConfig =
		chainSpec.genesis.runtime.runtime_genesis_config ||
		chainSpec.genesis.runtime;
	if (runtimeConfig && runtimeConfig.palletNodleStaking) {
		return runtimeConfig.palletNodleStaking.invulnerables;
	}
}

// Remove all existing invulnerables from staking pallet
export function clearStakingInvulnerables(spec: string) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec;
	try {
		chainSpec = JSON.parse(rawdata);
	} catch {
		console.error("failed to parse the chain spec");
		process.exit(1);
	}

	let invulnerables = getStakingInvulnerables(chainSpec);
	if (invulnerables) {
		invulnerables.length = 0;

		let data = JSON.stringify(chainSpec, null, 2);
		fs.writeFileSync(spec, data);
		console.log(`\n🧹 Starting with a fresh invulnerables set...`);
	} else {
		console.log(`\n🧹 No invulnerables in genesis config...`);
	}
}

// Add validator to pallet-nodle-staking invulnerable list
export async function addInvulnerables(spec: string, name: string) {
	await cryptoWaitReady();

	const sr_keyring = new Keyring({ type: "sr25519" });
	const sr_stash = sr_keyring.createFromUri(`//${nameCase(name)}//stash`);

	let invulnerable = sr_stash.address;

	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);

	let invulnerables = getStakingInvulnerables(chainSpec);
	if (invulnerables) {
		invulnerables.push(invulnerable);

		let data = JSON.stringify(chainSpec, null, 2);
		fs.writeFileSync(spec, data);
		console.log(`  👤 Added Staker ${name} to invulnerable list`);
	} else {
		console.log(
			`\n🧹 No invulnerables in genesis config, Staker ${name} not added`
		);
	}
}

// Add parachains to the chain spec at genesis.
export async function addGenesisParachain(
	spec: string,
	para_id: string,
	head: string,
	wasm: string,
	parachain: boolean
) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);

	// Check runtime_genesis_config key for rococo compatibility.
	const runtimeConfig =
		chainSpec.genesis.runtime.runtime_genesis_config ||
		chainSpec.genesis.runtime;
	if (runtimeConfig.parachainsParas) {
		let paras = runtimeConfig.parachainsParas.paras;

		let new_para = [
			parseInt(para_id),
			{
				genesis_head: head,
				validation_code: wasm,
				parachain: parachain,
			},
		];

		paras.push(new_para);

		let data = JSON.stringify(chainSpec, null, 2);
		fs.writeFileSync(spec, data);
		console.log(`  ✓ Added Genesis Parachain ${para_id}`);
	}
}

// // Update the `genesis` object in the chain specification.
// export async function addGenesisHrmpChannel(
// 	spec: string,
// 	hrmpChannel: HrmpChannelsConfig
// ) {
// 	let rawdata = fs.readFileSync(spec);
// 	let chainSpec = JSON.parse(rawdata);

// 	let newHrmpChannel = [
// 		hrmpChannel.sender,
// 		hrmpChannel.recipient,
// 		hrmpChannel.maxCapacity,
// 		hrmpChannel.maxMessageSize,
// 	];

// 	// Check runtime_genesis_config key for rococo compatibility.
// 	const runtimeConfig =
// 		chainSpec.genesis.runtime.runtime_genesis_config ||
// 		chainSpec.genesis.runtime;

// 	if (
// 		runtimeConfig.parachainsHrmp &&
// 		runtimeConfig.parachainsHrmp.preopenHrmpChannels
// 	) {
// 		runtimeConfig.parachainsHrmp.preopenHrmpChannels.push(newHrmpChannel);

// 		let data = JSON.stringify(chainSpec, null, 2);
// 		fs.writeFileSync(spec, data);
// 		console.log(
// 			`  ✓ Added HRMP channel ${hrmpChannel.sender} -> ${hrmpChannel.recipient}`
// 		);
// 	}
// }

// Update the runtime config in the genesis.
// It will try to match keys which exist within the configuration and update the value.
export async function changeGenesisConfig(spec: string, updates: any) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);

	console.log(`\n⚙ Updating Relay Chain Genesis Configuration`);

	if (chainSpec.genesis) {
		let config = chainSpec.genesis;
		findAndReplaceConfig(updates, config);

		let data = JSON.stringify(chainSpec, null, 2);
		fs.writeFileSync(spec, data);
	}
}

// Look at the key + values from `obj1` and try to replace them in `obj2`.
function findAndReplaceConfig(obj1: any, obj2: any) {
	// Look at keys of obj1
	Object.keys(obj1).forEach((key) => {
		// See if obj2 also has this key
		if (obj2.hasOwnProperty(key)) {
			// If it goes deeper, recurse...
			if (
				obj1[key] !== null &&
				obj1[key] !== undefined &&
				obj1[key].constructor === Object
			) {
				findAndReplaceConfig(obj1[key], obj2[key]);
			} else {
				obj2[key] = obj1[key];
				console.log(
					`  ✓ Updated Genesis Configuration [ ${key}: ${obj2[key]} ]`
				);
			}
		} else {
			console.error(`  ⚠ Bad Genesis Configuration [ ${key}: ${obj1[key]} ]`);
		}
	});
}
