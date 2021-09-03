import React from 'react';
import { classNames } from '../../utils';

interface TableIconProps {
	icon: JSX.Element;
	text: string | number;
	justify: string;
	hasLink?: boolean;
}

export const TableIcon: React.FC<TableIconProps> = ({ icon, text, justify, hasLink }) => {
	justify = justify ?? 'center';
	justify = `justify-${justify}`;
	return (
		<div className={classNames('flex ml-4', justify)}>
			<div className='flex items-center'>
				<span>{icon}</span>
				<span className='ml-4 font-semibold text-left'>
					{hasLink ? (
						<a href={`https://etherscan.io/address/${text}`} target='_blank' rel='noreferrer'>
							{text}
						</a>
					) : (
						text
					)}
				</span>
			</div>
		</div>
	);
};

TableIcon.displayName = 'Icon';
TableIcon.whyDidYouRender = false;
