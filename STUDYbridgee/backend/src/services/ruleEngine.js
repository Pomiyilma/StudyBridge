// src/services/ruleEngine.js
const Topic = require('../models/Topic');
const Connection = require('../models/Connection');

// Simple rule mappings (extendable)
const crossSubjectMap = {
  calculus: { Physics: ['motion', 'velocity', 'acceleration'] },
  rate_of_change: { Physics: ['velocity', 'acceleration'] },
  statistics: { Economics: ['probability', 'risk'] }
};

const normalize = s => s.toLowerCase().replace(/\s+/g, '_');

async function generateConnectionsForTopic(topicId) {
  const topic = await Topic.findById(topicId);
  if (!topic) return [];

  const topicTags = (topic.tags || []).map(normalize);
  const subjects = topic.subjects?.map(s => s.name) || [];
  const candidates = [];

  // Intra-subject: shared tags
  const intra = await Topic.find({
    _id: { $ne: topic._id },
    tags: { $in: topic.tags || [] },
    'subjects.name': { $in: subjects }
  }).limit(50);

  for (const t of intra) {
    candidates.push({
      fromTopicId: topic._id,
      toTopicId: t._id,
      reason: `Shared tags: ${topic.tags.filter(tag => t.tags.includes(tag)).join(', ')}`,
      subjectContext: subjects[0] || 'General',
      createdBy: 'rule',
      approved: true
    });
  }

  // Cross-subject: mapped semantics
  for (const tag of topicTags) {
    const map = crossSubjectMap[tag];
    if (!map) continue;
    for (const [targetSubject, targetTags] of Object.entries(map)) {
      const cross = await Topic.find({
        _id: { $ne: topic._id },
        'subjects.name': targetSubject,
        tags: { $in: targetTags }
      }).limit(50);
      for (const t of cross) {
        candidates.push({
          fromTopicId: topic._id,
          toTopicId: t._id,
          reason: `Rule link: ${tag} → ${targetSubject} (${targetTags.join(', ')})`,
          subjectContext: targetSubject,
          createdBy: 'rule',
          approved: true
        });
      }
    }
  }

  // Upsert connections
  const saved = [];
  for (const c of candidates) {
    try {
      const exists = await Connection.findOne({ fromTopicId: c.fromTopicId, toTopicId: c.toTopicId });
      if (!exists) {
        saved.push(await Connection.create(c));
      }
    } catch (e) { /* ignore duplicates */ }
  }
  return saved;
}

module.exports = { generateConnectionsForTopic };
