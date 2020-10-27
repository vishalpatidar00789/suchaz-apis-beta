
import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const skuSchema = new Schema({
    type: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String }
})

const sellerItemSchema = new Schema({
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    isAffiliate: { type: Boolean, default: false },
    description: { type: String },
    storeId: { type: Schema.Types.ObjectId, ref: 'store', required: true },
    suchazProductId: { type: Schema.Types.ObjectId, ref: 'suchaz_product', required: true },
    skus: [skuSchema],
    bestPrice: { type: Number },
    sellingPrice: { type: Number },
    discountRate: { type: Number },
    isFeatured: { type: Boolean, default: false },
    shippingCharge: { type: Number },
    specification: { type: Object },
    quantity: { type: Number },
    customerAvgRating: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0 },
    itemURL: { type: String },
    brand: { type: String },
    gst: { type: String, default: "0" },
    gift_wrap_available: { type: Boolean, default: false },
    giftWrapCharge: { type: Number, default: "" },
    customization_available: { type: Boolean, default: false },
    customization_text: { type: Boolean, default: false },
    customization_maxtext: { type: Number, default: 15 },
    customization_image: { type: Boolean, default: false },
    customization_maximage: { type: Number, default: 1 },
    images: [],
    activated: { type: Boolean, default: false },
    pageTitle: { type: String, default: "" },
    pageDescription: { type: String, default: "" },
    keywords: { type: String, default: "" },
    createdBy: { type: String },
    lastUpdatedBy: { type: String }
}, { timestamps: true });

sellerItemSchema.plugin(mongoosePaginate)
sellerItemSchema.plugin(aggregatePaginate)
sellerItemSchema.plugin(mongooseKeywords, { paths: ['title', 'description'] })

sellerItemSchema.virtual('suchazProduct', {
    ref: 'suchaz_product',
    localField: 'suchazProductId',
    foreignField: '_id',
    justOne: true,
});

sellerItemSchema.virtual('store', {
    ref: 'store',
    localField: 'storeId',
    foreignField: '_id',
    justOne: true,
});

sellerItemSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['__v'];
        delete ret['_id'];
        delete ret['updatedAt'];
        return ret;
    },
    virtuals: true
});

const model = mongoose.model('seller_item', sellerItemSchema)

export const schema = model.schema
export default model