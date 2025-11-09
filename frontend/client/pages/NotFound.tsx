import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <div>
          <h1 className="text-7xl font-bold text-primary mb-2">404</h1>
          <p className="text-2xl font-semibold text-foreground">Page not found</p>
        </div>
        <p className="text-lg text-muted-foreground max-w-md">
          The page you're looking for doesn't exist. Please continue exploring HYDRA or
          return to the homepage.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
