import React from 'react';
import { classNames } from '../../utils';

interface TableIconProps {
	icon: JSX.Element;
	text: string | number;
	justify: string;
}

export const TableIcon: React.FC<TableIconProps> = ({ icon, text, justify }) => {
	justify = justify ?? 'center';
	justify = `justify-${justify}`;
	return (
		<div className={classNames('flex ml-4', justify)}>
			<div className='flex items-center'>
				<span>{icon}</span>
				<span className='ml-4 font-semibold text-left'>{text}</span>
			</div>
		</div>
	);
};

TableIcon.displayName = 'Icon';
(TableIcon as any).whyDidYouRender = false;
