import { createFileRoute } from "@tanstack/react-router";
import { Splash } from "~/components/splash";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Splash />
    </div>
  );
}
