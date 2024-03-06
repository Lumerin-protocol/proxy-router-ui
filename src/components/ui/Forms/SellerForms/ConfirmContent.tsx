import React from 'react';
import { AddressLength, InputValuesCreateForm } from '../../../../types';
import { truncateAddress } from '../../../../utils';
import { ReviewItems } from '../Forms.styled';

interface ConfirmContentProps {
	data: InputValuesCreateForm;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({
	data: { walletAddress, contractTime, speed, listPrice },
}) => {
	return (
		<ReviewItems>
			<div>
				<h3>Wallet Address</h3>
				<p>{truncateAddress(walletAddress as string, AddressLength.MEDIUM)}</p>
			</div>
			<div>
				<h3>Contract Time</h3>
				<p>
					{contractTime} {contractTime && contractTime < 12 ? 'minutes' : 'hours'}{' '}
				</p>
			</div>
			<div>
				<h3>Speed</h3>
				<p>{speed} TH/S</p>
			</div>
			<div>
				<h3>List Price</h3>
				<p>{listPrice} LMR</p>
			</div>
		</ReviewItems>
	);
};
