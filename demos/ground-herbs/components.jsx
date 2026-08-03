// Shared building blocks — Nav, PowderTile (placeholder imagery), ProductCard, Buttons

const { useState, useEffect, useRef, useMemo } = React;

// === Themed wrapper that applies the brand vibe ===
function applyVibe(vibe) {
  const root = document.documentElement;
  const vibes = {
    earthy: {
      "--bg": "#EFE6D6", "--bg-2": "#E5D9C2", "--ink": "#1A1410", "--ink-2": "#4A3D2E",
      "--line": "#C9B998", "--accent": "#B85A3A", "--accent-ink": "#FFFFFF",
      "--card": "#F7F0E0", "--muted": "#7A6A52",
    },
    wellness: {
      "--bg": "#F6F5F0", "--bg-2": "#EEEDE5", "--ink": "#1C1C1A", "--ink-2": "#3A3A36",
      "--line": "#D0D0C5", "--accent": "#5C7A55", "--accent-ink": "#FFFFFF",
      "--card": "#FFFFFF", "--muted": "#7A7A72",
    },
    ayurveda: {
      "--bg": "#FBF1DC", "--bg-2": "#F4E3BE", "--ink": "#2A1208", "--ink-2": "#5C2A14",
      "--line": "#D9B175", "--accent": "#C2410C", "--accent-ink": "#FBF1DC",
      "--card": "#FFF7E4", "--muted": "#8A5A2E",
    },
    editorial: {
      "--bg": "#F4EFE6", "--bg-2": "#E9E2D2", "--ink": "#0B0B0A", "--ink-2": "#2A2826",
      "--line": "#C4BAA5", "--accent": "#A78344", "--accent-ink": "#0B0B0A",
      "--card": "#FBF7EE", "--muted": "#73695A",
    },
  };
  const v = vibes[vibe] || vibes.earthy;
  Object.entries(v).forEach(([k, val]) => root.style.setProperty(k, val));
  root.dataset.vibe = vibe;
}

// === Powder tile — striped placeholder per design spec ===
// Used in product cards, hero, recipes. Color drawn from product.swatch.
function PowderTile({ color, swatch, label, ratio = "1/1", note, kind = "stripe", soldOut }) {
  // Variation: stripe (default), splash, jar, monogram
  const styles = {
    container: {
      position: "relative",
      width: "100%",
      aspectRatio: ratio,
      background: "var(--bg-2)",
      overflow: "hidden",
      borderRadius: "2px",
    },
    label: {
      position: "absolute", left: 12, bottom: 10, right: 12,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em",
      color: "var(--ink)", opacity: 0.55, display: "flex", justifyContent: "space-between",
    },
    soldOut: {
      position: "absolute", top: 12, right: 12,
      fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
      textTransform: "uppercase", letterSpacing: "0.1em",
      background: "var(--ink)", color: "var(--bg)", padding: "4px 8px",
    },
  };

  let inner;
  if (kind === "jar") {
    inner = (
      <svg viewBox="0 0 200 200" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id={`stripe-${label}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={swatch} strokeWidth="3" opacity="0.4" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="200" height="200" fill={`url(#stripe-${label})`} opacity="0.25" />
        {/* jar silhouette */}
        <rect x="64" y="58" width="72" height="14" fill={swatch} opacity="0.7" />
        <rect x="58" y="72" width="84" height="98" fill={color} />
        <rect x="58" y="92" width="84" height="4" fill={swatch} opacity="0.4" />
        <rect x="74" y="110" width="52" height="38" fill="var(--bg)" opacity="0.92" />
      </svg>
    );
  } else if (kind === "splash") {
    inner = (
      <svg viewBox="0 0 200 200" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
        <circle cx="100" cy="100" r="68" fill={color} />
        <circle cx="100" cy="100" r="38" fill={swatch} opacity="0.7" />
        <circle cx="64" cy="82" r="6" fill={color} />
        <circle cx="148" cy="124" r="9" fill={color} />
        <circle cx="142" cy="62" r="4" fill={color} />
        <circle cx="58" cy="138" r="5" fill={color} />
      </svg>
    );
  } else {
    // stripe — default, abstract
    inner = (
      <svg viewBox="0 0 200 200" style={{position:"absolute",inset:0,width:"100%",height:"100%"}} preserveAspectRatio="none">
        <rect x="0" y="0" width="200" height="200" fill={swatch} opacity="0.35" />
        <rect x="0" y="60" width="200" height="80" fill={color} />
        <rect x="0" y="76" width="200" height="2" fill={swatch} opacity="0.55" />
        <rect x="0" y="120" width="200" height="2" fill={swatch} opacity="0.55" />
      </svg>
    );
  }

  return (
    <div style={styles.container}>
      {inner}
      {soldOut && <div style={styles.soldOut}>Out of stock</div>}
      <div style={styles.label}>
        <span>◐ {label}</span>
        {note && <span>{note}</span>}
      </div>
    </div>
  );
}

// === Product card ===
function ProductCard({ product, onAdd, onOpen, density = "regular", tile = "stripe" }) {
  const [hover, setHover] = useState(false);
  const compact = density === "compact";
  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(product)}
      style={{
        cursor: "pointer",
        padding: compact ? "10px" : "14px",
        background: hover ? "var(--card)" : "transparent",
        borderTop: "1px solid var(--line)",
        transition: "background 120ms ease",
      }}
    >
      <PowderTile
        color={product.color}
        swatch={product.swatch}
        label={product.id}
        note={product.weight}
        kind={tile}
        soldOut={!product.stock}
      />
      <div style={{ marginTop: compact ? 10 : 14, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: compact ? "18px" : "22px", lineHeight: 1.1, color: "var(--ink)" }}>
            {product.name}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginTop: 4 }}>
            {product.latin}
          </div>
        </div>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: compact ? "16px" : "18px", color: "var(--ink)", whiteSpace: "nowrap" }}>
          {fmtPrice(product.price)}
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {product.uses.slice(0, 3).map((u) => (
          <span key={u} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em",
            color: "var(--ink-2)",
            padding: "3px 7px", border: "1px solid var(--line)", borderRadius: 999,
          }}>{u}</span>
        ))}
      </div>
      <button
        disabled={!product.stock}
        onClick={(e) => { e.stopPropagation(); onAdd(product); }}
        style={{
          marginTop: 12, width: "100%",
          padding: "10px 12px",
          fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
          textTransform: "uppercase", letterSpacing: "0.1em",
          background: product.stock ? (hover ? "var(--ink)" : "transparent") : "transparent",
          color: product.stock ? (hover ? "var(--bg)" : "var(--ink)") : "var(--muted)",
          border: "1px solid " + (product.stock ? "var(--ink)" : "var(--line)"),
          cursor: product.stock ? "pointer" : "not-allowed",
          transition: "background 120ms ease, color 120ms ease",
        }}
      >
        {product.stock ? "Add to cart — " + fmtPrice(product.price) : "Notify me"}
      </button>
    </article>
  );
}

// === Nav ===
function Nav({ route, onRoute, cartCount, onCart, onSearch, query, setQuery, currency, onCurrency }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [curOpen, setCurOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "var(--bg)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "16px 32px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 24 }}>
        {/* Mobile hamburger (hidden on desktop via CSS) */}
        <button
          data-nav-mobile-toggle
          onClick={() => setMobileMenuOpen(true)}
          style={{
            display: "none",
            alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none", padding: 8,
            cursor: "pointer", position: "absolute", left: 8, top: 12,
          }}
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="6" x2="19" y2="6"/><line x1="3" y1="11" x2="19" y2="11"/><line x1="3" y1="16" x2="19" y2="16"/></g></svg>
        </button>

        {/* Left links */}
        <div data-nav-row="links" style={{ display: "flex", gap: 22, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {["shop", "quiz", "recipes", "about", "account", "admin"].map((r) => (
            <a key={r} onClick={() => onRoute(r)} style={{
              cursor: "pointer", color: route === r ? "var(--accent)" : "var(--ink)",
              borderBottom: route === r ? "1px solid var(--accent)" : "1px solid transparent",
              paddingBottom: 2,
            }}>{r === "quiz" ? "Find your powder" : r === "account" ? "My account" : r}</a>
          ))}
        </div>
        {/* Logo */}
        <a onClick={() => onRoute("home")} style={{ cursor: "pointer", textAlign: "center" }}>
          <div data-nav-logo style={{
            fontFamily: "'Newsreader', serif", fontWeight: 500,
            fontSize: "28px", letterSpacing: "0.2em", color: "var(--ink)",
          }}>GROUND</div>
          <div data-nav-logo-sub style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "9px",
            textTransform: "uppercase", letterSpacing: "0.3em", color: "var(--muted)", marginTop: -2,
          }}>botanical powders · est. 2019</div>
        </a>
        {/* Right actions */}
        <div data-nav-row="actions" style={{ display: "flex", gap: 18, justifyContent: "flex-end", alignItems: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <div data-nav-search style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--line)", padding: "4px 0" }}>
            <span style={{ color: "var(--muted)" }}>⌕</span>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (e.target.value) onSearch(); }}
              placeholder="Search powders…"
              style={{
                background: "transparent", border: "none", outline: "none",
                fontFamily: "inherit", fontSize: "11px", textTransform: "uppercase",
                letterSpacing: "0.1em", color: "var(--ink)", width: 160,
              }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setCurOpen(o => !o)} style={{
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
              fontFamily: "inherit", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em",
              color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              EN · <span data-nav-currency-text>{currency}</span> <span style={{ fontSize: "8px", color: "var(--muted)" }}>{curOpen ? "▲" : "▼"}</span>
            </button>
            {curOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 220,
                background: "var(--bg)", border: "1px solid var(--ink)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50,
              }}>
                <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--line)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Currency</div>
                {Object.values(CURRENCIES).map((c) => (
                  <button key={c.code} onClick={() => { onCurrency(c.code); setCurOpen(false); }} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
                    padding: "10px 12px", background: currency === c.code ? "var(--bg-2)" : "transparent",
                    border: "none", borderBottom: "1px solid var(--line)", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--ink)", textAlign: "left",
                  }}>
                    <span><span style={{ marginRight: 8, display: "inline-block", minWidth: 14 }}>{c.symbol}</span> {c.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)" }}>{c.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <a onClick={onCart} style={{ cursor: "pointer", color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
            Cart
            <span style={{
              minWidth: 22, height: 22, borderRadius: 999,
              background: cartCount ? "var(--accent)" : "transparent",
              color: cartCount ? "var(--accent-ink)" : "var(--ink)",
              border: "1px solid " + (cartCount ? "var(--accent)" : "var(--line)"),
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", letterSpacing: 0,
            }}>{cartCount}</span>
          </a>
        </div>
      </div>
      {/* Announcement bar */}
      <div data-announcement style={{
        background: "var(--ink)", color: "var(--bg)",
        fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
        textTransform: "uppercase", letterSpacing: "0.2em",
        padding: "8px 32px", textAlign: "center",
      }}>
        ✦ Free shipping over {fmtPrice(60)} &nbsp; · &nbsp; Subscribe & save 15% &nbsp; · &nbsp; Harvest of the week: Lakadong turmeric
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} onRoute={(r) => { onRoute(r); setMobileMenuOpen(false); }} route={route} currency={currency} onCurrency={onCurrency} query={query} setQuery={setQuery} onSearch={onSearch} />}
    </nav>
  );
}

// === Footer ===
function Footer() {
  return (
    <footer style={{
      marginTop: 80, borderTop: "1px solid var(--line)",
      padding: "48px 32px 32px", background: "var(--bg-2)",
    }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 48 }}>
        <div>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: "36px", letterSpacing: "0.16em", color: "var(--ink)" }}>GROUND</div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: "16px", lineHeight: 1.5, color: "var(--ink-2)", marginTop: 12, maxWidth: 380, textWrap: "pretty" }}>
            Single-origin botanical powders. Slow-milled, third-party tested, sold by the gram you'll actually use.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 8 }}>
            <input placeholder="your@email.com" style={{
              flex: 1, padding: "12px 14px", background: "transparent",
              border: "1px solid var(--line)", borderRadius: 0,
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--ink)", outline: "none",
            }} />
            <button style={{
              padding: "12px 18px", background: "var(--ink)", color: "var(--bg)",
              border: "1px solid var(--ink)", cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>Subscribe</button>
          </div>
        </div>
        {[
          { title: "Shop", items: ["All powders", "Adaptogens", "Mushrooms", "Greens", "Ayurvedic"] },
          { title: "Learn", items: ["Recipes", "Sourcing", "Lab tests", "Journal"] },
          { title: "Support", items: ["Help center", "Shipping", "Returns", "Contact"] },
          { title: "Company", items: ["Our story", "Farmers", "Sustainability", "Press"] },
        ].map((col) => (
          <div key={col.title}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>{col.title}</div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.items.map((i) => (
                <a key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--ink)", cursor: "pointer" }}>{i}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1440, margin: "48px auto 0", paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
        <span>© 2026 GROUND botanical powders Co.</span>
        <span>Made with respect for plants, people, and patience.</span>
      </div>
    </footer>
  );
}

Object.assign(window, { applyVibe, PowderTile, ProductCard, Nav, Footer });

// === Mobile slide-in menu ===
function MobileMenu({ onClose, onRoute, route, currency, onCurrency, query, setQuery, onSearch }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 90,
      }} />
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: "min(86vw, 380px)",
        background: "var(--bg)", borderRight: "1px solid var(--ink)", zIndex: 100,
        display: "flex", flexDirection: "column", animation: "slideIn 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}>
        <div style={{ padding: "20px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: "24px", letterSpacing: "0.16em" }}>GROUND</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer", padding: 4 }}>×</button>
        </div>

        {/* Search */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px solid var(--line)" }}>
            <span style={{ color: "var(--muted)" }}>⌕</span>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (e.target.value) { onSearch(); onClose(); } }}
              placeholder="Search powders…"
              style={{
                background: "transparent", border: "none", outline: "none", width: "100%",
                fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "var(--ink)",
              }}
            />
          </div>
        </div>

        {/* Routes */}
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {[
            ["home", "Home"],
            ["shop", "Shop all powders"],
            ["quiz", "Find your powder"],
            ["recipes", "Recipes"],
            ["about", "Our story"],
            ["account", "My account"],
            ["admin", "Admin · mill room"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => onRoute(id)} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "16px 20px",
              background: route === id ? "var(--bg-2)" : "transparent",
              border: "none", borderBottom: "1px solid var(--line)",
              fontFamily: "'Newsreader', serif", fontSize: "22px",
              color: route === id ? "var(--accent)" : "var(--ink)",
              cursor: "pointer",
            }}>{label} <span style={{ float: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--muted)" }}>→</span></button>
          ))}
        </nav>

        {/* Currency */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--line)" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)", marginBottom: 10 }}>Currency</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
            {Object.values(CURRENCIES).map((c) => (
              <button key={c.code} onClick={() => onCurrency(c.code)} style={{
                padding: "10px 4px", textAlign: "center",
                background: currency === c.code ? "var(--ink)" : "transparent",
                color: currency === c.code ? "var(--bg)" : "var(--ink)",
                border: "1px solid " + (currency === c.code ? "var(--ink)" : "var(--line)"),
                fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", cursor: "pointer",
              }}>
                <div>{c.symbol}</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.1em", opacity: 0.7, marginTop: 2 }}>{c.code}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

Object.assign(window, { MobileMenu });
