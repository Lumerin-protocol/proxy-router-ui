// string helpers
export const truncateAddress: (address: string) => string = (address) => {
	return `${address.substr(0, 5)}...${address.substring(address.length - 5, address.length - 1)}`;
};

export const classNames = (...classes: string[]) => {
	return classes.filter(Boolean).join(' ');
};
