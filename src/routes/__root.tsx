/// <reference types="vite/client" />
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "~/styles/app.css?url";
import metadata from "../../metadata.json";

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
      { rel: "icon", href: `${metadata.browserIcon}?x7k9m2p4` },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: React.PropsWithChildren) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
