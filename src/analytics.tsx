import ReactGA from 'react-ga4';

export const purchasedHashrate = (totalHashrate: number) =>
	ReactGA.event({
		action: 'purchased_hashrate',
		category: 'Hashrate',
		value: totalHashrate,
	});
