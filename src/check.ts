// This function checks that the `config.json` file has all the expected properties.
// It displays a unique error message and returns `false` for any detected issues.
import { LaunchConfig } from "./types";
export function checkConfig(config: LaunchConfig) {
	if (!config) {
		return false;
	}

	if (!config.devchain) {
		console.error("⚠ Missing `devchain` object");
		return false;
	}

	if (!config.devchain.bin) {
		console.error("⚠ Missing `devchain.bin`");
		return false;
	}

	if (!config.devchain.chain) {
		console.error("⚠ Missing `devchain.chain`");
		return false;
	}

	if (config.devchain.nodes.length == 0) {
		console.error("⚠ No devchain nodes defined");
		return false;
	}

	for (const node of config.devchain.nodes) {
		if (node.flags && node.flags.constructor !== Array) {
			console.error("⚠ Relay chain flags should be an array.");
			return false;
		}
	}

	return true;
}
