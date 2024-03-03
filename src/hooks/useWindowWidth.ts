import { useEffect, useState } from 'react';

export const useWindowWidth = () => {
	const [width, setWidth] = useState<number>(window.innerWidth);

	useEffect(() => {
		function handleWindowSizeChange() {
			setWidth(window.innerWidth);
		}

		window.addEventListener('resize', handleWindowSizeChange);
		return () => {
			window.removeEventListener('resize', handleWindowSizeChange);
		};
	}, []);

	return width;
};
