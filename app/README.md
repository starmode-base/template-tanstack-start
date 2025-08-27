# New dawn app

https://template-tanstack-start-app.vercel.app/

## Contributing

### Prerequisites

1. Install [Node.js](https://nodejs.org/) (v22.x)
1. Install [Bun](https://bun.sh/)
1. Clone the [git repo](https://github.com/starmode-base/new-dawn-app)
1. Install dependencies: `bun install`
1. Link the Vercel project, to be able to pull development environment variables from Vercel: `bunx vercel link`
   - Set up “~/starmode-base/new-dawn-app? yes
   - Which scope should contain your project? STAR MODE
   - Found project “starmode/new-dawn-app”. Link to it? yes

### Local development

1. Pull development environment variables from Vercel: `bun env:pull`
1. Start the app in development mode: `bun dev`

To install dependencies:

```sh
bun install
```

## Devops

- [Clerk](https://dashboard.clerk.com/apps/)
- [GitHub](https://github.com/starmode-base/template-tanstack-start)
- [Neon](https://console.neon.tech/app/projects/calm-forest-40252170)
- [Vercel](https://vercel.com/starmode/template-tanstack-start-app)

### Setup services

#### Vercel

1. Go to https://vercel.com/
1. Click _Add New..._ → _Project_
1. Pick `new-dawn-app` from the list → _Import_
1. Set a _Project Name_ → Click _Deploy_

#### Neon

Make sure you have installed the [Vercel integration](https://vercel.com/marketplace/neon). Select the _Link Existing Neon Account_, not the _Create New Neon Account_.

IMPORTANT: Use the [Neon-Managed Integration](https://neon.com/docs/guides/neon-managed-vercel-integration), not the [Vercel-Managed Integration](https://neon.com/docs/guides/vercel-managed-integration).

1. Go to https://console.neon.tech/
1. Click _New project_
1. Pick a name and click _Create_
1. Go to _Integrations_ → _Vercel_
1. Select _Vercel project_
1. Run `bun env:pull`

#### Clerk

1. Go to https://dashboard.clerk.com/apps/new
1. Copy Clerk env vars to [Vercel Environment Variables](https://vercel.com/starmode/template-tanstack-start-app/settings/environment-variables)
1. Run `bun env:pull`

## Configured tools

- [Vercel Serverless](https://vercel.com/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Vercel development environment variables](https://vercel.com/docs/environment-variables#development-environment-variables)
- [Neon WebSocket driver](https://neon.com/)
- [Drizzle ORM](https://neon.com/)
- ...and more

## Quality

- [Vitest](https://vitest.dev/)
- [Prettier](https://prettier.io/)
- neon-testing
