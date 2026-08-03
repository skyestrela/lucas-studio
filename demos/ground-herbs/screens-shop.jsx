// Shop listing + PDP + Quiz + Recipes + About screens

const { useState: useStateB, useMemo: useMemoB, useEffect: useEffectB } = React;

/* ========================= SHOP ========================= */
function ShopScreen({ query, onOpenProduct, onAdd, density, tile }) {
  const [category, setCategory] = useStateB("all");
  const [sort, setSort] = useStateB("featured");
  const [useFilter, setUseFilter] = useStateB(new Set());
  const [originFilter, setOriginFilter] = useStateB(new Set());
  const [showFilters, setShowFilters] = useStateB(typeof window !== "undefined" && window.innerWidth >= 760);

  const allUses = useMemoB(() => Array.from(new Set(PRODUCTS.flatMap(p => p.uses))).sort(), []);
  const allRegions = useMemoB(() => {
    const set = new Set();
    PRODUCTS.forEach(p => set.add(p.origin.split(",").slice(-1)[0].trim()));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemoB(() => {
    let r = PRODUCTS.slice();
    if (category !== "all") r = r.filter(p => p.category === category);
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.latin.toLowerCase().includes(q) ||
        p.uses.some(u => u.toLowerCase().includes(q)) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (useFilter.size) r = r.filter(p => p.uses.some(u => useFilter.has(u)));
    if (originFilter.size) r = r.filter(p => originFilter.has(p.origin.split(",").slice(-1)[0].trim()));
    if (sort === "price-asc") r.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r.sort((a, b) => b.price - a.price);
    if (sort === "rating") r.sort((a, b) => b.rating - a.rating);
    if (sort === "az") r.sort((a, b) => a.name.localeCompare(b.name));
    return r;
  }, [category, query, useFilter, originFilter, sort]);

  const toggle = (set, setSet, val) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setSet(next);
  };

  return (
    <main>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "48px 32px 32px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Shop · {filtered.length} of {PRODUCTS.length}</div>
          <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "clamp(56px, 7vw, 96px)", lineHeight: 0.98, margin: "12px 0 0", color: "var(--ink)" }}>
            {query ? <>Results for <em style={{ color: "var(--accent)" }}>"{query}"</em></> : CATEGORIES.find(c => c.id === category).label}
          </h1>
        </div>
        {/* Category tabs */}
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px 16px", display: "flex", gap: 20, overflowX: "auto" }}>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)} style={{
              padding: "8px 0", background: "transparent",
              border: "none", borderBottom: "1px solid " + (category === c.id ? "var(--accent)" : "transparent"),
              color: category === c.id ? "var(--accent)" : "var(--ink)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
              textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", whiteSpace: "nowrap",
            }}>{c.label} <span style={{ opacity: 0.5 }}>· {c.n}</span></button>
          ))}
        </div>
      </div>

      <div data-shop-grid style={{ maxWidth: 1440, margin: "0 auto", display: "grid", gridTemplateColumns: showFilters ? "240px 1fr" : "1fr", gap: 0 }}>
        {/* Filters */}
        {showFilters && (
          <aside data-shop-filters data-open="true" style={{ padding: "32px 24px 32px 32px", borderRight: "1px solid var(--line)" }}>
            <div data-shop-filters-close style={{ display: "none", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em" }}>Filters</span>
              <button onClick={() => setShowFilters(false)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>
            <FilterGroup title="Use">
              {allUses.map((u) => (
                <FilterRow key={u} label={u} active={useFilter.has(u)} onToggle={() => toggle(useFilter, setUseFilter, u)} />
              ))}
            </FilterGroup>
            <FilterGroup title="Origin">
              {allRegions.map((r) => (
                <FilterRow key={r} label={r} active={originFilter.has(r)} onToggle={() => toggle(originFilter, setOriginFilter, r)} />
              ))}
            </FilterGroup>
            <button onClick={() => { setUseFilter(new Set()); setOriginFilter(new Set()); }} style={{
              marginTop: 16, padding: "10px 14px", width: "100%",
              background: "transparent", border: "1px solid var(--line)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
              textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink)", cursor: "pointer",
            }}>Clear filters</button>
          </aside>
        )}

        {/* Grid */}
        <section>
          {/* Sort bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: "1px solid var(--line)" }}>
            <button onClick={() => setShowFilters(s => !s)} style={{ background: "transparent", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink)", cursor: "pointer" }}>
              {showFilters ? "× Hide filters" : "+ Show filters"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              <span style={{ color: "var(--muted)" }}>Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
                background: "transparent", border: "none",
                fontFamily: "inherit", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em",
                color: "var(--ink)", cursor: "pointer", outline: "none",
              }}>
                <option value="featured">Featured</option>
                <option value="rating">Highest rated</option>
                <option value="price-asc">Price · low to high</option>
                <option value="price-desc">Price · high to low</option>
                <option value="az">A–Z</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "120px 32px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: "32px", color: "var(--ink)" }}>Nothing matches that yet.</div>
              <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Try removing a filter or a different search.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: showFilters ? "repeat(3, 1fr)" : "repeat(4, 1fr)", gap: 0, borderTop: "1px solid var(--line)" }}>
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} onAdd={onAdd} onOpen={onOpenProduct} density={density} tile={tile} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function FilterGroup({ title, children }) {
  const [open, setOpen] = useStateB(true);
  return (
    <div style={{ marginBottom: 24, borderBottom: "1px solid var(--line)", paddingBottom: 16 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", background: "transparent", border: "none", padding: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink)", cursor: "pointer", marginBottom: 14 }}>
        <span>{title}</span><span>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>}
    </div>
  );
}
function FilterRow({ label, active, onToggle }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--ink)", cursor: "pointer", textTransform: "capitalize" }}>
      <span style={{
        width: 14, height: 14, border: "1px solid var(--ink)",
        background: active ? "var(--ink)" : "transparent",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "var(--bg)", fontSize: "10px",
      }}>{active ? "✓" : ""}</span>
      <input type="checkbox" checked={active} onChange={onToggle} style={{ display: "none" }} />
      {label}
    </label>
  );
}

/* ========================= PDP ========================= */
function PDPScreen({ product, onAdd, onOpenProduct, tile }) {
  const [size, setSize] = useStateB("regular");
  const [qty, setQty] = useStateB(1);
  const [subscribe, setSubscribe] = useStateB(false);
  const [interval, setInterval] = useStateB("30");
  const [tab, setTab] = useStateB("how");

  const sizes = [
    { id: "trial", label: "Trial", weight: "40g", mult: 0.5 },
    { id: "regular", label: "Regular", weight: product.weight, mult: 1 },
    { id: "double", label: "Double", weight: parseInt(product.weight) * 2 + "g", mult: 1.85 },
  ];
  const chosen = sizes.find(s => s.id === size);
  const basePrice = product.price * chosen.mult;
  const finalPrice = subscribe ? basePrice * 0.85 : basePrice;
  const lineTotal = finalPrice * qty;

  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <main>
      {/* Breadcrumb */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "16px 32px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto" }}>
          Shop · {CATEGORIES.find(c => c.id === product.category).label} · <span style={{ color: "var(--ink)" }}>{product.name}</span>
        </div>
      </div>

      <div data-pdp-grid style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 32px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64 }}>
        {/* Imagery stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <PowderTile color={product.color} swatch={product.swatch} label={product.id} note={product.weight} kind="jar" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <PowderTile color={product.color} swatch={product.swatch} label="texture" kind="splash" />
            <PowderTile color={product.swatch} swatch={product.color} label="origin" kind="stripe" />
            <PowderTile color={product.color} swatch={product.swatch} label="serving" kind="splash" />
          </div>
        </div>

        {/* Buy box */}
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>
            {product.latin} · {product.origin}
          </div>
          <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "72px", lineHeight: 1.0, margin: "12px 0 0", color: "var(--ink)", textWrap: "balance" }}>{product.name}</h1>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--ink-2)" }}>
            <span style={{ color: "var(--accent)" }}>★ {product.rating}</span>
            <span>{product.reviews.toLocaleString()} reviews</span>
            <span>·</span>
            <span style={{ color: product.stock ? "var(--ink-2)" : "var(--accent)" }}>{product.stock ? "In stock — ships in 24h" : "Restocking — notify me"}</span>
          </div>
          <p style={{ marginTop: 24, fontFamily: "'Newsreader', serif", fontSize: "20px", lineHeight: 1.5, color: "var(--ink-2)", textWrap: "pretty" }}>{product.story}</p>

          {/* Uses chips */}
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {product.uses.map((u) => (
              <span key={u} style={{ padding: "6px 10px", border: "1px solid var(--line)", borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-2)" }}>{u}</span>
            ))}
          </div>

          {/* Sizes */}
          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Size</div>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {sizes.map(s => (
                <button key={s.id} onClick={() => setSize(s.id)} style={{
                  padding: "14px 12px", textAlign: "left",
                  background: size === s.id ? "var(--ink)" : "transparent",
                  color: size === s.id ? "var(--bg)" : "var(--ink)",
                  border: "1px solid " + (size === s.id ? "var(--ink)" : "var(--line)"),
                  cursor: "pointer",
                }}>
                  <div style={{ fontFamily: "'Newsreader', serif", fontSize: "18px" }}>{s.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", opacity: 0.7, marginTop: 4 }}>{s.weight} · {fmtPrice(product.price * s.mult, { decimals: 0 })}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subscribe & save */}
          <div style={{ marginTop: 20, padding: 16, border: "1px solid var(--line)", display: "flex", gap: 14, alignItems: "center" }}>
            <button onClick={() => setSubscribe(s => !s)} style={{
              width: 36, height: 22, borderRadius: 999, padding: 2,
              background: subscribe ? "var(--accent)" : "var(--line)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: subscribe ? "flex-end" : "flex-start",
              transition: "all 150ms ease",
            }}>
              <span style={{ width: 18, height: 18, borderRadius: 999, background: "white" }} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: "18px", color: "var(--ink)" }}>Subscribe & save 15%</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginTop: 2 }}>Skip, swap, or cancel anytime</div>
            </div>
            {subscribe && (
              <select value={interval} onChange={(e) => setInterval(e.target.value)} style={{ padding: "8px 10px", background: "transparent", border: "1px solid var(--line)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ink)" }}>
                <option value="14">Every 2 weeks</option>
                <option value="30">Every 30 days</option>
                <option value="60">Every 60 days</option>
                <option value="90">Every 90 days</option>
              </select>
            )}
          </div>

          {/* Qty + add */}
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--ink)" }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: "16px 16px", background: "transparent", border: "none", color: "var(--ink)", cursor: "pointer", fontFamily: "'Newsreader', serif", fontSize: "18px" }}>−</button>
              <div style={{ minWidth: 32, textAlign: "center", fontFamily: "'Newsreader', serif", fontSize: "18px" }}>{qty}</div>
              <button onClick={() => setQty(q => q + 1)} style={{ padding: "16px 16px", background: "transparent", border: "none", color: "var(--ink)", cursor: "pointer", fontFamily: "'Newsreader', serif", fontSize: "18px" }}>+</button>
            </div>
            <button onClick={() => onAdd({ ...product, price: finalPrice, sizeLabel: chosen.label, sizeWeight: chosen.weight, subscribe, interval }, qty)} disabled={!product.stock} style={{
              flex: 1, padding: "16px", background: "var(--ink)", color: "var(--bg)",
              border: "none", cursor: product.stock ? "pointer" : "not-allowed",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
              textTransform: "uppercase", letterSpacing: "0.15em",
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
            }}>
              <span>{product.stock ? "Add to cart" : "Notify me when back"}</span>
              <span>{fmtPrice(lineTotal)}</span>
            </button>
          </div>

          {/* Trust line */}
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", textAlign: "center" }}>
            <span style={{ padding: "10px 4px", border: "1px solid var(--line)" }}>✦ Free over {fmtPrice(60)}</span>
            <span style={{ padding: "10px 4px", border: "1px solid var(--line)" }}>↺ 30-day returns</span>
            <span style={{ padding: "10px 4px", border: "1px solid var(--line)" }}>✓ 3rd-party tested</span>
          </div>
        </div>
      </div>

      {/* Spec block */}
      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "48px 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
          {[
            ["Origin", product.origin],
            ["Potency", product.potency],
            ["Net weight", product.weight],
            ["Best with", product.uses.join(" · ")],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>{k}</div>
              <div style={{ marginTop: 8, fontFamily: "'Newsreader', serif", fontSize: "22px", lineHeight: 1.2, color: "var(--ink)" }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "64px 32px 0" }}>
        <div data-pdp-tabs style={{ display: "flex", gap: 28, borderBottom: "1px solid var(--line)" }}>
          {[["how", "How to use"], ["science", "What's in it"], ["sourcing", "Where it's from"], ["reviews", "Reviews · " + product.reviews]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "16px 0", background: "transparent", border: "none",
              borderBottom: "2px solid " + (tab === id ? "var(--ink)" : "transparent"),
              fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
              textTransform: "uppercase", letterSpacing: "0.12em",
              color: tab === id ? "var(--ink)" : "var(--muted)", cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>
        <div style={{ padding: "40px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
          {tab === "how" && (
            <>
              <div>
                <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "32px", margin: 0 }}>Three ways in.</h3>
                <ol style={{ marginTop: 24, padding: 0, listStyle: "none", fontFamily: "'Newsreader', serif", fontSize: "18px", lineHeight: 1.5, color: "var(--ink-2)" }}>
                  <li style={{ display: "flex", gap: 16, marginBottom: 20 }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--muted)", paddingTop: 6 }}>01</span> <span>One teaspoon (4g) in warm milk with a pinch of black pepper and a drizzle of honey.</span></li>
                  <li style={{ display: "flex", gap: 16, marginBottom: 20 }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--muted)", paddingTop: 6 }}>02</span> <span>Whisk into a morning smoothie with banana, oats, and almond butter.</span></li>
                  <li style={{ display: "flex", gap: 16 }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--muted)", paddingTop: 6 }}>03</span> <span>Stir into broths, dahls, and curries — the kitchen's oldest place for it.</span></li>
                </ol>
              </div>
              <div style={{ background: "var(--card)", padding: 28 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Daily dose</div>
                <div style={{ marginTop: 8, fontFamily: "'Newsreader', serif", fontSize: "44px", lineHeight: 1, color: "var(--ink)" }}>1–2 tsp</div>
                <div style={{ marginTop: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)" }}>≈ 4–8 g · 30 servings per jar</div>
                <div style={{ marginTop: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Pairs well with</div>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {related.slice(0, 3).map(r => (
                    <button key={r.id} onClick={() => onOpenProduct(r)} style={{ padding: "8px 12px", background: "transparent", border: "1px solid var(--line)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ink)", cursor: "pointer" }}>+ {r.name}</button>
                  ))}
                </div>
              </div>
            </>
          )}
          {tab === "science" && (
            <>
              <div>
                <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "32px", margin: 0 }}>What we measured.</h3>
                <div style={{ marginTop: 24, fontFamily: "'DM Sans', sans-serif", fontSize: "15px", lineHeight: 1.6, color: "var(--ink-2)" }}>
                  Every harvest is tested by an ISO-17025 lab for heavy metals, microbials, and active compound content. Results live on the jar (and on this page).
                </div>
              </div>
              <div>
                {[["Active compounds", product.potency], ["Heavy metals", "Below WHO limits — full panel on file"], ["Microbial load", "< 10³ CFU/g (Pharmacopoeia)"], ["Pesticides", "None detected (LC-MS, 400 panel)"]].map(([k, v]) => (
                  <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)" }}>{k}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "var(--ink)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "sourcing" && (
            <>
              <div>
                <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "32px", margin: 0 }}>One farm. Named.</h3>
                <p style={{ marginTop: 24, fontFamily: "'Newsreader', serif", fontSize: "18px", lineHeight: 1.5, color: "var(--ink-2)" }}>
                  {product.story} We pay 2.3× the commodity rate and visit every grower at least once a year.
                </p>
              </div>
              <div>
                <PowderTile color={product.swatch} swatch={product.color} label={"map · " + product.origin} kind="splash" />
              </div>
            </>
          )}
          {tab === "reviews" && (
            <>
              <div>
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: "96px", color: "var(--ink)", lineHeight: 1 }}>{product.rating}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)" }}>★★★★★ · {product.reviews.toLocaleString()} reviews</div>
                <div style={{ marginTop: 32 }}>
                  {[5,4,3,2,1].map(n => (
                    <div key={n} style={{ display: "grid", gridTemplateColumns: "20px 1fr 40px", gap: 12, alignItems: "center", padding: "4px 0" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--muted)" }}>{n}★</span>
                      <div style={{ height: 4, background: "var(--line)" }}><div style={{ width: (n===5?78:n===4?15:n===3?4:n===2?2:1) + "%", height: "100%", background: "var(--ink)" }} /></div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)", textAlign: "right" }}>{(n===5?78:n===4?15:n===3?4:n===2?2:1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { name: "Anika P.", body: "Bought after my mother-in-law swore by it for joint pain. Three weeks in and she's bouncing around the garden again. The pepper-and-honey directions matter.", stars: 5 },
                  { name: "Marc D.", body: "The earthy aroma alone tells you this is the real article. Color is deep orange — not the pale yellow grocery stuff.", stars: 5 },
                  { name: "Jules R.", body: "Subscribed. I run out of everything else first.", stars: 5 },
                ].map((r, i) => (
                  <div key={i} style={{ paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink)" }}>{r.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--accent)" }}>{"★".repeat(r.stars)}</span>
                    </div>
                    <p style={{ marginTop: 8, fontFamily: "'Newsreader', serif", fontSize: "17px", lineHeight: 1.5, color: "var(--ink-2)" }}>"{r.body}"</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Related */}
      <section style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 32px 0" }}>
        <SectionHeader kicker="Goes with" title="Often steeped together." />
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderBottom: "1px solid var(--line)" }}>
          {related.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} onOpen={onOpenProduct} />)}
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { ShopScreen, PDPScreen });
