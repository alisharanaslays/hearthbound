import Link from "next/link";
import { IconBrush, IconPencil, IconShelf } from "./Icons";

const paths = [
  {
    href: "/sketchbook/draw",
    title: "Start Drawing",
    text: "Open a blank page and draw with a brush, an eraser, and as many undos as you need.",
    icon: <IconPencil />,
    wash: "wash-teal",
  },
  {
    href: "/sketchbook/upload",
    title: "Upload Artwork",
    text: "Bring in a drawing from paper or another app. You can preview it before it is kept.",
    icon: <IconBrush />,
    wash: "wash-pink",
  },
  {
    href: "/sketchbook/creations",
    title: "My Creations",
    text: "See drawings and uploads saved in this browser, then open a draft or remove one.",
    icon: <IconShelf />,
    wash: "wash-lavender",
  },
];

export function SketchbookHome() {
  return (
    <div className="wrap page sketchbook">
      <header className="page-header">
        <p className="eyebrow">A private art journal</p>
        <h1>The Sketchbook 🎨</h1>
        <p className="tagline">Your imagination, your canvas.</p>
        <p className="lede">
          Draw a little magic, bring your favourite stories to life, and create something that&apos;s completely yours.
        </p>
      </header>
      <div className="sketch-grid">
        {paths.map((path) => (
          <Link key={path.href} href={path.href} className={`card choice-card ${path.wash}`}>
            <span className="icon-blob">{path.icon}</span>
            <h2>{path.title}</h2>
            <p>{path.text}</p>
          </Link>
        ))}
      </div>
      <aside className="card prototype-note" style={{ marginTop: "1.25rem" }}>
        <p>
          Creations stay in this browser. They are not tied to an account, and they are not shown in Art Hub. Asking
          to submit calls the publication check, which is closed until accounts and a real review exist.
        </p>
      </aside>
    </div>
  );
}
