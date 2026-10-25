"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="wrap page">
      <h1>Something snagged on this page.</h1>
      <p className="lede">Your browser shelf should still be here. You can try the page again.</p>
      <button type="button" className="btn primary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
