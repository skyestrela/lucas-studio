// THE DAILY BLOOM — visual components
// Layout primitives: Masthead, WeatherStrip, Nav, Hero, ColumnGrid, StoryCard,
// BrightSpots, SmileBox, PhotoEssay, LettersBox, Reader (overlay), Footer.

const { useState, useEffect, useRef, useMemo } = React;
const { STORIES, BRIGHT_SPOTS, SMILE, LETTERS } = window.NEWS_DATA;

// ── Placeholder image ─────────────────────────────────────────────────────
// Subtly striped duotone "photograph" placeholder. Hue from the story so
// images feel distinct without us drawing actual scenes.
function Placeholder({ hue = 40, label = "PHOTO", height = 220, mono = false }) {
  const a = mono ? "oklch(0.78 0.01 80)" : `oklch(0.78 0.07 ${hue})`;
  const b = mono ? "oklch(0.62 0.012 80)" : `oklch(0.5 0.09 ${hue})`;
  return (
    <div className="ph" style={{ height,
      background: `repeating-linear-gradient(135deg, ${a} 0 8px, ${b} 8px 16px)` }}>
      <span className="ph-tag">{label}</span>
    </div>
  );
}

// ── Date helpers ──────────────────────────────────────────────────────────
function formatToday() {
  const d = new Date();
  const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const months = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ── Top strip (date · weather · edition · forecast index) ─────────────────
function TopStrip() {
  return (
    <div className="topstrip">
      <span>{formatToday()}</span>
      <span className="dot" />
      <span>Vol. XIV · No. 184</span>
      <span className="dot" />
      <span>Partly Sunny · 71°F · Gentle SW Breeze</span>
      <span className="dot" />
      <span>Sunrise 5:47 · Sunset 8:21</span>
      <span className="spacer" />
      <span className="bright">Optimism Index <b>+0.42</b> ↑</span>
    </div>
  );
}

// ── Masthead ──────────────────────────────────────────────────────────────
function Masthead() {
  return (
    <header className="masthead">
      <div className="m-side left">
        <div className="m-side-label">Established</div>
        <div className="m-side-value">MMXII</div>
      </div>
      <div className="m-center">
        <h1 className="m-title">The Daily Bloom</h1>
        <p className="m-tagline">All the news that's good to print · Issued daily, regardless of the weather</p>
      </div>
      <div className="m-side right">
        <div className="m-side-label">Edition</div>
        <div className="m-side-value">Morning</div>
      </div>
    </header>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────
const SECTIONS = ["All", "World", "Science", "Community", "Culture", "Sports"];

function Nav({ active, onChange }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        {SECTIONS.map(s => (
          <button key={s}
            className={"nav-btn " + (active === s ? "is-active" : "")}
            onClick={() => onChange(s)}>{s}</button>
        ))}
        <span className="nav-spacer" />
        <button className="nav-sub">Subscribe — free, forever</button>
      </div>
    </nav>
  );
}

// ── Story Cards (multiple variants) ───────────────────────────────────────
function Kicker({ children }) {
  return <span className="kicker">{children}</span>;
}

function Byline({ story }) {
  return (
    <div className="byline">
      <span>{story.byline}</span>
      {story.location && <><span className="bull">·</span><span className="loc">{story.location}</span></>}
      {story.readTime && <><span className="bull">·</span><span>{story.readTime} min read</span></>}
    </div>
  );
}

// Big hero — image on left, heavy serif title on right.
function HeroLead({ story, onOpen }) {
  return (
    <article className="hero" onClick={() => onOpen(story)}>
      <div className="hero-media">
        <Placeholder hue={story.image?.hue ?? 200} label={story.image?.label ?? "PHOTO"} height={460} />
        <div className="hero-caption">{story.image?.label}</div>
      </div>
      <div className="hero-body">
        <Kicker>{story.section} · {story.kicker}</Kicker>
        <h2 className="hero-title">{story.headline}</h2>
        <p className="hero-deck">{story.deck}</p>
        <Byline story={story} />
        <p className="hero-body-text">{story.body[0]}</p>
        <p className="hero-body-text">{story.body[1]}</p>
        <span className="readmore">Continue reading ›</span>
      </div>
    </article>
  );
}

// Stacked sub-lead — wide image up top, body below
function SubLead({ story, onOpen }) {
  return (
    <article className="sublead" onClick={() => onOpen(story)}>
      <Placeholder hue={story.image?.hue ?? 80} label={story.image?.label ?? "PHOTO"} height={180} />
      <Kicker>{story.kicker}</Kicker>
      <h3 className="sublead-title">{story.headline}</h3>
      <p className="sublead-deck">{story.deck}</p>
      <Byline story={story} />
    </article>
  );
}

// Compact column item — no image
function ColumnStory({ story, onOpen, withRule = true, first = false }) {
  return (
    <article className={"col-story " + (first ? "first " : "") + (withRule ? "ruled" : "")}
             onClick={() => onOpen(story)}>
      <Kicker>{story.kicker}</Kicker>
      <h4 className="col-title">{story.headline}</h4>
      <p className="col-deck">{story.deck}</p>
      <div className="col-by">{story.byline}</div>
    </article>
  );
}

// Card with image at top
function PictureStory({ story, onOpen }) {
  return (
    <article className="pic-story" onClick={() => onOpen(story)}>
      <Placeholder hue={story.image?.hue ?? 40} label={story.image?.label ?? "PHOTO"} height={160} />
      <Kicker>{story.kicker}</Kicker>
      <h4 className="pic-title">{story.headline}</h4>
      <p className="pic-deck">{story.deck}</p>
      <div className="col-by">{story.byline}</div>
    </article>
  );
}

// ── Bright Spots (right rail) ─────────────────────────────────────────────
function BrightSpots() {
  return (
    <aside className="rail-box brightspots">
      <div className="rail-head">
        <span className="rail-rule" />
        <span className="rail-title">Bright Spots Today</span>
        <span className="rail-rule" />
      </div>
      <ol className="bs-list">
        {BRIGHT_SPOTS.map((b, i) => (
          <li key={i}><span className="bs-num">{String(i+1).padStart(2,"0")}</span>{b}</li>
        ))}
      </ol>
      <div className="rail-foot">Compiled from reader submissions and wires.</div>
    </aside>
  );
}

// ── Today's Smile ─────────────────────────────────────────────────────────
function SmileBox() {
  return (
    <aside className="rail-box smile">
      <div className="smile-badge">Today's Smile</div>
      <h4 className="smile-title">{SMILE.headline}</h4>
      <p className="smile-body">{SMILE.body}</p>
      <div className="smile-rule" />
      <div className="smile-foot">A new one every morning, before the coffee.</div>
    </aside>
  );
}

// ── Photo Essay strip ─────────────────────────────────────────────────────
function PhotoEssay() {
  const panes = [
    { hue: 145, label: "01 · LOW TIDE" },
    { hue: 35,  label: "02 · GULL, RESTING" },
    { hue: 200, label: "03 · CHANNEL AT FOUR" },
    { hue: 90,  label: "04 · MARSH GRASS" },
    { hue: 320, label: "05 · LIGHTHOUSE, FAR" },
  ];
  return (
    <section className="essay">
      <div className="essay-head">
        <Kicker>Photo Essay · Saturdays</Kicker>
        <h3 className="essay-title">Spring in the Salt Marshes</h3>
        <p className="essay-deck">Five frames from a quiet morning on the estuary. Photographs by R. Calderon.</p>
      </div>
      <div className="essay-grid">
        {panes.map((p, i) => (
          <div key={i} className="essay-pane">
            <Placeholder hue={p.hue} label={p.label} height={220} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Editorial / Letters ───────────────────────────────────────────────────
function Editorial() {
  return (
    <section className="editorial">
      <div className="ed-col">
        <Kicker>From the Editor</Kicker>
        <h3 className="ed-title">Why "Good News" Isn't Soft News</h3>
        <p className="ed-body">
          <span className="dropcap">W</span>e are sometimes told, kindly, that a paper devoted to good news is a paper without teeth.
          We disagree, gently. A nurse paying for a colleague's surgery is not a feel-good story; it is reporting on the actual material conditions of working life.
          A reef returning is not a soft headline; it is a survey of fourteen hundred miles of ocean.
        </p>
        <p className="ed-body">
          The world is not, on balance, fine. We do not pretend it is. We simply hold that the good things that happen in it — and there are many — also deserve to be written down, carefully, by people who were there.
        </p>
        <p className="ed-sig">— The Editors</p>
      </div>
      <div className="letters-col">
        <Kicker>Letters</Kicker>
        <h3 className="ed-title small">From Our Readers</h3>
        {LETTERS.map((l, i) => (
          <div key={i} className="letter">
            <p className="letter-body">&ldquo;{l.body}&rdquo;</p>
            <div className="letter-name">— {l.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Reader overlay ────────────────────────────────────────────────────────
function Reader({ story, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!story) return null;
  // Use the article body if present; otherwise generate placeholder paragraphs
  // so any story can be opened.
  const body = story.body && story.body.length
    ? story.body
    : [
        story.deck,
        "Reporters from across the wire confirm the broad outlines of the story. Local witnesses describe the scene in terms that, taken together, suggest something worth slowing down for.",
        "More details are expected through the day. For now, the bare facts seem to be these: it happened, people are pleased, and the small machinery of an ordinary morning is moving on.",
      ];

  return (
    <div className="reader-scrim" onClick={onClose}>
      <div className="reader" onClick={e => e.stopPropagation()}>
        <button className="reader-close" onClick={onClose} aria-label="Close">×</button>
        <div className="reader-tag">{story.section.toUpperCase()} · {story.kicker?.toUpperCase()}</div>
        <h1 className="reader-title">{story.headline}</h1>
        <p className="reader-deck">{story.deck}</p>
        <Byline story={story} />
        <Placeholder hue={story.image?.hue ?? 200} label={story.image?.label ?? "PHOTO"} height={360} />
        {body.map((p, i) => (
          <p key={i} className={"reader-p " + (i === 0 ? "first" : "")}>
            {i === 0 ? <><span className="dropcap">{p[0]}</span>{p.slice(1)}</> : p}
          </p>
        ))}
        <div className="reader-end">◆ ◆ ◆</div>
        {story.tags && (
          <div className="reader-tags">
            {story.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        <div className="reader-foot">
          Press <kbd>Esc</kbd> to close · Filed from {story.location || "the desk"}
        </div>
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="foot">
      <div className="foot-mast">The Daily Bloom</div>
      <div className="foot-cols">
        <div>
          <div className="foot-h">Sections</div>
          <div>World · Science · Community · Culture · Sports · Photo Essay</div>
        </div>
        <div>
          <div className="foot-h">About</div>
          <div>Masthead · Standards · Submit a Story · Letters · Corrections</div>
        </div>
        <div>
          <div className="foot-h">Get the paper</div>
          <div>Morning email · Weekend digest · The Smile, alone, daily</div>
        </div>
      </div>
      <div className="foot-rule" />
      <div className="foot-backstage">
        <a href="reader.html">Your Bloom →</a>
        <a href="editor.html">Editor desk →</a>
        <a href="pipelines.html">Pipelines →</a>
      </div>
      <div className="foot-fine">
        © The Daily Bloom · Printed on hopeful paper · No story published here was negative — we checked twice.
      </div>
    </footer>
  );
}

Object.assign(window, {
  Placeholder, TopStrip, Masthead, Nav, SECTIONS,
  HeroLead, SubLead, ColumnStory, PictureStory,
  BrightSpots, SmileBox, PhotoEssay, Editorial, Reader, Footer,
  Kicker, Byline,
});
