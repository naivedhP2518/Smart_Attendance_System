export default function StudentResultsTab({ results, formatDate, Icons }) {
  return (
    <div className="sd-tab">
      <div className="sd-results-top">
        <div className="sd-cpi-card">
          <p className="sd-cpi-label">Cumulative Performance Index</p>
          <p className="sd-cpi-val">{results.cpi ?? "—"}</p>
          <p className="sd-cpi-sub">
            Based on {results.history.length} semesters
          </p>
        </div>
        {results.latest && (
          <div className="sd-spi-card">
            <p className="sd-cpi-label">Latest SPI</p>
            <p className="sd-cpi-val">{results.latest.spi}</p>
            <p className="sd-cpi-sub">
              Semester {results.latest.semester} · Grade {results.latest.grade}
            </p>
          </div>
        )}
      </div>
      <div className="sd-panel">
        <div className="sd-panel-header">
          <Icons.Award />
          <h3>Semester Results</h3>
        </div>
        <div className="sd-results-table">
          <div className="sd-results-thead">
            <span>Semester</span>
            <span>SPI</span>
            <span>Grade</span>
            <span>Declared</span>
          </div>
          {results.history.map((r, i) => (
            <div key={i} className="sd-results-trow">
              <span>Semester {r.semester}</span>
              <span className="sd-spi-chip">{r.spi}</span>
              <span className={`sd-grade-chip grade-${r.grade}`}>{r.grade}</span>
              <span>{formatDate(r.declaredAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
