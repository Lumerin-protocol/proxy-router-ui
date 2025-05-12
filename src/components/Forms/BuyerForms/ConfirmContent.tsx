import type React from "react";
import type { FormData } from "../../../types/types";
import { ReviewItems } from "../Forms.styled";

interface ConfirmContentProps {
  data: FormData;
  validator?: string;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({
  data: { poolAddress, username, lightningAddress },
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
      {username && (
        <div>
          <h3>Username</h3>
          <p>{username}</p>
        </div>
      )}
      {lightningAddress && (
        <div>
          <h3>Lightning Address</h3>
          <p>{lightningAddress}</p>
        </div>
      )}
    </ReviewItems>
  );
};
