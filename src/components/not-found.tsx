import { Link } from "@tanstack/react-router";

export function NotFound(props: React.PropsWithChildren) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div>
        {props.children ?? (
          <div>The page you are looking for does not exist.</div>
        )}
      </div>
      <div className="flex gap-2">
        <Link to="/" className="underline">
          Go to home
        </Link>
      </div>
    </div>
  );
}
