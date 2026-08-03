// All original positive-news content for THE DAILY BLOOM
// Sections: world, science, community, culture, sports

const STORIES = [
  // ── LEAD ────────────────────────────────────────────────────────────────
  {
    id: "lead-reefs",
    section: "Science",
    kicker: "Indo-Pacific",
    headline: "Reefs Bloom Again",
    deck: "Two decades of restoration work pay off as marine biologists confirm the largest coral rebound on record across a 1,400-mile corridor.",
    byline: "By Mira Aboubakar",
    location: "RAJA AMPAT",
    readTime: 9,
    body: [
      "For thirty years the maps told a single story: a long, slow bleaching of the world's reefs. This week, the maps were quietly redrawn.",
      "A coalition of 41 research stations, working with twelve coastal communities from the Coral Triangle to the Solomon Sea, published the first full survey of what scientists are calling the Long Bloom — a continuous corridor of recovering reef that now stretches roughly the length of the Mississippi River.",
      "\"We were measuring recovery in single colonies,\" said Dr. Halia Mareko, who has dived the same transect since 1998. \"Now I swim out and I cannot count them. It is as if someone turned the lights back on.\"",
      "The rebound is being credited to a quiet combination of practices: cooler upwelling currents, a ten-year ban on bottom trawling, the patient transplant work of village dive teams, and a microbiome treatment developed in a small lab in Manado that, by all accounts, was nearly defunded twice.",
      "Local fisheries are reporting yields not seen since the 1970s. A boat captain in Misool described the new reef as \"loud again\" — full of the clicks and pops that older fishermen remember from childhood."
    ],
    image: { hue: 195, label: "REEF SURVEY • RAJA AMPAT" },
    tags: ["Climate", "Marine", "Long read"]
  },

  // ── SUB-LEADS ───────────────────────────────────────────────────────────
  {
    id: "sub-mall",
    section: "Community",
    kicker: "Urban Renewal",
    headline: "From Dead Mall to Living Mall",
    deck: "An abandoned shopping center in Akron has been reborn as a vertical farm, library, and the city's busiest community kitchen.",
    byline: "By Jordan Tess Whitlow",
    location: "AKRON, OHIO",
    readTime: 6,
    body: [
      "The Rolling Acres Mall sat dark for seventeen years. Last Tuesday it served four thousand meals.",
      "What was once a food court is now a working kitchen run by a rotation of neighborhood cooks. The Sears wing grows lettuce, basil, and an improbable amount of strawberries under LED skylight. The old JCPenney is a free public library with the longest opening hours in the county.",
      "\"We didn't tear it down because we couldn't afford to,\" said city planner Devon Ailes, laughing. \"Turns out that was the best decision we never made.\"",
      "Six other cities have sent delegations to study the model. A municipal handbook is in the works."
    ],
    image: { hue: 35, label: "INTERIOR • ROLLING ACRES" },
    tags: ["Cities", "Food"]
  },
  {
    id: "sub-bike",
    section: "Community",
    kicker: "Lost & Found",
    headline: "A Bicycle, 14 Years Later",
    deck: "A stolen bike posted on a yard-sale page led three strangers to track down its original owner across two states.",
    byline: "By Owen Caraway",
    location: "PORTLAND, MAINE",
    readTime: 4,
    body: [
      "The bike — a teal Schwinn with a hand-painted starfish on the crossbar — was stolen from a porch in 2011. Last week, a man in Augusta posted it for sale online for thirty dollars.",
      "Three people, none of whom had ever met, independently recognized the starfish from a missing-bike flier that had quietly stayed pinned to a coffee shop bulletin board for over a decade.",
      "The original owner, now twenty-six, drove up the next morning. \"I cried in the parking lot,\" she said. \"The seller cried in the parking lot. We all just stood there crying about a bike.\""
    ],
    image: { hue: 175, label: "TEAL SCHWINN • RECOVERED" },
    tags: ["Human interest"]
  },

  // ── WORLD ───────────────────────────────────────────────────────────────
  {
    id: "world-cr",
    section: "World",
    kicker: "Energy",
    headline: "Costa Rica Marks 547 Days on Renewables",
    deck: "The country's grid has not burned a single barrel of oil for power since the autumn of 2024 — the longest such streak on record.",
    byline: "By Salomé Quirós",
    location: "SAN JOSÉ",
    readTime: 5,
    body: [
      "The streak began on a rainy afternoon in November 2024 and has continued, uninterrupted, through two dry seasons.",
      "Hydropower carries the bulk of the load, but a fast-growing geothermal program — plus rooftop solar on roughly one in three urban homes — has filled the gaps that used to require fuel.",
      "Officials are cautious. \"We are one bad drought from breaking the streak,\" the energy minister said. \"But we are also one good year from never needing oil again.\""
    ],
    image: { hue: 145, label: "ARENAL DAM AT DAWN" },
    tags: ["Climate", "Policy"]
  },
  {
    id: "world-sheepdog",
    section: "World",
    kicker: "Diplomacy",
    headline: "Two Villages, One Sheepdog Trial",
    deck: "After a decade of border disputes, neighbors in the South Caucasus held a joint herding competition. Nobody filed a grievance. Everyone went home tired and full of bread.",
    byline: "By Anush Petrosyan",
    location: "TAVUSH PROVINCE",
    readTime: 7,
    image: { hue: 80, label: "DOG WITH FLOCK • HIGHLAND PASS" },
    tags: ["Reconciliation"]
  },
  {
    id: "world-river",
    section: "World",
    kicker: "Rivers",
    headline: "The Loire Runs Clean to the Sea",
    deck: "A decade-long basin restoration has restored salmon to the lower Loire for the first time since the 1950s.",
    byline: "By Camille Berthier",
    location: "NANTES",
    readTime: 5,
    tags: ["Rivers", "Wildlife"]
  },

  // ── SCIENCE ─────────────────────────────────────────────────────────────
  {
    id: "sci-octopus",
    section: "Science",
    kicker: "Cephalopods",
    headline: "An Octopus Who Knows Your Name",
    deck: "A two-year study at a Mediterranean dive site shows octopuses can reliably distinguish between individual human divers — and appear to prefer the polite ones.",
    byline: "By Dr. Léo Hartmann",
    location: "MARSEILLE",
    readTime: 8,
    image: { hue: 285, label: "OCTOPUS PORTRAIT • DEN 04" },
    tags: ["Cognition", "Marine"]
  },
  {
    id: "sci-flu",
    section: "Science",
    kicker: "Public Health",
    headline: "A Single Shot for Every Flu",
    deck: "A universal influenza vaccine has cleared its third trial with 94% efficacy across nineteen strains, including three never seen before in humans.",
    byline: "By Priya Ramanathan",
    location: "BETHESDA",
    readTime: 7,
    tags: ["Medicine"]
  },
  {
    id: "sci-bees",
    section: "Science",
    kicker: "Pollinators",
    headline: "Bees, Counted, Are Up",
    deck: "The North American honeybee census shows a 22% year-over-year increase — the first sustained rebound since records began.",
    byline: "By Hattie Mae Forester",
    location: "DAVIS, CALIFORNIA",
    readTime: 4,
    image: { hue: 50, label: "APIARY • SPRING SURVEY" },
    tags: ["Pollinators"]
  },

  // ── COMMUNITY ───────────────────────────────────────────────────────────
  {
    id: "com-library",
    section: "Community",
    kicker: "Volunteers",
    headline: "She's Thirteen. The Library Is Hers.",
    deck: "What started as a Little Free Library in a front yard now circulates more books per capita than any branch in Indiana.",
    byline: "By Marlene O. Spruill",
    location: "MUNCIE",
    readTime: 6,
    tags: ["Literacy", "Youth"]
  },
  {
    id: "com-nurses",
    section: "Community",
    kicker: "Quietly",
    headline: "Three Floors of Nurses, One Surgery",
    deck: "Without telling her, coworkers at three hospitals funded a colleague's surgery. She found out when she went to pay her bill.",
    byline: "By Tarek Mansour",
    location: "PITTSBURGH",
    readTime: 5,
    tags: ["Workers"]
  },
  {
    id: "com-postman",
    section: "Community",
    kicker: "On Foot",
    headline: "96,000 Miles and Still Walking",
    deck: "A retired postman has now walked, on his off days and in his retirement, the equivalent of nearly four trips around the planet — every step sponsored for a children's hospice.",
    byline: "By Jules Apperley",
    location: "EXETER",
    readTime: 4,
    image: { hue: 25, label: "ARTHUR MELVILLE • SOUTH WEST PATH" },
    tags: ["Charity"]
  },

  // ── ARTS & CULTURE ──────────────────────────────────────────────────────
  {
    id: "arts-author",
    section: "Culture",
    kicker: "After Three Decades",
    headline: "The Quiet Return of A. J. Pell",
    deck: "Thirty-one years after her debut, the reclusive novelist has surfaced with a slim, luminous second book — and a note that simply reads: \"Thank you for waiting.\"",
    byline: "By Henrietta Kove",
    location: "EDINBURGH",
    readTime: 7,
    image: { hue: 15, label: "BOOK JACKET • THE SOFT HOUR" },
    tags: ["Books"]
  },
  {
    id: "arts-symphony",
    section: "Culture",
    kicker: "Underground",
    headline: "A Symphony in the Tunnel",
    deck: "Eighty musicians played the entirety of Dvořák's Ninth in a disused subway tunnel for a free public audience. The acoustics, by all accounts, were absurd.",
    byline: "By Yusra Vance",
    location: "BROOKLYN",
    readTime: 5,
    tags: ["Music"]
  },
  {
    id: "arts-hokusai",
    section: "Culture",
    kicker: "Returned",
    headline: "A Hokusai Goes Home",
    deck: "A print missing from a Tokyo family's collection since 1944 has been returned, after a London dealer recognized it from a hand-written inventory in a wartime diary.",
    byline: "By Akira Mendelsohn",
    location: "TOKYO",
    readTime: 6,
    tags: ["Art", "Restitution"]
  },

  // ── SPORTS ──────────────────────────────────────────────────────────────
  {
    id: "sports-rugby",
    section: "Sports",
    kicker: "Underdogs",
    headline: "Coach's Daughter Cleared. Team Wins on Penalty.",
    deck: "Cwmtawe RFC, picked to finish last, lift the regional shield in extra time after the news everyone had been waiting on.",
    byline: "By Geraint Powell",
    location: "SWANSEA",
    readTime: 5,
    image: { hue: 130, label: "FULL TIME • RAIN" },
    tags: ["Rugby"]
  },
  {
    id: "sports-freedive",
    section: "Sports",
    kicker: "Junior Record",
    headline: "Fourteen, and the Sea Knows It",
    deck: "Tamsin Olafsdóttir has set a new junior free-dive record at 71 meters — and, characteristically, says she'd rather not talk about it.",
    byline: "By Birta Helgadóttir",
    location: "VESTMANNAEYJAR",
    readTime: 4,
    tags: ["Freediving"]
  },
  {
    id: "sports-marathon",
    section: "Sports",
    kicker: "Mile 22",
    headline: "He Finished Carrying a Stranger's Dog",
    deck: "A marathoner spotted a small terrier wandering an unshaded stretch of course. He picked it up and ran the last four miles with it cradled in his arms.",
    byline: "By Soraya Wells",
    location: "PHOENIX",
    readTime: 3,
    tags: ["Running"]
  },
];

// "Bright Spots" — micro-items for the right rail
const BRIGHT_SPOTS = [
  "Norway's puffin colony adds its first chicks in seven seasons.",
  "A New Mexico middle school's bean variety wins a USDA seed-bank slot.",
  "Volunteer divers clean 41 tons of net from the Aegean.",
  "Ottawa's snow-plow drivers organize a children's literacy fund.",
  "Universal screening cuts late-stage colon cancer 38% in Scotland.",
  "A donated kidney passes through six recipients in a single chain.",
  "Wetlands return to a former parking lot in central Manchester.",
  "A village in Kerala becomes India's first to compost all its waste.",
];

// Today's Smile — a single short, gentle item
const SMILE = {
  headline: "A Dog Learned to Knock",
  body: "After eleven years of scratching, Beatrice — a beagle in Aix-en-Provence — has, according to her owner, finally chosen to use the door knocker. \"I asked her once,\" said Madame Reverdy. \"She thought about it for a long time.\""
};

// Letters to the editor
const LETTERS = [
  { name: "M. Kowalski, Warsaw", body: "Three years ago I cancelled every news subscription I had. This is the first paper I've kept on the table. Thank you for the quiet." },
  { name: "S. Adebayo, Lagos", body: "Re: the coral story. My grandfather was a fisherman. I read your piece to him this morning and he held my hand the whole way through." },
  { name: "P. Chen, Vancouver", body: "Please don't grow. Stay small. Stay strange. Stay kind." },
];

window.NEWS_DATA = { STORIES, BRIGHT_SPOTS, SMILE, LETTERS };
