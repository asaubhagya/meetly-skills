---
name: create-meetly-interactive-map
description: Create an interactive visual map from relationships, arguments, concepts, systems, or dependencies discussed in an authorized Meetly meeting or lecture.
---

# Create a Meetly Interactive Map

Retrieve the source with `search` and `fetch`. Identify the map's central
question, the smallest useful set of nodes, and meaningful typed relationships.
Use speaker-tagged evidence to separate facts, proposals, decisions, risks, and
open questions.

Choose the visual grammar that best fits the source: concept map for learning,
system map for components and dependencies, argument map for claims and
evidence, or decision map for options and trade-offs. Avoid a decorative cloud
of transcript phrases.

When the host can create files or interactive artifacts, produce one
self-contained accessible HTML file with embedded CSS and JavaScript. It must:

- work without external libraries, fonts, trackers, or network requests;
- support keyboard navigation, visible focus, zoom/pan or an equivalent usable
  overview, and reduced-motion preferences;
- expose evidence on selection without dumping the whole transcript;
- remain readable in a static fallback and on narrow screens;
- escape meeting text before inserting it into HTML.

Otherwise, return a clearly structured map in the best native visual format the
host supports. Create it directly; do not call a Meetly HTML, prepare, render,
mind-map, or visualization tool.
