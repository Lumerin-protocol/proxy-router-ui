import React from 'react';
import { classNames } from '../../utils';

interface TableIconProps {
	icon: JSX.Element | null;
	text: string | number;
	justify: string;
	hasLink?: boolean;
}

export const TableIcon: React.FC<TableIconProps> = ({ icon, text, justify, hasLink }) => {
	let updatedJustify = justify ?? 'center';
	updatedJustify = `justify-${updatedJustify}`;

	return (
		<div className={classNames('flex', updatedJustify)}>
			<div className='flex items-center'>
				<span className={icon ? 'mr-2' : ''}>{icon}</span>
				<span className='font-semibold text-left'>
					{hasLink ? (
						<a href={`https://etherscan.io/address/${text}`} target='_blank' rel='noreferrer' className='cursor-pointer'>
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
