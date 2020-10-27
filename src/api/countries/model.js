import mongoose, { Schema } from 'mongoose'

const countrySchema = new Schema({
    title: {
        type: String, required: true
    },
    code: {
        type: String,
        unique: true,
        uppercase: true
    },
    activated: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

countrySchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['__v'];
        delete ret['_id'];
        delete ret['updatedAt'];
        return ret;
    },
    virtuals: true
});

const model = mongoose.model('country', countrySchema)

export const schema = model.schema
export default model