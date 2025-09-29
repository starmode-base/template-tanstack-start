import { createFileRoute } from "@tanstack/react-router";
import { SignOutButton, UserButton } from "@clerk/tanstack-react-start";
import { createServerFn } from "@tanstack/react-start";
import { ensureViewerMiddleware } from "~/lib/auth";

const authorizedSF = createServerFn()
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
      <div className="flex flex-1">
        <div className="m-auto flex flex-col gap-2 pb-10 text-center">
          <div className="text-2xl font-semibold text-slate-900">
            TanStack Start template for apps
          </div>
          <div className="text-slate-600">
            A modern, full-stack React application starter
          </div>
          <div className="text-sm text-slate-500">
            Built with TanStack Router, Clerk Auth, and more
          </div>
          <div>
            <a
              href="https://github.com/starmode-base/template-tanstack-start"
              target="_blank"
              className="text-sky-500 underline hover:text-sky-600"
            >
              Get the template →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
