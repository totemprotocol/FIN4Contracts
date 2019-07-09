import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { getContractData } from '../../components/ContractData';
import Box from '../../components/Box';
import Currency from '../../components/Currency';
import Modal from '../../components/Modal';
import ProofSubmission from './ProofSubmission';
import { Chip, Typography, Divider, Grid, Paper, createMuiTheme, Button } from '@material-ui/core';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import colors from '../../config/colors-config';
import DateIcon from '@material-ui/icons/AccessTime';
import moment from 'moment';
import styled from 'styled-components';
import ContractForm from '../../components/ContractForm';

class PreviousClaims extends Component {
	constructor(props, context) {
		super(props);

		this.state = {
			claims: [],
			actionTypeAddressForProofModal: '',
			claimIdForProofModal: ''
		};

		getContractData('Fin4Main', 'Fin4Main.json', 'getActionsWhereUserHasClaims', [], context.drizzle)
			.then(actionTypeAddresses => {
				// action types
				return actionTypeAddresses.map(actionTypeAddress => {
					return getContractData(actionTypeAddress, 'Fin4Token.json', 'getMyClaimIds', [], context.drizzle)
						.then(({ 1: tokenName, 2: tokenSymbol, 3: claimIds }) => {
							// claim ids per action type
							return claimIds.map(claimId => {
								return {
									claimId: claimId,
									actionTypeAddress: actionTypeAddress,
									tokenName: tokenName,
									tokenSymbol: tokenSymbol
								};
							});
						})
						.then(claims => {
							return claims.map(({ claimId, actionTypeAddress, tokenName, tokenSymbol }) => {
								return getContractData(
									actionTypeAddress,
									'Fin4Token.json',
									'getClaimInfo',
									[claimId],
									context.drizzle
								).then(({ 1: isApproved, 2: quantity, 3: date, 4: comment }) => {
									// claims per claim id per action type
									return {
										claimId: claimId,
										actionTypeAddress: actionTypeAddress,
										tokenName: tokenName,
										tokenSymbol: tokenSymbol,
										isApproved: isApproved,
										quantity: quantity,
										date: date,
										comment: comment
									};
								});
							});
						});
				});
			})
			.then(data => Promise.all(data))
			.then(data => data.flat())
			.then(data => Promise.all(data))
			.then(data => {
				data.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
				this.setState({ claims: data });
			});
	}

	isProofModalOpen = () => {
		return !!this.state.actionTypeAddressForProofModal && !!this.state.claimIdForProofModal;
	};

	closeProofModal = () => {
		this.setState({ actionTypeAddressForProofModal: '', claimIdForProofModal: '' });
	};

	render() {
		return (
			this.state.claims.length > 0 && (
				<>
					<Box title="My Previous Claims">
						{this.state.claims.map(
							({ claimId, actionTypeAddress, tokenName, tokenSymbol, isApproved, quantity, date, comment }) => {
								// crop last 3 digits (milliseconds) of date and apply human readable .calendar() function
								date = moment.unix(Number(date.substring(0, date.length - 3))).calendar();
								return (
									<Claim isApproved={isApproved} key={`${actionTypeAddress}${claimId}`}>
										<div>
											<Grid container alignItems="center">
												<Grid item xs>
													<Typography gutterBottom variant="h5">
														{tokenName}
													</Typography>
												</Grid>
												<Grid item>
													<Typography gutterBottom variant="h6">
														{quantity} <Currency>{tokenSymbol}</Currency>
													</Typography>
												</Grid>
											</Grid>
											{comment && (
												<Typography color="textSecondary" variant="body2">
													{comment}
												</Typography>
											)}
										</div>
										<Divider style={{ margin: '10px 0' }} variant="middle" />
										<ThemeProvider theme={chipTheme}>
											<Chip key="0" color="primary" icon={<DateIcon />} label={date} style={{ marginRight: '20px' }} />
											<Chip
												key="1"
												color={isApproved ? 'primary' : 'secondary'}
												component={isApproved ? 'span' : 'a'}
												clickable={!isApproved}
												onClick={() => {
													this.setState({
														actionTypeAddressForProofModal: actionTypeAddress,
														claimIdForProofModal: claimId
													});
												}}
												label={isApproved ? 'approved' : 'submit proof'}
											/>
											{isApproved ? (
												<ContractForm
													contractName="Fin4Main"
													method="mintToken"
													buttonLable="Claim token"
													fixArgs={{
														tokenAddress: actionTypeAddress,
														amount: quantity
													}}
												/>
											) : null}
										</ThemeProvider>
									</Claim>
								);
							}
						)}
					</Box>
					<Modal
						isOpen={this.isProofModalOpen()}
						handleClose={this.closeProofModal}
						title="Submit Proofs"
						width="450px">
						<ProofSubmission
							tokenAddress={this.state.actionTypeAddressForProofModal}
							claimId={this.state.claimIdForProofModal}
						/>
					</Modal>
				</>
			)
		);
	}
}

const chipTheme = createMuiTheme({
	palette: {
		primary: {
			main: colors.light,
			contrastText: colors.main
		},
		secondary: {
			main: 'rgba(248, 57, 48, 0.5)',
			contrastText: colors.light
		}
	}
});

const Claim = styled(Paper)`
	&& {
		box-sizing: border-box;
		margin: 15px 0;
		padding: 15px;
		background: ${props => (props.isApproved ? colors.true : colors.wrong)};
	}
`;

PreviousClaims.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts
	};
};

export default drizzleConnect(PreviousClaims, mapStateToProps);
