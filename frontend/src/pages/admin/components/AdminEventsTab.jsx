import Calendar from "../../../components/Calendar/Calendar";

export default function AdminEventsTab() {
  return (
    <div className="ad-tab">
      <div
        className="ad-panel"
        style={{
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#f8fafc",
        }}
      >
        <h2 style={{ marginBottom: "32px", color: "#1e293b" }}>
          Schedule Academic Event
        </h2>
        <Calendar onSelect={(val) => alert(`Selected Event Time: ${val}`)} />
        <p style={{ marginTop: "24px", color: "#64748b" }}>
          Use the calendar above to pick a date and time for campus-wide notices.
        </p>
      </div>
    </div>
  );
}
