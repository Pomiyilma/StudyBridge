const mongoose = require('mongoose');

'use strict';

const { Schema } = mongoose;

function makeSlug(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // remove non-word chars
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 120);
}

const TopicSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        slug: {
            type: String,
            index: true,
            unique: true,
            required: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lessons: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Lesson',
            },
        ],
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Text index for quick searching
TopicSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Ensure unique-ish slug by appending a short suffix if needed
TopicSchema.pre('validate', async function (next) {
    if (!this.title) return next();
    const base = makeSlug(this.title);
    let slug = base || `topic-${Date.now().toString(36)}`;
    // If new or title changed, ensure uniqueness
    if (this.isNew || this.isModified('title')) {
        let i = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const candidate = i === 0 ? slug : `${slug}-${i}`;
            const existing = await mongoose.models.Topic.findOne({ slug: candidate }).select('_id').lean();
            if (!existing || (this._id && existing._id.equals(this._id))) {
                this.slug = candidate;
                break;
            }
            i += 1;
        }
    }
    next();
});

// Instance helper to add/remove lessons
TopicSchema.methods.addLesson = function (lessonId) {
    if (!this.lessons.some((l) => l.equals(lessonId))) {
        this.lessons.push(lessonId);
    }
    return this.save();
};

TopicSchema.methods.removeLesson = function (lessonId) {
    this.lessons = this.lessons.filter((l) => !l.equals(lessonId));
    return this.save();
};

// Static search helper
TopicSchema.statics.search = function (query, opts = {}) {
    const q = query ? { $text: { $search: query } } : {};
    const projection = query ? { score: { $meta: 'textScore' } } : {};
    const cursor = this.find(q, projection).sort(query ? { score: { $meta: 'textScore' } } : { createdAt: -1 });
    if (opts.limit) cursor.limit(opts.limit);
    if (opts.skip) cursor.skip(opts.skip);
    return cursor.exec();
};

module.exports = mongoose.model('Topic', TopicSchema);