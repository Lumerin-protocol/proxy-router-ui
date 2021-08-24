module.exports = {
	purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			fontFamily: {
				Inter: ['Inter', 'sans-serif'],
			},
			colors: {
				'lumerin-gray': '#F2F5F9',
				'lumerin-dark-gray': '#DEE3EA',
				'lumerin-aqua': '#11B4BF',
				'lumerin-light-aqua': '#DBECED',
			},
			borderRadius: {
				'4xl': '50px',
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
