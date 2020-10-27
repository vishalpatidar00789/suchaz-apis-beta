import mongoose, { Schema } from 'mongoose'
const mongoosePaginate = require('mongoose-paginate-v2');

const opttionSchema = new Schema({
    title: { type: String, required: true },
    group_name: {
        type: String,
        required: true,
        enum: ["gender", "age_groups", "hobbies", "personalities", "professions", "occasions", "relationships"]
    },
    createdBy: { type: String },
    lastUpdatedBy: { type: String },
    activated: { type: Boolean, default: false },
}, { timestamps: true });

opttionSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['__v'],
            delete ret['_id'],
            delete ret['updatedAt'];
        return ret;
    },
    virtuals: true
});

opttionSchema.plugin(mongoosePaginate)
const model = mongoose.model('option', opttionSchema)

export const schema = model.schema
export default model