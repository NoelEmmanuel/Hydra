"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-10 left-0 right-0 z-50 mx-auto w-11/12 max-w-6xl rounded-2xl px-8 py-1">
      <nav className="flex items-center gap-12 w-full">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: '#341f4f' }}>
            <Image 
              src="/logo.png" 
              alt="Hydra" 
              width={40}
              height={40}
              className="object-contain p-0.5"
              unoptimized
            />
          </div>
          <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
            HYDRA
          </span>
        </Link>

        <Link
          href="/auth"
          className="px-6 py-2 text-white rounded-lg font-medium text-sm transition-colors flex-shrink-0 ml-[50rem]"
          style={{ backgroundColor: '#341f4f' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a1840'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#341f4f'}
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}
