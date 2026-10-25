export const CHEERS = [
  { id: "amazing", text: "OMG, YOUR ART IS AMAZING! KEEP GOING!" },
  { id: "starts", text: "Every artist starts somewhere!" },
  { id: "imagination", text: "Your imagination is wonderful!" },
  { id: "matter", text: "Keep creating. Your ideas matter!" },
  { id: "no-wrong", text: "There is no wrong way to imagine!" },
] as const;

export type CheerId = (typeof CHEERS)[number]["id"];

export function cheerText(id: string) {
  return CHEERS.find((cheer) => cheer.id === id)?.text;
}

export const REPORT_REASONS = [
  "It does not seem original",
  "It feels unkind or unsafe",
  "It seems meant for a different age space",
  "Something else",
] as const;
