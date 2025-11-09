import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-8 left-0 right-0 z-50 mx-auto w-11/12 max-w-6xl bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-3 shadow-lg">
      <nav className="flex items-center gap-12 w-full">
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center font-bold text-white text-lg">
            H
          </div>
          <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
            HYDRA
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 ml-auto">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it Works
          </a>
          <a
            href="#use-cases"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Use Cases
          </a>
        </div>

        <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex-shrink-0">
          Get Started
        </button>
      </nav>
    </header>
  );
}
