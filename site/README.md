# Computer Networks — Interactive Learning Site

An explorable, visual companion to the 13-lecture Computer Networks course (and the
Master Revision book). Every section, diagram, table and exam question from the PDF
study guides in `CN_Study_Guides/`, plus interactive 3D models, simulations and
auto-graded quizzes.

## Run it

```bash
cd site
python3 -m http.server 8765
# open http://localhost:8765
```

(Any static file server works — no build step, no external dependencies, works offline.)

## What's inside

- **Lectures 1–13 + Master Revision** — the full study content, themed per lecture
  with the same warm-paper design as the PDFs. MCQs grade instantly; written
  questions reveal model answers.
- **10 Interactive Labs** (⚡ in the sidebar):
  1. The OSI Stack in 3D — drag to spin, click a layer, watch encapsulation descend the tower
  2. The Complete Packet Journey — DNS → TCP handshake → HTTP, fully narrated
  3. Subnet Calculator — see the 32 bits, borrow host bits, get the subnet table
  4. Routing Algorithms — drag routers, step through Dijkstra / BFS / DFS / Bellman-Ford
  5. TCP Handshake & Teardown — seq/ack maths and state transitions, step by step
  6. TCP Congestion Control — the sawtooth: slow start, avoidance, fast recovery, timeouts
  7. DHCP — the DORA dance with broadcast/unicast and the 24-hour lease clock
  8. NAT — watch the translation table rewrite IP:port pairs in and out
  9. DNS — climb root → TLD → authoritative, then watch caches answer within the TTL
  10. Delay Lab — transmission vs propagation, and the bandwidth-delay product
- **Quizzes & Exam** — per-lecture scored MCQs plus the 70-mark mock exam from the
  Master Book. Best scores are saved in the browser (localStorage).
- **Cheat Sheets** — every lecture's rapid-revision card on one page.

## Regenerating content

`site/data/lectures.json` is extracted from the PDF source HTML:

```bash
node tools/extract.js   # re-reads build/lecture*.html + master.html
```

Progress data lives in the browser only (localStorage key `cn_progress`).

## Gamification layer (v2)

- **Quest Map** (home) — the course as a seven-zone adventure path with stars,
  "up next" hints and the Final Boss (mock exam) at the summit.
- **XP & levels** — earn XP for reading, quizzes, labs and games; level titles from
  *Curious Newbie* to *Internet Legend*, with confetti + fanfare on level-ups.
- **Streaks** — learn on consecutive days to grow the 🔥 counter.
- **14 achievements** — from *Bookworm I* to *Network Deity*.
- **Game Arcade** — six mini-games: Binary Blitz (octet ⇄ binary speed rounds),
  Packet Rush (next-hop forwarding arcade), Header Builder (encapsulation order),
  Port Match (memory pairs), Journey Order (rebuild protocol stories),
  Network Doctor (diagnose faults).
- **Pax the Packet** — a mascot who pops quiz tips; sound effects (mutable) and
  confetti throughout. All progress in `localStorage` (`cn_game`, `cn_progress`).

### v7 — juice & visualisation upgrades

- Living **network mesh** animates behind the quest-map hero (packets hop node to node)
- **Quiz combos** 🔥 — consecutive correct answers stack, floating "+8 XP" chips fly from your cursor, milestone bursts at ×5 and ×8
- **Loot chest** ceremony after every quiz — shake, burst, confetti, collect
- **Progress rings** around map nodes show your best quiz % per lecture
- **Animated XP counter** and aurora-gradient hero
- Subnet lab gained an **address-space bar** (see which block your IP lives in)
- Congestion chart now glows, fills under the sawtooth, and shows the **segments in flight**

### v11 — Assignment Academy 📝

- **All 77 multi-select MCQs** from the assignment PDF across 6 sections, each as an
  interactive select-all drill: tick → Check my answer → per-statement ✓/✗ with a
  one-line reason. Perfect checks earn +6 XP and a "solved" badge.
- **4 coding problems** (First DFS, Path in Directed Graph, Cycle in Directed Graph,
  Dijkstra) with: the PDF's given Java/C++ solution, a cleaner **optimal solution**
  (parent-pointer climb in O(1) space, early-exit BFS, Kahn's peeling, heapq Dijkstra),
  complexity comparisons, and **step-through visualisations** on the assignment's own
  example inputs.

### Section 7 of the Assignment Academy — Past Quiz 📋

The full **CN Quiz (2029 Batch, Groups A+B)** — 20 multi-select questions — with the
verified answer key and per-statement reasoning. Includes drills the lectures only
touch lightly: the **MST cut property**, a **Prim's algorithm dry run** (total weight 14),
**circuit vs packet switching**, **cross-subnet gateway routing**, the **/12 block math**
(2²⁰ addresses), and a **Bellman-Ford iteration trace with a negative edge**.
