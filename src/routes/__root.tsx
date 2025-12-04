import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import appCss from "~/styles/app.css?url";
import metadata from "../../metadata.json";
import { inject } from "@vercel/analytics";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/tanstack-react-start";
import { syncViewerSF } from "~/server-functions/sync-viewer";
import { Splash } from "~/components/splash";

/**
 * Route
 */
export const Route = createRootRoute({
  beforeLoad: async () => ({
    // Ensure the viewer is synced from Clerk to the database. This also makes
    // the viewer available as context in the loader of descendant routes.
    viewer: await syncViewerSF(),
  }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: metadata.name },
      { name: "description", content: metadata.description },
      { name: "og:title", content: metadata.name },
      { name: "og:description", content: metadata.description },
      { name: "og:image", content: metadata.shareCardImage },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: metadata.browserIcon },
    ],
  }),
  shellComponent: RootDocument,
});

/**
 * Root document
 */
function RootDocument(props: React.PropsWithChildren) {
  // https://vercel.com/docs/analytics/quickstart
  inject();

  return (
    <Providers>
      <html>
        <head>
          <HeadContent />
        </head>
        <body>
          <Shell>{props.children}</Shell>
          <div className="print:hidden">
            <TanStackRouterDevtools position="bottom-right" />
          </div>
          <Scripts />
        </body>
      </html>
    </Providers>
  );
}

/**
 * Providers
 */
function Providers(props: React.PropsWithChildren) {
  return <ClerkProvider>{props.children}</ClerkProvider>;
}

/**
 * Shell
 */
function Shell(props: React.PropsWithChildren) {
  return (
    <main className="flex h-dvh flex-col text-slate-900">
      <SignedIn>{props.children}</SignedIn>
      <SignedOut>
        <div className="m-auto flex flex-col rounded bg-white shadow">
          <div className="p-10">
            <Splash />
          </div>
          <div className="flex gap-2 bg-slate-100 p-4">
            <SignInButton mode="modal">
              <button className="rounded bg-sky-500 px-4 py-1 text-white">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded bg-sky-500 px-4 py-1 text-white">
                Sign up
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
    </main>
  );
}
