const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
        rating: { type: Number, min: 1, max: 5, default: 0 },
        comment: { type: String, trim: true, default: '' },
        deletedAt: { type: Date, default: null }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

feedbackSchema.index({ user: 1, resource: 1 }, { unique: true });

feedbackSchema.statics.createFeedback = function (payload) {
    return this.create(payload);
};

feedbackSchema.statics.findByUserAndResource = function (userId, resourceId) {
    return this.findOne({ user: userId, resource: resourceId }).exec();
};

feedbackSchema.statics.deleteFeedback = function (id) {
    return this.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).exec();
};

module.exports = mongoose.model('Feedback', feedbackSchema);