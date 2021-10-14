const { colors } = require('./styles/styles.config');

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
				18: '1.125rem',
				50: '3.125rem',
			},
			colors,
			spacing: {
				50: '12.5rem',
			},
			borderRadius: {
				5: '5px',
				30: '30px',
				50: '50px',
				120: '120px',
				'50%': '50%',
			},
			padding: {
				18: '4.5rem',
			},
			height: {
				75: '75px',
			},
			width: {
				99: '99%',
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [require('@tailwindcss/forms')],
};
