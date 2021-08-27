// string helpers
export const truncateAddress: (address: string, isLongString?: boolean) => string = (address, isLongString) => {
	const index = isLongString ? 10 : 5;
	return `${address.substr(0, index)}...${address.substring(address.length - index, address.length - 1)}`;
};

export const classNames = (...classes: string[]) => {
	return classes.filter(Boolean).join(' ');
};
