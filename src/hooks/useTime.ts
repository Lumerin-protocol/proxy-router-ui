import { useEffect, useState } from 'react';

// Returns the current time and queues re-renders every `refreshCycle` milliseconds
export const useTime = (refreshCycleMs = 1000) => {
	const [now, setNow] = useState(getTime());

	useEffect(() => {
		const intervalId = setInterval(() => setNow(getTime()), refreshCycleMs);

		return () => clearInterval(intervalId);
	}, [refreshCycleMs, setNow]);

	return now;
};

const getTime = () => new Date();
