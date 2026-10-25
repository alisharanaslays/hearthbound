export function Chart({
  points,
  label,
  tone,
  unit,
}: {
  points: { label: string; value: number }[];
  label: string;
  tone: "books" | "pages";
  unit: string;
}) {
  const max = Math.max(1, ...points.map((point) => point.value));
  const empty = points.every((point) => point.value === 0);

  return (
    <figure className="card chart-card">
      <h3>{label}</h3>
      {empty ? (
        <p>Nothing in this view yet. Log pages or finish a book, and the marks will show up here.</p>
      ) : (
        <ul className={`bars ${tone === "pages" ? "pages" : ""}`}>
          {points.map((point) => (
            <li key={point.label}>
              <span className="sr-only">
                {point.label}: {point.value} {unit}
              </span>
              <span
                className="bar-fill"
                style={{
                  height: point.value ? `${(point.value / max) * 100}%` : "0px",
                  minHeight: point.value ? 4 : 0,
                }}
                aria-hidden="true"
              />
              <span className="label" aria-hidden="true">
                {point.label}
              </span>
            </li>
          ))}
        </ul>
      )}
      <details className="numbers">
        <summary>View the numbers</summary>
        <table>
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              <th scope="col">When</th>
              <th scope="col">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.label}>
                <th scope="row">{point.label}</th>
                <td>{point.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
