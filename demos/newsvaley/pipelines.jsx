// Pipelines page — cron jobs, content ingestion stages, live log
// This is the backstage that feeds the paper.

const { useState, useEffect, useMemo, useRef } = React;

// ── Data ────────────────────────────────────────────────────────────────
const JOBS = [
  { id: "wire", schedule: "*/15 * * * *", name: "Wire poll · AP + Reuters",
    desc: "Pull headlines, filter on positivity > 0.65",
    lastRun: "4m ago", nextRun: "in 11m", status: "ok",
    inflow: 41, kept: 3, dur: "1.8s", owner: "ingest-svc" },
  { id: "rss-science", schedule: "0 */2 * * *", name: "Journals · Nature, Lancet, PNAS",
    desc: "RSS pull of open-access positive findings",
    lastRun: "1h 12m", nextRun: "in 48m", status: "ok",
    inflow: 8, kept: 5, dur: "4.1s", owner: "ingest-svc" },
  { id: "reddit", schedule: "0 6 * * *", name: "Community mirror · r/UpliftingNews",
    desc: "Hand-curated mirror of high-score uplifting posts",
    lastRun: "today 06:00", nextRun: "tomorrow 06:00", status: "ok",
    inflow: 120, kept: 18, dur: "12.4s", owner: "ingest-svc" },
  { id: "tip-line", schedule: "*/5 * * * *", name: "Reader tip line",
    desc: "Inbox poll → triage queue",
    lastRun: "2m ago", nextRun: "in 3m", status: "ok",
    inflow: 14, kept: 6, dur: "0.6s", owner: "ingest-svc" },
  { id: "positivity", schedule: "*/5 * * * *", name: "Positivity classifier",
    desc: "Score every incoming candidate (0.00–1.00)",
    lastRun: "2m ago", nextRun: "in 3m", status: "ok",
    inflow: 184, kept: null, dur: "3.2s", owner: "ml-svc" },
  { id: "neg-filter", schedule: "*/5 * * * *", name: "Negativity filter sweep",
    desc: "Block list + sentiment second-pass",
    lastRun: "2m ago", nextRun: "in 3m", status: "ok",
    inflow: 184, kept: 41, dur: "0.4s", owner: "ml-svc" },
  { id: "factcheck", schedule: "*/30 * * * *", name: "Fact-check assist",
    desc: "Cross-reference claims against trusted sources",
    lastRun: "12m ago", nextRun: "in 18m", status: "warn",
    inflow: 9, kept: 7, dur: "11.2s", owner: "ml-svc",
    note: "2 items pending human verification" },
  { id: "alt-text", schedule: "*/30 * * * *", name: "Image alt-text generation",
    desc: "Vision model → caption + alt text",
    lastRun: "18m ago", nextRun: "in 12m", status: "warn",
    inflow: 8, kept: 8, dur: "6.7s", owner: "ml-svc",
    note: "Vision API latency p95: 4.2s (target 2.0s)" },
  { id: "deck-gen", schedule: "0 4 * * *", name: "Deck draft generation",
    desc: "Compose deck/lede for each greenlit item",
    lastRun: "today 04:00", nextRun: "tomorrow 04:00", status: "ok",
    inflow: 12, kept: 12, dur: "42s", owner: "editorial-svc" },
  { id: "smile", schedule: "0 3 * * *", name: "Today's Smile selection",
    desc: "Rank gentle items, pick 1 for the front box",
    lastRun: "today 03:00", nextRun: "tomorrow 03:00", status: "ok",
    inflow: 200, kept: 1, dur: "8.0s", owner: "editorial-svc" },
  { id: "optimism", schedule: "30 5 * * *", name: "Optimism Index recompute",
    desc: "Aggregate the day's tone into the +/− index",
    lastRun: "today 05:30", nextRun: "tomorrow 05:30", status: "ok",
    inflow: null, kept: null, dur: "1.1s", owner: "editorial-svc" },
  { id: "reef", schedule: "0 0 * * 1", name: "Coral reef monitoring",
    desc: "Weekly pull of Indo-Pacific reef telemetry",
    lastRun: "3d ago", nextRun: "in 4d", status: "ok",
    inflow: 1, kept: 1, dur: "3m 12s", owner: "data-svc" },
  { id: "essay", schedule: "0 8 * * 0", name: "Weekend photo essay assembly",
    desc: "Compile and arrange the Saturday five-frame",
    lastRun: "2d ago", nextRun: "in 5d", status: "ok",
    inflow: 18, kept: 5, dur: "22s", owner: "editorial-svc" },
  { id: "newsletter", schedule: "0 7 * * *", name: "Morning email blast",
    desc: "Render + send to subscriber list",
    lastRun: "today 07:00", nextRun: "tomorrow 07:00", status: "ok",
    inflow: 8, kept: null, dur: "1m 47s", owner: "delivery-svc" },
  { id: "archive", schedule: "0 1 * * *", name: "Archive last edition",
    desc: "Freeze yesterday's edition to immutable storage",
    lastRun: "today 01:00", nextRun: "tomorrow 01:00", status: "ok",
    inflow: null, kept: null, dur: "14s", owner: "data-svc" },
  { id: "cache", schedule: "0 */6 * * *", name: "CDN cache warm",
    desc: "Pre-render top stories to edge",
    lastRun: "2h", nextRun: "in 4h", status: "ok",
    inflow: 24, kept: 24, dur: "30s", owner: "delivery-svc" },
  { id: "negdict", schedule: "0 2 * * 0", name: "Negativity dictionary refresh",
    desc: "Pull updated block-word list + retrain",
    lastRun: "Sun 02:00", nextRun: "in 4d", status: "ok",
    inflow: null, kept: null, dur: "9m", owner: "ml-svc" },
];

const STAGES = [
  { key: "ingest",   label: "Ingest",         count: 184, color: "var(--info)" },
  { key: "positivity", label: "Positivity",   count: 119, color: "var(--accent)" },
  { key: "negfilter",label: "Neg. filter",    count: 73,  color: "var(--warn)" },
  { key: "factcheck",label: "Fact-check",     count: 41,  color: "var(--info)" },
  { key: "triage",   label: "Editor triage",  count: 26,  color: "var(--accent)" },
  { key: "ready",    label: "Ready to print", count: 12,  color: "var(--good)" },
];

const BLOCK_WORDS = [
  "tragedy", "tragic", "disaster", "outrage", "feud", "scandal", "shocking",
  "panic", "crisis", "doomed", "collapse", "horror", "terror", "fury",
  "blast", "slammed", "slams", "blasted", "ravages", "ravaged", "grim",
];

const TRIAGE = [
  { src: "WIRE · Reuters",   title: "Tiger numbers up 31% in Bhutan census",            score: 0.92, action: "publish",   recom: "Auto-approve" },
  { src: "TIP · K. Mansour", title: "Three nurses on three floors quietly funded surgery", score: 0.95, action: "publish", recom: "Auto-approve" },
  { src: "RSS · Nature",     title: "Mangrove restoration in Bangladesh hits 12-yr high",   score: 0.83, action: "publish", recom: "Auto-approve" },
  { src: "WIRE · AP",        title: "Heroic firefighter saves four from blaze",             score: 0.71, action: "hold",    recom: "Edge case — mentions danger" },
  { src: "RSS · Lancet",     title: "Universal flu candidate clears phase 3",               score: 0.94, action: "publish", recom: "Auto-approve" },
  { src: "REDDIT",           title: "Lost ring returned to widow via metal detector",       score: 0.87, action: "hold",    recom: "Needs verification" },
  { src: "WIRE · AFP",       title: "Local elections marked by record turnout, cheer",      score: 0.69, action: "hold",    recom: "Tone borderline" },
  { src: "WIRE · AP",        title: "Stocks plunge on inflation report",                    score: 0.18, action: "reject",  recom: "Out of scope" },
  { src: "WIRE · Reuters",   title: "Earthquake hits coastal province, casualties feared",  score: 0.06, action: "reject",  recom: "Out of scope" },
];

// Tiny inline sparkline
function Spark({ values, color = "var(--ink)" }) {
  const max = Math.max(...values, 1), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg className="kpi-spark" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <polyline points={`${pts} 100,100 0,100`} fill={color} opacity="0.08" />
    </svg>
  );
}

// ── Pipeline diagram ───────────────────────────────────────────────────
function PipelineDiagram() {
  const max = Math.max(...STAGES.map(s => s.count));
  return (
    <div className="pipeline">
      {STAGES.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="stage" style={{ flex: 1 }}>
            <div className="stage-bar-track">
              <div className="stage-bar" style={{ height: `${(s.count / max) * 100}%`, background: s.color }} />
            </div>
            <div className="stage-meta">
              <div className="stage-count">{s.count}</div>
              <div className="stage-label">{s.label}</div>
            </div>
          </div>
          {i < STAGES.length - 1 && (
            <div className="stage-arrow">
              <svg viewBox="0 0 24 24"><path d="M2 12h18M14 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>{Math.round((STAGES[i+1].count / s.count) * 100)}%</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Live log (terminal) ────────────────────────────────────────────────
const LOG_SEED = [
  { t: "14:32:11", src: "wire-poll", level: "info", msg: "fetched 14 items from ap" },
  { t: "14:32:11", src: "wire-poll", level: "info", msg: "filtered → 3 candidates" },
  { t: "14:32:11", src: "positivity", level: "info", msg: "scoring 3 items" },
  { t: "14:32:12", src: "positivity", level: "ok",   msg: "Bhutan tiger census → 0.92 ✓" },
  { t: "14:32:12", src: "positivity", level: "ok",   msg: "Lagos solar microgrid → 0.81 ✓" },
  { t: "14:32:12", src: "positivity", level: "ok",   msg: "Vienna metro line opens → 0.74 ✓" },
  { t: "14:32:12", src: "neg-filter", level: "ok",   msg: "3/3 cleared block-word check" },
  { t: "14:32:12", src: "triage",     level: "info", msg: "3 items queued for editor (#editor-dashboard)" },
  { t: "14:33:00", src: "alt-text",   level: "info", msg: "queue depth 8 · vision-api p95 4.2s" },
  { t: "14:33:14", src: "tip-line",   level: "ok",   msg: "new submission: \"sixth-grader builds wind-turbine\"" },
  { t: "14:33:14", src: "positivity", level: "ok",   msg: "tip → 0.88 ✓ routed to community" },
  { t: "14:34:02", src: "factcheck",  level: "info", msg: "verifying: \"96,000 miles, postman Exeter\"" },
  { t: "14:34:09", src: "factcheck",  level: "ok",   msg: "verified via charity registry 2 sources" },
  { t: "14:35:00", src: "smile",      level: "info", msg: "next-run check — selection frozen until 03:00 UTC" },
];

function useLiveLog() {
  const [lines, setLines] = useState(LOG_SEED);
  const idx = useRef(0);
  useEffect(() => {
    const candidates = [
      { src: "wire-poll", level: "info", msg: "fetched 9 items from reuters" },
      { src: "positivity", level: "ok",   msg: "Reef recovery survey → 0.94 ✓" },
      { src: "neg-filter", level: "no",   msg: "blocked: 'shocking' present in headline (id 41882)" },
      { src: "factcheck",  level: "ok",   msg: "2 sources matched on bee census figure" },
      { src: "tip-line",   level: "ok",   msg: "new submission from reader · queued" },
      { src: "alt-text",   level: "info", msg: "captioned 3 images for science section" },
      { src: "positivity", level: "ok",   msg: "Loire salmon return → 0.86 ✓" },
      { src: "deck-gen",   level: "info", msg: "draft generated · Hokusai · 134 words" },
      { src: "newsletter", level: "info", msg: "rendered preview · 8 stories · 41kb" },
      { src: "positivity", level: "no",   msg: "filtered out: out-of-scope (0.22)" },
    ];
    const t = setInterval(() => {
      const c = candidates[idx.current++ % candidates.length];
      const now = new Date();
      const time = now.toTimeString().slice(0, 8);
      setLines(prev => {
        const next = [...prev, { ...c, t: time }];
        return next.slice(-60);
      });
    }, 1600);
    return () => clearInterval(t);
  }, []);
  return lines;
}

function LogPanel() {
  const lines = useLiveLog();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);
  return (
    <div className="term" ref={ref}>
      {lines.map((l, i) => (
        <div key={i}>
          <span className="ts">{l.t}</span>
          <span className="src">{l.src.padEnd(11, " ")}</span>
          <span className={l.level === "ok" ? "ok" : l.level === "no" ? "no" : "info"}>
            {l.level === "ok" ? "✓ " : l.level === "no" ? "✗ " : "› "}
          </span>
          <span>{l.msg}</span>
        </div>
      ))}
      <div className="lo">▌</div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────
function App() {
  const [filter, setFilter] = useState("all");
  const jobs = filter === "all" ? JOBS : JOBS.filter(j => j.status === filter);

  const sparks = {
    ingested: [120, 132, 128, 145, 162, 174, 168, 184],
    kept:     [12, 14, 11, 13, 15, 14, 12, 14],
    smiles:   [1,1,1,1,1,1,1,1],
    optimism: [0.31, 0.34, 0.30, 0.36, 0.39, 0.41, 0.40, 0.42],
  };

  return (
    <>
      <StaffTopBar current="pipelines" />
      <main className="dash">
        <header className="dash-head">
          <div>
            <div className="kicker" style={{marginBottom:6}}>Backstage · Cron + Ingestion</div>
            <h1>How the paper gets made.</h1>
            <p>Seventeen scheduled jobs feed the newsroom — pulling wires, filtering tone, fact-checking, captioning images, picking a Smile. Editors approve. Nobody publishes alone.</p>
          </div>
          <div className="dash-head-meta">
            CURRENT TIME · <b>14:35 UTC</b><br />
            JOBS HEALTHY · <b>15</b> / 17<br />
            QUEUE DEPTH · <b>26</b> awaiting triage<br />
            NEXT PUBLISH · <b>04h 22m</b>
          </div>
        </header>

        {/* KPIs */}
        <section className="kpis">
          <div className="kpi">
            <div className="kpi-label">Items ingested · today</div>
            <div className="kpi-value">184</div>
            <Spark values={sparks.ingested} color="var(--info)" />
            <div className="kpi-foot"><span>vs. 7-day avg 152</span><span className="up">+21%</span></div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Items kept after triage</div>
            <div className="kpi-value">14<span className="unit">/ 184</span></div>
            <Spark values={sparks.kept} color="var(--good)" />
            <div className="kpi-foot"><span>conversion 7.6%</span><span className="up">+0.4pp</span></div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Today's Smile · selected</div>
            <div className="kpi-value">1<span className="unit">of 200</span></div>
            <Spark values={sparks.smiles} color="var(--accent)" />
            <div className="kpi-foot"><span>"A Dog Learned to Knock"</span><span className="up">locked</span></div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Optimism Index · live</div>
            <div className="kpi-value">+0.42</div>
            <Spark values={sparks.optimism} color="var(--accent)" />
            <div className="kpi-foot"><span>30-day mean +0.37</span><span className="up">↑</span></div>
          </div>
        </section>

        {/* Pipeline diagram */}
        <section className="card">
          <div className="sec-head" style={{marginBottom:6, border:0, paddingBottom:0}}>
            <h2>Today's funnel</h2>
            <span className="crumb">Real time · last refreshed 14m ago</span>
            <span className="grow" />
            <div className="sec-tools">
              <button className="is-active">Today</button>
              <button>7d</button>
              <button>30d</button>
            </div>
          </div>
          <PipelineDiagram />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:14, fontFamily:"var(--mono)", fontSize:11, color:"var(--muted)", letterSpacing:".06em", textTransform:"uppercase" }}>
            <span>184 candidates considered</span>
            <span>170 filtered out by tone, fit, or verification</span>
            <span>12 made tomorrow's edition</span>
          </div>
        </section>

        {/* Jobs table + Triage */}
        <section className="row-2-1">
          <div>
            <div className="sec-head">
              <h2>Scheduled jobs</h2>
              <span className="crumb">17 active · 0 paused</span>
              <span className="grow" />
              <div className="sec-tools">
                <button className={filter==="all"  ? "is-active" : ""} onClick={() => setFilter("all")}>All</button>
                <button className={filter==="ok"   ? "is-active" : ""} onClick={() => setFilter("ok")}>OK</button>
                <button className={filter==="warn" ? "is-active" : ""} onClick={() => setFilter("warn")}>Warn</button>
                <button className={filter==="bad"  ? "is-active" : ""} onClick={() => setFilter("bad")}>Failing</button>
              </div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Schedule</th>
                    <th>Job</th>
                    <th>Last</th>
                    <th>Next</th>
                    <th>In / Kept</th>
                    <th>Dur.</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id}>
                      <td className="mono" style={{whiteSpace:"nowrap"}}>{j.schedule}</td>
                      <td>
                        <div className="cell-strong">{j.name}</div>
                        <div className="cell-sub">{j.desc}{j.note ? ` · ${j.note}` : ""}</div>
                      </td>
                      <td className="mono">{j.lastRun}</td>
                      <td className="mono">{j.nextRun}</td>
                      <td className="mono">
                        {j.inflow != null ? <span>{j.inflow}{j.kept != null ? ` → ${j.kept}` : ""}</span> : "—"}
                      </td>
                      <td className="mono">{j.dur}</td>
                      <td>
                        <span className={`chip ${j.status === "ok" ? "good" : j.status === "warn" ? "warn" : "bad"}`}>
                          {j.status === "ok" ? "Healthy" : j.status === "warn" ? "Watch" : "Failing"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="btn tiny ghost">Run</button>
                          <button className="btn tiny ghost">Logs</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Triage queue */}
          <div>
            <div className="sec-head">
              <h2>Triage queue</h2>
              <span className="crumb">From classifier</span>
            </div>
            <div className="stack">
              {TRIAGE.slice(0, 7).map((t, i) => (
                <div key={i} className="card solid" style={{padding:14}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8}}>
                    <div className="kicker" style={{padding:0}}>{t.src}</div>
                    <div className="mono" style={{fontSize:13, fontWeight:600,
                         color: t.score > 0.8 ? "var(--good)" : t.score > 0.5 ? "var(--warn)" : "var(--bad)"}}>
                      {t.score.toFixed(2)}
                    </div>
                  </div>
                  <div className="cell-strong" style={{margin:"6px 0 8px", fontSize:15, lineHeight:1.25}}>{t.title}</div>
                  <div className="bar"><i className={t.score > 0.8 ? "good" : t.score > 0.5 ? "warn" : "bad"} style={{width: `${t.score*100}%`}} /></div>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10}}>
                    <span className={`chip ${t.action === "publish" ? "good" : t.action === "hold" ? "warn" : "bad"}`}>
                      {t.recom}
                    </span>
                    <div className="row-actions">
                      {t.action !== "reject" && <button className="btn tiny">Approve</button>}
                      <button className="btn tiny ghost">Hold</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live log + Negativity filter config */}
        <section className="row-2-1">
          <div>
            <div className="sec-head">
              <h2>Live ingest log</h2>
              <span className="crumb">tail -f · all services</span>
              <span className="grow" />
              <div className="sec-tools">
                <button className="is-active">Follow</button>
                <button>Pause</button>
                <button>Export</button>
              </div>
            </div>
            <LogPanel />
          </div>
          <div>
            <div className="sec-head"><h2>Filter config</h2><span className="crumb">Tunable</span></div>
            <div className="card stack" style={{gap:18}}>
              <div>
                <div className="kicker" style={{padding:0, marginBottom:6}}>Positivity threshold</div>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <div className="bar lg" style={{flex:1}}><i style={{width:"65%"}} /></div>
                  <div className="mono" style={{fontWeight:600}}>0.65</div>
                </div>
                <div className="cell-sub">Items scoring below this are auto-rejected.</div>
              </div>
              <div>
                <div className="kicker" style={{padding:0, marginBottom:6}}>AI confidence floor</div>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <div className="bar lg" style={{flex:1}}><i className="warn" style={{width:"50%"}} /></div>
                  <div className="mono" style={{fontWeight:600}}>0.50</div>
                </div>
                <div className="cell-sub">Below 0.50, send to a human regardless of score.</div>
              </div>
              <div>
                <div className="kicker" style={{padding:0, marginBottom:6}}>Block-word dictionary · {BLOCK_WORDS.length}</div>
                <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                  {BLOCK_WORDS.map(w => <span key={w} className="chip no-dot">{w}</span>)}
                  <span className="chip no-dot" style={{borderStyle:"dashed", cursor:"pointer"}}>+ add word</span>
                </div>
                <div className="cell-sub" style={{marginTop:10}}>Last refresh: Sunday 02:00 · next run: 4d</div>
              </div>
              <div>
                <div className="kicker" style={{padding:0, marginBottom:6}}>Source weights</div>
                <table className="tbl" style={{fontSize:12}}>
                  <tbody>
                    <tr><td>Reuters wire</td><td className="mono" style={{textAlign:"right"}}>1.00</td></tr>
                    <tr><td>AP wire</td><td className="mono" style={{textAlign:"right"}}>1.00</td></tr>
                    <tr><td>Nature / Lancet</td><td className="mono" style={{textAlign:"right"}}>0.95</td></tr>
                    <tr><td>Reader tips</td><td className="mono" style={{textAlign:"right"}}>0.70</td></tr>
                    <tr><td>Community mirror</td><td className="mono" style={{textAlign:"right"}}>0.55</td></tr>
                  </tbody>
                </table>
              </div>
              <button className="btn">Save filter config</button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
