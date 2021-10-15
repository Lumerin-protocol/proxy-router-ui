// String helpers
export enum AddressLength {
	SHORT,
	MEDIUM,
	LONG,
}
export const truncateAddress: (address: string, desiredLength?: AddressLength) => string = (address, desiredLength) => {
	let index;
	switch (desiredLength) {
		case AddressLength.SHORT:
			return `${address.substr(0, 5)}...`;
		case AddressLength.MEDIUM:
			index = 5;
			break;
		case AddressLength.LONG:
			index = 10;
			break;
		default:
			index = 10;
	}
	return `${address.substr(0, index)}...${address.substring(address.length - index, address.length)}`;
};

// Used to dynamically set classes for html elements
export const classNames: (...classes: string[]) => string = (...classes) => {
	return classes.filter(Boolean).join(' ');
};

// Error logging
export const printError: (message: string, stacktrace: string) => void = (message, stacktrace) => {
	console.log(`Error: ${message}, Stacktrace: ${stacktrace}`);
};

// Unit display helpers
enum DurationUnit {
	Hour = 'H',
	Day = 'D',
	Week = 'W',
}
export const getLengthDisplay: (length: number) => string = (length) => {
	// Test contract returning less than an hr so use multiplier
	// TODO: remove when contracts updated
	length = length * 10000;
	const secondsInHour = 3600;
	const secondsInDay = secondsInHour * 24;
	const secondsInWeek = secondsInDay * 7;
	const secondsInhour = 60;
	// Smallest unit to display is an hour since min contract duration is 1 hour
	const weeks = Math.floor(length / secondsInWeek);
	const days = Math.floor((length % secondsInWeek) / secondsInDay);
	const hours = Math.floor((length % secondsInDay) / secondsInHour);
	const seconds = Math.floor(length % secondsInHour);
	const hasRemainingSeconds = seconds > 0 ? '+' : '';
	if (weeks === 0) {
		if (days === 0) return `${hours}${DurationUnit.Hour}`;
		if (hours === 0) return `${days}${DurationUnit.Day}`;
		return `${days}${DurationUnit.Day} / ${hours}${DurationUnit.Hour}${hasRemainingSeconds}`;
	}
	return `${weeks}${DurationUnit.Week} / ${days}${DurationUnit.Day} / ${hours}${DurationUnit.Hour}${hasRemainingSeconds}`;
};
