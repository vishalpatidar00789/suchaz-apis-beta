import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
const mongoosePaginate = require('mongoose-paginate-v2');

const storeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    website: { type: String },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    shop_name: { type: String, required: true, unique: true },
    email: { 
        type: String, match: /^\S+@\S+\.\S+$/,
        required: true,
        unique: true,
        trim: true,
        lowercase: true 
    },
    contact_number: { type: String, required: true, unique: true },
    country: { type: String, default: "IN" },
    gst_no: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "", required: true },
    activated: { type: Boolean, default: true },
    description: { type: String, default: "" },
    createdBy: { type: String },
    lastUpdatedBy: { type: String }
}, { timestamps: true });

storeSchema.plugin(mongoosePaginate);
storeSchema.plugin(mongooseKeywords, { paths: ['shop_name', 'description'] })
storeSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['__v'];
        delete ret['_id'];
        delete ret['updatedAt'];
        return ret;
    },
    virtuals: true
});

const model = mongoose.model('store', storeSchema);

export const schema = model.schema
export default model