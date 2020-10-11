import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const suchAzProductSchema = new Schema({
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    categoryCode: { type: Schema.Types.ObjectId, ref: 'category', required: true },
    country: { type: String, default: 'IN' },
    images: [],
    activated: { type: Boolean, default: false },
    vendors: [],
    features: [],
    scores: [],
    isFeatured: { type: Boolean, default: false },
    pageTitle: { type: String, default: "" },
    pageDescription: { type: String, default: "" },
    keywords: { type: String, default: "" },
    createdBy: { type: String },
    lastUpdatedBy: { type: String }
}, { timestamps: true });

suchAzProductSchema.plugin(mongoosePaginate)
suchAzProductSchema.plugin(aggregatePaginate)
suchAzProductSchema.plugin(mongooseKeywords, { paths: ['title', 'description'] })

suchAzProductSchema.virtual('country_data', {
    from: 'Country', // The model to use
    localField: "country", // Find people where `localField`
    foreignField: 'code', // is equal to `foreignField`
});

suchAzProductSchema.virtual('category', {
    ref: 'category',
    localField: 'categoryCode',
    foreignField: '_id',
    justOne: true,
});

suchAzProductSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['__v'];
        delete ret['_id'];
        delete ret['updatedAt'];
        return ret;
    },
    virtuals: true
});

const model = mongoose.model('suchaz_product', suchAzProductSchema)

export const schema = model.schema
export default model