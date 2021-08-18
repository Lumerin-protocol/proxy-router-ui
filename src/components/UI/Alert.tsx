import { XCircleIcon } from '@heroicons/react/solid';

interface AlertProps {
	message: string;
}

export const Alert: React.FC<AlertProps> = ({ message }) => {
	return (
		<div className='rounded-md bg-red-50 p-4'>
			<div className='flex'>
				<div className='flex-shrink-0'>
					<XCircleIcon className='h-5 w-5 text-red-400' aria-hidden='true' />
				</div>
				<div className='ml-3'>
					<h3 className='text-sm font-medium text-red-800'>{message}</h3>
				</div>
			</div>
		</div>
	);
};

Alert.displayName = 'Alert';
(Alert as any).whyDidYouRender = false;
