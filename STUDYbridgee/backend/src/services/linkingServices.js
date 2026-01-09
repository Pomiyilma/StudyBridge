// src/services/linkingService.js
const Topic = require("../models/Topic");

function sharesConcept(a, b) {
  // Example: overlap in concept tags (excluding grade)
  const drop = new Set([
    "grade7",
    "grade8",
    "grade9",
    "grade10",
    "grade11",
    "grade12",
  ]);
  const ta = a.tags.filter((t) => !drop.has(t));
  const tb = b.tags.filter((t) => !drop.has(t));
  return ta.some((t) => tb.includes(t));
}

function consecutiveGrades(ga, gb) {
  const g = (tag) => Number(tag.replace("grade", ""));
  const A = (a) => a.tags.find((t) => /^grade\d+$/.test(t));
  const B = (b) => b.tags.find((t) => /^grade\d+$/.test(t));
  const gaTag = A(ga),
    gbTag = B(gb);
  if (!gaTag || !gbTag) return false;
  return g(gbTag) === g(gaTag) + 1;
}

async function autoLinkByRules() {
  const topics = await Topic.find();
  // Index by subject
  const bySubject = {};
  for (const t of topics) {
    const subj =
      t.tags.find((tag) =>
        [
          "math",
          "physics",
          "chemistry",
          "biology",
          "civics",
          "english",
        ].includes(tag)
      ) || "general";
    (bySubject[subj] ||= []).push(t);
  }

  // Rule 1: subject continuity with consecutive grades
  for (const subject in bySubject) {
    const list = bySubject[subject];
    for (const a of list) {
      for (const b of list) {
        if (a._id.equals(b._id)) continue;
        if (consecutiveGrades(a, b)) a.addConnection(b._id);
      }
      await a.save();
    }
  }

  // Rule 2: concept progression via shared concept tags
  for (const a of topics) {
    for (const b of topics) {
      if (a._id.equals(b._id)) continue;
      if (sharesConcept(a, b)) a.addConnection(b._id);
    }
    await a.save();
  }

  return { message: "Rule-based linking completed" };
}

module.exports = { autoLinkByRules };
