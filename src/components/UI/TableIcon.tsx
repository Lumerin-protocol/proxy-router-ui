import React from 'react';

interface TableIconProps {
	icon: JSX.Element;
	text: string | number;
}

export const TableIcon: React.FC<TableIconProps> = ({ icon, text }) => {
	return (
		<div className='flex justify-center'>
			<div className='flex'>
				<span>{icon}</span>
				<span className='ml-4'>{text}</span>
			</div>
		</div>
	);
};

TableIcon.displayName = 'Icon';
(TableIcon as any).whyDidYouRender = false;
