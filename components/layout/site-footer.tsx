import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import {
  ecosystemNavigation,
  primaryNavigation,
  projectInquiryNavigation,
} from "@/lib/navigation";
import { siteConfig } from "@/lib/seo/site";

export function SiteFooter() {
  return (
    <footer className="wc-site-footer">
      <Container className="wc-site-footer__inner" width="wide">
        <div className="wc-site-footer__lead">
          <div>
            <p className="wc-site-footer__eyebrow">Independent creative studio</p>
            <p className="wc-site-footer__title">WestCose Designs</p>
          </div>
          <ButtonLink href={projectInquiryNavigation.href} size="lg">
            {projectInquiryNavigation.label}
          </ButtonLink>
        </div>

        <div className="wc-site-footer__directory">
          <p className="wc-site-footer__description">{siteConfig.description}</p>

          <nav className="wc-site-footer__nav" aria-label="Footer">
            <p className="wc-site-footer__nav-label">Explore</p>
            <ul>
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="wc-site-footer__nav" aria-label="WestCose ecosystem">
            <p className="wc-site-footer__nav-label">Ecosystem</p>
            <ul>
              {ecosystemNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span>{item.label}</span>
                    <span className="wc-navigation-indicator" aria-hidden="true">
                      {item.indicator}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="wc-site-footer__base">
          <p>California roots · Independent practice</p>
          <p>© {new Date().getFullYear()} WestCose Designs</p>
        </div>
      </Container>
    </footer>
  );
}
