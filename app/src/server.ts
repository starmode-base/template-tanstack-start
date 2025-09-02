import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createClerkHandler } from "@clerk/tanstack-react-start/server";
import { createRouter } from "./router";

const handler = createStartHandler({
  createRouter,
});

const clerkHandler = createClerkHandler(handler);

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export default clerkHandler(defaultStreamHandler);
