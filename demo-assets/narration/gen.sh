#!/bin/bash
# two-host narration: Ava (A) + Andrew (B), energetic, native pitch/rate
cd "$(dirname "$0")"
declare -a LINES=(
  "A|01|What if learning Computer Networks felt like playing your favourite game?"
  "A|02|This is NetMastery — an entire Computer Networks course rebuilt as an adventure. Thirteen lectures. Seven zones. One final boss. Every lecture you finish earns stars, XP, and keeps your daily streak alive."
  "B|03|And every day begins with five fresh questions, picked from across the whole course. Small wins — every single day."
  "B|04|Each lecture opens with a two-minute quick check. Three questions, instant feedback — and the full set folds away until you're ready for it."
  "A|05|Concepts come alive inside the reading. Predict the answer first — then watch the DNS hierarchy climb, right where you're learning."
  "B|06|The OSI stack in true 3D. Drag it, spin it — and watch your data gain headers, layer by layer."
  "A|07|Even count-to-infinity — the most feared routing problem — becomes something you can watch, break, and fix with split horizon."
  "B|08|Every exam question from the course is here — all ninety-seven — with the answer key fully explained. And every coding problem solved in Java and C plus plus, with step-by-step visualisers."
  "A|09|Six arcade games turn subnetting, ports and headers into pure play."
  "B|10|It all leads to the final boss — a seventy-mark mock exam with its own health bar. Beat it, and the crown is yours."
  "A|11a|NetMastery. Built for the exam. Designed to be loved."
  "B|11b|Star it on GitHub — and start your journey today."
)
for line in "${LINES[@]}"; do
  host="${line%%|*}"; rest="${line#*|}"; num="${rest%%|*}"; text="${rest#*|}"
  if [ "$host" = "A" ]; then V="en-US-AvaMultilingualNeural"; else V="en-US-AndrewMultilingualNeural"; fi
  edge-tts --voice "$V" --rate=+12% --pitch=+3Hz --write-media "line-$num.mp3" -t "$text" 2>/dev/null
  echo "line-$num.mp3 ($host)"
done
