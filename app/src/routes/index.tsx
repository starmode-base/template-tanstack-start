import { createFileRoute } from "@tanstack/react-router";
import { SignOutButton, UserButton } from "@clerk/tanstack-react-start";
import { createServerFn } from "@tanstack/react-start";
import { ensureViewerMiddleware } from "~/lib/auth-middleware";
import { Splash } from "~/components/splash";

const authorizedSF = createServerFn({ method: "POST" })
  .middleware([ensureViewerMiddleware])
  .handler(() => {
    return "ok";
  });

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context }) => {
    // This is just to test that the middleware is working
    const authorized = await authorizedSF();
    console.log(authorized);

    return context.viewer;
  },
});

function Home() {
  const viewer = Route.useLoaderData();

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white p-4">
        <div>You are signed in as: {viewer?.email}</div>
        <div className="flex items-center gap-2">
          <UserButton />
          <SignOutButton>
            <button className="h-fit rounded bg-sky-500 px-4 py-1 text-white">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Splash />
      </div>
    </>
  );
}
