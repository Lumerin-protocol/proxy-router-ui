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
	webpack: {
		configure: (/** @type import("webpack").Configuration */ webpackConfig) => {
			webpackConfig.plugins.push(
				new webpack.DefinePlugin({
					"process.env.REACT_APP_VERSION": JSON.stringify(version)
				})
			);
			webpackConfig.plugins.push(
				new webpack.ProvidePlugin({
					Buffer: ['buffer', 'Buffer'],
				}),
			);
			webpackConfig.resolve.fallback = {
				...webpackConfig.resolve.fallback,
				"stream": require.resolve("stream-browserify"),
				"buffer": require.resolve("buffer/"),
				"http": require.resolve("stream-http"),
				"https": require.resolve("https-browserify"),
				"os": require.resolve("os-browserify/browser"),
				"assert": require.resolve("assert/"),
				"url": require.resolve("url/"),
			}

			return webpackConfig
		},
	}
};
