import React, { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ReviewContent } from './ReviewContent';
import { ConfirmContent } from './ConfirmContent';
import { CompletedContent } from './CompletedContent';
import {
	getButton,
	truncateAddress,
	getValidatorPublicKey,
	getPoolRfc2396,
	getValidatorURL,
} from '../../../../utils';
import {
	AddressLength,
	AlertMessage,
	ContentState,
	FormData,
	HashRentalContract,
	InputValuesBuyForm,
	PathName,
} from '../../../../types';
import { Alert } from '../../Alert';
import { buttonText } from '../../../../shared';
import { divideByDigits } from '../../../../web3/helpers';
import { FormButtonsWrapper, SecondaryButton } from '../FormButtons/Buttons.styled';
import { purchasedHashrate } from '../../../../analytics';
import { ContractLink } from '../../Modal.styled';
import { Alert as AlertMUI } from '@mui/material';
import { useHistory } from 'react-router';
import { usePurchaseContract } from '../../../../gateway/hooks';

// Used to set initial state for contentData to prevent undefined error
const initialFormData: FormData = {
	poolAddress: '',
	validatorAddress: '',
	portNumber: '',
	username: '',
	password: '',
	speed: '',
	price: '',
};

interface BuyFormProps {
	contract: HashRentalContract;
	userAccount: string;
	lumerinbalance: number | null;
	onClose: () => void;
	onPurchase: () => void;
}

export const BuyForm: React.FC<BuyFormProps> = ({
	contract,
	lumerinbalance,
	onClose,
	onPurchase,
}) => {
	const [contentState, setContentState] = useState<ContentState>(ContentState.Review);
	const [formData, setFormData] = useState<FormData>(initialFormData);
	const [totalHashrate, setTotalHashrate] = useState<number>();
	const [purchasedTx, setPurchasedTx] = useState<string>('');
	const [usedLightningPayoutsFlow, setUsedLightningPayoutsFlow] = useState<boolean>(false);
	const history = useHistory();
	const form = useForm<InputValuesBuyForm>({ mode: 'onBlur', reValidateMode: 'onBlur' });

	const purchaseAction = usePurchaseContract({
		contractAddress: contract.id,
		price: BigInt(contract.price),
		validatorPublicKey: getValidatorPublicKey()!,
		validatorURL: `stratum+tcp://:@${getValidatorURL()}`,
		destURL: getPoolRfc2396(formData)!,
		termsVersion: Number(contract.version),
	});

	useEffect(() => {
		if (purchaseAction.purchaseTx.isSuccess) {
			// Successfully purchased contract
			localStorage.setItem(
				contract.id,
				JSON.stringify({ poolAddress: formData.poolAddress, username: formData.username })
			);
			setPurchasedTx(purchaseAction.purchaseTx.data!);
			purchasedHashrate(totalHashrate!);
			setContentState(ContentState.Complete);
			onPurchase();
		}
	}, [purchaseAction.purchaseTxReceipt.isSuccess]);

	useEffect(() => {
		if (purchaseAction.approveTx.isError || purchaseAction.purchaseTx.isError) {
			console.error(
				'Error in purchaseAction',
				purchaseAction.approveTx.error,
				purchaseAction.purchaseTx.error
			);
			setContentState(ContentState.Review);
		}
	}, [purchaseAction.approveTx.isError, purchaseAction.purchaseTx.isError]);

	const buyContract = async (data: InputValuesBuyForm): Promise<void> => {
		if (contentState === ContentState.Review) {
			setFormData({
				poolAddress: data.poolAddress,
				portNumber: data.portNumber,
				username: data.username,
				password: data.password,
				speed: contract.speed as string,
				price: contract.price as string,
				length: contract.length as string,
				// version: contract.version as string,
			});
			setTotalHashrate(Number(contract.speed) * Number(contract.length));
			setContentState(ContentState.Confirm);
		}

		if (contentState === ContentState.Confirm) {
			setContentState(ContentState.Pending);
			purchaseAction.execute();
			console.log('purchasing');
		}
	};

	const getButtonText = () => {
		switch (contentState) {
			case ContentState.Confirm:
				return buttonText.confirm;
			case ContentState.Pending:
			case ContentState.Complete:
				return buttonText.completed;
			default:
				return buttonText.review;
		}
	};

	const renderContent = () => {
		switch (contentState) {
			case ContentState.Confirm:
				return <ConfirmContent data={formData} />;
			case ContentState.Pending:
			case ContentState.Complete:
				return (
					<CompletedContent
						contentState={contentState}
						tx={purchasedTx}
						useLightningPayouts={usedLightningPayoutsFlow}
					/>
				);
			default:
				return (
					<ReviewContent
						register={form.register}
						errors={form.formState.errors}
						setValue={form.setValue}
						setFormData={setFormData}
						inputData={formData}
						onUseLightningPayoutsFlow={(e) => {
							setUsedLightningPayoutsFlow(e);
							form.trigger('poolAddress');
							form.clearErrors();
						}}
						clearErrors={form.clearErrors}
					/>
				);
		}
	};

	function getAlertMsg(): AlertMessage {
		if (purchaseAction.approveTx.isError) {
			return AlertMessage.IncreaseAllowanceFailed;
		}
		if (purchaseAction.purchaseTx.isError) {
			if (
				purchaseAction.purchaseTx.error?.message.includes('contract is not in an available state')
			) {
				return AlertMessage.ContractIsPurchased;
			} else {
				return AlertMessage.PurchaseFailed;
			}
		}
		if (
			contentState === ContentState.Confirm &&
			lumerinbalance !== null &&
			lumerinbalance < divideByDigits(Number(contract.price))
		) {
			return AlertMessage.InsufficientBalance;
		}

		return AlertMessage.Hide;
	}

	// Set styles and button based on ContentState
	const isPendingOrComplete = ![ContentState.Pending, ContentState.Complete].includes(contentState);

	return (
		<Fragment>
			<Alert
				message={getAlertMsg()}
				isOpen={getAlertMsg() !== AlertMessage.Hide}
				onClose={() => {
					purchaseAction.reset();
					setContentState(ContentState.Review);
				}}
			/>
			{isPendingOrComplete && (
				<>
					<h2>Purchase Hashpower</h2>
					<p className='font-normal mb-3'>
						Enter the Pool Address, Port Number, and Username you are pointing the purchased
						hashpower to.
					</p>
					<ContractLink
						href={`${process.env.REACT_APP_ETHERSCAN_URL}${contract.id as string}`}
						target='_blank'
						rel='noreferrer'
					>
						Contract Address: {truncateAddress(contract.id as string, AddressLength.MEDIUM)}
					</ContractLink>
				</>
			)}
			{contentState === ContentState.Confirm && (
				<AlertMUI severity='warning' sx={{ margin: '3px 0' }}>
					Thank you for choosing the Lumerin Hashpower Marketplace. Click "Confirm Order" below. You
					will be prompted to approve a transaction through your wallet. Stand by for a second
					transaction. Once both transactions are confirmed, you will be redirected to view your
					orders.
				</AlertMUI>
			)}

			{renderContent()}

			<FormButtonsWrapper>
				<SecondaryButton type='submit' onClick={onClose}>
					Close
				</SecondaryButton>
				{contentState !== ContentState.Pending &&
					getButton(
						contentState,
						getButtonText(),
						() => {
							onClose();
							history.push(PathName.MyOrders);
						},
						() => buyContract(formData),
						!form.formState.isValid
					)}
			</FormButtonsWrapper>
		</Fragment>
	);
};
