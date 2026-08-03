// app.jsx — Mobile (iOS) and Desktop (browser) shells wrapping the shared
// screens. Both read from the same DriftProvider so state is shared.

// ── Mobile shell ──────────────────────────────────────────────────────────
function MobileTabBar({ c, active, onChange }) {
  const tabs = [
    { id: 'game', label: 'Game', icon: Icon.chart },
    { id: 'lobby', label: 'Lobby', icon: Icon.grid },
    { id: 'wallet', label: 'Wallet', icon: Icon.wallet },
    { id: 'leaders', label: 'Leaders', icon: Icon.trophy },
    { id: 'profile', label: 'You', icon: Icon.profile },
  ];
  return (
    <div style={{
      borderTop: `1px solid ${c.hairline}`,
      background: c.surface,
      padding: '6px 4px 14px',
      display: 'flex',
    }}>
      {tabs.map((t) => {
        const on = t.id === active;
        const Ic = t.icon;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
              padding: '8px 0',
              border: 'none', background: 'transparent', cursor: 'pointer',
            }}>
            <Ic c={on ? c.ink : c.muted} size={20} />
            <span style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 600,
              color: on ? c.ink : c.muted, letterSpacing: 0.2,
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MobileTopBar({ c, title, balance }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px 8px',
      borderBottom: `1px solid ${c.hairline}`,
      background: c.surface,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <DriftMark size={20} color={c.ink} />
        <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: c.ink, letterSpacing: -0.4 }}>
          Drift
        </span>
        <span style={{ fontFamily: SANS, fontSize: 13, color: c.muted, fontWeight: 500, marginLeft: 6 }}>
          {title}
        </span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 999,
        background: c.surfaceAlt,
      }}>
        <Money value={balance} size={12} color={c.ink} weight={600} />
      </div>
    </div>
  );
}

function MobileApp({ c, density, presets, startScreen = 'game' }) {
  const d = useDrift();
  const [tab, setTab] = React.useState(startScreen);
  const [showLogin, setShowLogin] = React.useState(false);
  const titles = {
    game: 'The Line',
    lobby: 'Games',
    wallet: 'Wallet',
    leaders: 'Leaderboard',
    profile: 'Profile',
  };

  if (showLogin) {
    return (
      <div style={{ width: '100%', height: '100%', background: c.surface, display: 'flex', flexDirection: 'column' }}>
        <LoginScreen c={c} onContinue={() => setShowLogin(false)} />
      </div>
    );
  }

  // The iOS frame already includes status bar and home indicator. We just
  // render a clean content area + bottom tab bar inside it.
  return (
    <div style={{ width: '100%', height: '100%', background: c.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* spacer for the iOS status bar */}
      <div style={{ height: 54, flexShrink: 0 }} />
      <MobileTopBar c={c} title={titles[tab]} balance={d.wallet.usd} />
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'game' && <LiveGameScreen c={c} density={density} presets={presets} width={402} />}
        {tab === 'lobby' && <LobbyScreen c={c} />}
        {tab === 'wallet' && <WalletScreen c={c} />}
        {tab === 'leaders' && <LeaderboardScreen c={c} />}
        {tab === 'profile' && <ProfileScreen c={c} onLogout={() => setShowLogin(true)} />}
      </div>
      <MobileTabBar c={c} active={tab} onChange={setTab} />
      {/* spacer for the iOS home indicator */}
      <div style={{ height: 28, flexShrink: 0, background: c.surface }} />
    </div>
  );
}

// ── Desktop shell ─────────────────────────────────────────────────────────
function DesktopSidebar({ c, active, onChange, balance }) {
  const items = [
    { id: 'game', label: 'Live game', icon: Icon.chart },
    { id: 'lobby', label: 'Lobby', icon: Icon.grid },
    { id: 'wallet', label: 'Wallet', icon: Icon.wallet },
    { id: 'leaders', label: 'Leaderboard', icon: Icon.trophy },
    { id: 'profile', label: 'Profile', icon: Icon.profile },
  ];
  return (
    <div style={{
      width: 220, flexShrink: 0,
      borderRight: `1px solid ${c.hairline}`,
      background: c.bg,
      padding: '20px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 18px' }}>
        <DriftMark size={22} color={c.ink} />
        <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: c.ink, letterSpacing: -0.5 }}>
          Drift
        </span>
      </div>
      {items.map((it) => {
        const on = it.id === active;
        const Ic = it.icon;
        return (
          <button key={it.id} onClick={() => onChange(it.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', height: 34,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              background: on ? c.surface : 'transparent',
              boxShadow: on ? `inset 0 0 0 1px ${c.hairline}` : 'none',
              color: on ? c.ink : c.inkSoft,
              fontFamily: SANS, fontSize: 13, fontWeight: on ? 600 : 500,
              textAlign: 'left',
            }}>
            <Ic c={on ? c.ink : c.muted} size={16} />
            {it.label}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <div style={{ padding: '10px', borderRadius: 8, background: c.surface, border: `1px solid ${c.hairline}` }}>
        <div style={{ fontFamily: SANS, fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>Balance</div>
        <Money value={balance} size={18} color={c.ink} weight={700} />
        <button
          style={{
            marginTop: 6, width: '100%', height: 28, borderRadius: 6,
            border: `1px solid ${c.hairline}`,
            background: c.surfaceAlt, color: c.ink,
            fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>+ Add funds</button>
      </div>
    </div>
  );
}

function DesktopTopbar({ c, title, subtitle, right }) {
  return (
    <div style={{
      padding: '20px 28px',
      borderBottom: `1px solid ${c.hairline}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: c.bg,
    }}>
      <div>
        <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: c.ink, letterSpacing: -0.5 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontFamily: SANS, fontSize: 13, color: c.muted, marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
}

// Desktop live game — wider chart, anchor list as side panel, fairness below
function DesktopLiveGame({ c, density, presets }) {
  const d = useDrift();
  const { round, wallet, placeAnchor, pool, allAnchors, ROUND_BASE_VALUE } = d;
  const [proposed, setProposed] = React.useState(ROUND_BASE_VALUE);
  const [stake, setStake] = React.useState(presets[1] || 25);

  React.useEffect(() => {
    setProposed(ROUND_BASE_VALUE + (Math.random() - 0.5) * 4);
  }, [round.id]);

  const place = () => {
    if (round.userAnchor) return;
    placeAnchor(proposed, stake);
  };

  return (
    <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PhaseStrip c={c} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
        {/* chart side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card c={c} pad={16}>
            <DriftChart c={c} width={580} height={340} density={density}
              proposedLevel={proposed} onProposeLevel={setProposed} />
          </Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <Card c={c} pad={12}>
              <SectionLabel c={c} style={{ fontSize: 10 }}>Pool</SectionLabel>
              <Money value={pool} size={20} color={c.ink} weight={700} />
            </Card>
            <Card c={c} pad={12}>
              <SectionLabel c={c} style={{ fontSize: 10 }}>Players</SectionLabel>
              <Num value={allAnchors.length} size={20} color={c.ink} weight={700} decimals={0} />
            </Card>
            <Card c={c} pad={12}>
              <SectionLabel c={c} style={{ fontSize: 10 }}>House rake</SectionLabel>
              <Num value={3} size={20} color={c.muted} weight={700} decimals={0} suffix="%" />
            </Card>
            <Card c={c} pad={12}>
              <SectionLabel c={c} style={{ fontSize: 10 }}>Your balance</SectionLabel>
              <Money value={wallet.usd} size={20} color={c.ink} weight={700} />
            </Card>
          </div>
          <FairnessBlock c={c} />
        </div>

        {/* action / anchor side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card c={c} pad={16}>
            <SectionLabel c={c} style={{ marginBottom: 6 }}>
              {round.phase === 'open' && !round.userAnchor ? 'Place an anchor' :
               round.phase === 'open' ? 'Anchor placed' :
               round.phase === 'drift' ? 'Round live' :
               'Settled'}
            </SectionLabel>
            {round.phase === 'open' && !round.userAnchor && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: c.muted }}>Target level</span>
                  <Num value={proposed} size={22} weight={700} color={c.ink} />
                </div>
                <StakeRow c={c} value={stake} onChange={setStake} presets={presets} max={Math.floor(wallet.usd)} />
                <Btn c={c} kind="primary" size="lg" full onClick={place}
                  disabled={stake > wallet.usd || stake < 1}>
                  Place anchor
                </Btn>
                <div style={{ fontFamily: SANS, fontSize: 11, color: c.muted, textAlign: 'center' }}>
                  Drag the chart to set the level, then place.
                </div>
              </div>
            )}
            {round.phase === 'open' && round.userAnchor && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon.check c={c.up} size={14} />
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: c.ink }}>Anchor placed</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: c.inkSoft }}>
                  ${round.userAnchor.stake} @ {round.userAnchor.level.toFixed(2)}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: c.muted, lineHeight: 1.5 }}>
                  Drift starts when the open window closes.
                </div>
              </div>
            )}
            {round.phase === 'drift' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontFamily: SANS, fontSize: 13, color: c.inkSoft, lineHeight: 1.5 }}>
                  {round.userAnchor
                    ? <>Your anchor at <strong style={{ fontFamily: MONO, color: c.ink }}>{round.userAnchor.level.toFixed(2)}</strong> is in play. Watching the line settle.</>
                    : <>Round in progress. You'll be able to anchor in the next round.</>
                  }
                </div>
              </div>
            )}
            {round.phase === 'settle' && <ResultsCard c={c} />}
          </Card>

          <Card c={c} pad={14}>
            <SectionLabel c={c} style={{ marginBottom: 10 }}>Anchors ({allAnchors.length})</SectionLabel>
            <AnchorList c={c} max={8} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function DesktopApp({ c, density, presets, startScreen = 'game' }) {
  const d = useDrift();
  const [section, setSection] = React.useState(startScreen);
  const [showLogin, setShowLogin] = React.useState(false);

  if (showLogin) {
    return (
      <div style={{ width: '100%', height: '100%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 460, height: 600, background: c.surface, border: `1px solid ${c.hairline}`, borderRadius: 18, overflow: 'hidden' }}>
          <LoginScreen c={c} onContinue={() => setShowLogin(false)} />
        </div>
      </div>
    );
  }

  const titles = {
    game: { t: 'The Line', s: `Round #${d.round.id} · Provably fair` },
    lobby: { t: 'Games', s: 'Active and upcoming rounds' },
    wallet: { t: 'Wallet', s: 'Deposit, withdraw, history' },
    leaders: { t: 'Leaderboard', s: 'Top players this week' },
    profile: { t: 'Profile', s: '@' + d.user.handle },
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: c.bg, color: c.ink, overflow: 'hidden' }}>
      <DesktopSidebar c={c} active={section} onChange={setSection} balance={d.wallet.usd} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <DesktopTopbar c={c}
          title={titles[section].t}
          subtitle={titles[section].s}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setShowLogin(true)}
                style={{ padding: '6px 10px', height: 32, border: `1px solid ${c.hairline}`, borderRadius: 8, background: c.surface, color: c.inkSoft, fontFamily: SANS, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                Sign out
              </button>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: c.ink,
                color: c.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SANS, fontSize: 13, fontWeight: 700,
              }}>{d.user.initial}</div>
            </div>
          } />
        <div style={{ flex: 1, overflow: 'auto', background: c.bg }}>
          {section === 'game' && <DesktopLiveGame c={c} density={density} presets={presets} />}
          {section === 'lobby' && (
            <div style={{ maxWidth: 720 }}><LobbyScreen c={c} /></div>
          )}
          {section === 'wallet' && (
            <div style={{ maxWidth: 600 }}><WalletScreen c={c} /></div>
          )}
          {section === 'leaders' && (
            <div style={{ maxWidth: 640 }}><LeaderboardScreen c={c} /></div>
          )}
          {section === 'profile' && (
            <div style={{ maxWidth: 720 }}><ProfileScreen c={c} onLogout={() => setShowLogin(true)} /></div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileApp, DesktopApp });
