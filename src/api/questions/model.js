import mongoose, { Schema } from 'mongoose'
const mongoosePaginate = require('mongoose-paginate-v2');

const questionSchema = new Schema({
    question: { type: String, required: true },
    optionsArray: [{ type: mongoose.Schema.Types.ObjectId, ref: "options" }],
    group_name: {
        type: String,
        required: true,
        enum: ["gender", "age_groups", "hobbies", "personalities", "professions", "occasions", "relationships"]
    },
    createdBy: { type: String },
    lastUpdatedBy: { type: String },
    activated: { type: Boolean, default: false },
}, { timestamps: true });

questionSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['__v'],
            delete ret['_id'],
            delete ret['updatedAt'];
        return ret;
    },
    virtuals: true
});
questionSchema.plugin(mongoosePaginate)

const model = mongoose.model('question', questionSchema)

export const schema = model.schema
export default model