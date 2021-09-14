// string helpers
export enum AddressLength {
	short,
	medium,
	long,
}
export const truncateAddress: (address: string, desiredLength?: AddressLength) => string = (address, desiredLength) => {
	let index;
	switch (desiredLength) {
		case AddressLength.short:
			return `${address.substr(0, 5)}...`;
		case AddressLength.medium:
			index = 5;
			break;
		case AddressLength.long:
			index = 10;
			break;
		default:
			index = 10;
	}
	return `${address.substr(0, index)}...${address.substring(address.length - index, address.length)}`;
};

// used to dynamically set classes for html elements
export const classNames: (...classes: string[]) => string = (...classes) => {
	return classes.filter(Boolean).join(' ');
};
