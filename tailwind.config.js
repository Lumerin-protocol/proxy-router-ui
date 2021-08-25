module.exports = {
	purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			fontFamily: {
				Inter: ['Inter', 'sans-serif'],
			},
			fontSize: {
				xs: '.8125rem',
			},
			colors: {
				'lumerin-gray': '#F2F5F9',
				'lumerin-dark-gray': '#DEE3EA',
				'lumerin-input-gray': '#EDEEF2',
				'lumerin-aqua': '#11B4BF',
				'lumerin-light-aqua': '#DBECED',
			},
			borderRadius: {
				30: '30px',
				50: '50px',
				120: '120px',
				'50%': '50%',
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [require('@tailwindcss/forms')],
};
