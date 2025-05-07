import { FormButtonsWrapper } from "./Forms/FormButtons/Buttons.styled";

interface ButtonGroupProps {
  button1: JSX.Element;
  button2: JSX.Element;
}
export const ButtonGroup: React.FC<ButtonGroupProps> = ({ button1, button2 }) => {
  return (
    <FormButtonsWrapper>
      {button1}
      {button2}
    </FormButtonsWrapper>
  );
};

ButtonGroup.displayName = "ButtonGroup";
