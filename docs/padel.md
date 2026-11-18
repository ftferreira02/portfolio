# The Portfolio Open

The playful padel introduction lives at `/padel`; the full portfolio stays at `/`. They are two versions of one site:

- The header carries a **Portfolio | Match** switch on every page (inside the menu on phones).
- The home hero shows a still of the court (`public/padel/court.webp`, the match's opening frame). Its Serve button goes to `/padel?serve=1`, the still grows into the live court through a shared `ViewTransition`, and the first serve plays by itself unless motion is reduced.
- `/padel` is a dark, full-screen page. `padel.css` darkens the page and hides the footer through the header's `data-version="match"` attribute (not through `.padel-page`, which Next keeps in the document, hidden, after you navigate away); the header drops the section links and theme toggle there and keeps the switch and the CV, which are also the way out without JavaScript or WebGL.

Keep the match page focused on the match, without a duplicate biography or project list underneath. If the court's opening frame changes, recapture the still.

- `content/padel.ts` owns the caption copy and project links, reusing the site's identity, project statistics and experience data.
- `lib/padel/choreography.js` owns the four scripted points. Its `contentKey` values join each shot to a caption.
- `lib/padel/engine.js` mounts the approved Three.js scene inside `components/padel/match.tsx`. The effect loads it only on this route and disposes its renderer, scene resources, audio, observers and listeners on navigation.
- `app/padel/padel.css` owns the broadcast styling. The match fits the viewport below the site header. Narrow screens put compact captions below the court. Shot choices use a modal over the paused game; animation settings and point explanations use popovers. Opening or selecting a shot must not scroll the page or increase the play area’s height.

The match starts in manual mode with sound off. Reduced-motion users start with static captions; autoplay is disabled until they choose “Enable match animation”. The match-specific choice is saved in browser storage, without changing their system settings. They can disable animation again at any time. Links to the full portfolio and CV stay available without JavaScript or WebGL.

## Choose the shot

Each point pauses before its final shot: the low volley, back-glass rebound, deep overhead and short lob. `lib/padel/decisions.js` supplies three contextual options for each moment, with alternative swing types, ball paths, winners and explanations. The scenarios are scripted: they illustrate why a shot works in that particular rally.

Chosen direction (option A): **a lost point still tells the story**. Every branch retains all 16 captions and reaches contact. The scoreboard awards the point to the selected branch's winner; the ending reports the result of the four-point exhibition, including a possible draw. Winning all four unlocks a nine-shot bonus fifth point with its own final decision.

Auto waits for a selection. Next stops at the next unanswered decision. Choices have no time limit. Back lets visitors revisit a decision; choosing again replaces its result and clears later choices. Play again resets all choices and both scores. Scoring is derived from the timeline so rewinding cannot award a point twice.

`npm run test:padel-model` verifies all 81 combinations. The Playwright suite covers winning and losing journeys, changing a previous choice, the decision gates and narrow screens.

## Broadcast review details

Contact framing holds through impact; the next serve blends in before its caption. Winning shots cut to the landing, then show the winning pair celebrating while the other pair slumps. The closing camera faces the four players on the near side of the net: the winners in the middle lifting a gold trophy, the other pair either side. The final card sits to one side (below the canvas on phones), and portrait uses a closer framing of the same group. Portrait framing follows the active hitter and ball instead of fitting the whole court.

The Ferreira tag disappears during his swing, including the incoming wind-up. Ground strokes use a brief articulated-arm contact solve and keep the feet planted through impact. When a choice substitutes an overhead at a different contact height, elevation and contact reach adapt to that ball while preserving the authored wrist pose. The free arm and existing knee/jump mechanics remain independent of this solve. The ready racket sits below the face. Heavy contacts retain the full expanding shockwave.

Decision captions say “Choose your shot” before a selection and use the selected neutral option label afterwards. Outcome shot names and explanations appear in “Why?” only after the point resolves. The decision tray sits at the bottom; on phones its compact options leave the paused contact visible above it. Speed badges occupy the opposite side from the caption. Score callouts wait until the point resolves. While the tray is open on wider screens, the caption moves up under the score so it stays readable, and “Why?” opens on the side away from the caption. On wider screens its row is reserved from the start, so the court never resizes mid-match; phones skip the reservation to avoid an empty strip above the controls. On phones the caption fades in and out instead of wiping, because it sits in its own row under the court. At full time the score bug switches from tennis points to points won, matching the closing card.

`npm run test:padel-model` also checks every default and choice trajectory using the same segment sampler as the engine: every net crossing must clear the 0.88 m net by the 0.105 m ball radius plus 4 cm. The deliberate net fault stops on its own side. Losing glass faults retain their first-glass-before-bounce paths.


## Partner broadcast features

The visitor is Francisco’s yellow-shirted partner (“Ferreira / You” on the score bug). The original 16 biography captions are preserved. `choreography.js` owns shot-type commentary and choice-dependent point calls. The aria-hidden ticker sits in a dedicated bottom strip below captions; it is hidden on phones and short screens and when choosing a shot. Reduced motion uses static text.

Crowd bodies and heads remain instanced. A win triggers a travelling angular wave around all four stands and a cheer; a loss triggers a brief slump and a descending synthesized groan. Sound is off until enabled. Project placards use titles from `content/padel.ts`, sourced from portfolio content. Motion effects are disabled in reduced motion.

Four winning selections append `tieBreak`: a nine-shot rally in the style of Agustín Tapia's highlight reels. The opponents smash x3 over the side wall; Francisco runs out through the gap in the side fence (each half of each side fence has one), lobs the ball back in from outside the court, and runs back in. A beat's `run` sends a player along waypoints through the gap rather than through the glass, and a hitter outside the court gets a close-up from inside it. The last shot is a decision (`shotDecisions.tiebreak`): Smash x4 over the back wall or a víbora wins it, and a flat smash into the back glass loses it, scoring 4–1. The rally shows one bonus caption. Progress adds a fifth segment. Replacing an earlier choice removes the encore and later selections; changing only the tie-break choice keeps the encore. Replay resets everything. All scores, including the bonus, are derived from the active timeline. The model tests check the encore's net clearance, its decision and its route through the gap.

At full time the players gather for the presentation, then a toon trophy rises between the winners with instanced confetti. After 2.8 seconds the existing contact card appears with a gold presentation panel. Reduced motion skips directly to the static trophy/card. Back cancels the ceremony. There is no scorecard download (removed on purpose).

The 3D arena follows the root `data-theme`, falling back to `prefers-color-scheme`; a MutationObserver and media/storage listeners update it live even with reduced motion. Night lowers ambient light, lowers the shadow-casting light for longer shadows and adds floodlight glow/beams. Match UI chrome stays dark. Scene resources and listeners are disposed on navigation.

## Round 2 broadcast polish

Night explicitly tints the arena toon materials and glass, with luminous floodlight heads, cones, court pools and sharper shadows. Placards are fixed uniform planes on sticks attached to occupied seats, using the loaded display font; no camera-facing sprites. Instanced skin-coloured arms appear only on fans who are up in the travelling wave, raised in a V along their row. The wave plays behind the normal celebration shot; the camera does not cut to the stands. The edge-on arena banner is hidden to avoid a cropped phone banner or yellow line.

Bonus scoring uses numeric points won throughout the tie-break and its callouts. Every end result says We won / We lost / We drew, in team-first score order. The commentary bar has a yellow chip, 18px display text, distinct serve/bonus beats and per-point outcome calls. It stays hidden on phones and during choices.

The presentation takes place entirely on the near side of the net. Both partners face the dedicated ceremony camera beside the raised trophy, with opponents applauding nearby and rackets put away. Reduced motion shows a static presentation immediately.
