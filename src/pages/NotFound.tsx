import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="glass p-10 text-center max-w-md">
        <p className="eyebrow">Page not found</p>
        <h1 className="mb-3 text-5xl font-extrabold text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">This page drifted off with the clouds. Let's get you back home.</p>
        <Link to="/" className="btn-primary">Return to home</Link>
      </div>
    </main>
  );
};
export default NotFound;
