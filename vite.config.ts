import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";
import { type Env, EnvSchema } from "./env.schema";
import { version } from "./package.json";
import { newAjv } from "./validator";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

const envsToInject = Object.keys(EnvSchema.properties);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  env.REACT_APP_VERSION = version;

  const ajv = newAjv();
  const validate = ajv.compile(EnvSchema);

  if (!validate(env)) {
    throw new Error(
      `Invalid environment variables: ${ajv.errorsText(validate.errors, {
        dataVar: "ENV",
        separator: ".",
      })}`,
    );
  }

  // TODO: migrate to import.meta.env
  // Temporary hack to support process.env way to get env variables

  // Simply injecting our env variables for each occurence of process.env
  // doesn't work because it overwrites existing process.env variables
  // and screws the electron dev mode
  //
  // define: {
  //   'process.env': JSON.stringify(env) // don't do it
  // }
  //
  // so we need to define them in a way that they are merged with the existing process.env

  const processEnvDefineMap: Record<string, string> = {};

  for (const key of envsToInject) {
    processEnvDefineMap[`process.env.${key}`] = JSON.stringify(env[key]);
  }

  return {
    plugins: [
      react({
        // jsxImportSource: "@emotion/react",
        jsxImportSource: "@welldone-software/why-did-you-render",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      svgr(),
      tailwindcss(),
    ],
    build: {
      outDir: "build", // CRA's default build output
    },
    define: processEnvDefineMap,
  };
});
