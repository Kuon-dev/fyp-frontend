import { Link, useNavigate } from "@remix-run/react";
import { Button } from "../ui/button";

export default function ErrorComponent() {
  const nav = useNavigate();
  const handlePageRefresh = () => {
    // current location
    nav(`${window.location.pathname}`);
  };

  const handlePreviousPage = () => {
    nav(-1);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 dark:bg-muted/40">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-50">
          500
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Oops, something went wrong on our end.
        </p>
        <div className="flex flex-row gap-4 justify-center items-center mt-2">
          <Button onClick={handlePageRefresh}>Try again</Button>
          <Button variant="outline" onClick={handlePreviousPage}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}

export const ErrorComponentNoButton = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-50">
          500
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Oops, something went wrong on our end.
        </p>
      </div>
    </div>
  );
};
