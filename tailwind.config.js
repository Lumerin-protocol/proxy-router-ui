module.exports = {
	purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			colors: {
				'titan-gray': '#EDEEF2',
				'titan-aqua': '#27C9D0',
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
