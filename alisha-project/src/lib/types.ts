export type ReadingStatus = "planned" | "reading" | "completed";

export type AvatarId = "fox" | "moon" | "mushroom" | "book" | "star" | "whale";

export type MotifId =
  | "lantern-isle"
  | "tea-dragon"
  | "reading-fox"
  | "glass-garden"
  | "moon-hare"
  | "star-sailor"
  | "mapmaker"
  | "two-weather";

export type PictureId =
  | "fox"
  | "moon"
  | "boat"
  | "tree"
  | "dragon"
  | "house"
  | "star"
  | "flower";

export type ArtCategory = "Fantasy" | "Animals" | "Characters" | "Magical worlds";

export type SketchCategory = "Book Fan Art" | "Fantasy" | "Nature" | "Original Art" | "Other";

export type SketchKind = "drawing" | "upload";

export type SketchStroke = {
  tool: "pen" | "eraser";
  color: string;
  size: number;
  points: [number, number][];
};

export type ProgressEntry = {
  at: string;
  delta: number;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  totalPages: number;
  pagesRead: number;
  status: ReadingStatus;
  startedOn?: string;
  finishedOn?: string;
  coverDataUrl?: string;
  progressLog: ProgressEntry[];
  createdAt: string;
  favorite?: boolean;
  sample?: boolean;
};

export type Goals = {
  year: number;
  books?: number;
  pages?: number;
};

export type Profile = {
  nickname: string;
  avatar: AvatarId;
};

export type Submission = {
  id: string;
  title: string;
  description: string;
  inspiration?: string;
  category: ArtCategory;
  imageDataUrl?: string;
  motif?: MotifId;
  createdAt: string;
};

export type Cheer = {
  artId: string;
  messageId: string;
  at: string;
};

export type Report = {
  id: string;
  artId: string;
  artTitle: string;
  reason: string;
  note?: string;
  createdAt: string;
};

export type ColoringItem = {
  id: string;
  kind: "coloring";
  title: string;
  colors: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type LittleBookPage = {
  picture: PictureId;
  text: string;
};

export type LittleBookItem = {
  id: string;
  kind: "book";
  title: string;
  pages: LittleBookPage[];
  createdAt: string;
  updatedAt: string;
};

export type ShelfItem = ColoringItem | LittleBookItem;

export type SketchItem = {
  id: string;
  kind: SketchKind;
  title: string;
  description: string;
  category: SketchCategory;
  strokes?: SketchStroke[];
  imageDataUrl?: string;
  askedReview: boolean;
  reviewReply?: string;
  createdAt: string;
  updatedAt: string;
};

export type Store = {
  version: 1;
  profile: Profile;
  books: Book[];
  favoriteGenres: string[];
  goals: Goals;
  submissions: Submission[];
  cheers: Cheer[];
  reports: Report[];
  hiddenArtIds: string[];
  shelf: ShelfItem[];
  sketches: SketchItem[];
};

export type BookDraft = {
  title: string;
  author: string;
  genre: string;
  totalPages: number;
  pagesRead: number;
  status: ReadingStatus;
  startedOn?: string;
  finishedOn?: string;
  coverDataUrl?: string;
};

export type CatalogBook = {
  id: string;
  title: string;
  author: string;
  genre: string;
  pages: number;
  blurb: string;
};

export type SampleArt = {
  id: string;
  title: string;
  description: string;
  inspiration?: string;
  category: ArtCategory;
  artist: string;
  avatar: AvatarId;
  motif: MotifId;
};
