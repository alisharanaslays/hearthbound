import Link from "next/link";
import { ClosedStudio } from "@/components/Scenes";
import { PageHeader } from "@/components/PageHeader";

const plans = [
  "Write original stories and longer fiction.",
  "Write fan fiction inspired by books you have read, clearly labelled as inspired work.",
  "Imagine what happens after a book ends, or try an alternative ending.",
  "Ask “what if?” and follow that path for a chapter.",
  "Develop characters, settings, and plots.",
  "Organize writing into chapters, with private drafts.",
  "Design a cover and add illustrations you have the right to use.",
  "Share eligible writing only after a safety and moderation check.",
];

export default function StudioPage() {
  return (
    <div className="wrap page">
      <div className="studio-hero">
        <ClosedStudio />
        <div>
          <PageHeader
            eyebrow="Coming later"
            title="Story Studio"
            lede="A quiet room for original stories, and for imagining past the last page. It is not open. There is no editor on this page, and nothing you type here would be saved, because there is nowhere to type."
          />
        </div>
      </div>
      <section className="section card">
        <h2>What the room is for</h2>
        <ul className="future-list">
          {plans.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="section grid-2">
        <article className="card">
          <h2>Original fiction and fan fiction</h2>
          <p>
            Both belong here later. Stories inspired by published books will need a clear label. A copyright report path will let a rights holder ask for a review.
            Sharing waits until a person has checked the work. Inspiration is not the same thing as copying a book.
          </p>
        </article>
        <article className="card">
          <h2>Private until it is ready</h2>
          <p>
            Unfinished writing stays private. Public stories, when the studio opens, follow the same age spaces as artwork: under 14 stays with a linked guardian,
            and older public shelves are separated. That gate is not built yet.
          </p>
          <Link href="/safety">Read the safety notes</Link>
        </article>
      </section>
    </div>
  );
}
