module.exports = {
	purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			fontFamily: {
				Inter: ['Inter', 'sans-serif'],
			},
			colors: {
				'lumerin-gray': '#EDEEF2',
				'lumerin-aqua': '#11B4BF',
				'lumerin-light-aqua': '#DBECED',
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
