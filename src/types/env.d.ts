import type { Env } from "../../env.schema";

declare global {
  namespace NodeJS {
    // Override the entire ProcessEnv interface
    interface ProcessEnv extends Env {}
  }
}
