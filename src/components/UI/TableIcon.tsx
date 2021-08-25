import React from 'react';

interface TableIconProps {
	icon: JSX.Element;
	text: string | number;
}

export const TableIcon: React.FC<TableIconProps> = ({ icon, text }) => {
	return (
		<div className='flex justify-center items-center'>
			<div className='flex items-center'>
				<span>{icon}</span>
				<span className='ml-4 font-semibold'>{text}</span>
			</div>
		</div>
	);
};

TableIcon.displayName = 'Icon';
(TableIcon as any).whyDidYouRender = false;
