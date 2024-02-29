const { CracoAliasPlugin, configPaths } = require('react-app-rewire-alias');
const webpack = require('webpack');
const version = require('./package.json').version;

module.exports = {
	plugins: [
		{
			plugin: CracoAliasPlugin,
			options: { alias: configPaths('./tsconfig.paths.json') },
		},
	],
	style: {
		postcss: {
			plugins: [require('tailwindcss'), require('autoprefixer')],
		},
	},
	webpack: {
		plugins: [
			new webpack.DefinePlugin({
				"process.env.REACT_APP_VERSION": JSON.stringify(version)
			})
		]
	}
};
