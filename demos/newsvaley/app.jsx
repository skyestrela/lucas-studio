// THE DAILY BLOOM — main app
// Composes all section components; runs the section filter + reader overlay.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#f6f1e6", "#1a1814", "#c97a1e"],
  "density": "regular",
  "showImages": true,
  "serifMode": "newsreader"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [section, setSection] = useState("All");
  const [openStory, setOpenStory] = useState(null);

  // Apply palette + density tokens to root
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--paper", t.palette[0]);
    r.style.setProperty("--ink", t.palette[1]);
    r.style.setProperty("--accent", t.palette[2]);
    r.dataset.density = t.density;
    r.dataset.images = t.showImages ? "1" : "0";
    r.dataset.serif = t.serifMode;
  }, [t]);

  const stories = window.NEWS_DATA.STORIES;
  const filtered = section === "All" ? stories : stories.filter(s => s.section === section);

  const lead     = filtered.find(s => s.id === "lead-reefs") || filtered[0];
  const subleads = filtered.filter(s => ["sub-mall","sub-bike"].includes(s.id) && s.id !== lead.id).slice(0,2);

  // Group remainder by section for the column grid
  const used = new Set([lead.id, ...subleads.map(s => s.id)]);
  const remaining = filtered.filter(s => !used.has(s.id));

  // Bucket into the four section columns; "All" gets the full sweep.
  const colSections = section === "All"
    ? ["World", "Science", "Community", "Culture"]
    : [section];
  const buckets = colSections.map(name => ({
    name,
    items: (section === "All" ? remaining.filter(s => s.section === name) : remaining)
  })).filter(b => b.items.length);

  // Sports gets its own band below the columns when on "All"
  const sports = section === "All" ? stories.filter(s => s.section === "Sports") : [];

  return (
    <div className="paper">
      <TopStrip />
      <Masthead />
      <Nav active={section} onChange={setSection} />

      <main className="main">
        {/* HERO ROW: big lead + right rail */}
        <section className="row hero-row">
          <div className="hero-col">
            {lead && <HeroLead story={lead} onOpen={setOpenStory} />}
            <div className="sublead-row">
              {subleads.map(s => <SubLead key={s.id} story={s} onOpen={setOpenStory} />)}
            </div>
          </div>
          <aside className="rail">
            <BrightSpots />
            <SmileBox />
          </aside>
        </section>

        <div className="band-rule"><span>The Sections</span></div>

        {/* COLUMN GRID */}
        <section className="cols">
          {buckets.map((b, bi) => (
            <div key={b.name} className="col">
              <div className="col-head">
                <h3 className="col-section">{b.name}</h3>
                <span className="col-section-rule" />
              </div>
              {b.items.map((s, i) => (
                i === 0 && s.image
                  ? <PictureStory key={s.id} story={s} onOpen={setOpenStory} />
                  : <ColumnStory key={s.id} story={s} onOpen={setOpenStory} first={i === 0} />
              ))}
            </div>
          ))}
        </section>

        {sports.length > 0 && (
          <>
            <div className="band-rule"><span>Sports</span></div>
            <section className="sports-row">
              {sports.map(s => (
                s.image
                  ? <PictureStory key={s.id} story={s} onOpen={setOpenStory} />
                  : <ColumnStory key={s.id} story={s} onOpen={setOpenStory} first />
              ))}
            </section>
          </>
        )}

        <div className="band-rule"><span>Photographs</span></div>
        <PhotoEssay />

        <div className="band-rule"><span>Opinion · Letters</span></div>
        <Editorial />
      </main>

      <Footer />

      {openStory && <Reader story={openStory} onClose={() => setOpenStory(null)} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette" />
        <TweakColor label="Paper" value={t.palette}
          options={[
            ["#f6f1e6", "#1a1814", "#c97a1e"], // cream / ink / marigold
            ["#fafafa", "#0f0f10", "#1d4ed8"], // newsprint white / blue
            ["#0f0f10", "#f4f0e6", "#e8b34a"], // night edition
            ["#fde9d9", "#3b1f0f", "#c0392b"], // peach / brick
            ["#eef2ec", "#11261d", "#1f8a5b"], // sage / forest
          ]}
          onChange={v => setTweak("palette", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
          options={["compact","regular","comfy"]}
          onChange={v => setTweak("density", v)} />
        <TweakToggle label="Show photographs" value={t.showImages}
          onChange={v => setTweak("showImages", v)} />
        <TweakSection label="Typography" />
        <TweakRadio label="Serif" value={t.serifMode}
          options={[
            {value:"newsreader", label:"Newsreader"},
            {value:"dmserif", label:"DM Serif"},
            {value:"spectral", label:"Spectral"}
          ]}
          onChange={v => setTweak("serifMode", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
