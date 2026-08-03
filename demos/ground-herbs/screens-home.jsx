// Screens — Home, Shop, PDP, CartDrawer, Checkout, Quiz, Recipes, About

const { useState: useStateS, useEffect: useEffectS, useMemo: useMemoS, useRef: useRefS } = React;

/* ========================= HOME ========================= */
function HomeScreen({ onRoute, onOpenProduct, onAdd, hero, tile, openQuiz }) {
  const featured = PRODUCTS.filter(p => p.hero).slice(0, 7);
  const editor = PRODUCTS.find(p => p.id === "turmeric");

  return (
    <main>
      {/* HERO — 4 variants */}
      {hero === "editorial" && <HeroEditorial onOpen={onOpenProduct} editor={editor} tile={tile} />}
      {hero === "product"   && <HeroProduct featured={featured} onOpen={onOpenProduct} tile={tile} />}
      {hero === "manifesto" && <HeroManifesto onRoute={onRoute} />}
      {hero === "blend"     && <HeroBlend onAdd={onAdd} openQuiz={openQuiz} tile={tile} />}

      {/* Ticker */}
      <Ticker />

      {/* Featured grid */}
      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 32px 0" }}>
        <SectionHeader kicker="Index 01" title="The seven most-prescribed powders." link="Shop all 40 →" onClick={() => onRoute("shop")} />
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderBottom: "1px solid var(--line)" }}>
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} onOpen={onOpenProduct} tile={tile} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) 1fr", gap: 0, borderBottom: "1px solid var(--line)" }}>
          {featured.slice(4).map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} onOpen={onOpenProduct} tile={tile} />
          ))}
          <SubscribeCard />
        </div>
      </section>

      {/* By category */}
      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 32px 0" }}>
        <SectionHeader kicker="Index 02" title="Browse by family." />
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {CATEGORIES.slice(1).map((c) => {
            const sample = PRODUCTS.find(p => p.category === c.id);
            return (
              <div key={c.id} onClick={() => onRoute("shop")} style={{ cursor: "pointer" }}>
                <PowderTile color={sample.color} swatch={sample.swatch} label={c.id} note={c.n + " items"} kind="splash" />
                <div style={{ marginTop: 12, fontFamily: "'Newsreader', serif", fontSize: "20px", color: "var(--ink)" }}>{c.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Story strip */}
      <StoryStrip />

      {/* Recipes preview */}
      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 32px 0" }}>
        <SectionHeader kicker="Index 03" title="Three ways to drink them." link="All recipes →" onClick={() => onRoute("recipes")} />
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {RECIPES.slice(0, 3).map((r) => <RecipeCard key={r.title} recipe={r} tile={tile} />)}
        </div>
      </section>

      {/* Trust strip */}
      <TrustStrip />
    </main>
  );
}

function SectionHeader({ kicker, title, link, onClick }) {
  return (
    <div data-section-header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--line)", paddingTop: 24 }}>
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>{kicker}</div>
        <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "44px", lineHeight: 1.05, color: "var(--ink)", margin: "12px 0 0", textWrap: "pretty" }}>{title}</h2>
      </div>
      {link && <a onClick={onClick} style={{ cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--ink)" }}>{link}</a>}
    </div>
  );
}

/* ===== Hero variants ===== */
function HeroEditorial({ onOpen, editor, tile }) {
  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "48px 32px 0", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "end" }}>
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Volume IX · Spring '26</div>
        <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "clamp(72px, 9vw, 132px)", lineHeight: 0.95, margin: "16px 0 0", color: "var(--ink)", textWrap: "balance" }}>
          The world's
          <br />
          oldest <em style={{ fontStyle: "italic", color: "var(--accent)" }}>pharmacy</em>,
          <br />
          milled to order.
        </h1>
        <p style={{ marginTop: 32, fontFamily: "'Newsreader', serif", fontSize: "20px", lineHeight: 1.45, color: "var(--ink-2)", maxWidth: 560, textWrap: "pretty" }}>
          Forty plant powders sourced from a single farm, valley, or forest each. Tested for purity. Sold by the gram you'll actually use, never the kilo you won't.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
          <button onClick={() => onOpen(editor)} style={{ padding: "16px 24px", background: "var(--ink)", color: "var(--bg)", border: "1px solid var(--ink)", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer" }}>Shop the harvest →</button>
          <button style={{ padding: "16px 24px", background: "transparent", color: "var(--ink)", border: "1px solid var(--ink)", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer" }}>How we source</button>
        </div>
      </div>
      <div>
        <PowderTile color={editor.color} swatch={editor.swatch} label={"product · " + editor.id} note={editor.weight} kind="jar" />
        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
          <span>Fig. 01 — {editor.name}</span>
          <span>{editor.origin}</span>
        </div>
      </div>
    </section>
  );
}

function HeroProduct({ featured, onOpen, tile }) {
  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "48px 32px 0" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>The shelf · 7 in the spotlight</div>
      <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "clamp(56px, 7vw, 96px)", lineHeight: 0.98, margin: "12px 0 32px", color: "var(--ink)", textWrap: "balance" }}>
        Forty powders. <em style={{ color: "var(--accent)" }}>One pantry.</em>
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {featured.map((p, i) => (
          <div key={p.id} onClick={() => onOpen(p)} style={{ cursor: "pointer", aspectRatio: i === 3 ? "1/2.05" : "1/1", gridRow: i === 3 ? "span 2" : "auto" }}>
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, background: p.color, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(135deg, ${p.swatch}33 0px, ${p.swatch}33 2px, transparent 2px, transparent 12px)` }} />
                <div style={{ position: "absolute", left: 12, top: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", color: "var(--bg)", opacity: 0.85 }}>0{i+1}</div>
              </div>
              <div style={{ padding: "10px 4px 0", background: "var(--bg)" }}>
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: "16px", lineHeight: 1.1 }}>{p.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)", marginTop: 2 }}>{fmtPrice(p.price)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroManifesto({ onRoute }) {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 32px 60px", textAlign: "center" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3em", color: "var(--muted)" }}>— A manifesto —</div>
      <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontStyle: "italic", fontSize: "clamp(56px, 7vw, 104px)", lineHeight: 1.02, margin: "32px 0", color: "var(--ink)", textWrap: "balance" }}>
        Plants kept people alive for ten thousand years before pills did. The good ones still do.
      </h1>
      <p style={{ fontFamily: "'Newsreader', serif", fontSize: "20px", lineHeight: 1.5, color: "var(--ink-2)", maxWidth: 680, margin: "0 auto", textWrap: "pretty" }}>
        We work with forty growers in fourteen countries. We don't blend, mask, or dilute. Every jar tells you where the soil is, who tends it, and what's measurably in the powder.
      </p>
      <button onClick={() => onRoute("shop")} style={{ marginTop: 40, padding: "16px 32px", background: "var(--ink)", color: "var(--bg)", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.2em", cursor: "pointer" }}>Enter the apothecary →</button>
    </section>
  );
}

function HeroBlend({ onAdd, openQuiz, tile }) {
  const [picks, setPicks] = useStateS(["ashwagandha", "turmeric", "moringa"]);
  const pool = ["ashwagandha", "turmeric", "moringa", "reishi", "matcha", "cacao", "maca", "lionsmane"];
  const togglePick = (id) => setPicks((p) => p.includes(id) ? p.filter(x => x !== id) : (p.length < 5 ? [...p, id] : p));
  const items = picks.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const total = items.reduce((s, p) => s + p.price, 0);

  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "48px 32px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Build a daily blend · interactive</div>
        <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "clamp(56px, 6.5vw, 92px)", lineHeight: 0.98, margin: "16px 0 24px", color: "var(--ink)", textWrap: "balance" }}>
          Pick three to five. We'll <em style={{color: "var(--accent)"}}>mill them together</em>.
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {pool.map((id) => {
            const p = PRODUCTS.find(x => x.id === id);
            const active = picks.includes(id);
            return (
              <button key={id} onClick={() => togglePick(id)} style={{
                padding: "10px 14px", border: "1px solid " + (active ? "var(--ink)" : "var(--line)"),
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--bg)" : "var(--ink)",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
                textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: p.color, display: "inline-block" }} />
                {p.name}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={openQuiz} style={{ padding: "14px 22px", background: "transparent", border: "1px solid var(--ink)", color: "var(--ink)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer" }}>Or take the quiz</button>
          <button onClick={() => items.forEach(onAdd)} style={{ padding: "14px 22px", background: "var(--accent)", color: "var(--accent-ink)", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer" }}>
            Add blend · {fmtPrice(total)}
          </button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {items.slice(0, 4).map((p) => (
          <PowderTile key={p.id} color={p.color} swatch={p.swatch} label={p.id} note={p.weight} kind="jar" />
        ))}
        {items.length < 4 && Array.from({ length: 4 - items.length }).map((_, i) => (
          <div key={i} style={{ aspectRatio: "1/1", border: "1px dashed var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
            Add powder
          </div>
        ))}
      </div>
    </section>
  );
}

/* ===== Misc home pieces ===== */
function Ticker() {
  const items = ["⊹ 40 single-origin powders", "⊹ Lab-tested every harvest", "⊹ Slow-milled cold", "⊹ Compostable packaging", "⊹ 1% to soil restoration", "⊹ Ships in 24 hours"];
  return (
    <div style={{ overflow: "hidden", background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", marginTop: 80 }}>
      <div style={{ display: "flex", gap: 48, padding: "14px 0", animation: "ticker 40s linear infinite", whiteSpace: "nowrap" }}>
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--ink)" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function SubscribeCard() {
  return (
    <div style={{ padding: 14, borderTop: "1px solid var(--line)", background: "var(--accent)", color: "var(--accent-ink)" }}>
      <div style={{ aspectRatio: "1/1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7 }}>Save 15% · skip anytime</div>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: "32px", lineHeight: 1.0, textWrap: "balance" }}>
          The monthly<br />resupply.
        </div>
        <button style={{ width: "100%", padding: "12px", background: "var(--accent-ink)", color: "var(--accent)", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>Subscribe →</button>
      </div>
    </div>
  );
}

function StoryStrip() {
  return (
    <section style={{ background: "var(--ink)", color: "var(--bg)", marginTop: 80, padding: "100px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.6 }}>— On sourcing —</div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "56px", lineHeight: 1.05, margin: "16px 0 0", textWrap: "balance" }}>
            We name the farmer on every jar.
          </h2>
        </div>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: "20px", lineHeight: 1.55, opacity: 0.85, textWrap: "pretty" }}>
          The turmeric is Rajbanshi's. The ashwagandha is the Sharma cooperative. The matcha is Yamamoto-san's third-generation field in Uji. A small label on each jar tells you exactly which acre your powder came from — and how much was paid for it.
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    ["40", "single-origin growers"],
    ["14", "countries · 1 standard"],
    ["100%", "third-party tested"],
    ["1%", "of revenue to soil"],
  ];
  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 32px 0", borderTop: "1px solid var(--line)" }}>
      <div data-trust-grid style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
        {items.map(([n, l]) => (
          <div key={l} style={{ padding: "40px 24px", borderLeft: "1px solid var(--line)" }}>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: "80px", lineHeight: 0.9, color: "var(--ink)" }}>{n}</div>
            <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)" }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const RECIPES = [
  { title: "Golden milk, slowly.", subtitle: "Turmeric · ginger · cardamom", time: "8 min", uses: "turmeric", color: "#D97706", swatch: "#E89B40" },
  { title: "Adaptogen latte.", subtitle: "Ashwagandha · reishi · cacao", time: "5 min", uses: "ashwagandha", color: "#5C4326", swatch: "#7E6240" },
  { title: "Morning greens.", subtitle: "Moringa · matcha · amla", time: "3 min", uses: "moringa", color: "#5C7A55", swatch: "#7E9C73" },
  { title: "Forest tonic.", subtitle: "Chaga · cordyceps · cacao", time: "10 min", uses: "reishi", color: "#3D1F14", swatch: "#5C3525" },
];

function RecipeCard({ recipe, tile }) {
  return (
    <article style={{ cursor: "pointer" }}>
      <PowderTile color={recipe.color} swatch={recipe.swatch} label="recipe" note={recipe.time} kind="splash" />
      <div style={{ marginTop: 16 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>{recipe.subtitle}</div>
        <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "28px", lineHeight: 1.1, margin: "8px 0 0", color: "var(--ink)" }}>{recipe.title}</h3>
      </div>
    </article>
  );
}

Object.assign(window, { HomeScreen, RECIPES, RecipeCard });
