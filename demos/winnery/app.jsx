/* Maison Corval — main app */
const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "cellar",
  "displayFont": "Cormorant Garamond",
  "accentChoice": "wine"
}/*EDITMODE-END*/;

const PALETTES = {
  cellar:   { ink: '#14100e', parchment: '#f3ede0', cream: '#faf6ec', wine: '#5a121c', gold: '#a98349', line: '#d8cfc1' },
  midnight: { ink: '#0c0a1a', parchment: '#1a1730', cream: '#e8e3d4', wine: '#a45f2e', gold: '#c9a978', line: '#2c2845' },
  bone:     { ink: '#262019', parchment: '#ece4d3', cream: '#f7f1e4', wine: '#7a2030', gold: '#9a7a3d', line: '#ccc0a8' },
  noir:     { ink: '#080604', parchment: '#0e0c0a', cream: '#e8dfd0', wine: '#8a2424', gold: '#c9a05a', line: '#2a221c' }
};

function NavBar({ route, go, onCartOpen, cartCount }) {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Cellar' },
    { id: 'allocation', label: 'Allocations' },
    { id: 'journal', label: 'Journal' },
    { id: 'visit', label: 'Visit' }
  ];
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-links">
          {links.map(l => (
            <span key={l.id} className={`nav-link ${route === l.id ? 'active' : ''}`}
              onClick={() => go({ route: l.id === 'allocation' || l.id === 'journal' || l.id === 'visit' ? 'shop' : l.id })}>
              {l.label}
            </span>
          ))}
        </div>
        <div onClick={() => go({ route: 'home' })} style={{ cursor: 'pointer' }}><Logo /></div>
        <div className="nav-right">
          <span style={{ cursor: 'pointer' }}>Search</span>
          <span style={{ cursor: 'pointer' }}>Account</span>
          <button className="cart-button" onClick={onCartOpen}>
            Cart {cartCount > 0 && <span className="cart-count mono">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: 'var(--cream)', padding: '80px 0 40px', marginTop: 0 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 60 }}>
          <div>
            <Logo tone="cream" />
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#c9c0b3', marginTop: 20, maxWidth: 360 }}>
              A working négociant of fine wine, headquartered in Saint-Émilion since 1894. Family-owned, four generations, and counting.
            </p>
          </div>
          <div>
            <div className="kicker" style={{ color: 'var(--gold-soft)' }}>Cellar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, fontSize: 13, color: '#c9c0b3' }}>
              <span>All wines</span><span>Allocations</span><span>By region</span><span>Mixed cases</span><span>Gift cards</span>
            </div>
          </div>
          <div>
            <div className="kicker" style={{ color: 'var(--gold-soft)' }}>House</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, fontSize: 13, color: '#c9c0b3' }}>
              <span>About</span><span>The Corval family</span><span>Cellarmaster</span><span>Journal</span><span>Press</span>
            </div>
          </div>
          <div>
            <div className="kicker" style={{ color: 'var(--gold-soft)' }}>The list</div>
            <p style={{ fontSize: 13, color: '#c9c0b3', marginTop: 16, lineHeight: 1.55 }}>
              Allocation news, tasting invitations, and the occasional cellar essay.
            </p>
            <div style={{ display: 'flex', borderBottom: '1px solid #4a3f33', marginTop: 14 }}>
              <input placeholder="you@example.com" style={{
                background: 'transparent', border: 0, color: 'var(--cream)', padding: '10px 0', flex: 1, fontSize: 13, outline: 'none'
              }} />
              <button style={{ background: 'transparent', border: 0, color: 'var(--gold-soft)', padding: '10px 0', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}>Join →</button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2a241e', paddingTop: 28, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a7062' }}>
          <span>© 2026 Maison Corval, S.A. · Saint-Émilion, France</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <span>Terms</span><span>Privacy</span><span>Shipping</span><span>Wine policy · Drink responsibly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ====================== APP ======================
function App() {
  const [view, setView] = useStateA({ route: 'home' });
  const [cart, setCart] = useStateA([]);
  const [drawerOpen, setDrawerOpen] = useStateA(false);
  const [toast, setToast] = useStateA(null);
  const [order, setOrder] = useStateA(null);
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // apply palette
  useEffectA(() => {
    const p = PALETTES[tweaks.palette] || PALETTES.cellar;
    const r = document.documentElement;
    r.style.setProperty('--ink', p.ink);
    r.style.setProperty('--parchment', p.parchment);
    r.style.setProperty('--parchment-deep', shade(p.parchment, -6));
    r.style.setProperty('--cream', p.cream);
    r.style.setProperty('--wine', p.wine);
    r.style.setProperty('--gold', p.gold);
    r.style.setProperty('--gold-soft', shade(p.gold, 12));
    r.style.setProperty('--line', p.line);
    r.style.setProperty('--line-soft', shade(p.line, 10));
    r.style.setProperty('--ink-soft', shade(p.ink, 18));
    r.style.setProperty('--ink-mute', shade(p.ink, 38));
  }, [tweaks.palette]);

  useEffectA(() => {
    document.documentElement.style.setProperty('--display-font', `'${tweaks.displayFont}', serif`);
    // inject style override for .serif
    let el = document.getElementById('__display-font-style');
    if (!el) { el = document.createElement('style'); el.id = '__display-font-style'; document.head.appendChild(el); }
    el.textContent = `.serif, .wine-card .name, .bottle .label .lname, .bottle .label .lvin { font-family: '${tweaks.displayFont}', 'Cormorant Garamond', serif !important; }`;
  }, [tweaks.displayFont]);

  // scroll to top on route change
  useEffectA(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [view.route, view.id]);

  const wines = window.WINES;
  const currentWine = useMemoA(() => wines.find(w => w.id === view.id), [view.id]);

  const go = (v) => setView(v);

  const addToCart = (wine, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(it => it.wine.id === wine.id);
      if (ex) return prev.map(it => it.wine.id === wine.id ? { ...it, qty: Math.min(it.qty + qty, wine.stock) } : it);
      return [...prev, { wine, qty }];
    });
    setToast(`Added · ${wine.name} ${wine.vintage}`);
  };
  const setQty = (id, qty) => setCart(prev => prev.map(it => it.wine.id === id ? { ...it, qty } : it));
  const removeItem = (id) => setCart(prev => prev.filter(it => it.wine.id !== id));

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  const onCheckoutComplete = (o) => {
    setOrder(o);
    setCart([]);
    go({ route: 'confirmation' });
  };

  return (
    <React.Fragment>
      {view.route !== 'confirmation' && (
        <NavBar route={view.route} go={go} onCartOpen={() => setDrawerOpen(true)} cartCount={cartCount} />
      )}

      {view.route === 'home' && <HomeScreen wines={wines} go={go} addToCart={addToCart} />}
      {view.route === 'shop' && <ShopScreen wines={wines} go={go} addToCart={addToCart} initialFilter={view.filter} />}
      {view.route === 'product' && <ProductScreen wine={currentWine} wines={wines} go={go} addToCart={addToCart} />}
      {view.route === 'checkout' && <CheckoutScreen cart={cart} go={go} onComplete={onCheckoutComplete} />}
      {view.route === 'confirmation' && <ConfirmationScreen order={order} go={go} />}

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        setQty={setQty}
        removeItem={removeItem}
        go={go}
      />

      <Toast message={toast} onDone={() => setToast(null)} />

      {view.route !== 'checkout' && view.route !== 'confirmation' && <Footer />}

      {/* Tweaks */}
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Palette">
          <window.TweakRadio
            label="Mood"
            value={tweaks.palette}
            onChange={(v) => setTweak('palette', v)}
            options={[
              { value: 'cellar', label: 'Cellar' },
              { value: 'bone', label: 'Bone' },
              { value: 'midnight', label: 'Midnight' },
              { value: 'noir', label: 'Noir' }
            ]}
          />
        </window.TweakSection>
        <window.TweakSection label="Display type">
          <window.TweakSelect
            label="Font"
            value={tweaks.displayFont}
            onChange={(v) => setTweak('displayFont', v)}
            options={[
              { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
              { value: 'Playfair Display', label: 'Playfair Display' },
              { value: 'DM Serif Display', label: 'DM Serif Display' },
              { value: 'EB Garamond', label: 'EB Garamond' },
              { value: 'Libre Caslon Text', label: 'Libre Caslon' }
            ]}
          />
        </window.TweakSection>
        <window.TweakSection label="Jump to">
          <window.TweakButton label="Home" onClick={() => go({ route: 'home' })} />
          <window.TweakButton label="Cellar" onClick={() => go({ route: 'shop' })} />
          <window.TweakButton label="Product page" onClick={() => go({ route: 'product', id: 'corval-noir-2019' })} />
          <window.TweakButton label="Checkout" onClick={() => { if (cart.length === 0) addToCart(wines[0], 2); go({ route: 'checkout' }); }} />
        </window.TweakSection>
      </window.TweaksPanel>
    </React.Fragment>
  );
}

// utility — lighten/darken hex color
function shade(hex, percent) {
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2), 16);
  const g = parseInt(h.slice(2,4), 16);
  const b = parseInt(h.slice(4,6), 16);
  const sign = percent < 0 ? -1 : 1;
  const amt = Math.abs(percent) * 2.55;
  const nr = Math.max(0, Math.min(255, Math.round(r + sign * amt)));
  const ng = Math.max(0, Math.min(255, Math.round(g + sign * amt)));
  const nb = Math.max(0, Math.min(255, Math.round(b + sign * amt)));
  return '#' + [nr,ng,nb].map(v => v.toString(16).padStart(2,'0')).join('');
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
