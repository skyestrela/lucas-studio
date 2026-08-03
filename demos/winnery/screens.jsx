/* Maison Corval — screens */
const { useState: useStateS, useEffect: useEffectS, useMemo: useMemoS } = React;

// ====================== HOME ======================
function HomeScreen({ wines, go, addToCart }) {
  const featured = wines.slice(0, 4);
  const hero = wines[0];
  return (
    <div className="fade-in">
      {/* HERO */}
      <section className="hero">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div className="kicker" style={{ marginBottom: 28 }}>Autumn release · No. 47</div>
            <h1>The cellar,<br/><em>uncorked.</em></h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-soft)', maxWidth: 520, marginTop: 32 }}>
              A working négociant in three appellations and a quiet Piedmont cellar.
              We import what we'd serve at our own table — never more, sometimes less.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
              <button className="btn" onClick={() => go({ route: 'shop' })}>Browse the cellar</button>
              <button className="btn btn-ghost" onClick={() => go({ route: 'product', id: hero.id })}>Read about No. 47</button>
            </div>
            <div style={{ display: 'flex', gap: 40, marginTop: 56 }}>
              <div>
                <div className="serif" style={{ fontSize: 38 }}>132</div>
                <div className="kicker">Wines in cellar</div>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 38 }}>9</div>
                <div className="kicker">Allocations open</div>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 38 }}>24h</div>
                <div className="kicker">Temp-controlled ship</div>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', height: 620 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--parchment-deep), var(--parchment) 70%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '60%', height: '100%' }}>
                <Bottle wine={hero} />
              </div>
            </div>
            <div style={{ position: 'absolute', top: 28, right: 0, textAlign: 'right' }}>
              <div className="kicker">N° 47 · Featured</div>
              <div className="serif" style={{ fontSize: 32, marginTop: 6 }}>{hero.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-mute)' }}>{hero.region} · {hero.vintage}</div>
            </div>
            <div style={{ position: 'absolute', bottom: 28, left: 0 }}>
              <ScoreCrest score={hero.score} critic={hero.critic} />
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS STRIP */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 36 }}>
            <h2 className="serif" style={{ fontSize: 44, margin: 0 }}>Collections</h2>
            <span className="kicker">Curated · updated weekly</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid var(--line)' }}>
            {window.COLLECTIONS.map((c, i) => (
              <div key={c.id}
                onClick={() => go({ route: 'shop', collection: c.id })}
                style={{
                  padding: '40px 32px 36px',
                  borderRight: i < 2 ? '1px solid var(--line)' : 'none',
                  cursor: 'pointer', transition: 'background .25s',
                  position: 'relative'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--parchment-deep)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="kicker">{String(i + 1).padStart(2,'0')} / 03</div>
                <h3 className="serif" style={{ fontSize: 32, margin: '16px 0 12px' }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-mute)', margin: 0, lineHeight: 1.5 }}>{c.sub}</p>
                <div style={{ marginTop: 28, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  {c.count} bottles  ⟶
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED GRID */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 36 }}>
            <div>
              <div className="kicker">In the cellar</div>
              <h2 className="serif" style={{ fontSize: 44, margin: '8px 0 0' }}>Drinking now</h2>
            </div>
            <button className="btn btn-ghost" onClick={() => go({ route: 'shop' })}>All wines ⟶</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
            {featured.map(w => (
              <div key={w.id} className="wine-card" onClick={() => go({ route: 'product', id: w.id })}
                style={{ borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                <div style={{ height: 320 }}><Bottle wine={w} /></div>
                <div className="kicker" style={{ marginTop: 18 }}>{w.region}</div>
                <div className="meta" style={{ marginTop: 8 }}>
                  <div className="name">{w.name}</div>
                  <div className="price serif" style={{ fontSize: 20 }}><Price amount={w.price} /></div>
                </div>
                <div className="sub">{w.grape} · {w.vintage}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                  <ScoreCrest score={w.score} critic={w.critic} />
                  <button className="chip active" onClick={(e) => { e.stopPropagation(); addToCart(w); }}>Add ＋</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY BAND */}
      <section style={{ padding: '100px 0', background: 'var(--ink)', color: 'var(--cream)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="kicker" style={{ color: 'var(--gold-soft)' }}>The house</div>
            <h2 className="serif" style={{ fontSize: 72, margin: '12px 0 24px', lineHeight: 1 }}>
              A small house, with strong opinions.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: '#d9d2c5', maxWidth: 520 }}>
              Maison Corval is three generations of wine merchants working in Saint-Émilion, the Mosel, and Piedmont. We taste 4,000 wines a year; we list around 130. We work directly with the vignerons, we hold the wines in temperature-controlled cellar in Bordeaux, and we ship them only when the weather is on our side.
            </p>
            <button className="btn" style={{ marginTop: 36, background: 'var(--cream)', color: 'var(--ink)', border: 'none' }}>
              Read the manifesto
            </button>
          </div>
          <div style={{ position: 'relative', height: 460 }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(135deg, #2a2420, #2a2420 16px, #221d19 16px, #221d19 32px)',
              border: '1px solid rgba(201,169,120,0.2)'
            }}>
              <div style={{ padding: 24, color: 'rgba(201,169,120,0.5)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Photo · cellar, Saint-Émilion
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 24, right: 24, color: 'var(--gold-soft)' }}>
              <div className="kicker" style={{ color: 'var(--gold-soft)' }}>Cellarmaster</div>
              <div className="serif" style={{ fontSize: 26 }}>Élise Corval-Ferrand</div>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 36 }}>
            <h2 className="serif" style={{ fontSize: 44, margin: 0 }}>From the journal</h2>
            <span className="kicker">Notes, pairings, vignerons</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {window.JOURNAL.map((j, i) => (
              <div key={i} style={{ borderTop: '1px solid var(--ink)', paddingTop: 24, cursor: 'pointer' }}>
                <div className="kicker">{j.kicker} · {j.date}</div>
                <h3 className="serif" style={{ fontSize: 32, lineHeight: 1.1, marginTop: 14, marginBottom: 18 }}>{j.title}</h3>
                <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Read essay ⟶</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ====================== SHOP ======================
function ShopScreen({ wines, go, addToCart, initialFilter }) {
  const [styleFilter, setStyleFilter] = useStateS(initialFilter?.style || 'All');
  const [sort, setSort] = useStateS('curated');
  const [priceMax, setPriceMax] = useStateS(300);

  const styles = ['All', 'Red', 'White', 'Rosé', 'Sparkling'];
  const filtered = useMemoS(() => {
    let r = wines.filter(w => (styleFilter === 'All' || w.style === styleFilter) && w.price <= priceMax);
    if (sort === 'price-asc') r = [...r].sort((a,b) => a.price - b.price);
    else if (sort === 'price-desc') r = [...r].sort((a,b) => b.price - a.price);
    else if (sort === 'score') r = [...r].sort((a,b) => b.score - a.score);
    else if (sort === 'vintage') r = [...r].sort((a,b) => a.vintage - b.vintage);
    return r;
  }, [wines, styleFilter, sort, priceMax]);

  return (
    <div className="fade-in">
      <div style={{ padding: '56px 0 32px', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div className="kicker">The cellar</div>
          <h1 className="serif" style={{ fontSize: 92, margin: '12px 0 0', lineHeight: 0.95 }}>
            All wines, <em style={{ color: 'var(--wine)' }}>{filtered.length}</em>
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {styles.map(s => (
            <button key={s} className={`chip ${styleFilter === s ? 'active' : ''}`} onClick={() => setStyleFilter(s)}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
            Up to <span className="mono" style={{ color: 'var(--ink)' }}>${priceMax}</span>
            <input type="range" min="40" max="300" step="10" value={priceMax} onChange={e => setPriceMax(+e.target.value)} style={{ width: 140 }} />
          </label>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: 'transparent', border: '1px solid var(--ink)', padding: '8px 14px', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            <option value="curated">Curated</option>
            <option value="price-asc">Price · low → high</option>
            <option value="price-desc">Price · high → low</option>
            <option value="score">Score</option>
            <option value="vintage">Vintage · old → new</option>
          </select>
        </div>
      </div>

      <div className="container" style={{ padding: '0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderLeft: '1px solid var(--line)' }}>
          {filtered.map(w => (
            <div key={w.id} className="wine-card" onClick={() => go({ route: 'product', id: w.id })}
              style={{ borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)', minHeight: 540 }}>
              <div style={{ height: 320 }}><Bottle wine={w} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span className="kicker">{w.style}</span>
                {w.stock <= 8 && <span className="kicker" style={{ color: 'var(--wine)' }}>Only {w.stock} left</span>}
              </div>
              <div className="meta" style={{ marginTop: 8 }}>
                <div className="name">{w.name}</div>
                <div className="price serif" style={{ fontSize: 22 }}><Price amount={w.price} /></div>
              </div>
              <div className="sub">{w.region} · {w.vintage}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                <ScoreCrest score={w.score} critic={w.critic} />
                <button className="chip active" onClick={(e) => { e.stopPropagation(); addToCart(w); }}>Add ＋</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====================== PRODUCT ======================
function ProductScreen({ wine, wines, go, addToCart }) {
  const [qty, setQty] = useStateS(1);
  if (!wine) return null;

  // Pseudo tasting scales derived from data
  const taste = {
    'Body': wine.body === 'Full' ? 88 : wine.body === 'Medium' ? 60 : 32,
    'Tannin': wine.style === 'Red' ? (wine.body === 'Full' ? 80 : 55) : 12,
    'Acidity': wine.style === 'White' || wine.style === 'Sparkling' ? 82 : 56,
    'Sweetness': 8,
    'Oak': wine.style === 'Red' && wine.body === 'Full' ? 62 : 24,
    'Finish': wine.score >= 95 ? 92 : wine.score >= 93 ? 78 : 62
  };
  const recs = wines.filter(w => w.id !== wine.id).slice(0, 4);

  return (
    <div className="fade-in">
      <div className="container" style={{ padding: '24px 40px', display: 'flex', gap: 14, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', borderBottom: '1px solid var(--line)' }}>
        <span onClick={() => go({ route: 'home' })} style={{ cursor: 'pointer' }}>Home</span>
        <span>/</span>
        <span onClick={() => go({ route: 'shop' })} style={{ cursor: 'pointer' }}>Cellar</span>
        <span>/</span>
        <span style={{ color: 'var(--ink)' }}>{wine.name}</span>
      </div>

      <div className="container" style={{ padding: '40px 40px 0', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80 }}>
        {/* LEFT — bottle */}
        <div style={{ position: 'sticky', top: 100, alignSelf: 'flex-start', height: 'fit-content' }}>
          <div style={{ background: 'var(--parchment-deep)', height: 720, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, padding: 40 }}>
              <Bottle wine={wine} />
            </div>
            <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="kicker">{wine.rarity}</span>
              {wine.stock <= 8 && <span className="kicker" style={{ color: 'var(--wine)' }}>· {wine.stock} bottles remain</span>}
            </div>
            <div style={{ position: 'absolute', top: 24, right: 24 }}>
              <ScoreCrest score={wine.score} critic={wine.critic} />
            </div>
            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
              <span>{wine.bottle}</span>
              <span>{wine.abv}% abv</span>
              <span>Decant · {wine.decant}</span>
            </div>
          </div>
        </div>

        {/* RIGHT — info */}
        <div style={{ paddingBottom: 80 }}>
          <div className="kicker">{wine.region}, {wine.country}</div>
          <h1 className="serif" style={{ fontSize: 84, margin: '12px 0 4px', lineHeight: 0.92 }}>{wine.name}</h1>
          <div className="serif" style={{ fontSize: 28, fontStyle: 'italic', color: 'var(--ink-mute)', margin: 0 }}>{wine.cuvee} · {wine.vintage}</div>

          <div style={{ display: 'flex', gap: 28, marginTop: 28, flexWrap: 'wrap' }}>
            <div><div className="kicker">Grape</div><div style={{ marginTop: 4 }}>{wine.grape}</div></div>
            <div><div className="kicker">Style</div><div style={{ marginTop: 4 }}>{wine.style} · {wine.body}-bodied</div></div>
            <div><div className="kicker">Bottle</div><div style={{ marginTop: 4 }}>{wine.bottle}</div></div>
          </div>

          <p style={{ fontSize: 19, lineHeight: 1.55, marginTop: 36, color: 'var(--ink-soft)' }}>
            {wine.notes}
          </p>

          <div className="hair" style={{ margin: '36px 0' }} />

          {/* tasting wheel */}
          <div className="kicker" style={{ marginBottom: 18 }}>Tasting profile</div>
          <div className="wheel">
            {Object.entries(taste).map(([k, v]) => (
              <TasteBar key={k} label={k} value={v} />
            ))}
          </div>

          <div className="hair" style={{ margin: '36px 0' }} />

          <div className="kicker" style={{ marginBottom: 10 }}>Pairing</div>
          <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0 }}>{wine.pairing}</p>

          <div className="hair" style={{ margin: '36px 0' }} />

          {/* price + buy */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div className="kicker">Per bottle</div>
              <div className="serif" style={{ fontSize: 56, lineHeight: 1, marginTop: 6 }}><Price amount={wine.price} /></div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 6 }}>${(wine.price * 6 * 0.95).toFixed(0)} per six · 5% case discount</div>
            </div>
            <Qty value={qty} onChange={setQty} max={Math.min(wine.stock, 12)} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button className="btn btn-block" onClick={() => addToCart(wine, qty)}>Add to cart · <Price amount={wine.price * qty} /></button>
            <button className="btn btn-ghost" style={{ flexShrink: 0 }}>♡</button>
          </div>

          <div style={{ marginTop: 28, fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
            Ships from our Bordeaux cellar in temperature-controlled cartons. <br/>
            Complimentary shipping on orders over $400. Adult signature required at delivery.
          </div>
        </div>
      </div>

      {/* You may also like */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--line)', marginTop: 40 }}>
        <div className="container">
          <div className="kicker">From the same cellar</div>
          <h2 className="serif" style={{ fontSize: 44, margin: '8px 0 36px' }}>You may also enjoy</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
            {recs.map(w => (
              <div key={w.id} className="wine-card" onClick={() => go({ route: 'product', id: w.id })}
                style={{ borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                <div style={{ height: 280 }}><Bottle wine={w} /></div>
                <div className="meta" style={{ marginTop: 14 }}>
                  <div className="name" style={{ fontSize: 24 }}>{w.name}</div>
                  <div className="price serif" style={{ fontSize: 18 }}><Price amount={w.price} /></div>
                </div>
                <div className="sub">{w.region} · {w.vintage}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { HomeScreen, ShopScreen, ProductScreen });
