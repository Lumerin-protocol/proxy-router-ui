const ethereum: any = window.ethereum;

export const registerEventListeners: (setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>) => void = (setAlertOpen) => {
	registerChainChangedListener();
	registerAccountsChangedListener(setAlertOpen);
};

/**********************************************************/
/* Handle chain (network) and chainChanged (per EIP-1193) */
/**********************************************************/
const handleChainChanged: (chainId: string) => void = (chainId) => {
	window.location.reload();
};
const registerChainChangedListener: () => void = async () => {
	ethereum.on('chainChanged', handleChainChanged);
};

/***********************************************************/
/* Handle user accounts and accountsChanged (per EIP-1193) */
/***********************************************************/
const registerAccountsChangedListener: (setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>) => void = (setAlertOpen) => {
	const showAlertModal = setAlertOpen;
	const handleAccountsChanged: (accounts: string[]) => void = (accounts) => {
		if (accounts.length === 0 || accounts[0] === '') {
			// MetaMask is locked or the user has not connected any accounts
			showAlertModal(true);
		}
	};
	// Note that this event is emitted on page load.
	// If the array of accounts is non-empty, you're already
	// connected.
	ethereum.on('accountsChanged', handleAccountsChanged);
};
