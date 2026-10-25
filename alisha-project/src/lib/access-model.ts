/**
 * Publishing rules for Hearthbound.
 * This module describes the intended model. It does not grant access.
 * The publication route refuses to publish until accounts, age assurance,
 * and human review exist. An age sent by the browser is never proof of age.
 */
export const ACCESS_MODEL = {
  enforced: false,
  summary:
    "Age-group access is not enforced yet. There are no accounts, no age assurance, and no reviewers.",
  bands: [
    {
      id: "under-14",
      label: "Under 14",
      rule: "Create and save private work. Later, selected creations may be shared only with a securely linked parent or guardian. No public publishing.",
    },
    {
      id: "14-15",
      label: "Ages 14–15",
      rule: "May become eligible to publish into a 14–15 space after checks and moderation.",
    },
    {
      id: "16-17",
      label: "Ages 16–17",
      rule: "A separate public space. It does not open automatically to other age groups.",
    },
    {
      id: "adult",
      label: "Adults",
      rule: "An adult space. Access to younger public spaces is not automatic.",
    },
  ],
  futureServerChecks: [
    "Gallery, artwork, profile, search, recommendation, and story reads",
    "Artwork and story submissions, which stay pending until a stored human review decision",
    "Sunshine notes, reports, and blocks",
    "Parent or guardian links, which require consent and a real account relationship",
  ],
} as const;
