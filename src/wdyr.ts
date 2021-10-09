/**
 * This enables the "Why Did You Render" tool in dev mode
 *
 * To enable this for a specific component add this to the bottom of the file:
 *  MyVeryCoolComponent.whyDidYouRender = true;
 */
/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react';

if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React, {
		// trackAllPureComponents: true,
		// trackHooks: true,
		// trackExtraHooks: ['useElementDimensions', 'useHttp', 'useHttpV2', 'useReactBridgeSubscription'],
		// logOnDifferentValues: true,
	});
}
