export const ActionPanel: React.FC = () => {
	return (
		<div className='bg-white rounded-3xl'>
			<div className='text-center p-2'>
				<h2 className='font-serif text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl'>
					<span className='block'>Lumerin</span>
				</h2>
				<div className='flex justify-around my-6'>
					<button
						type='button'
						className='btn-action-panel border-transparent shadow-sm px-12 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700'
						onClick={() => {}}
					>
						Send
					</button>
					<button
						type='button'
						className='btn-action-panel border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50'
						onClick={() => {}}
					>
						Receive
					</button>
				</div>
			</div>
		</div>
	);
};

ActionPanel.displayName = 'ActionPanel';
(ActionPanel as any).whyDidYouRender = false;
