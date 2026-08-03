// Shared chrome for the staff/reader dashboards.
// Exports a top bar with logo, page tabs, status indicator, and avatar.

function StaffTopBar({ current = "newsstand", user = { initial: "E", name: "Eliza A." } }) {
  const tabs = [
    { id: "newsstand", label: "Newsstand", href: "index.html" },
    { id: "editor",    label: "Editor",    href: "editor.html" },
    { id: "pipelines", label: "Pipelines", href: "pipelines.html" },
    { id: "reader",    label: "Your Bloom", href: "reader.html" },
  ];
  return (
    <header className="staff-top">
      <div className="staff-top-inner">
        <a href="index.html" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="staff-mark">
            The Daily Bloom
            <small>{current === "newsstand" ? "Morning Edition" : `Staff · ${current}`}</small>
          </div>
        </a>
        <nav className="staff-nav">
          {tabs.map(t => (
            <a key={t.id} href={t.href} className={t.id === current ? "is-active" : ""}>
              {t.label}
            </a>
          ))}
        </nav>
        <span className="staff-top-spacer" />
        <div className="staff-status">
          <span><span className="dot" /> Press OK</span>
          <span>Edition #184 · 04h 22m to publish</span>
          <span className="staff-avatar">{user.initial}</span>
        </div>
      </div>
    </header>
  );
}

window.StaffTopBar = StaffTopBar;
