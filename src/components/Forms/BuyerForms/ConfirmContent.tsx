import type React from "react";
import type { FormData } from "../../../types/types";
import { ReviewItems } from "../Forms.styled";

interface ConfirmContentProps {
  data: FormData;
  validator?: string;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({
  data: { poolAddress, portNumber, username, speed, price, length },
  validator,
}) => {
  return (
    <ReviewItems>
      <div>
        <h3>Validator Address</h3>
        <p>{validator}</p>
      </div>
      <div>
        <h3>Pool Address</h3>
        <p>{poolAddress}</p>
      </div>
      {/* <div>
				<h3>Port Number</h3>
				<p>{portNumber}</p>
			</div> */}
      <div>
        <h3>Username</h3>
        <p>{username}</p>
      </div>
      {/* <div>
				<h3>Speed (TH/S)</h3>
				<p>{String(Number(speed) / 10 ** 12)}</p>
			</div>
			<div>
				<h3>Duration (HOURS)</h3>
				<p>{String(parseInt(length as string) / 3600)}</p>
			</div> */}
      {/* <div className='total-cost'>
				<h3>Total Cost</h3>
				<p className='price'>{price ? divideByDigits(parseInt(price)) : price} LMR</p>
			</div> */}
      {/* <div className='confirm-div'>
				<p>Use Titan Validator Service</p>
				<p>{withValidator ? 'Yes' : 'No'}</p>
			</div> */}
    </ReviewItems>
  );
};

ConfirmContent.displayName = "ConfirmContent";
