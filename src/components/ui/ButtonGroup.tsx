import { ButtonsWrapper } from './Forms/FormButtons/Buttons.styled';

interface ButtonGroupProps {
	button1: JSX.Element;
	button2: JSX.Element;
}
export const ButtonGroup: React.FC<ButtonGroupProps> = ({ button1, button2 }) => {
	return (
		<ButtonsWrapper>
			{button1}
			{button2}
		</ButtonsWrapper>
	);
};

ButtonGroup.displayName = 'ButtonGroup';
ButtonGroup.whyDidYouRender = false;
