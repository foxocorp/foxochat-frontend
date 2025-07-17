declare module "@fontsource/inter";

declare module "*.svg?react" {
  import { ComponentType } from "preact";
  const content: ComponentType<{ className?: string; style?: any }>;
  export default content;
}

declare const __GIT_BRANCH__: string;
declare const __GIT_REVISION__: string;
declare const __GIT_COMMIT_COUNT__: string;