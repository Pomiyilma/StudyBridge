const mongoose = require('mongoose');
const forumSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
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
forumSchema.index({ title: 'text', description: 'text', tags : 'text' }, { weights : { title : 5 , tags : 2 , description : 1 } });
// Unique per-owner title to avoid duplicates
forumSchema.index({ owner : 1 , title : 1 } , { unique : true , sparse : true });

// Normalize URL before save (ensure protocol)
forumSchema.pre('save', function (next) {
    if (this.isModified('url')) {
        if (!/^https?:\/\//i.test(this.url)) this.url = `https://${this.url}`;
    }
    next();
});

// Instance method to increment counters efficiently
forumSchema.methods.incViews = function () {
    return this.model('Forum').findByIdAndUpdate(this._id, { $inc : { 'meta.views' : 1 } }, { new : true , select : 'meta.views' }).lean().exec();
};

// Static helpers using lean queries for performance
forumSchema.statics.createForum = function (payload) {
    return this.create(payload);
};

forumSchema.statics.findByIdLean = function (id, projection = null) {
    return this.findOne({ _id : id , deleted : false }, projection).lean().exec();
};

forumSchema.statics.search = function (term, { limit = 20 , skip = 0 , sort = { createdAt : -1 } } = {}) {
    const q = term ? { $text : { $search : term } , deleted : false } : { deleted : false };
    return this.find(q)
        .select('-deleted -__v')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

forumSchema.statics.softDelete = function (id) {
    return this.findByIdAndUpdate(id, { $set : { deleted : true } }, { new : true }).exec();
};

// Clean JSON output
forumSchema.set('toJSON', {
    transform:(doc, ret) => {
        delete ret.__v;
        delete ret.deleted;
        return ret;
    }
});

module.exports = mongoose.model('Forum', forumSchema);