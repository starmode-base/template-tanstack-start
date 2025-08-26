import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/tanstack-react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { getAuth } from "@clerk/tanstack-react-start/server";

const authStateFn = createServerFn({ method: "GET" }).handler(async () => {
  const { userId } = await getAuth(getWebRequest());

  return userId;
});

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await authStateFn(),
});

function Home() {
  const userId = Route.useLoaderData();

  return (
    <main className="flex h-dvh flex-col">
      <SignedIn>
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white p-4">
          <div>You are signed in as: {userId}</div>
          <div className="flex items-center gap-2">
            <UserButton />
            <SignOutButton>
              <button className="h-fit rounded bg-sky-500 px-4 py-1 text-white">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="m-auto flex flex-col gap-4 rounded bg-white p-4 shadow">
          <div className="text-center">You are signed out</div>
          <div className="flex gap-2">
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
