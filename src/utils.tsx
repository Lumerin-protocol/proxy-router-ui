import { ProgressBar } from './components/ui/ProgressBar';
import { AddressLength, ContractState, StatusText } from './types';
import _ from 'lodash';

// STRING HELPERS
// Get address based on desired length
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

// HTML HELPERS
// Dynamically set classes for html elements
export const classNames: (...classes: string[]) => string = (...classes) => {
	return classes.filter(Boolean).join(' ');
};

// Media query change handler
export const setMediaQueryListOnChangeHandler: (
	mediaQueryList: MediaQueryList,
	isLargeBreakpointOrGreater: boolean,
	setIsLargeBreakpointOrGreater: React.Dispatch<React.SetStateAction<boolean>>
) => void = (mediaQueryList, isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater) => {
	function mediaQueryListOnChangeHandler(this: MediaQueryList, event: MediaQueryListEvent): any {
		if (this.matches && !isLargeBreakpointOrGreater) {
			setIsLargeBreakpointOrGreater(true);
		} else if (isLargeBreakpointOrGreater) {
			setIsLargeBreakpointOrGreater(false);
		}
	}
	if (mediaQueryList) mediaQueryList.onchange = mediaQueryListOnChangeHandler;
};

// TABLE HELPERS
// Get contract duration in days
export const getLengthDisplay: (length: number) => string = (length) => {
	const secondsInHour = 3600;
	const secondsInDay = secondsInHour * 24;

	const days = (length / secondsInDay).toFixed(2);

	return days;

	// return days === '1.00' ? '1 day' : `${days} days`;
};

// Display status of contracts
export const getStatusText: (state: string) => string = (state) => {
	switch (state) {
		case ContractState.Available:
			return StatusText.Available;
		case ContractState.Active:
			return StatusText.Active;
		case ContractState.Running:
			return StatusText.Running;
		case ContractState.Complete:
			return StatusText.Complete;
		default:
			return StatusText.Complete;
	}
};

// Display address based on breakpoint
export const getAddressDisplay: (isLargeBreakpointOrGreater: boolean, address: string) => string = (isLargeBreakpointOrGreater, address) => {
	return isLargeBreakpointOrGreater ? truncateAddress(address) : truncateAddress(address, AddressLength.SHORT);
};

// Get progress div
export const getProgressDiv: (startTime: string, length: number, currentBlockTimestamp: number) => JSX.Element = (
	startTime,
	length,
	currentBlockTimestamp
) => {
	let timeElapsed: number = 0;
	let percentage: number = 0;
	if (length === 0 || currentBlockTimestamp === 0) {
		percentage = 100;
	} else {
		timeElapsed = (currentBlockTimestamp as number) - parseInt(startTime);
		percentage = (timeElapsed / length) * 100;
		percentage = percentage > 100 ? 100 : percentage;
	}

	return (
		<div className='flex items-baseline'>
			<div>{percentage.toFixed()}%</div>
			<div className='w-1/2 ml-4'>
				<ProgressBar width={percentage.toString()} />
			</div>
		</div>
	);
};

// Get status div
export const getStatusDiv: (state: string) => JSX.Element = (state) => {
	return (
		<div>
			<span
				className={classNames(
					state === ContractState.Running ? 'w-24 bg-lumerin-green text-white' : 'w-24 bg-lumerin-dark-gray text-black',
					'flex justify-center items-center h-8 rounded-5'
				)}
			>
				<p>{_.capitalize(getStatusText(state))}</p>
			</span>
		</div>
	);
};

// ERROR LOGGING
// Print error message and stacktrace
export const printError: (message: string, stacktrace: string) => void = (message, stacktrace) => {
	console.log(`Error: ${message}, Stacktrace: ${stacktrace}`);
};
