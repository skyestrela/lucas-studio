// Cart drawer, Checkout, Quiz (Find Your Powder), Recipes page, About page

const { useState: useStateC, useMemo: useMemoC, useEffect: useEffectC } = React;

/* ========================= CART DRAWER ========================= */
function CartDrawer({ open, onClose, items, onUpdateQty, onRemove, onCheckout }) {
  const subtotal = items.reduce((s, it) => s + it.product.price * it.qty, 0);
  const shipping = subtotal >= 60 ? 0 : 6;
  const total = subtotal + shipping;
  const progress = Math.min(100, (subtotal / 60) * 100);
  const left = Math.max(0, 60 - subtotal);

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 200ms ease", zIndex: 50,
      }} />
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 460, zIndex: 60,
        background: "var(--bg)", borderLeft: "1px solid var(--line)",
        transform: `translateX(${open ? 0 : 100}%)`,
        transition: "transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Your basket · {items.length} {items.length === 1 ? "item" : "items"}</div>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: "28px", marginTop: 4 }}>The basket</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "20px", color: "var(--ink)", cursor: "pointer", padding: 8 }}>×</button>
        </div>

        {/* Shipping progress */}
        {items.length > 0 && (
          <div style={{ padding: "14px 24px", background: "var(--bg-2)", borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink)" }}>
              {left > 0 ? `Add ${fmtPrice(left)} for free shipping` : "Free shipping unlocked"}
            </div>
            <div style={{ height: 3, marginTop: 8, background: "var(--line)" }}>
              <div style={{ height: "100%", width: progress + "%", background: "var(--accent)", transition: "width 200ms ease" }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflow: "auto", padding: "0 24px" }}>
          {items.length === 0 ? (
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: "28px", color: "var(--ink)" }}>Empty so far.</div>
              <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Pick a powder to begin.</div>
            </div>
          ) : items.map((it, idx) => (
            <div key={idx} style={{ padding: "20px 0", borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 14 }}>
              <PowderTile color={it.product.color} swatch={it.product.swatch} label={it.product.id} kind="jar" />
              <div>
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: "20px", lineHeight: 1.1, color: "var(--ink)" }}>{it.product.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginTop: 4 }}>
                  {it.product.sizeLabel || "Regular"} · {it.product.sizeWeight || it.product.weight}
                </div>
                {it.product.subscribe && (
                  <div style={{ marginTop: 6, display: "inline-block", padding: "3px 7px", background: "var(--accent)", color: "var(--accent-ink)", fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    ↺ Every {it.product.interval} days · −15%
                  </div>
                )}
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)" }}>
                    <button onClick={() => onUpdateQty(idx, Math.max(1, it.qty - 1))} style={{ padding: "4px 10px", background: "transparent", border: "none", cursor: "pointer" }}>−</button>
                    <span style={{ minWidth: 18, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>{it.qty}</span>
                    <button onClick={() => onUpdateQty(idx, it.qty + 1)} style={{ padding: "4px 10px", background: "transparent", border: "none", cursor: "pointer" }}>+</button>
                  </div>
                  <button onClick={() => onRemove(idx)} style={{ background: "transparent", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", textDecoration: "underline", cursor: "pointer" }}>Remove</button>
                </div>
              </div>
              <div style={{ textAlign: "right", fontFamily: "'Newsreader', serif", fontSize: "18px", color: "var(--ink)" }}>{fmtPrice(it.product.price * it.qty)}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--ink-2)" }}>
              <span>Subtotal</span><span>{fmtPrice(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--ink-2)", marginTop: 6 }}>
              <span>Shipping</span><span>{shipping === 0 ? "Free" : fmtPrice(shipping)}</span>
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontFamily: "'Newsreader', serif", fontSize: "24px", color: "var(--ink)" }}>
              <span>Total</span><span>{fmtPrice(total)}</span>
            </div>
            <button onClick={onCheckout} style={{
              width: "100%", marginTop: 16, padding: "16px",
              background: "var(--ink)", color: "var(--bg)", border: "none", cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
              textTransform: "uppercase", letterSpacing: "0.15em",
            }}>Check out — {fmtPrice(total)} →</button>
            <div style={{ marginTop: 10, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)" }}>30-day returns · ships in 24h</div>
          </div>
        )}
      </aside>
    </>
  );
}

/* ========================= CHECKOUT ========================= */
function CheckoutScreen({ items, onClose, onPlaceOrder }) {
  const [step, setStep] = useStateC(1);
  const [email, setEmail] = useStateC("anika@example.com");
  const [shipping, setShipping] = useStateC({ name: "Anika Patel", addr: "412 Mortar Lane", city: "Brooklyn", zip: "11215", country: "USA" });
  const [paid, setPaid] = useStateC(false);
  const subtotal = items.reduce((s, it) => s + it.product.price * it.qty, 0);
  const shipFee = subtotal >= 60 ? 0 : 6;
  const tax = +(subtotal * 0.0875).toFixed(2);
  const total = subtotal + shipFee + tax;

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 70, overflow: "auto" }}>
      <div style={{ borderBottom: "1px solid var(--line)", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: "24px", letterSpacing: "0.16em", color: "var(--ink)" }}>GROUND</div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink)", cursor: "pointer" }}>← Continue shopping</button>
      </div>
      <div data-checkout-grid style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64 }}>
        {/* Left — form */}
        <div>
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            {[[1, "Information"], [2, "Shipping"], [3, "Payment"]].map(([n, l]) => (
              <button key={n} onClick={() => setStep(n)} style={{
                background: "transparent", border: "none", padding: 0, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
                textTransform: "uppercase", letterSpacing: "0.12em",
                color: step === n ? "var(--ink)" : "var(--muted)",
                borderBottom: "1px solid " + (step === n ? "var(--ink)" : "transparent"),
                paddingBottom: 4,
              }}>{n}. {l}</button>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "40px", margin: 0 }}>Where to send your order?</h2>
              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <CheckoutInput label="Email" value={email} onChange={setEmail} full />
                <CheckoutInput label="Full name" value={shipping.name} onChange={(v) => setShipping(s => ({...s, name: v}))} />
                <CheckoutInput label="Phone" value="+1 718 555 0144" onChange={() => {}} />
                <CheckoutInput label="Street address" value={shipping.addr} onChange={(v) => setShipping(s => ({...s, addr: v}))} full />
                <CheckoutInput label="City" value={shipping.city} onChange={(v) => setShipping(s => ({...s, city: v}))} />
                <CheckoutInput label="ZIP" value={shipping.zip} onChange={(v) => setShipping(s => ({...s, zip: v}))} />
              </div>
              <button onClick={() => setStep(2)} style={{ marginTop: 24, padding: "14px 24px", background: "var(--ink)", color: "var(--bg)", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em" }}>Continue to shipping →</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "40px", margin: 0 }}>How fast?</h2>
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                {[["standard", "Standard · 3–5 days", subtotal >= 60 ? "Free" : fmtPrice(6)], ["express", "Express · 2 days", fmtPrice(12)], ["carbon", "Carbon-neutral · 5–7 days", "Free + 1% to soil"]].map(([id, label, price]) => (
                  <label key={id} style={{ padding: 16, border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input type="radio" name="ship" defaultChecked={id === "standard"} />
                      <span style={{ fontFamily: "'Newsreader', serif", fontSize: "18px", color: "var(--ink)" }}>{label}</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "var(--ink)" }}>{price}</span>
                  </label>
                ))}
              </div>
              <button onClick={() => setStep(3)} style={{ marginTop: 24, padding: "14px 24px", background: "var(--ink)", color: "var(--bg)", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em" }}>Continue to payment →</button>
            </div>
          )}
          {step === 3 && !paid && (
            <div>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "40px", margin: 0 }}>Pay securely.</h2>
              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <CheckoutInput label="Card number" value="4242 4242 4242 4242" onChange={() => {}} full />
                <CheckoutInput label="Expiry" value="11 / 28" onChange={() => {}} />
                <CheckoutInput label="CVC" value="•••" onChange={() => {}} />
                <CheckoutInput label="Name on card" value="Anika Patel" onChange={() => {}} full />
              </div>
              <label style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--ink-2)" }}>
                <input type="checkbox" defaultChecked /> Save this card for next time
              </label>
              <button onClick={() => { setPaid(true); setTimeout(onPlaceOrder, 1200); }} style={{ marginTop: 24, padding: "16px 28px", background: "var(--accent)", color: "var(--accent-ink)", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em" }}>Place order — {fmtPrice(total)}</button>
            </div>
          )}
          {paid && (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--accent)" }}>✓ Confirmed</div>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "56px", margin: "16px 0 8px", textWrap: "balance" }}>Your order is milling.</h2>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: "18px", color: "var(--ink-2)" }}>We'll send a receipt to {email}. Your jars ship within 24 hours.</p>
            </div>
          )}
        </div>

        {/* Right — summary */}
        <aside style={{ background: "var(--bg-2)", padding: 28, alignSelf: "start" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Order summary</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((it, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 10, alignItems: "center" }}>
                <PowderTile color={it.product.color} swatch={it.product.swatch} label={it.product.id} kind="jar" />
                <div>
                  <div style={{ fontFamily: "'Newsreader', serif", fontSize: "15px" }}>{it.product.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)", marginTop: 2 }}>{it.qty} × {it.product.sizeLabel || "Regular"}</div>
                </div>
                <span style={{ fontFamily: "'Newsreader', serif", fontSize: "15px" }}>{fmtPrice(it.product.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 6, fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--ink-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{fmtPrice(subtotal)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Shipping</span><span>{shipFee === 0 ? "Free" : fmtPrice(shipFee)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tax</span><span>{fmtPrice(tax)}</span></div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontFamily: "'Newsreader', serif", fontSize: "24px" }}>
            <span>Total</span><span>{fmtPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckoutInput({ label, value, onChange, full }) {
  return (
    <label style={{ gridColumn: full ? "1 / -1" : "auto", display: "block" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)" }}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={{
        marginTop: 6, width: "100%", padding: "12px 14px", background: "transparent",
        border: "1px solid var(--line)", borderRadius: 0,
        fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "var(--ink)", outline: "none",
      }} />
    </label>
  );
}

/* ========================= QUIZ ========================= */
function QuizScreen({ onClose, onAdd, onOpenProduct }) {
  const QUESTIONS = [
    { id: "goal", q: "What are you actually after?", opts: [
      ["energy", "More steady energy", "morning"],
      ["calm", "Better calm or sleep", "evening"],
      ["focus", "Sharper focus", "morning"],
      ["recovery", "Recovery & resilience", "any"],
      ["beauty", "Skin, hair & glow", "any"],
      ["digestion", "Digestion & gut", "any"],
    ]},
    { id: "time", q: "When would you take it?", opts: [
      ["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"], ["any", "Anytime"],
    ]},
    { id: "taste", q: "Bitter, earthy, sweet?", opts: [
      ["bitter", "I can handle bitter"], ["earthy", "Earthy and grounded"], ["sweet", "On the sweeter side"], ["any", "No preference"],
    ]},
    { id: "tradition", q: "Any tradition you lean toward?", opts: [
      ["ayurveda", "Ayurveda"], ["chinese", "Traditional Chinese"], ["amazon", "Amazonian"], ["any", "Open to anything"],
    ]},
  ];
  const [step, setStep] = useStateC(0);
  const [answers, setAnswers] = useStateC({});

  const score = (p) => {
    let s = 0;
    if (answers.goal && p.tags.includes(answers.goal)) s += 3;
    if (answers.goal === "energy" && p.uses.some(u => /energy|stamina/i.test(u))) s += 2;
    if (answers.goal === "calm" && p.uses.some(u => /calm|sleep|stress/i.test(u))) s += 2;
    if (answers.goal === "focus" && p.uses.some(u => /focus|memory|clarity/i.test(u))) s += 2;
    if (answers.goal === "recovery" && p.uses.some(u => /recovery|immunity|joint|inflammation/i.test(u))) s += 2;
    if (answers.goal === "beauty" && p.uses.some(u => /skin|hair/i.test(u))) s += 2;
    if (answers.goal === "digestion" && p.uses.some(u => /gut|digestion|liver/i.test(u))) s += 2;
    if (answers.time && p.tags.includes(answers.time)) s += 2;
    if (answers.tradition === "ayurveda" && (p.category === "ayurveda" || /india/i.test(p.origin))) s += 2;
    if (answers.tradition === "chinese" && /china/i.test(p.origin)) s += 2;
    if (answers.tradition === "amazon" && /brazil|peru|amazon/i.test(p.origin)) s += 2;
    return s;
  };

  const results = useMemoC(() => {
    if (Object.keys(answers).length < QUESTIONS.length) return [];
    return PRODUCTS.map(p => [p, score(p)]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
  }, [answers]);

  const current = QUESTIONS[step];
  const done = step >= QUESTIONS.length;

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 70, overflow: "auto" }}>
      <div style={{ borderBottom: "1px solid var(--line)", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Newsreader', serif", fontSize: "24px", letterSpacing: "0.16em", color: "var(--ink)" }}>GROUND · Find your powder</div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink)", cursor: "pointer" }}>× Close</button>
      </div>
      {!done ? (
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "60px 32px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, background: i <= step ? "var(--ink)" : "var(--line)" }} />
            ))}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Question {step + 1} of {QUESTIONS.length}</div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "clamp(48px, 6vw, 80px)", lineHeight: 1.0, margin: "16px 0 40px", color: "var(--ink)", textWrap: "balance" }}>{current.q}</h2>
          <div data-quiz-options style={{ display: "grid", gridTemplateColumns: current.opts.length > 4 ? "1fr 1fr" : "1fr", gap: 12 }}>
            {current.opts.map((o) => {
              const [v, l] = o;
              return (
                <button key={v} onClick={() => { setAnswers(a => ({...a, [current.id]: v})); setStep(s => s + 1); }} style={{
                  padding: "22px 24px", textAlign: "left",
                  background: "transparent", color: "var(--ink)",
                  border: "1px solid var(--line)", cursor: "pointer",
                  fontFamily: "'Newsreader', serif", fontSize: "22px",
                  transition: "all 120ms ease",
                }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--bg)"; }}
                   onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink)"; }}>
                  {l} <span style={{ float: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>→</span>
                </button>
              );
            })}
          </div>
          {step > 0 && (
            <button onClick={() => setStep(s => Math.max(0, s - 1))} style={{ marginTop: 32, background: "transparent", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", cursor: "pointer" }}>← Back</button>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Your three</div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "clamp(48px, 6vw, 80px)", lineHeight: 1.0, margin: "16px 0 32px", color: "var(--ink)", textWrap: "balance" }}>
            Based on your answers — these three are yours.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            {results.map((p, i) => (
              <div key={p.id} style={{ borderRight: i < 2 ? "1px solid var(--line)" : "none" }}>
                <ProductCard product={p} onAdd={onAdd} onOpen={onOpenProduct} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <button onClick={() => { results.forEach(p => onAdd(p)); onClose(); }} style={{ padding: "16px 28px", background: "var(--accent)", color: "var(--accent-ink)", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer" }}>
              Add all three — {fmtPrice(results.reduce((s, p) => s + p.price, 0))}
            </button>
            <button onClick={() => { setAnswers({}); setStep(0); }} style={{ padding: "16px 28px", background: "transparent", color: "var(--ink)", border: "1px solid var(--ink)", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer" }}>
              Retake the quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================= RECIPES ========================= */
const FULL_RECIPES = [
  { title: "Golden milk, slowly.", lead: "The traditional way — milk on low, ground spices in last.", ingredients: ["1 tsp turmeric powder", "½ tsp ginger powder", "3 cardamom pods, crushed", "1 cup whole milk (or oat)", "Pinch black pepper", "1 tsp raw honey"], steps: ["Warm milk on low heat — do not boil.", "Whisk in turmeric, ginger, cardamom and pepper.", "Simmer five minutes, stirring.", "Off heat, stir in honey. Drink warm."], time: "8 min", powder: "turmeric", color: "#D97706", swatch: "#E89B40" },
  { title: "Adaptogen latte.", lead: "Stress-shoulders by Wednesday? This.", ingredients: ["½ tsp ashwagandha", "½ tsp reishi powder", "1 tsp cacao", "1 cup oat milk", "1 tsp maple syrup"], steps: ["Whisk powders into 2 tbsp cold water to make a paste.", "Heat oat milk to just under a simmer.", "Combine and froth. Sweeten to taste."], time: "5 min", powder: "ashwagandha", color: "#5C4326", swatch: "#7E6240" },
  { title: "Morning greens.", lead: "Iron, chlorophyll, vitamin C — done by 8am.", ingredients: ["1 tsp moringa", "½ tsp matcha", "½ tsp amla", "1 banana", "1 cup almond milk", "Squeeze of lime"], steps: ["Blend everything on high for 45 seconds.", "Add a handful of ice if you like it cold.", "Pour, drink, go."], time: "3 min", powder: "moringa", color: "#5C7A55", swatch: "#7E9C73" },
  { title: "Forest tonic.", lead: "A mushroom decoction for the dark months.", ingredients: ["½ tsp chaga", "½ tsp cordyceps", "1 tsp cacao", "1 cup hot water", "1 strip orange peel"], steps: ["Bring water to a simmer with the orange peel.", "Whisk in mushroom powders. Steep 5 minutes.", "Strain and stir in cacao."], time: "10 min", powder: "reishi", color: "#3D1F14", swatch: "#5C3525" },
  { title: "Sunset chai.", lead: "Slow chai, evening dose of warmth.", ingredients: ["1 tsp tulsi", "½ tsp cinnamon", "½ tsp ginger", "1 cup milk", "Honey, to taste"], steps: ["Simmer milk and spices ten minutes on lowest heat.", "Whisk in tulsi just at the end.", "Cover, rest, pour."], time: "12 min", powder: "tulsi", color: "#6B7A4A", swatch: "#94A573" },
  { title: "Beet & berry shot.", lead: "Two-ounce energy, no caffeine.", ingredients: ["1 tsp beetroot powder", "½ tsp camu camu", "Juice of 1 lemon", "1 inch ginger, grated", "2 oz water"], steps: ["Stir powders into water until smooth.", "Add lemon and ginger juice. Shoot."], time: "2 min", powder: "beetroot", color: "#7C1D6F", swatch: "#A03E92" },
];

function RecipesScreen({ onOpenProduct, onAdd }) {
  return (
    <main style={{ maxWidth: 1440, margin: "0 auto", padding: "48px 32px 0" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>Recipes · 6 ways in</div>
      <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "clamp(64px, 8vw, 112px)", lineHeight: 0.95, margin: "12px 0 0", color: "var(--ink)", textWrap: "balance" }}>
        How <em style={{ color: "var(--accent)" }}>we</em> drink them.
      </h1>
      <p style={{ marginTop: 24, fontFamily: "'Newsreader', serif", fontSize: "20px", lineHeight: 1.5, color: "var(--ink-2)", maxWidth: 640, textWrap: "pretty" }}>
        Six everyday recipes — from a five-minute latte to a Sunday-afternoon mushroom decoction. Each one tells you exactly which powder is doing the work.
      </p>
      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 64 }}>
        {FULL_RECIPES.map((r) => {
          const prod = PRODUCTS.find(p => p.id === r.powder);
          return (
            <article key={r.title} style={{ borderTop: "1px solid var(--line)", paddingTop: 32 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <PowderTile color={r.color} swatch={r.swatch} label={r.powder} note={r.time} kind="splash" />
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>{r.time} · 1 serving</div>
                  <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "32px", lineHeight: 1.1, margin: "8px 0 12px" }}>{r.title}</h3>
                  <p style={{ fontFamily: "'Newsreader', serif", fontSize: "16px", lineHeight: 1.5, color: "var(--ink-2)" }}>{r.lead}</p>
                  <button onClick={() => prod && onAdd(prod)} style={{ marginTop: 16, padding: "10px 14px", background: "transparent", border: "1px solid var(--ink)", color: "var(--ink)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer" }}>
                    + Add {prod?.name}
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24 }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>You need</div>
                  <ul style={{ marginTop: 12, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {r.ingredients.map(i => (
                      <li key={i} style={{ fontFamily: "'Newsreader', serif", fontSize: "15px", color: "var(--ink-2)", borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>{i}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)" }}>Method</div>
                  <ol style={{ marginTop: 12, paddingLeft: 0, listStyle: "none" }}>
                    {r.steps.map((s, i) => (
                      <li key={i} style={{ display: "flex", gap: 12, padding: "8px 0", fontFamily: "'Newsreader', serif", fontSize: "16px", lineHeight: 1.45, color: "var(--ink-2)", borderBottom: "1px solid var(--line)" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)", paddingTop: 4 }}>0{i+1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

/* ========================= ABOUT ========================= */
function AboutScreen() {
  return (
    <main>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 32px 0" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>About · since 2019</div>
        <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "clamp(72px, 9vw, 144px)", lineHeight: 0.92, margin: "24px 0 0", color: "var(--ink)", textWrap: "balance" }}>
          We mill plants. <em style={{ color: "var(--accent)" }}>Slowly.</em>
        </h1>
      </section>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
        <p style={{ fontFamily: "'Newsreader', serif", fontSize: "24px", lineHeight: 1.45, color: "var(--ink)", margin: 0, textWrap: "pretty" }}>
          GROUND started in 2019 as a stone mill in a Brooklyn basement and a list of forty growers we'd been writing to for years. We wanted to buy the powders we actually used at home — the ones that hadn't been on a pallet for ten months, hadn't been blended with maltodextrin, hadn't been irradiated for shelf life.
        </p>
        <p style={{ fontFamily: "'Newsreader', serif", fontSize: "18px", lineHeight: 1.6, color: "var(--ink-2)", margin: 0, textWrap: "pretty" }}>
          Seven years later we work with the same forty growers. We mill cold and slow, in batches the size of a kitchen counter. We test every harvest. We ship in glass when glass makes sense, kraft when it doesn't. Nothing is private-labeled, nothing is reformulated to hit a price point. We just keep paying the farmers more and selling the powder for what it costs.
        </p>
      </section>
      <section style={{ maxWidth: 1440, margin: "80px auto 0", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {PRODUCTS.filter(p => p.hero).slice(0, 4).map(p => (
            <PowderTile key={p.id} color={p.color} swatch={p.swatch} label={p.origin.split(",")[0]} note={p.name} kind="splash" />
          ))}
        </div>
      </section>
      <section style={{ maxWidth: 1100, margin: "80px auto 0", padding: "0 32px" }}>
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 32 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)" }}>The standards</div>
          <h2 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "56px", lineHeight: 1.05, margin: "12px 0 32px", textWrap: "balance" }}>Six promises, in plain English.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {[
              ["01", "Single-origin", "Every powder comes from one farm, valley, or forest. No blends, no anonymity, no kilo-bag pooling."],
              ["02", "Tested every harvest", "Heavy metals, microbials, active compounds. Tests live on the jar."],
              ["03", "Slow cold-milled", "We don't heat-process. The mill runs at 23°C so the actives stay intact."],
              ["04", "Fair, named pricing", "We pay 2.3× the commodity rate. The farmer's name and county are printed on the label."],
              ["05", "Compostable inside-out", "Kraft pouches, paper-lined tins, no foil liners. Tested in home compost."],
              ["06", "1% to soil", "One percent of every order goes to regenerative soil work in the regions we source from."],
            ].map(([n, t, b]) => (
              <div key={n} style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--muted)" }}>{n}</div>
                <h3 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: "26px", margin: "8px 0 6px", color: "var(--ink)" }}>{t}</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", lineHeight: 1.55, color: "var(--ink-2)", margin: 0, textWrap: "pretty" }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { CartDrawer, CheckoutScreen, QuizScreen, RecipesScreen, AboutScreen });
