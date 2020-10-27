import mongoose, { Schema } from 'mongoose'
const mongoosePaginate = require('mongoose-paginate-v2');

const pincodeSchema = new Schema({
    pincode: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true }, 
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'IN' },
    createdBy: { type: String },
    lastUpdatedBy: { type: String }
}, { timestamps: true });

pincodeSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['__v'],
            delete ret['_id'],
            delete ret['updatedAt'];
        return ret;
    },
    virtuals: true
});

pincodeSchema.plugin(mongoosePaginate)
const model = mongoose.model('pincode', pincodeSchema)

export const schema = model.schema
export default model