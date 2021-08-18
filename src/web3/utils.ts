const ethereum: any = window.ethereum;

export const disconnectWallet: () => void = async () => {
	await ethereum.request({
		method: 'wallet_requestPermissions',
		params: [
			{
				eth_accounts: {},
			},
		],
	});
};
