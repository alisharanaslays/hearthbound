import { ACCESS_MODEL } from "@/lib/access-model";
import { PageHeader } from "@/components/PageHeader";

export default function SafetyPage() {
  return (
    <div className="wrap page">
      <PageHeader
        eyebrow="Proposed rules"
        title="Safety and privacy"
        lede="These are the rules Hearthbound is being built around. This page is not a promise that the prototype already enforces them, and it is not legal advice."
      />
      <section className="card">
        <h2>What this prototype does today</h2>
        <ul className="future-list">
          <li>Reading lists, goals, artwork drafts, coloring, and little books stay in this browser.</li>
          <li>The server refuses to publish artwork or cozy creations. There is no review queue behind that refusal.</li>
          <li>Sample gallery pieces are original placeholders, not visitor uploads.</li>
          <li>Reports and blocks are saved on this device only. No moderator receives them.</li>
          <li>Profiles ask for a nickname and an illustrated avatar. They do not ask for a real name, school, photo, or contact detail.</li>
          <li>There is no direct messaging and no open chat. Sunshine notes are chosen from a fixed list.</li>
        </ul>
      </section>
      <section className="section">
        <h2>Who a future community is for</h2>
        <p className="lede">{ACCESS_MODEL.summary}</p>
        {ACCESS_MODEL.bands.map((band) => (
          <article key={band.id} className="band">
            <h3>{band.label}</h3>
            <p>{band.rule}</p>
          </article>
        ))}
        <p>
          People should not automatically see every age space. The same limit has to cover artwork, profiles, search, galleries, recommendations, and future stories.
          Hiding a button is not enough. Each request needs a server check tied to a real session, not an age field the browser can edit.
        </p>
      </section>
      <section className="section card">
        <h2>What has to exist before real children use it</h2>
        <ul className="future-list">
          {ACCESS_MODEL.futureServerChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>Age assurance that does not trust a typed age, and parental consent where the law requires it.</li>
          <li>Human moderation by a trusted adult, with qualified support for anything serious.</li>
          <li>A privacy notice, a short retention period, and a way to delete data that actually deletes it.</li>
          <li>AI screening, if used, sits beside human review. It is not a reason to call the place completely safe.</li>
        </ul>
      </section>
      <section className="section">
        <h2>What we will not build</h2>
        <ul className="future-list">
          <li>Public leaderboards, follower counts, or popularity rankings.</li>
          <li>Public like totals. An artist may see their own tally. Other people may not, and nobody sees who reacted.</li>
          <li>Unrestricted private messages or open chat rooms.</li>
          <li>Real-face profile photos, or public display of real names, schools, precise locations, phone numbers, or other contact details.</li>
          <li>Voice recording in Cozy Corner. Reading aloud, when the browser offers it, is not stored.</li>
        </ul>
      </section>
    </div>
  );
}
