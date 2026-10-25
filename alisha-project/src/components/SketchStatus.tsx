import type { SketchItem } from "@/lib/types";

export function ReviewLegend() {
  return (
    <ul className="status-legend">
      <li>
        <strong>Draft.</strong> Saved in this browser only. It has not been sent anywhere.
      </li>
      <li>
        <strong>Pending Review.</strong> Not in use. This server has no review queue, so nothing waits for a person.
      </li>
      <li>
        <strong>Approved.</strong> Not in use. Sketchbook artwork is never placed in the public Art Hub.
      </li>
      <li>
        <strong>Needs Changes.</strong> Not in use. There is no reviewer who can send notes back.
      </li>
    </ul>
  );
}

export function SketchBadge({ item }: { item: SketchItem }) {
  return (
    <p className="meta">
      <span className="pill planned">Draft</span>
      {item.askedReview ? " · You asked to publish. The server did not accept it." : " · Private on this device"}
    </p>
  );
}
