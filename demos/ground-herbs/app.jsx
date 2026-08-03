// Main app shell — routing, cart state, tweaks panel

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

function App() {
  const tweaksDefaults = /*EDITMODE-BEGIN*/{
    "vibe": "earthy",
    "hero": "editorial",
    "tile": "stripe",
    "density": "regular"
  }/*EDITMODE-END*/;

  const [t, setTweak] = useTweaks(tweaksDefaults);
  const [route, setRoute] = useStateA("home");
  const [pdpProduct, setPdpProduct] = useStateA(null);
  const [cart, setCart] = useStateA([]);
  const [cartOpen, setCartOpen] = useStateA(false);
  const [checkoutOpen, setCheckoutOpen] = useStateA(false);
  const [quizOpen, setQuizOpen] = useStateA(false);
  const [query, setQuery] = useStateA("");
  const [toast, setToast] = useStateA(null);
  const [currency, setCurrency] = useStateA("USD");

  useEffectA(() => { applyVibe(t.vibe); }, [t.vibe]);
  useEffectA(() => { window.CURRENCY = currency; }, [currency]);

  const handleAdd = (product, qty = 1) => {
    setCart(c => {
      const i = c.findIndex(it => it.product.id === product.id && it.product.sizeLabel === product.sizeLabel);
      if (i >= 0) {
        const copy = c.slice(); copy[i] = { ...copy[i], qty: copy[i].qty + qty }; return copy;
      }
      return [...c, { product, qty }];
    });
    setToast(`${product.name} added`);
    setTimeout(() => setToast(null), 1800);
  };

  const goRoute = (r) => { setRoute(r); setPdpProduct(null); window.scrollTo({ top: 0, behavior: "instant" }); };
  const openProduct = (p) => { setPdpProduct(p); setRoute("pdp"); window.scrollTo({ top: 0, behavior: "instant" }); };

  // Palette options for the Tweaks color picker — first color is the bg, second is ink, third is accent
  const vibePalettes = [
    ["#EFE6D6", "#1A1410", "#B85A3A"], // earthy
    ["#F6F5F0", "#1C1C1A", "#5C7A55"], // wellness
    ["#FBF1DC", "#2A1208", "#C2410C"], // ayurveda
    ["#F4EFE6", "#0B0B0A", "#A78344"], // editorial
  ];
  const vibeKeys = ["earthy", "wellness", "ayurveda", "editorial"];
  const currentPalette = vibePalettes[vibeKeys.indexOf(t.vibe)] || vibePalettes[0];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      <Nav
        route={route}
        onRoute={goRoute}
        cartCount={cart.reduce((s, it) => s + it.qty, 0)}
        onCart={() => setCartOpen(true)}
        onSearch={() => setRoute("shop")}
        query={query} setQuery={setQuery}
        currency={currency}
        onCurrency={(c) => { window.CURRENCY = c; setCurrency(c); }}
      />

      <div key={currency}>
      {route === "home" && <HomeScreen onRoute={goRoute} onOpenProduct={openProduct} onAdd={handleAdd} hero={t.hero} tile={t.tile} openQuiz={() => setQuizOpen(true)} />}
      {route === "shop" && <ShopScreen query={query} onOpenProduct={openProduct} onAdd={handleAdd} density={t.density} tile={t.tile} />}
      {route === "pdp" && pdpProduct && <PDPScreen product={pdpProduct} onAdd={handleAdd} onOpenProduct={openProduct} tile={t.tile} />}
      {route === "recipes" && <RecipesScreen onOpenProduct={openProduct} onAdd={handleAdd} />}
      {route === "about" && <AboutScreen />}
      {route === "account" && <CustomerDashboard onOpenProduct={openProduct} onAdd={handleAdd} onRoute={goRoute} />}
      {route === "admin" && <AdminDashboard onOpenProduct={openProduct} />}
      </div>

      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQty={(idx, qty) => setCart(c => c.map((it, i) => i === idx ? { ...it, qty } : it))}
        onRemove={(idx) => setCart(c => c.filter((_, i) => i !== idx))}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />

      {checkoutOpen && <CheckoutScreen key={currency + "-co"} items={cart} onClose={() => setCheckoutOpen(false)} onPlaceOrder={() => { setCart([]); }} />}
      {quizOpen && <QuizScreen onClose={() => setQuizOpen(false)} onAdd={handleAdd} onOpenProduct={(p) => { setQuizOpen(false); openProduct(p); }} />}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          padding: "12px 20px", background: "var(--ink)", color: "var(--bg)",
          fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
          textTransform: "uppercase", letterSpacing: "0.15em", zIndex: 100,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}>✓ {toast}</div>
      )}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand vibe" />
        <TweakColor
          label="Palette"
          value={currentPalette}
          options={vibePalettes}
          onChange={(palette) => {
            const idx = vibePalettes.indexOf(palette);
            if (idx >= 0) setTweak("vibe", vibeKeys[idx]);
          }}
        />
        <TweakSelect
          label="Named vibe"
          value={t.vibe}
          options={[
            { value: "earthy", label: "Earthy apothecary" },
            { value: "wellness", label: "Modern wellness" },
            { value: "ayurveda", label: "Bold ayurvedic" },
            { value: "editorial", label: "Editorial premium" },
          ]}
          onChange={(v) => setTweak("vibe", v)}
        />

        <TweakSection label="Layout" />
        <TweakSelect
          label="Hero treatment"
          value={t.hero}
          options={[
            { value: "editorial", label: "Editorial · image + tagline" },
            { value: "product", label: "Product-forward grid" },
            { value: "manifesto", label: "Manifesto · type-led" },
            { value: "blend", label: "Build your blend" },
          ]}
          onChange={(v) => setTweak("hero", v)}
        />
        <TweakRadio
          label="Imagery"
          value={t.tile}
          options={["stripe", "jar", "splash"]}
          onChange={(v) => setTweak("tile", v)}
        />
        <TweakRadio
          label="Density"
          value={t.density}
          options={[
            { value: "regular", label: "Airy" },
            { value: "compact", label: "Compact" },
          ]}
          onChange={(v) => setTweak("density", v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
