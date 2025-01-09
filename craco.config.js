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
			}),
		]
	},
	babel:
		{
			presets: [["@babel/preset-env", { targets: "defaults" }]],
			plugins: [
				"@babel/plugin-proposal-nullish-coalescing-operator",
				"@babel/plugin-transform-numeric-separator",
				"@babel/plugin-transform-optional-chaining",
			]
		}
};
