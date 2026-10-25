import { genreStyle } from "@/lib/genres";

export function BookCover({
  title,
  author,
  genre,
  image,
}: {
  title: string;
  author: string;
  genre: string;
  image?: string;
}) {
  if (image) {
    return <img className="book-cover has-image" src={image} alt="" />;
  }
  const style = genreStyle(genre);
  return (
    <div className="book-cover" style={{ background: `linear-gradient(165deg, ${style.from}, ${style.to})` }} aria-hidden="true">
      <span className="book-cover-genre">{genre}</span>
      <CoverSymbol symbol={style.symbol} />
      <span>
        <span className="book-cover-title">{title}</span>
        <span className="book-cover-author">{author}</span>
      </span>
    </div>
  );
}

function CoverSymbol({ symbol }: { symbol: string }) {
  return (
    <svg className="cover-symbol" viewBox="0 0 24 24" aria-hidden="true">
      {symbol === "star" && <path d="M12 3l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="#fbf6ee" />}
      {symbol === "key" && <path d="M10 8a4 4 0 1 1-2 7.5V20H6v-2H4v-2h4.2A4 4 0 0 1 10 8z" fill="#fbf6ee" />}
      {symbol === "leaf" && <path d="M6 16c8-1 12-8 12-12-6 1-12 6-12 12z" fill="#fbf6ee" />}
      {symbol === "paw" && (
        <>
          <circle cx="12" cy="14" r="3.2" fill="#fbf6ee" />
          <circle cx="7" cy="10" r="1.5" fill="#fbf6ee" />
          <circle cx="12" cy="8" r="1.5" fill="#fbf6ee" />
          <circle cx="17" cy="10" r="1.5" fill="#fbf6ee" />
        </>
      )}
      {symbol === "ship" && <path d="M4 16l8-8 8 8H4zm8-8V4" stroke="#fbf6ee" strokeWidth="2" fill="none" />}
      {symbol === "moon" && <path d="M14 4a7 7 0 1 0 6 10A6 6 0 0 1 14 4z" fill="#fbf6ee" />}
      {symbol === "atom" && (
        <>
          <circle cx="12" cy="12" r="2" fill="#fbf6ee" />
          <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="#fbf6ee" strokeWidth="1.4" />
          <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" fill="none" stroke="#fbf6ee" strokeWidth="1.4" />
        </>
      )}
      {symbol === "book" && <path d="M5 6h6c1 2 1 10 0 12H5zM19 6h-6c-1 2-1 10 0 12h6z" fill="#fbf6ee" />}
    </svg>
  );
}
