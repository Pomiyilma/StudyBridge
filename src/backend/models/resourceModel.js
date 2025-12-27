const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        url: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: v => /^https?:\/\//i.test(v),
                message: 'URL must start with http:// or https://'
            }
        },
        type: {
            type: String,
            enum: ['article', 'video', 'book', 'course', 'other'],
            default: 'other'
        },
        tags: { type: [String], index: true, default: [] },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        meta: {
            views: { type: Number, default: 0 },
            likes: { type: Number, default: 0 }
        },
        deleted: { type: Boolean, default: false, select: false }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Text index for fast search
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' }, { weights: { title: 5, tags: 2, description: 1 } });
// Unique per-owner url to avoid duplicates
resourceSchema.index({ owner: 1, url: 1 }, { unique: true, sparse: true });

// Normalize URL before save (ensure protocol)
resourceSchema.pre('save', function (next) {
    if (this.isModified('url')) {
        if (!/^https?:\/\//i.test(this.url)) this.url = `https://${this.url}`;
    }
    next();
});

// Instance method to increment counters efficiently
resourceSchema.methods.incViews = function () {
    return this.model('Resource').findByIdAndUpdate(this._id, { $inc: { 'meta.views': 1 } }, { new: true, select: 'meta.views' }).lean().exec();
};

// Static helpers using lean queries for performance
resourceSchema.statics.createResource = function (payload) {
    return this.create(payload);
};

resourceSchema.statics.findByIdLean = function (id, projection = null) {
    return this.findOne({ _id: id, deleted: false }, projection).lean().exec();
};

resourceSchema.statics.search = function (term, { limit = 20, skip = 0, sort = { createdAt: -1 } } = {}) {
    const q = term ? { $text: { $search: term }, deleted: false } : { deleted: false };
    return this.find(q)
        .select('-deleted -__v')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

resourceSchema.statics.softDelete = function (id) {
    return this.findByIdAndUpdate(id, { $set: { deleted: true } }, { new: true }).exec();
};

// Clean JSON output
resourceSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.deleted;
        return ret;
    }
});

module.exports = mongoose.model('Resource', resourceSchema);