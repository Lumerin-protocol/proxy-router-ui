interface ButtonGroupProps {
	button1: JSX.Element;
	button2: JSX.Element;
}
export const ButtonGroup: React.FC<ButtonGroupProps> = ({ button1, button2 }) => {
	return (
		<span className='flex flex-col gap-1 lg:pr-8 bg-white text-sm font-medium text-gray-700'>
			{button1}
			{button2}
		</span>
	);
};

ButtonGroup.displayName = 'ButtonGroup';
ButtonGroup.whyDidYouRender = false;
