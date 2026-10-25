import Link from "next/link";
import { loadContent } from "@/lib/site";

export async function SiteFooter() {
  const content = await loadContent();
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <strong>{content.copy.siteName}</strong>
          <p className="fine">{content.copy.motto}</p>
          <p className="fine">{content.copy.footerNote}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="footer-links">
            <li><Link href="/reading">My Reading</Link></li>
            <li><Link href="/art">Art Hub</Link></li>
            <li><Link href="/sketchbook">The Sketchbook</Link></li>
            <li><Link href="/cozy">Cozy Corner</Link></li>
            <li><Link href="/studio">Story Studio</Link></li>
            <li><Link href="/library">My Library</Link></li>
            <li><Link href="/reviews">{content.copy.reviewsHeading}</Link></li>
            <li><Link href="/safety">Safety and privacy</Link></li>
            <li><Link href="/admin">Site desk</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
