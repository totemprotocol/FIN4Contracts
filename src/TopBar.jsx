import React from 'react';
import colors from './config/colors-config';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import { useTranslation } from 'react-i18next';
import { drizzleConnect } from 'drizzle-react';

const useStyles = makeStyles(theme => ({
	bar: {
		background: colors.main,
		marginBottom: 20,
		'padding-top': 15,
		'padding-bottom': 15,
		'font-size': 'large',
		'font-family': 'arial'
	},
	headerImage: {
		maxHeight: 50,
		width: 300,
		margin: '10px auto'
	},
	flags: {
		'font-family': 'arial',
		'font-size': 'small',
		'text-align': 'right',
		'padding-right': '20px'
	},
	lngLink: {
		'text-decoration': 'none'
	},
	activeLng: {
		'font-weight': 'bold'
	},
	logoText: {
		'text-decoration': 'none',
		color: 'white'
	},
	noWeb3Warning: {
		color: 'yellow',
		'font-family': 'arial'
	}
}));

function TopBar(props) {
	const { t, i18n } = useTranslation();
	const classes = useStyles();

	const langIsEN = () => {
		return i18n.language === 'en';
	};

	return (
		<AppBar position="static" className={classes.bar}>
			<center>
				<a className={classes.logoText} href="/">
					FIN4Xplorer
				</a>
			</center>
			<div className={classes.flags}>
				<a
					className={`${classes.lngLink} ${langIsEN() ? classes.activeLng : ''}`}
					href="#"
					onClick={() => {
						let lng = i18n.language;
						i18n.changeLanguage('en', () => {
							console.log('Language changed: from ' + lng + ' to en');
						});
					}}>
					EN
				</a>
				{' / '}
				<a
					className={`${classes.lngLink} ${!langIsEN() ? classes.activeLng : ''}`}
					href="#"
					onClick={() => {
						let lng = i18n.language;
						i18n.changeLanguage('de', () => {
							console.log('Language changed: from ' + lng + ' to de');
						});
					}}>
					DE
				</a>
			</div>
			{props.defaultAccount === null && (
				<center className={classes.noWeb3Warning}>
					<div className={classes.activeLng}>
						Not connected to the Ethereum Rinkeby network. Is MetaMask installed and connected?
					</div>
					<div>
						Get the{' '}
						<a className={classes.noWeb3Warning} href="https://metamask.io/">
							MetaMask extension
						</a>{' '}
						for your desktop browser or try
						<br />{' '}
						<a className={classes.noWeb3Warning} href="https://link.medium.com/zdWtIl7Pq0">
							MetaMask Mobile
						</a>{' '}
						or{' '}
						<a className={classes.noWeb3Warning} href="https://status.im/get/">
							Status
						</a>{' '}
						on your mobile phone. Need help{' '}
						<a
							className={classes.noWeb3Warning}
							href={
								langIsEN()
									? 'https://fin4xplorer.readthedocs.io/en/latest'
									: 'https://fin4xplorer.readthedocs.io/de/latest/'
							}
							target="_blank">
							getting started
						</a>
						?
					</div>
				</center>
			)}
		</AppBar>
	);
}
// <a href="/"><img src="/header.png" alt="header of finfoo" className={classes.headerImage} />

const mapStateToProps = state => {
	return {
		defaultAccount: state.fin4Store.defaultAccount
	};
};

export default drizzleConnect(TopBar, mapStateToProps);
