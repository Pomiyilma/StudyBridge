/**
 * Recommendation service factory
 * Usage:
 *   const rec = createRecommendationService(db, { popularityWeight: 0.3 });
 *   const list = await rec.getRecommendations(userId, { limit: 10 });
 *
 * Notes:
 * - `db` should implement:
 *     - getUserInteractions(userId) -> [{ itemId, weight }]
 *     - getAllItems() -> [{ id, features: {tagA:1, tagB:0.5, ...} }]
 *     - getPopularItems(limit) -> [{ id, score }]
 *     - getItemInteractions() -> [{ userId, itemId }]
 * - This file provides simple content-based, item-collaborative, and hybrid recommenders.
 */

function createRecommendationService(db, opts = {}) {
    const {
        popularityWeight = 0.25, // fallback weight for popularity in hybrid
        collabWeight = 0.45,
        contentWeight = 0.30,
        cacheTtlMs = 1000 * 60 * 5
    } = opts;

    const cache = new Map();

    function setCache(key, value) {
        cache.set(key, { value, expires: Date.now() + cacheTtlMs });
    }
    function getCache(key) {
        const e = cache.get(key);
        if (!e) return null;
        if (Date.now() > e.expires) {
            cache.delete(key);
            return null;
        }
        return e.value;
    }

    function cosineSimilarity(vecA, vecB) {
        let num = 0, a2 = 0, b2 = 0;
        for (const k of Object.keys(vecA)) {
            const av = vecA[k] || 0;
            const bv = vecB[k] || 0;
            num += av * bv;
            a2 += av * av;
            b2 += bv * bv;
        }
        const denom = Math.sqrt(a2) * Math.sqrt(b2);
        return denom === 0 ? 0 : num / denom;
    }

    async function buildUserProfile(userId) {
        const cacheKey = `profile:${userId}`;
        const cached = getCache(cacheKey);
        if (cached) return cached;

        const interactions = await db.getUserInteractions(userId); // [{itemId, weight}]
        const items = await db.getAllItems(); // [{id, features}]
        const itemMap = new Map(items.map(i => [i.id, i.features || {}]));
        const profile = {};

        for (const it of interactions) {
            const features = itemMap.get(it.itemId);
            if (!features) continue;
            const w = it.weight == null ? 1 : it.weight;
            for (const [k, v] of Object.entries(features)) profile[k] = (profile[k] || 0) + v * w;
        }

        setCache(cacheKey, profile);
        return profile;
    }

    // Content-based recommend: score items by cosine similarity to user profile
    async function recommendByContent(userId, limit = 10) {
        const all = await db.getAllItems();
        const profile = await buildUserProfile(userId);
        const scores = [];
        for (const item of all) {
            const s = cosineSimilarity(profile, item.features || {});
            scores.push({ id: item.id, score: s });
        }
        scores.sort((a, b) => b.score - a.score);
        return scores.slice(0, limit).map(s => s.id);
    }

    // Item-item collaborative filter (co-occurrence): simple scoring
    async function recommendByCollaborative(userId, limit = 10) {
        const cacheKey = 'itemCooccurrence';
        let co = getCache(cacheKey);
        if (!co) {
            // Build co-occurrence matrix: { itemId: { otherItemId: count } }
            const interactions = await db.getItemInteractions(); // [{ userId, itemId }]
            const byUser = new Map();
            for (const r of interactions) {
                if (!byUser.has(r.userId)) byUser.set(r.userId, new Set());
                byUser.get(r.userId).add(r.itemId);
            }
            co = new Map();
            for (const itemSet of byUser.values()) {
                const arr = Array.from(itemSet);
                for (let i = 0; i < arr.length; i++) {
                    for (let j = 0; j < arr.length; j++) {
                        if (i === j) continue;
                        const a = arr[i], b = arr[j];
                        if (!co.has(a)) co.set(a, new Map());
                        co.get(a).set(b, (co.get(a).get(b) || 0) + 1);
                    }
                }
            }
            setCache(cacheKey, co);
        }

        const userInteractions = await db.getUserInteractions(userId);
        const userItems = new Set(userInteractions.map(i => i.itemId));
        const scores = new Map();
        for (const itemId of userItems) {
            const neighbors = co.get(itemId);
            if (!neighbors) continue;
            for (const [other, cnt] of neighbors.entries()) {
                if (userItems.has(other)) continue; // skip already consumed
                scores.set(other, (scores.get(other) || 0) + cnt);
            }
        }
        const out = Array.from(scores.entries()).map(([id, score]) => ({ id, score }));
        out.sort((a, b) => b.score - a.score);
        return out.slice(0, limit).map(x => x.id);
    }

    // Hybrid recommend: weighted combination of methods + popularity fallback
    async function getRecommendations(userId, { limit = 10, method = 'hybrid' } = {}) {
        if (method === 'content') return recommendByContent(userId, limit);
        if (method === 'collab') return recommendByCollaborative(userId, limit);

        // hybrid
        const [contentList, collabList, popular] = await Promise.all([
            recommendByContent(userId, limit * 3),
            recommendByCollaborative(userId, limit * 3),
            db.getPopularItems(limit * 3)
        ]);

        const scoreMap = new Map();
        const addScore = (id, s) => scoreMap.set(id, (scoreMap.get(id) || 0) + s);

        contentList.forEach((id, idx) => addScore(id, contentWeight * (1 / (1 + idx))));
        collabList.forEach((id, idx) => addScore(id, collabWeight * (1 / (1 + idx))));
        popular.forEach((p, idx) => addScore(p.id, popularityWeight * (1 / (1 + idx))));

        // remove items user already consumed
        const userInteractions = await db.getUserInteractions(userId);
        const consumed = new Set(userInteractions.map(i => i.itemId));

        const candidates = Array.from(scoreMap.entries())
            .filter(([id]) => !consumed.has(id))
            .map(([id, score]) => ({ id, score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(x => x.id);

        return candidates;
    }

    return {
        getRecommendations,
        recommendByContent,
        recommendByCollaborative,
        buildUserProfile
    };
}

module.exports = createRecommendationService;