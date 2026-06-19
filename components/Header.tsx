"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Oversikt" },
  { href: "/statistikk", label: "År for år" },
  { href: "/topp", label: "Mest aktive" },
  { href: "/topp5ar", label: "Siste 5 år" },
  { href: "/veteraner", label: "Veteraner" },
  { href: "/heatmap", label: "Spillerdetaljer" },
  { href: "/events", label: "Turneringer" },
  { href: "/historie", label: "Historie" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link href="/" className="logo">
          <span className="logo-dg">dgno</span>
          <span className="logo-no">.no</span>
        </Link>

        <nav className="nav-desktop" aria-label="Hovednavigasjon">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${pathname === item.href ? " active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Lukk meny" : "Åpne meny"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="nav-mobile"
          aria-label="Mobilnavigasjon"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-mobile-link${pathname === item.href ? " active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
