import React from "react";

if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = await import("@welldone-software/why-did-you-render").then((m) => m.default);
  whyDidYouRender(React, {
    // trackAllPureComponents: true,
    trackHooks: true,
    trackAllPureComponents: true,
    logOnDifferentValues: true,
  });
}
