import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import {
  ecosystemNavigation,
  primaryNavigation,
  projectInquiryNavigation,
  siteNavigation,
  type NavigationItem,
} from "@/lib/navigation";
import { siteConfig } from "@/lib/seo/site";

function NavigationLabel({ item }: { item: NavigationItem }) {
  return (
    <>
      <span>{item.label}</span>
      {item.indicator ? (
        <span className="wc-navigation-indicator" aria-hidden="true">
          {item.indicator}
        </span>
      ) : null}
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="wc-site-header" data-site-header>
      <Container className="wc-site-header__inner" width="wide">
        <Link
          className="wc-site-header__brand"
          href="/"
          aria-label={`${siteConfig.name}, home`}
        >
          <Image
            className="wc-site-header__brand-mark"
            src="/brand/westcose-logo.svg"
            alt=""
            width={1080}
            height={1080}
            sizes="3rem"
            loading="eager"
            unoptimized
            aria-hidden="true"
          />
          <span className="wc-sr-only">WestCose Designs</span>
        </Link>

        <nav className="wc-site-header__desktop-nav" aria-label="Primary">
          <ul className="wc-site-header__desktop-list">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <Link className="wc-site-header__nav-link" href={item.href}>
                  <NavigationLabel item={item} />
                </Link>
              </li>
            ))}
            <li className="wc-site-header__project-link">
              <ButtonLink
                href={projectInquiryNavigation.href}
                size="sm"
                variant="outline"
              >
                {projectInquiryNavigation.label}
              </ButtonLink>
            </li>
            {ecosystemNavigation.map((item) => (
              <li key={item.href}>
                <Link className="wc-site-header__nav-link" href={item.href}>
                  <NavigationLabel item={item} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <details className="wc-site-header__disclosure">
          <summary className="wc-site-header__menu-trigger">
            <span>Menu</span>
            <span className="wc-site-header__menu-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </summary>

          <div className="wc-site-header__mobile-panel">
            <nav aria-label="Mobile primary">
              <ul className="wc-site-header__mobile-list">
                {siteNavigation.map((item, index) => (
                  <li
                    key={item.href}
                    className="wc-site-header__mobile-item"
                    data-kind={
                      item.href === projectInquiryNavigation.href
                        ? "project"
                        : "indicator" in item
                          ? "ecosystem"
                          : "primary"
                    }
                  >
                    <Link
                      className="wc-site-header__mobile-link"
                      href={item.href}
                    >
                      <span
                        className="wc-site-header__mobile-index"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <NavigationLabel item={item} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </details>
      </Container>
    </header>
  );
}
