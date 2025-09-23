import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import appCss from "~/styles/app.css?url";
import metadata from "../../metadata.json";
import { inject } from "@vercel/analytics";
import { ClerkProvider } from "@clerk/tanstack-react-start";
import { createServerFn } from "@tanstack/react-start";
import { syncViewer } from "~/middleware/auth-viewer";

const authStateFn = createServerFn({ method: "GET" }).handler(() => {
  return syncViewer();
});

export const Route = createRootRoute({
  beforeLoad: async () => ({
    viewer: await authStateFn(),
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
      { rel: "icon", href: metadata.browserIcon, type: "image/svg+xml" },
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
  return <>{props.children}</>;
}
