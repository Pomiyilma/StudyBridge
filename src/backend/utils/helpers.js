const helper = () => {
    // Helper function implementation
};
helper.misc = {
    isEmpty: v => v == null || (typeof v === 'object' && Object.keys(v).length === 0) || (typeof v === 'string' && v.trim() === ''),
    capitalize: s => typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : s,
    truncate: (s, n = 100) => typeof s === 'string' && s.length > n ? s.slice(0, n - 1) + '…' : s,
    formatDate: (date, locale = 'en-US', opts = {}) => new Date(date).toLocaleString(locale, opts),
    sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
    tryParseJSON: s => { try { return JSON.parse(s); } catch { return null } },
    uuidv4: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); }),
    deepClone: obj => JSON.parse(JSON.stringify(obj)),
    clamp: (v, min, max) => Math.min(max, Math.max(min, v)),
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    bytesToSize: bytes => {
        if (!bytes && bytes !== 0) return '';
        if (bytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }
};

module.exports = helper;