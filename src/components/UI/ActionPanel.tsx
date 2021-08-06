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
						className='w-5/12 rounded-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-12 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm'
						onClick={() => {}}
					>
						Send
					</button>
					<button
						type='button'
						className='w-5/12 mt-3 rounded-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm'
						onClick={() => {}}
					>
						Receive
					</button>
				</div>
			</div>
		</div>
	);
};
