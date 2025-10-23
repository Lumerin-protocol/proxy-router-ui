import styled from "@mui/material/styles/styled";
import { PrimaryButton } from "../../Forms/FormButtons/Buttons.styled";

interface DetailedSpecsModalProps {
  closeForm: () => void;
}

export const DetailedSpecsModal = ({ closeForm }: DetailedSpecsModalProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-6">Contract Specifications</h2>

      <div className="space-y-4">
        <SpecItem>
          <SpecLabel>Contract Unit</SpecLabel>
          <SpecValue>100 TH per week</SpecValue>
        </SpecItem>

        <SpecItem>
          <SpecLabel>Price Quotation</SpecLabel>
          <SpecValue>U.S. dollars and cents per 100 TH per day</SpecValue>
        </SpecItem>

        <SpecItem>
          <SpecLabel>Tick Size</SpecLabel>
          <SpecValue>$0.01</SpecValue>
        </SpecItem>

        <SpecItem>
          <SpecLabel>Tick Value</SpecLabel>
          <SpecValue>$0.07</SpecValue>
        </SpecItem>
      </div>

      <div className="flex justify-end mt-8">
        <PrimaryButton onClick={closeForm}>Close</PrimaryButton>
      </div>
    </div>
  );
};

const SpecItem = styled("div")`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SpecLabel = styled("h3")`
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const SpecValue = styled("div")`
  font-size: 1rem;
  font-weight: 500;
  color: #22c55e;
  margin-bottom: 0.5rem;
`;

const SpecDescription = styled("p")`
  font-size: 0.875rem;
  color: #a7a9b6;
  line-height: 1.5;
`;
