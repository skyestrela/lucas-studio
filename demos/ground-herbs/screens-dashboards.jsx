// Customer Dashboard + Admin Dashboard

const { useState: useStateD, useMemo: useMemoD } = React;

/* ============================================================
   CUSTOMER DASHBOARD — Anika's account
   ============================================================ */

const SAMPLE_ORDERS = [
  { id: "GR-2941", date: "Apr 22, 2026", status: "Delivered", items: [
    { id: "turmeric", qty: 1, size: "Regular" },
    { id: "ashwagandha", qty: 1, size: "Regular" },
    { id: "moringa", qty: 2, size: "Regular" },
  ], shipping: 0, tracking: "1Z·UPS·...8F2" },
  { id: "GR-2790", date: "Mar 18, 2026", status: "Delivered", items: [
    { id: "matcha", qty: 1, size: "Regular" },
    { id: "reishi", qty: 1, size: "Double" },
  ], shipping: 0, tracking: "1Z·UPS·...4A1" },
  { id: "GR-2613", date: "Feb 09, 2026", status: "Delivered", items: [
    { id: "lionsmane", qty: 1, size: "Regular" },
    { id: "cacao", qty: 1, size: "Regular" },
    { id: "triphala", qty: 1, size: "Trial" },
  ], shipping: 6, tracking: "1Z·UPS·...2C8" },
  { id: "GR-2455", date: "Jan 03, 2026", status: "Delivered", items: [
    { id: "shilajit", qty: 1, size: "Regular" },
  ], shipping: 6, tracking: "1Z·UPS·...9E0" },
];

const SAMPLE_SUBS = [
  { id: "sub-1", product: "turmeric", size: "Regular", interval: 30, next: "May 22, 2026", status: "Active" },
  { id: "sub-2", product: "moringa", size: "Double", interval: 60, next: "Jun 10, 2026", status: "Active" },
  { id: "sub-3", product: "reishi", size: "Regular", interval: 30, next: "Apr 30, 2026", status: "Paused" },
];

function CustomerDashboard({ onOpenProduct, onAdd, onRoute }) {
  const [tab, setTab] = useStateD("overview");

  const orderTotal = (o) => {
    const sub = o.items.reduce((s, it) => {
      const p = PRODUCTS.find(x => x.id === it.id);
      const mult = it.size === "Trial" ? 0.5 : it.size === "Double" ? 1.85 : 1;
      return s + (p ? p.price * mult * it.qty : 0);
    }, 0);
    return sub + o.shipping;
  };

  const subs = SAMPLE_SUBS;
  const orders = SAMPLE_ORDERS;
  const lifetime = orders.reduce((s, o) => s + orderTotal(o), 0);
  const jarsShipped = orders.reduce((s, o) => s + o.items.reduce((a, it) => a + it.qty, 0), 0);

  return (
    <main>
      {/* Header */}
      <section style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "48px 32px 32px", display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "end" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>My account · member since 2024</div>
            <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "clamp(56px, 7vw, 96px)", lineHeight: 0.98, margin: "12px 0 0", color: "var(--ink)" }}>
              Good morning, <em style={{ color: "var(--accent)" }}>Anika</em>.
            </h1>
            <p style={{ marginTop: 16, fontFamily: "'Newsreader', serif", fontSize: "18px", color: "var(--ink-2)", maxWidth: 560 }}>
              Your turmeric ships in 4 days. The reishi is paused. Everything else is steady.
            </p>
          </div>
          <button onClick={() => onRoute("shop")} style={{ padding: "12px 18px", background: "var(--ink)", color: "var(--bg)", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>+ Shop more powders</button>
        </div>
        {/* tabs */}
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px", display: "flex", gap: 24, overflowX: "auto" }}>
          {[["overview", "Overview"], ["orders", "Orders · " + orders.length], ["subs", "Subscriptions · " + subs.length], ["address", "Address book"], ["preferences", "Preferences"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "16px 0", background: "transparent", border: "none",
              borderBottom: "2px solid " + (tab === id ? "var(--ink)" : "transparent"),
              fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
              textTransform: "uppercase", letterSpacing: "0.12em",
              color: tab === id ? "var(--ink)" : "var(--muted)", cursor: "pointer", whiteSpace: "nowrap",
            }}>{label}</button>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "48px 32px" }}>
        {tab === "overview" && (
          <>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
              {[
                ["Orders", orders.length, "lifetime"],
                ["Active subs", subs.filter(s => s.status === "Active").length, "of " + subs.length],
                ["Jars shipped", jarsShipped, "across " + orders.length + " orders"],
                ["Lifetime spend", fmtPrice(lifetime, { decimals: 0 }), "saved " + fmtPrice(lifetime * 0.15, { decimals: 0 }) + " with subs"],
              ].map(([k, v, sub], i) => (
                <div key={k} style={{ padding: "28px 24px", borderLeft: i > 0 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>{k}</div>
                  <div style={{ marginTop: 10, fontFamily: "'Newsreader', serif", fontSize: "56px", lineHeight: 1, color: "var(--ink)" }}>{v}</div>
                  <div style={{ marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Next shipment + reorder grid */}
            <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 32 }}>
              <div style={{ background: "var(--ink)", color: "var(--bg)", padding: 32 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.6 }}>Up next · in 4 days</div>
                <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "44px", lineHeight: 1.05, margin: "16px 0 0", textWrap: "balance" }}>
                  Turmeric (Regular) ships May 22.
                </h2>
                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 14, alignItems: "center" }}>
                  <PowderTile color="#D97706" swatch="#E89B40" label="turmeric" kind="jar" />
                  <div>
                    <div style={{ fontFamily: "'Newsreader', serif", fontSize: "20px" }}>Turmeric · 200g</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6, marginTop: 4 }}>Every 30 days · −15%</div>
                  </div>
                  <div style={{ fontFamily: "'Newsreader', serif", fontSize: "22px" }}>{fmtPrice(16 * 0.85)}</div>
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button style={{ padding: "10px 16px", background: "transparent", color: "var(--bg)", border: "1px solid var(--bg)", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em" }}>Skip next</button>
                  <button style={{ padding: "10px 16px", background: "transparent", color: "var(--bg)", border: "1px solid var(--bg)", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em" }}>Edit interval</button>
                  <button style={{ padding: "10px 16px", background: "var(--bg)", color: "var(--ink)", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em" }}>Add to this order +</button>
                </div>
              </div>

              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Reorder · most loved</div>
                <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "36px", margin: "12px 0 16px", color: "var(--ink)" }}>One-tap refill.</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid var(--line)" }}>
                  {["turmeric", "ashwagandha", "moringa", "matcha"].map((id) => {
                    const p = PRODUCTS.find(x => x.id === id);
                    return (
                      <div key={id} style={{ padding: "14px 0", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "44px 1fr auto auto", gap: 14, alignItems: "center" }}>
                        <PowderTile color={p.color} swatch={p.swatch} label={p.id} kind="splash" />
                        <div>
                          <div style={{ fontFamily: "'Newsreader', serif", fontSize: "18px", color: "var(--ink)", cursor: "pointer" }} onClick={() => onOpenProduct(p)}>{p.name}</div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Ordered 3× · last Mar</div>
                        </div>
                        <div style={{ fontFamily: "'Newsreader', serif", fontSize: "18px", color: "var(--ink)" }}>{fmtPrice(p.price)}</div>
                        <button onClick={() => onAdd(p)} style={{ padding: "8px 12px", background: "var(--ink)", color: "var(--bg)", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em" }}>Add</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent orders */}
            <div style={{ marginTop: 48 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--line)", paddingTop: 24 }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Recent</div>
                  <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "36px", margin: "8px 0 0" }}>Last four orders.</h2>
                </div>
                <a onClick={() => setTab("orders")} style={{ cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em" }}>All orders →</a>
              </div>
              <OrdersList orders={orders} orderTotal={orderTotal} />
            </div>
          </>
        )}

        {tab === "orders" && (
          <div>
            <OrdersList orders={orders} orderTotal={orderTotal} long />
          </div>
        )}

        {tab === "subs" && (
          <SubscriptionsList subs={subs} onOpenProduct={onOpenProduct} />
        )}

        {tab === "address" && <AddressBook />}
        {tab === "preferences" && <Preferences />}
      </div>
    </main>
  );
}

function OrdersList({ orders, orderTotal, long }) {
  return (
    <div style={{ marginTop: 24 }}>
      {orders.map((o) => (
        <details key={o.id} style={{ borderTop: "1px solid var(--line)" }}>
          <summary style={{ listStyle: "none", cursor: "pointer", padding: "20px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 16, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)" }}>{o.id}</div>
              <div style={{ marginTop: 4, fontFamily: "'Newsreader', serif", fontSize: "18px" }}>{o.date}</div>
            </div>
            <div style={{ display: "flex", marginLeft: -2 }}>
              {o.items.slice(0, 4).map((it, i) => {
                const p = PRODUCTS.find(x => x.id === it.id);
                return p ? (
                  <div key={i} style={{ width: 40, marginLeft: -8, border: "2px solid var(--bg)" }}>
                    <PowderTile color={p.color} swatch={p.swatch} label={p.id} kind="jar" />
                  </div>
                ) : null;
              })}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--ink-2)" }}>{o.items.length} {o.items.length === 1 ? "item" : "items"}</div>
            <div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em",
                padding: "4px 10px", border: "1px solid var(--line)",
                color: o.status === "Delivered" ? "var(--accent)" : "var(--ink)",
              }}>● {o.status}</span>
            </div>
            <div style={{ textAlign: "right", fontFamily: "'Newsreader', serif", fontSize: "22px" }}>{fmtPrice(orderTotal(o))}</div>
          </summary>
          <div style={{ padding: "0 0 24px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
            <div>
              {o.items.map((it, i) => {
                const p = PRODUCTS.find(x => x.id === it.id);
                if (!p) return null;
                const mult = it.size === "Trial" ? 0.5 : it.size === "Double" ? 1.85 : 1;
                return (
                  <div key={i} style={{ padding: "12px 0", borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "44px 1fr auto auto", gap: 14, alignItems: "center" }}>
                    <PowderTile color={p.color} swatch={p.swatch} label={p.id} kind="jar" />
                    <div>
                      <div style={{ fontFamily: "'Newsreader', serif", fontSize: "16px" }}>{p.name}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)" }}>{it.size} · {it.qty} ×</div>
                    </div>
                    <div style={{ fontFamily: "'Newsreader', serif", fontSize: "15px" }}>{fmtPrice(p.price * mult * it.qty)}</div>
                    <button style={{ padding: "6px 10px", background: "transparent", border: "1px solid var(--line)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>Buy again</button>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "var(--bg-2)", padding: 20 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Tracking</div>
              <div style={{ marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "var(--ink)" }}>{o.tracking}</div>
              <div style={{ marginTop: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Ship to</div>
              <div style={{ marginTop: 6, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", lineHeight: 1.45, color: "var(--ink)" }}>Anika Patel · 412 Mortar Lane<br />Brooklyn, NY 11215</div>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                <button style={{ padding: "10px", background: "var(--ink)", color: "var(--bg)", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em" }}>Download invoice</button>
                <button style={{ padding: "10px", background: "transparent", color: "var(--ink)", border: "1px solid var(--ink)", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em" }}>Need help with this order?</button>
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function SubscriptionsList({ subs, onOpenProduct }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--line)", paddingTop: 24 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Subscriptions · {subs.length}</div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "44px", margin: "8px 0 0", textWrap: "balance" }}>Your repeating rhythm.</h2>
        </div>
        <button style={{ padding: "12px 18px", background: "var(--ink)", color: "var(--bg)", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em" }}>+ Add a subscription</button>
      </div>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid var(--line)" }}>
        {subs.map((s) => {
          const p = PRODUCTS.find(x => x.id === s.product);
          const mult = s.size === "Trial" ? 0.5 : s.size === "Double" ? 1.85 : 1;
          const subPrice = p.price * mult * 0.85;
          return (
            <div key={s.id} style={{ padding: "24px 0", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 20, alignItems: "center" }}>
              <PowderTile color={p.color} swatch={p.swatch} label={p.id} kind="jar" />
              <div>
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: "24px", color: "var(--ink)", cursor: "pointer" }} onClick={() => onOpenProduct(p)}>{p.name}</div>
                <div style={{ marginTop: 6, display: "flex", gap: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
                  <span>{s.size}</span>
                  <span>Every {s.interval} days</span>
                  <span>Next: {s.next}</span>
                  <span style={{ color: s.status === "Active" ? "var(--accent)" : "var(--muted)" }}>● {s.status}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Newsreader', serif", fontSize: "22px" }}>{fmtPrice(subPrice)}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)" }}>per shipment · −15%</div>
                </div>
                <button style={{ padding: "10px 14px", background: "transparent", border: "1px solid var(--ink)", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em" }}>Manage →</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddressBook() {
  const addresses = [
    { id: 1, label: "Home", name: "Anika Patel", line: "412 Mortar Lane", city: "Brooklyn, NY 11215", country: "USA", default: true },
    { id: 2, label: "Work", name: "Anika Patel · c/o Studio K", line: "228 Bowery, Floor 4", city: "New York, NY 10012", country: "USA", default: false },
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--line)", paddingTop: 24 }}>
        <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "44px", margin: 0 }}>Saved addresses.</h2>
        <button style={{ padding: "12px 18px", background: "var(--ink)", color: "var(--bg)", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em" }}>+ Add address</button>
      </div>
      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {addresses.map((a) => (
          <div key={a.id} style={{ padding: 24, border: "1px solid var(--line)", background: "var(--card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>{a.label}</span>
              {a.default && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", padding: "3px 8px", background: "var(--ink)", color: "var(--bg)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Default</span>}
            </div>
            <div style={{ marginTop: 16, fontFamily: "'Newsreader', serif", fontSize: "18px", lineHeight: 1.5, color: "var(--ink)" }}>
              {a.name}<br />{a.line}<br />{a.city}<br />{a.country}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button style={{ flex: 1, padding: "8px", background: "transparent", border: "1px solid var(--line)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>Edit</button>
              <button style={{ flex: 1, padding: "8px", background: "transparent", border: "1px solid var(--line)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", color: "var(--accent)" }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Preferences() {
  const [prefs, setPrefs] = useStateD({ news: true, restock: true, recipes: false, dietary: ["vegan"], goal: "energy" });
  const dietary = ["vegan", "gluten-free", "caffeine-free", "sugar-free"];
  return (
    <div>
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
        <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "44px", margin: 0 }}>Preferences.</h2>
        <p style={{ marginTop: 8, fontFamily: "'Newsreader', serif", fontSize: "18px", color: "var(--ink-2)" }}>We use these to recommend powders and tune emails.</p>
      </div>
      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div>
          <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Dietary</h3>
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {dietary.map((d) => {
              const on = prefs.dietary.includes(d);
              return (
                <button key={d} onClick={() => setPrefs(p => ({ ...p, dietary: on ? p.dietary.filter(x => x !== d) : [...p.dietary, d] }))} style={{
                  padding: "10px 16px", border: "1px solid " + (on ? "var(--ink)" : "var(--line)"),
                  background: on ? "var(--ink)" : "transparent",
                  color: on ? "var(--bg)" : "var(--ink)",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
                  textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
                }}>{d}</button>
              );
            })}
          </div>
          <h3 style={{ marginTop: 32, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Primary goal</h3>
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["energy", "calm", "focus", "recovery", "beauty", "digestion"].map((g) => (
              <button key={g} onClick={() => setPrefs(p => ({ ...p, goal: g }))} style={{
                padding: "12px 16px", textAlign: "left",
                border: "1px solid " + (prefs.goal === g ? "var(--ink)" : "var(--line)"),
                background: prefs.goal === g ? "var(--ink)" : "transparent",
                color: prefs.goal === g ? "var(--bg)" : "var(--ink)",
                fontFamily: "'Newsreader', serif", fontSize: "16px",
                cursor: "pointer", textTransform: "capitalize",
              }}>{g}</button>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Emails</h3>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {[["news", "Monthly almanac"], ["restock", "Restock alerts"], ["recipes", "Recipe of the week"]].map(([k, l]) => (
              <label key={k} style={{ padding: "16px 0", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Newsreader', serif", fontSize: "18px", cursor: "pointer" }}>
                {l}
                <button onClick={() => setPrefs(p => ({ ...p, [k]: !p[k] }))} style={{
                  width: 36, height: 22, borderRadius: 999, padding: 2,
                  background: prefs[k] ? "var(--accent)" : "var(--line)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: prefs[k] ? "flex-end" : "flex-start",
                }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, background: "white" }} />
                </button>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */

function AdminDashboard({ onOpenProduct }) {
  const [tab, setTab] = useStateD("overview");
  const [period, setPeriod] = useStateD("30d");
  const [orderFilter, setOrderFilter] = useStateD("all");

  // Synthetic admin orders
  const adminOrders = useMemoD(() => {
    const customers = ["Anika P.", "Marc D.", "Jules R.", "Yuki T.", "Liang Z.", "Sofia M.", "Owen B.", "Chiara V.", "Noah K.", "Priya S.", "Felix A.", "Tomás G."];
    const statuses = [["pending", "Pending"], ["packing", "Packing"], ["shipped", "Shipped"], ["delivered", "Delivered"]];
    const out = [];
    for (let i = 0; i < 24; i++) {
      const itemsCount = 1 + (i % 4);
      const items = [];
      for (let j = 0; j < itemsCount; j++) {
        items.push(PRODUCTS[(i * 3 + j * 7) % PRODUCTS.length]);
      }
      const total = items.reduce((s, p) => s + p.price, 0);
      const s = statuses[i % statuses.length];
      out.push({
        id: "GR-" + (3000 - i),
        date: new Date(2026, 4, 22 - Math.floor(i * 0.7)).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        customer: customers[i % customers.length],
        items, total,
        status: s[0], statusLabel: s[1],
        currency: ["USD", "GBP", "EUR", "USD", "USD"][i % 5],
      });
    }
    return out;
  }, []);

  const filtered = orderFilter === "all" ? adminOrders : adminOrders.filter(o => o.status === orderFilter);

  // KPIs
  const kpis = [
    { k: "Revenue", v: fmtPrice(48230, { decimals: 0 }), d: "+18% vs. last 30d", up: true },
    { k: "Orders", v: "412", d: "+9% vs. last 30d", up: true },
    { k: "Avg. order", v: fmtPrice(117), d: "+$8 vs. last 30d", up: true },
    { k: "Active subs", v: "284", d: "+12 this week", up: true },
    { k: "Conversion", v: "3.8%", d: "−0.2pp vs. last 30d", up: false },
    { k: "Refund rate", v: "1.2%", d: "Steady", up: true },
  ];

  // Synthetic 30-day sales curve
  const series = useMemoD(() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      const day = i + 1;
      const base = 1400 + Math.sin(i / 4) * 320 + Math.cos(i / 2.4) * 180;
      const noise = ((i * 7919) % 400) - 200;
      arr.push({ day, value: Math.max(400, Math.round(base + noise)) });
    }
    return arr;
  }, []);

  return (
    <main style={{ background: "var(--bg)", minHeight: "calc(100vh - 80px)" }}>
      <div style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 32px 20px", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Admin · operations</div>
            <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "56px", lineHeight: 1, margin: "8px 0 0" }}>Mill room.</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[["7d", "Last 7"], ["30d", "Last 30"], ["90d", "Last 90"], ["ytd", "YTD"]].map(([id, l]) => (
              <button key={id} onClick={() => setPeriod(id)} style={{
                padding: "8px 14px", background: period === id ? "var(--ink)" : "transparent",
                color: period === id ? "var(--bg)" : "var(--ink)",
                border: "1px solid " + (period === id ? "var(--ink)" : "var(--line)"),
                cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
                textTransform: "uppercase", letterSpacing: "0.12em",
              }}>{l}</button>
            ))}
            <div style={{ width: 1, height: 24, background: "var(--line)", margin: "0 4px" }} />
            <button style={{ padding: "8px 14px", background: "var(--ink)", color: "var(--bg)", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em" }}>Export CSV</button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px", display: "flex", gap: 24 }}>
          {[["overview", "Overview"], ["orders", "Orders · " + adminOrders.length], ["inventory", "Inventory · 40"], ["customers", "Customers · 1,284"], ["growers", "Growers · 40"]].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "16px 0", background: "transparent", border: "none",
              borderBottom: "2px solid " + (tab === id ? "var(--ink)" : "transparent"),
              fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
              textTransform: "uppercase", letterSpacing: "0.12em",
              color: tab === id ? "var(--ink)" : "var(--muted)", cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px" }}>
        {tab === "overview" && (
          <>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
              {kpis.map((k, i) => (
                <div key={k.k} style={{ padding: "24px 20px", borderLeft: i > 0 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>{k.k}</div>
                  <div style={{ marginTop: 10, fontFamily: "'Newsreader', serif", fontSize: "40px", lineHeight: 1 }}>{k.v}</div>
                  <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: k.up ? "var(--accent)" : "var(--muted)" }}>{k.up ? "↗" : "↘"} {k.d}</div>
                </div>
              ))}
            </div>

            {/* Sales chart + Top sellers */}
            <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32 }}>
              <div style={{ padding: 24, border: "1px solid var(--line)", background: "var(--card)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Revenue · last 30 days</div>
                    <div style={{ marginTop: 6, fontFamily: "'Newsreader', serif", fontSize: "44px" }}>{fmtPrice(48230, { decimals: 0 })}</div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)" }}>↗ 18.4%</div>
                </div>
                <SparkChart series={series} />
              </div>

              <div style={{ padding: 24, border: "1px solid var(--line)" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Top sellers · 30d</div>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  {PRODUCTS.filter(p => p.hero).slice(0, 7).map((p, i) => {
                    const pct = 100 - i * 10;
                    return (
                      <div key={p.id} style={{ display: "grid", gridTemplateColumns: "20px 1fr 40px", gap: 10, alignItems: "center" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)" }}>0{i+1}</span>
                        <div>
                          <div style={{ fontFamily: "'Newsreader', serif", fontSize: "15px", color: "var(--ink)" }}>{p.name}</div>
                          <div style={{ marginTop: 4, height: 3, background: "var(--bg-2)" }}><div style={{ width: pct + "%", height: "100%", background: p.color }} /></div>
                        </div>
                        <span style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>{Math.round(80 - i * 7)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent orders + alerts */}
            <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--line)", paddingTop: 20 }}>
                  <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "28px", margin: 0 }}>Recent orders.</h3>
                  <a onClick={() => setTab("orders")} style={{ cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em" }}>All →</a>
                </div>
                <AdminOrdersTable orders={adminOrders.slice(0, 6)} compact />
              </div>
              <div>
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
                  <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "28px", margin: 0 }}>Mill notes.</h3>
                </div>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    { type: "warn", title: "Chaga is restocking", body: "Wild-foraged batch from Finland arrives May 28. 142 customers waitlisted." },
                    { type: "ok", title: "New harvest received", body: "Lakadong turmeric, 240kg from Rajbanshi farm. Tests due May 24." },
                    { type: "warn", title: "Shilajit running low", body: "12 jars left. Reorder placed with Gilgit cooperative." },
                    { type: "info", title: "GBP price refresh", body: "FX rates updated this morning. £ list reflects today's rate." },
                  ].map((n, i) => (
                    <div key={i} style={{ padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontFamily: "'Newsreader', serif", fontSize: "16px", color: "var(--ink)" }}>{n.title}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.12em", padding: "2px 6px",
                          background: n.type === "warn" ? "var(--accent)" : n.type === "ok" ? "var(--ink)" : "var(--bg-2)",
                          color: n.type === "info" ? "var(--ink)" : "var(--bg)",
                        }}>{n.type}</span>
                      </div>
                      <p style={{ margin: "6px 0 0", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--ink-2)", lineHeight: 1.45 }}>{n.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "orders" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              {[["all", "All"], ["pending", "Pending"], ["packing", "Packing"], ["shipped", "Shipped"], ["delivered", "Delivered"]].map(([id, l]) => (
                <button key={id} onClick={() => setOrderFilter(id)} style={{
                  padding: "8px 14px", background: orderFilter === id ? "var(--ink)" : "transparent",
                  color: orderFilter === id ? "var(--bg)" : "var(--ink)",
                  border: "1px solid " + (orderFilter === id ? "var(--ink)" : "var(--line)"),
                  cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
                  textTransform: "uppercase", letterSpacing: "0.12em",
                }}>{l} {id === "all" ? `· ${adminOrders.length}` : `· ${adminOrders.filter(o => o.status === id).length}`}</button>
              ))}
            </div>
            <AdminOrdersTable orders={filtered} />
          </div>
        )}

        {tab === "inventory" && <AdminInventory onOpenProduct={onOpenProduct} />}
        {tab === "customers" && <AdminCustomers />}
        {tab === "growers" && <AdminGrowers />}
      </div>
    </main>
  );
}

function SparkChart({ series }) {
  const W = 760, H = 200, PAD = 8;
  const max = Math.max(...series.map(s => s.value));
  const min = Math.min(...series.map(s => s.value));
  const x = (i) => PAD + (i / (series.length - 1)) * (W - PAD * 2);
  const y = (v) => PAD + (1 - (v - min) / (max - min || 1)) * (H - PAD * 2);
  const path = series.map((s, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(s.value).toFixed(1)}`).join(" ");
  const area = `${path} L ${x(series.length - 1).toFixed(1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 200, marginTop: 16 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkfill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkfill)" />
      <path d={path} fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      {series.map((s, i) => i % 5 === 0 && (
        <circle key={i} cx={x(i)} cy={y(s.value)} r="2.5" fill="var(--ink)" />
      ))}
    </svg>
  );
}

function AdminOrdersTable({ orders, compact }) {
  return (
    <div data-table-scroll>
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 80px 120px 100px 80px", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)" }}>
        <span>Order</span><span>Customer</span><span>Items</span><span>Qty</span><span>Status</span><span style={{ textAlign: "right" }}>Total</span><span></span>
      </div>
      {orders.map((o) => (
        <div key={o.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 80px 120px 100px 80px", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "var(--ink)" }}>{o.id}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)" }}>{o.date}</div>
          </div>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: "15px" }}>{o.customer}</div>
          <div style={{ display: "flex", marginLeft: -4 }}>
            {o.items.slice(0, 4).map((p, i) => (
              <div key={i} title={p.name} style={{ width: 28, marginLeft: -6, border: "2px solid var(--bg)" }}>
                <PowderTile color={p.color} swatch={p.swatch} label={p.id} kind="jar" />
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "var(--ink-2)" }}>{o.items.length}</div>
          <div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.12em",
              padding: "4px 8px", display: "inline-block",
              background: o.status === "pending" ? "var(--bg-2)" : o.status === "packing" ? "var(--accent)" : o.status === "shipped" ? "var(--ink)" : "transparent",
              color: o.status === "pending" ? "var(--ink)" : o.status === "delivered" ? "var(--ink)" : "var(--bg)",
              border: o.status === "delivered" ? "1px solid var(--line)" : "none",
            }}>● {o.statusLabel}</span>
          </div>
          <div style={{ textAlign: "right", fontFamily: "'Newsreader', serif", fontSize: "18px" }}>{fmtPrice(o.total)}</div>
          <button style={{ padding: "6px 10px", background: "transparent", border: "1px solid var(--ink)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>View →</button>
        </div>
      ))}
    </div>
    </div>
  );
}

function AdminInventory({ onOpenProduct }) {
  // Synthetic stock numbers
  const rows = useMemoD(() => PRODUCTS.map((p, i) => {
    const stock = p.stock ? (i % 5 === 0 ? 4 + (i % 6) : 32 + ((i * 13) % 80)) : 0;
    const sold30 = 20 + ((i * 17) % 140);
    const days = stock === 0 ? 0 : Math.round(stock / (sold30 / 30) * 10) / 10;
    return { p, stock, sold30, days };
  }), []);
  const lowStock = rows.filter(r => r.stock > 0 && r.stock < 20).length;
  const oos = rows.filter(r => r.stock === 0).length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        {[
          ["SKUs", PRODUCTS.length],
          ["In stock", PRODUCTS.length - oos],
          ["Low stock", lowStock, "var(--accent)"],
          ["Out of stock", oos],
        ].map(([k, v, color], i) => (
          <div key={k} style={{ padding: "20px 24px", borderLeft: i > 0 ? "1px solid var(--line)" : "none" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>{k}</div>
            <div style={{ marginTop: 8, fontFamily: "'Newsreader', serif", fontSize: "40px", lineHeight: 1, color: color || "var(--ink)" }}>{v}</div>
          </div>
        ))}
      </div>

      <div data-table-scroll style={{ marginTop: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "44px 1.4fr 100px 90px 90px 110px 110px 80px", gap: 12, padding: "10px 12px", background: "var(--bg-2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink)" }}>
          <span></span><span>Product</span><span>SKU</span><span>Price</span><span>Stock</span><span>Sold 30d</span><span>Days left</span><span></span>
        </div>
        {rows.map((r, i) => (
          <div key={r.p.id} style={{ display: "grid", gridTemplateColumns: "44px 1.4fr 100px 90px 90px 110px 110px 80px", gap: 12, padding: "10px 12px", borderBottom: "1px solid var(--line)", alignItems: "center", background: r.stock === 0 ? "var(--bg-2)" : "transparent" }}>
            <PowderTile color={r.p.color} swatch={r.p.swatch} label={r.p.id} kind="jar" />
            <div onClick={() => onOpenProduct(r.p)} style={{ cursor: "pointer" }}>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: "15px" }}>{r.p.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)" }}>{r.p.weight} · {r.p.origin.split(",").slice(-1)[0].trim()}</div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ink-2)" }}>GR-{r.p.id.slice(0, 3).toUpperCase()}-{(i + 100)}</div>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: "15px" }}>{fmtPrice(r.p.price)}</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
              color: r.stock === 0 ? "var(--accent)" : r.stock < 20 ? "var(--accent)" : "var(--ink)",
            }}>{r.stock === 0 ? "0 · out" : r.stock + " jars"}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "var(--ink-2)" }}>{r.sold30}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: r.days < 7 && r.days > 0 ? "var(--accent)" : "var(--ink-2)" }}>{r.stock === 0 ? "—" : r.days + "d"}</div>
            <button style={{ padding: "6px 10px", background: r.stock < 20 ? "var(--ink)" : "transparent", color: r.stock < 20 ? "var(--bg)" : "var(--ink)", border: "1px solid var(--ink)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>
              {r.stock === 0 ? "Restock" : r.stock < 20 ? "Reorder" : "Edit"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCustomers() {
  const customers = [
    { name: "Anika Patel", email: "anika@…", orders: 8, lifetime: 412, joined: "Oct 2024", subs: 3 },
    { name: "Marc Delacroix", email: "marc.d@…", orders: 12, lifetime: 688, joined: "Aug 2023", subs: 2 },
    { name: "Jules Romero", email: "jules.r@…", orders: 4, lifetime: 167, joined: "Feb 2026", subs: 1 },
    { name: "Yuki Tanaka", email: "yuki.t@…", orders: 22, lifetime: 1180, joined: "May 2022", subs: 5 },
    { name: "Liang Zhou", email: "liang@…", orders: 3, lifetime: 89, joined: "Apr 2026", subs: 0 },
    { name: "Sofia Marín", email: "sofia.m@…", orders: 14, lifetime: 742, joined: "Jan 2024", subs: 3 },
    { name: "Owen Brennan", email: "owen.b@…", orders: 6, lifetime: 312, joined: "Dec 2024", subs: 1 },
    { name: "Chiara Villa", email: "chiara@…", orders: 9, lifetime: 488, joined: "Sep 2024", subs: 2 },
  ];
  return (
    <div data-table-scroll>
      <div style={{ display: "grid", gridTemplateColumns: "160px 1.4fr 1fr 100px 120px 120px 100px", gap: 12, padding: "10px 12px", background: "var(--bg-2)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink)" }}>
        <span>Joined</span><span>Name</span><span>Email</span><span>Orders</span><span>Lifetime</span><span>Subs</span><span></span>
      </div>
      {customers.map((c, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1.4fr 1fr 100px 120px 120px 100px", gap: 12, padding: "14px 12px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--muted)" }}>{c.joined}</span>
          <span style={{ fontFamily: "'Newsreader', serif", fontSize: "16px" }}>{c.name}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "var(--ink-2)" }}>{c.email}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px" }}>{c.orders}</span>
          <span style={{ fontFamily: "'Newsreader', serif", fontSize: "16px" }}>{fmtPrice(c.lifetime, { decimals: 0 })}</span>
          <span>
            {c.subs > 0 ? (
              <span style={{ display: "inline-flex", gap: 4 }}>
                {Array.from({ length: c.subs }).map((_, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)" }} />)}
                <span style={{ marginLeft: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--muted)" }}>{c.subs}</span>
              </span>
            ) : <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--muted)" }}>—</span>}
          </span>
          <button style={{ padding: "6px 10px", background: "transparent", border: "1px solid var(--ink)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>Profile →</button>
        </div>
      ))}
    </div>
  );
}

function AdminGrowers() {
  const growers = [
    { name: "Rajbanshi farm", region: "Meghalaya, India", products: ["turmeric"], hectares: 3.4, since: 2019 },
    { name: "Yamamoto-san", region: "Uji, Kyoto, Japan", products: ["matcha"], hectares: 1.1, since: 2020 },
    { name: "Sharma cooperative", region: "Rajasthan, India", products: ["ashwagandha", "fenugreek"], hectares: 12.8, since: 2019 },
    { name: "Geumsan Ginseng Co.", region: "Geumsan, Korea", products: ["ginseng"], hectares: 5.6, since: 2021 },
    { name: "Junín Maca Collective", region: "Junín, Peru", products: ["maca", "camucamu"], hectares: 18.3, since: 2020 },
    { name: "Sateré-Mawé community", region: "Maués, Brazil", products: ["guarana"], hectares: 6.2, since: 2022 },
    { name: "Hokkaido Burdock Farms", region: "Hokkaido, Japan", products: ["burdock"], hectares: 4.7, since: 2023 },
    { name: "Aragón Apiary", region: "Aragón, Spain", products: ["beepollen"], hectares: 0, since: 2021 },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      {growers.map((g, i) => (
        <div key={i} style={{ padding: 20, border: "1px solid var(--line)", background: "var(--card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Partner since {g.since}</div>
              <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "24px", margin: "8px 0 4px", color: "var(--ink)" }}>{g.name}</h3>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--ink-2)" }}>{g.region}</div>
            </div>
            <div style={{ width: 64, height: 64 }}>
              <PowderTile color={PRODUCTS.find(p => p.id === g.products[0])?.color || "#999"} swatch={PRODUCTS.find(p => p.id === g.products[0])?.swatch || "#bbb"} label={g.products[0]} kind="splash" />
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>
            <span><span style={{ color: "var(--muted)" }}>Powders</span> · {g.products.length}</span>
            <span><span style={{ color: "var(--muted)" }}>Hectares</span> · {g.hectares || "n/a"}</span>
            <span><span style={{ color: "var(--muted)" }}>Last visit</span> · Feb 2026</span>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { CustomerDashboard, AdminDashboard });
