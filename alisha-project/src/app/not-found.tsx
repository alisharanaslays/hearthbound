import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap page">
      <p className="eyebrow">404</p>
      <h1>This page is not on the shelf.</h1>
      <p className="lede">The link may be old, or the page was never part of this prototype.</p>
      <Link className="btn primary" href="/">
        Back home
      </Link>
    </section>
  );
}
