/* Checkout flow & cart drawer */
const { useState: useStateC, useEffect: useEffectC } = React;

// ====================== CART DRAWER ======================
function CartDrawer({ open, onClose, cart, setQty, removeItem, go }) {
  const subtotal = cart.reduce((s, it) => s + it.wine.price * it.qty, 0);
  const itemCount = cart.reduce((s, it) => s + it.qty, 0);
  const ship = subtotal >= 400 || subtotal === 0 ? 0 : 28;
  const total = subtotal + ship;

  return (
    <React.Fragment>
      <div className={`drawer-scrim ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-head">
          <div>
            <div className="kicker">Your selection</div>
            <div className="serif" style={{ fontSize: 28, marginTop: 4 }}>The cart · <span style={{ color: 'var(--ink-mute)' }}>{itemCount}</span></div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, fontSize: 20, color: 'var(--ink)' }}>✕</button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--ink-mute)' }}>
              <div className="serif" style={{ fontSize: 32, marginBottom: 10 }}>The cellar awaits</div>
              <div style={{ fontSize: 14 }}>Your cart is empty. Browse the cellar to begin.</div>
              <button className="btn" style={{ marginTop: 28 }} onClick={() => { onClose(); go({ route: 'shop' }); }}>Browse the cellar</button>
            </div>
          ) : (
            cart.map(it => (
              <div key={it.wine.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 18, padding: '20px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <div style={{ height: 120 }}><Bottle wine={it.wine} /></div>
                <div>
                  <div className="kicker">{it.wine.region}</div>
                  <div className="serif" style={{ fontSize: 22, marginTop: 4 }}>{it.wine.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>{it.wine.cuvee} · {it.wine.vintage}</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14 }}>
                    <Qty value={it.qty} onChange={(v) => setQty(it.wine.id, v)} max={Math.min(it.wine.stock, 12)} />
                    <button onClick={() => removeItem(it.wine.id)} style={{ background: 'transparent', border: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
                <div className="serif" style={{ fontSize: 22 }}><Price amount={it.wine.price * it.qty} /></div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span>Subtotal</span><Price amount={subtotal} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span>Shipping {ship === 0 && <em style={{ color: 'var(--gold)' }}>· complimentary</em>}</span>
              {ship === 0 ? <span>—</span> : <Price amount={ship} />}
            </div>
            <div className="hair" style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
              <span className="kicker">Total</span>
              <span className="serif" style={{ fontSize: 32 }}><Price amount={total} /></span>
            </div>
            <button className="btn btn-block" onClick={() => { onClose(); go({ route: 'checkout' }); }}>
              Proceed to checkout ⟶
            </button>
            <div style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
              Adult signature required · Bottle insurance included
            </div>
          </div>
        )}
      </aside>
    </React.Fragment>
  );
}

// ====================== CHECKOUT ======================
function CheckoutScreen({ cart, go, onComplete }) {
  const [step, setStep] = useStateC(0);
  const [form, setForm] = useStateC({
    email: '', firstName: '', lastName: '',
    address1: '', city: '', state: 'CA', zip: '', country: 'United States',
    card: '', exp: '', cvv: '', name: '',
    shipMethod: 'temp',
    giftNote: ''
  });
  const [errors, setErrors] = useStateC({});
  const [placing, setPlacing] = useStateC(false);

  const subtotal = cart.reduce((s, it) => s + it.wine.price * it.qty, 0);
  const shipMap = { temp: 28, express: 64, will: 0 };
  const shipFree = subtotal >= 400;
  const ship = shipFree ? 0 : shipMap[form.shipMethod];
  const tax = subtotal * 0.0875;
  const total = subtotal + ship + tax;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email required';
      if (!form.firstName) e.firstName = 'Required';
      if (!form.lastName) e.lastName = 'Required';
      if (!form.address1) e.address1 = 'Required';
      if (!form.city) e.city = 'Required';
      if (!form.zip || form.zip.length < 5) e.zip = 'Valid ZIP required';
    } else if (step === 1) {
      // shipping method
    } else if (step === 2) {
      if (!form.card.replace(/\s/g, '').match(/^\d{15,16}$/)) e.card = '15–16 digits';
      if (!form.exp.match(/^\d{2}\/\d{2}$/)) e.exp = 'MM/YY';
      if (!form.cvv.match(/^\d{3,4}$/)) e.cvv = '3–4 digits';
      if (!form.name) e.name = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => Math.max(0, s - 1));

  const place = () => {
    if (!validateStep()) return;
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      onComplete({
        ...form,
        items: cart,
        total,
        orderId: 'MC-' + Math.floor(100000 + Math.random() * 900000)
      });
    }, 1800);
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <div className="kicker">Checkout</div>
        <h1 className="serif" style={{ fontSize: 60, margin: '12px 0 16px' }}>Your cart is empty.</h1>
        <p style={{ color: 'var(--ink-mute)', marginBottom: 28 }}>Add a few bottles from the cellar to continue.</p>
        <button className="btn" onClick={() => go({ route: 'shop' })}>Browse the cellar</button>
      </div>
    );
  }

  const steps = ['Shipping', 'Method', 'Payment', 'Review'];

  return (
    <div className="fade-in" style={{ minHeight: '100vh' }}>
      <div className="container" style={{ padding: '40px 40px 0' }}>
        <div className="kicker">Checkout · Maison Corval</div>
        <h1 className="serif" style={{ fontSize: 60, margin: '8px 0 28px' }}>Almost yours.</h1>

        <div className="stepper" style={{ marginBottom: 36 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <span className={`step ${i === step ? 'active' : ''}`} style={{ color: i <= step ? 'var(--ink)' : 'var(--ink-mute)' }}>
                {String(i + 1).padStart(2, '0')} {s}
              </span>
              {i < steps.length - 1 && <div className="hair" style={{ width: 32 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '0 40px 80px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 80 }}>
        {/* LEFT — form */}
        <div>
          {step === 0 && (
            <div className="fade-in" style={{ display: 'grid', gap: 28 }}>
              <h2 className="serif" style={{ fontSize: 32, margin: 0 }}>Ship to</h2>
              <div className="field">
                <label>Email</label>
                <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                {errors.email && <span className="err">{errors.email}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="field">
                  <label>First name</label>
                  <input value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                  {errors.firstName && <span className="err">{errors.firstName}</span>}
                </div>
                <div className="field">
                  <label>Last name</label>
                  <input value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                  {errors.lastName && <span className="err">{errors.lastName}</span>}
                </div>
              </div>
              <div className="field">
                <label>Street address</label>
                <input value={form.address1} onChange={e => set('address1', e.target.value)} placeholder="No PO boxes — adult signature required" />
                {errors.address1 && <span className="err">{errors.address1}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 24 }}>
                <div className="field">
                  <label>City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} />
                  {errors.city && <span className="err">{errors.city}</span>}
                </div>
                <div className="field">
                  <label>State</label>
                  <select value={form.state} onChange={e => set('state', e.target.value)}>
                    {['CA','NY','TX','IL','WA','MA','FL','OR','CO','DC'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>ZIP</label>
                  <input value={form.zip} onChange={e => set('zip', e.target.value.replace(/\D/g,'').slice(0,5))} />
                  {errors.zip && <span className="err">{errors.zip}</span>}
                </div>
              </div>
              <div className="field">
                <label>Country</label>
                <select value={form.country} onChange={e => set('country', e.target.value)}>
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="fade-in" style={{ display: 'grid', gap: 16 }}>
              <h2 className="serif" style={{ fontSize: 32, margin: '0 0 12px' }}>Shipping method</h2>
              {[
                { id: 'temp', name: 'Temperature-controlled', sub: '2–4 business days · insulated carton', price: 28 },
                { id: 'express', name: 'Express overnight', sub: 'Next-day · refrigerated truck (where available)', price: 64 },
                { id: 'will', name: 'Will-call · cellar pickup', sub: 'Pick up at our Bordeaux cellar or Tribeca tasting room', price: 0 }
              ].map(opt => (
                <label key={opt.id} style={{
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center',
                  padding: 22, border: '1px solid ' + (form.shipMethod === opt.id ? 'var(--ink)' : 'var(--line)'),
                  background: form.shipMethod === opt.id ? 'var(--parchment-deep)' : 'transparent',
                  cursor: 'pointer'
                }}>
                  <input type="radio" checked={form.shipMethod === opt.id} onChange={() => set('shipMethod', opt.id)} style={{ accentColor: 'var(--wine)' }} />
                  <div>
                    <div className="serif" style={{ fontSize: 22 }}>{opt.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }}>{opt.sub}</div>
                  </div>
                  <div className="serif" style={{ fontSize: 22 }}>
                    {shipFree && opt.id === 'temp' ? <em style={{ color: 'var(--gold)' }}>Complimentary</em> : (opt.price === 0 ? 'Free' : `$${opt.price}`)}
                  </div>
                </label>
              ))}
              <div className="field" style={{ marginTop: 12 }}>
                <label>Gift note (optional)</label>
                <input value={form.giftNote} onChange={e => set('giftNote', e.target.value)} placeholder="Hand-written on the bottle card by our cellar staff" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in" style={{ display: 'grid', gap: 28 }}>
              <h2 className="serif" style={{ fontSize: 32, margin: 0 }}>Payment</h2>
              <div className="field">
                <label>Card number</label>
                <input value={form.card} onChange={e => {
                  const v = e.target.value.replace(/\D/g,'').slice(0,16);
                  set('card', v.replace(/(.{4})/g, '$1 ').trim());
                }} placeholder="0000 0000 0000 0000" />
                {errors.card && <span className="err">{errors.card}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="field">
                  <label>Expiry</label>
                  <input value={form.exp} onChange={e => {
                    let v = e.target.value.replace(/\D/g,'').slice(0,4);
                    if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
                    set('exp', v);
                  }} placeholder="MM/YY" />
                  {errors.exp && <span className="err">{errors.exp}</span>}
                </div>
                <div className="field">
                  <label>CVV</label>
                  <input value={form.cvv} onChange={e => set('cvv', e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="•••" />
                  {errors.cvv && <span className="err">{errors.cvv}</span>}
                </div>
              </div>
              <div className="field">
                <label>Name on card</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} />
                {errors.name && <span className="err">{errors.name}</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
                <div style={{ width: 8, height: 8, background: 'var(--gold)', borderRadius: 999 }} />
                256-bit encrypted · processed by Stripe
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in" style={{ display: 'grid', gap: 24 }}>
              <h2 className="serif" style={{ fontSize: 32, margin: 0 }}>Review</h2>
              <div style={{ border: '1px solid var(--line)', padding: 24 }}>
                <div className="kicker">Shipping to</div>
                <div className="serif" style={{ fontSize: 20, marginTop: 6 }}>{form.firstName} {form.lastName}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 4 }}>
                  {form.address1}<br/>
                  {form.city}, {form.state} {form.zip}<br/>
                  {form.country}
                </div>
                <button onClick={() => setStep(0)} style={{ background: 'transparent', border: 0, padding: 0, marginTop: 12, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--wine)' }}>Edit</button>
              </div>
              <div style={{ border: '1px solid var(--line)', padding: 24 }}>
                <div className="kicker">Method</div>
                <div className="serif" style={{ fontSize: 20, marginTop: 6 }}>
                  {form.shipMethod === 'temp' && 'Temperature-controlled · 2–4 days'}
                  {form.shipMethod === 'express' && 'Express overnight'}
                  {form.shipMethod === 'will' && 'Will-call · cellar pickup'}
                </div>
                <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 0, padding: 0, marginTop: 12, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--wine)' }}>Edit</button>
              </div>
              <div style={{ border: '1px solid var(--line)', padding: 24 }}>
                <div className="kicker">Payment</div>
                <div className="serif" style={{ fontSize: 20, marginTop: 6 }}>•••• •••• •••• {form.card.replace(/\s/g,'').slice(-4)}</div>
                <button onClick={() => setStep(2)} style={{ background: 'transparent', border: 0, padding: 0, marginTop: 12, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--wine)' }}>Edit</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
            {step > 0 && <button className="btn btn-ghost" onClick={back}>← Back</button>}
            {step < 3 && <button className="btn" style={{ flex: 1 }} onClick={next}>Continue ⟶</button>}
            {step === 3 && (
              <button className="btn" style={{ flex: 1 }} onClick={place} disabled={placing}>
                {placing ? 'Decanting your order…' : <React.Fragment>Place order · <Price amount={total} /></React.Fragment>}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT — order summary */}
        <aside style={{ position: 'sticky', top: 100, alignSelf: 'flex-start', background: 'var(--parchment-deep)', padding: 32, border: '1px solid var(--line)' }}>
          <div className="kicker">Order summary</div>
          <div className="serif" style={{ fontSize: 30, margin: '6px 0 24px' }}>{cart.reduce((s,it)=>s+it.qty,0)} bottles</div>
          {cart.map(it => (
            <div key={it.wine.id} style={{ display: 'grid', gridTemplateColumns: '54px 1fr auto', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line-soft)' }}>
              <div style={{ height: 80 }}><Bottle wine={it.wine} /></div>
              <div>
                <div className="serif" style={{ fontSize: 18 }}>{it.wine.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{it.wine.vintage} · ×{it.qty}</div>
              </div>
              <div className="serif" style={{ fontSize: 16 }}><Price amount={it.wine.price * it.qty} /></div>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Subtotal</span><Price amount={subtotal} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Shipping</span>{ship === 0 ? <span>—</span> : <Price amount={ship} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Estimated tax</span><Price amount={tax} />
            </div>
            <div className="hair" style={{ margin: '14px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="kicker">Total · USD</span>
              <span className="serif" style={{ fontSize: 30 }}><Price amount={total} /></span>
            </div>
          </div>
          <div className="hair" style={{ margin: '20px 0' }} />
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--ink)' }}>Bottle insurance included.</strong> If your wine arrives damaged or corked, we'll replace it from our cellar at no charge.
          </div>
        </aside>
      </div>
    </div>
  );
}

// ====================== CONFIRMATION ======================
function ConfirmationScreen({ order, go }) {
  if (!order) return null;
  return (
    <div className="fade-in container" style={{ padding: '100px 40px', maxWidth: 880 }}>
      <div className="kicker">Order confirmed</div>
      <h1 className="serif" style={{ fontSize: 96, margin: '12px 0 12px', lineHeight: 0.95 }}>Merci, {order.firstName}.</h1>
      <p style={{ fontSize: 19, color: 'var(--ink-soft)', lineHeight: 1.55, maxWidth: 620 }}>
        We've received your order. Our cellar staff in Bordeaux will hand-pack your wines in insulated cartons. You'll receive tracking by email within 24 hours.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, border: '1px solid var(--line)', marginTop: 48 }}>
        <div style={{ padding: 24, borderRight: '1px solid var(--line)' }}>
          <div className="kicker">Order number</div>
          <div className="serif" style={{ fontSize: 26, marginTop: 6 }}>{order.orderId}</div>
        </div>
        <div style={{ padding: 24, borderRight: '1px solid var(--line)' }}>
          <div className="kicker">Total</div>
          <div className="serif" style={{ fontSize: 26, marginTop: 6 }}><Price amount={order.total} /></div>
        </div>
        <div style={{ padding: 24 }}>
          <div className="kicker">Arriving</div>
          <div className="serif" style={{ fontSize: 26, marginTop: 6 }}>
            {order.shipMethod === 'express' ? 'Tomorrow' : order.shipMethod === 'will' ? 'Will-call' : '2–4 days'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 48 }}>
        <div className="kicker">In your case</div>
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
          {order.items.map(it => (
            <div key={it.wine.id}>
              <div style={{ height: 220 }}><Bottle wine={it.wine} /></div>
              <div className="serif" style={{ fontSize: 20, marginTop: 12 }}>{it.wine.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{it.wine.vintage} · {it.qty} bottle{it.qty>1?'s':''}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 56 }}>
        <button className="btn" onClick={() => go({ route: 'home' })}>Return home</button>
        <button className="btn btn-ghost" onClick={() => go({ route: 'shop' })}>Continue browsing</button>
      </div>
    </div>
  );
}

Object.assign(window, { CartDrawer, CheckoutScreen, ConfirmationScreen });
