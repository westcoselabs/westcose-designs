"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import { NavigationGlass } from "@/components/navigation/navigation-glass";
import { siteConfig } from "@/lib/seo/site";

const navigation = [
  { label: "Home", href: "/", path: "/" },
  { label: "About", href: "/#scene-02", path: "/studio" },
  { label: "Services", href: "/#hero-services", path: "/services" },
  { label: "Contact", href: "/#scene-07", path: "/start-a-project" },
  { label: "Shop", href: "/shop", path: "/shop" },
  { label: "Labs", href: "/westcose-labs", path: "/westcose-labs" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  return (
    <header className="wc-site-header wc-liquid-header" data-site-header>
      <div className="wc-liquid-header__shell">
        <NavigationGlass />
        <Link
          className="wc-liquid-header__brand"
          href="/"
          aria-label={`${siteConfig.name}, home`}
        >
          <Image
            src="/brand/westcose-monogram-reversed.svg"
            alt=""
            width={36}
            height={36}
            unoptimized
          />
        </Link>
        <nav className="wc-liquid-header__desktop" aria-label="Primary">
          <ul className="wc-liquid-header__links">
            {navigation.map((item) => (
              <li key={item.label}>
                <Link
                  className="wc-liquid-header__link"
                  href={item.href}
                  aria-current={pathname === item.path ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <details
          ref={menuRef}
          className="wc-liquid-header__menu"
          onKeyDown={(event) => {
            if (event.key === "Escape" && menuRef.current?.open) {
              closeMenu();
              triggerRef.current?.focus();
            }
          }}
        >
          <summary ref={triggerRef} className="wc-liquid-header__trigger">
            <span>Menu</span>
            <span className="wc-liquid-header__menu-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </summary>
          <nav
            className="wc-liquid-header__mobile-panel"
            aria-label="Mobile primary"
          >
            <ul>
              {navigation.map((item) => (
                <li key={item.label}>
                  <Link
                    className="wc-liquid-header__link"
                    href={item.href}
                    aria-current={pathname === item.path ? "page" : undefined}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
