import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import appCss from "~/styles/app.css?url";
import metadata from "../../metadata.json";
import { inject } from "@vercel/analytics";

export const Route = createRootRoute({
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
          <RootLayout>{props.children}</RootLayout>
          <TanStackRouterDevtools position="bottom-right" />
          <Scripts />
        </body>
      </html>
    </Providers>
  );
}

function Providers(props: React.PropsWithChildren) {
  return <>{props.children}</>;
}

function RootLayout(props: React.PropsWithChildren) {
  return <>{props.children}</>;
}
