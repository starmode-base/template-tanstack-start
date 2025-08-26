import {
  createStartHandler,
  defineHandlerCallback,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createRouter } from "./router";
import { createClerkHandler } from "@clerk/tanstack-react-start/server";

// https://github.com/clerk/javascript/blob/main/packages/tanstack-react-start/CHANGELOG.md#clerktanstack-react-start
const handlerFactory = createClerkHandler(
  createStartHandler({
    createRouter,
  }),
);

export default defineHandlerCallback(async (event) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const startHandler = await handlerFactory(defaultStreamHandler); // awaited
  return startHandler(event);
});
