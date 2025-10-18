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
import { createServerFn } from "@tanstack/react-start";
import { syncViewer } from "~/lib/auth";

const syncViewerSF = createServerFn().handler(() => syncViewer());

export const Route = createRootRoute({
  beforeLoad: async () => ({
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

function Providers(props: React.PropsWithChildren) {
  return <ClerkProvider>{props.children}</ClerkProvider>;
}

function Shell(props: React.PropsWithChildren) {
  return (
    <main className="flex h-dvh flex-col">
      <SignedIn>{props.children}</SignedIn>
      <SignedOut>
        <div className="m-auto flex flex-col rounded bg-white shadow">
          <div className="flex flex-col gap-2 p-4 text-center">
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
