import { WalletText } from '../components/Main';
const ethereum: any = window.ethereum;

export const registerEventListeners: (
	setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>,
	setWalletText: React.Dispatch<React.SetStateAction<string>>
) => void = (setAlertOpen, setWalletText) => {
	registerChainChangedListener();
	registerAccountsChangedListener(setAlertOpen, setWalletText);
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
const registerAccountsChangedListener: (
	setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>,
	setWalletText: React.Dispatch<React.SetStateAction<string>>
) => void = (setAlertOpen, setWalletText) => {
	const showAlertModal = setAlertOpen;
	const handleAccountsChanged: (accounts: string[], setWalletText: React.Dispatch<React.SetStateAction<string>>) => void = (
		accounts,
		setWalletText
	) => {
		if (accounts.length === 0 || accounts[0] === '') {
			// MetaMask is locked or the user has not connected any accounts
			showAlertModal(true);
		} else {
			setWalletText(WalletText.Disconnect);
		}
	};
	// Note that this event is emitted on page load.
	// If the array of accounts is non-empty, you're already
	// connected.
	ethereum.on('accountsChanged', (accounts: string[]) => handleAccountsChanged(accounts, setWalletText));
};
