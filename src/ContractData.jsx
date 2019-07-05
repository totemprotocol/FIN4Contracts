// heavily adapted from https://github.com/trufflesuite/drizzle-react-components/blob/develop/src/ContractData.js

import { drizzleConnect } from 'drizzle-react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Web3 from 'web3';

class ContractData extends Component {
	constructor(props, context) {
		super(props);

		var methodArgs = this.props.methodArgs ? this.props.methodArgs : [];
		this.contracts = context.drizzle.contracts;

		if (this.props.contractAddress) {
			const web3 = new Web3(window.web3.currentProvider);

			var contractJson = 'Fin4Token.json';
			if (this.props.contractJson) {
				contractJson = this.props.contractJson;
			}

			var tokenJson = require('./build/contracts/' + contractJson);

			// needs time and has no callback -> timout below
			context.drizzle.addContract({
				contractName: this.props.contractAddress,
				web3Contract: new web3.eth.Contract(tokenJson.abi, this.props.contractAddress)
			});

			this.contractIdentifier = this.props.contractAddress;
		} else {
			this.contractIdentifier = this.props.contractName;
		}

		this.state = {
			dataKey: undefined
		};

		// conditional timout if addContract was called above
		var setDataKey = setInterval(() => {
			if (this.props.contractName) {
				clearInterval(setDataKey);
			}
			try {
				this.setState({
					dataKey: this.contracts[this.contractIdentifier].methods[this.props.method].cacheCall(...methodArgs)
				});
				clearInterval(setDataKey);
			} catch (e) {}
		}, 10);
	}

	componentWillReceiveProps(nextProps) {
		const { methodArgs, contractName, method } = this.props;

		const didContractChange = contractName !== nextProps.contractName;
		const didMethodChange = method !== nextProps.method;
		const didArgsChange = JSON.stringify(methodArgs) !== JSON.stringify(nextProps.methodArgs);

		if (didContractChange || didMethodChange || didArgsChange) {
			this.setState({
				dataKey: this.contracts[contractName].methods[method].cacheCall(...methodArgs)
			});
		}
	}

	render() {
		// Contract is not yet intialized.
		if (
			this.state.dataKey === undefined ||
			!this.contracts[this.contractIdentifier] ||
			!this.props.contracts[this.contractIdentifier].initialized
		) {
			// console.log('Initializing...');
			return <></>;
		}

		// If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
		if (!(this.state.dataKey in this.props.contracts[this.contractIdentifier][this.props.method])) {
			// console.log('Fetching...');
			return <></>;
		}

		var displayData = this.props.contracts[this.contractIdentifier][this.props.method][this.state.dataKey].value;

		if (this.props.callback) {
			if (this.props.callbackArgs) {
				return this.props.callback(displayData, this.props.callbackArgs);
			}
			return this.props.callback(displayData);
		}

		return displayData;
	}
}

ContractData.contextTypes = {
	drizzle: PropTypes.object
};

ContractData.propTypes = {
	contracts: PropTypes.object.isRequired,
	contractName: PropTypes.string,
	contractAddress: PropTypes.string,
	method: PropTypes.string.isRequired,
	methodArgs: PropTypes.array,
	callback: PropTypes.func,
	callbackArgs: PropTypes.array
};

/*
 * Export connected component.
 */

const mapStateToProps = state => {
	return {
		contracts: state.contracts
	};
};

const getContractData = (contract, method, methodArgs, drizzle) => {
	// add contract if not yet added
	if (!Object.keys(drizzle.contracts).includes(contract)) {
		console.log(`adding contract ${contract}`);
		const tokenJson = require('./build/contracts/Fin4Token.json');
		const web3 = new Web3(window.web3.currentProvider);
		drizzle.addContract({
			contractName: contract,
			web3Contract: new web3.eth.Contract(tokenJson.abi, contract)
		});
	}
	return new Promise((resolve, reject) => {
		// addContract() needs time and has no callback -> try every 1ms until successful
		var tryAgain = setInterval(() => {
			if (Object.keys(drizzle.contracts).includes(contract)) {
				console.log(`found contract ${contract}`);
				clearInterval(tryAgain);
				// apply method
				resolve(drizzle.contracts[contract].methods[method](...methodArgs).call());
			} else {
				console.log(`trying to find contract ${contract}`);
			}
		}, 1);
	});
};

export default drizzleConnect(ContractData, mapStateToProps);

export { getContractData };
