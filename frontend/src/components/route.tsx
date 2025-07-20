import { ReactNode, useEffect, useState } from "react";

interface RouteProps {
  path: string;
  children: ReactNode;
}

export const useCurrentRoute = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname); // highlight-line

  useEffect(() => {
    // define callback as separate function so it can be removed later with cleanup function
    const onLocationChange = () => {
      // update path state to current window URL
      setCurrentPath(window.location.pathname); // highlight-line
    };

    // listen for popstate event
    window.addEventListener("popstate", onLocationChange);

    // clean up event listener
    return () => {
      window.removeEventListener("popstate", onLocationChange);
    };
  }, []);

  return { currentPath };
};

const Route = ({ path, children }: RouteProps) => {
  // state to track URL and force component to re-render on change
  const { currentPath } = useCurrentRoute();

  return currentPath === path // highlight-line
    ? children
    : null;
};

export default Route;
