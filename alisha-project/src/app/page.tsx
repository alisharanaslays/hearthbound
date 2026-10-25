import Link from "next/link";
import { SAMPLE_ART } from "@/lib/art";
import { ArtworkMotif } from "@/components/ArtworkMotif";
import { BookCover } from "@/components/BookCover";
import { IconBook, IconBrush, IconFlower, IconQuill, IconShelf } from "@/components/Icons";
import { QuietPrompt } from "@/components/QuietPrompt";
import { HeroScene } from "@/components/Scenes";
import { ShelfNotes } from "@/components/ShelfNotes";
import { loadContent, mottoParts, paragraphs } from "@/lib/site";

export default async function HomePage() {
  const content = await loadContent();
  const copy = content.copy;
  const spotlight = SAMPLE_ART[0];
  const featured = content.books.filter((book) => book.featured);
  const starters = (featured.length ? featured : content.books).slice(0, 3);
  const visibleNotes = content.reviews.filter((review) => review.visible);
  const motto = mottoParts(copy.motto);
  const kindness = paragraphs(copy.kindnessBody);
  const honest = paragraphs(copy.honestBody);
  const rooms = [
    { href: "/reading", title: "My Reading", text: copy.roomReading, icon: <IconBook />, wash: "wash-lavender" },
    { href: "/art", title: "Art Hub", text: copy.roomArt, icon: <IconBrush />, wash: "wash-pink" },
    { href: "/cozy", title: "Cozy Corner", text: copy.roomCozy, icon: <IconFlower />, wash: "wash-sage" },
    { href: "/studio", title: "Story Studio", text: copy.roomStudio, icon: <IconQuill />, wash: "wash-blue" },
    { href: "/library", title: "My Library", text: copy.roomLibrary, icon: <IconShelf />, wash: "wash-gold" },
  ];

  return (
    <div className="wrap page">
      <section className="hero">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.heroTitle}</h1>
          <p className="lede">{copy.heroLede}</p>
          <ul className="motto" aria-label="Motto">
            {motto.map((word, index) => (
              <li key={`${word}-${index}`}>{word}</li>
            ))}
          </ul>
          <div className="cluster">
            <Link className="btn primary" href="/reading">
              {copy.primaryCta}
            </Link>
            <Link className="btn" href="/art">
              {copy.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <HeroScene />
        </div>
      </section>

      <QuietPrompt />

      <section className="section" aria-labelledby="rooms-heading">
        <h2 id="rooms-heading">{copy.roomsHeading}</h2>
        <div className="room-grid">
          {rooms.map((room) => (
            <Link key={room.href} href={room.href} className={`card room-card ${room.wash}`}>
              <span className="icon-blob">{room.icon}</span>
              <h3>{room.title}</h3>
              <p>{room.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="kindness-heading">
        <h2 id="kindness-heading">{copy.kindnessHeading}</h2>
        <div className="grid-2">
          <article className="card">
            <h3>Send a little sunshine</h3>
            {kindness.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <Link className="btn" href={`/art/${spotlight.id}`}>
              Leave sunshine on a sample
            </Link>
          </article>
          <Link className="card art-card" href={`/art/${spotlight.id}`}>
            <div className="frame">
              <ArtworkMotif motif={spotlight.motif} />
            </div>
            <h3>{spotlight.title}</h3>
            <p className="meta">Sample by {spotlight.artist}</p>
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="starters-heading">
        <h2 id="starters-heading">{copy.startersHeading}</h2>
        <p className="lede">{copy.startersLede}</p>
        {starters.length === 0 ? <p>The book list is empty right now.</p> : null}
        <div className="grid-3">
          {starters.map((book) => (
            <article key={book.id} className="card">
              <div className="book-card">
                <BookCover title={book.title} author={book.author} genre={book.genre} />
                <div>
                  <h3>{book.title}</h3>
                  <p className="meta">{book.author}</p>
                  <p>{book.blurb}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/reading#suggestions">See suggestions on your shelf</Link>
        </p>
      </section>

      <ShelfNotes reviews={visibleNotes.slice(0, 3)} books={content.books} heading={copy.reviewsHeading} lede={copy.reviewsLede} />
      {visibleNotes.length > 3 ? (
        <p style={{ marginTop: "-1rem" }}>
          <Link href="/reviews">Read every shelf note</Link>
        </p>
      ) : null}

      <section className="section card" aria-labelledby="honest-heading">
        <h2 id="honest-heading">{copy.honestHeading}</h2>
        {honest.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <Link className="btn" href="/safety">
          Read the safety and privacy notes
        </Link>
      </section>
    </div>
  );
}
