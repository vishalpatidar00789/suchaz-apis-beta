const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const Schema = mongoose.Schema;

const ShippingAddressSchema = new Schema({
    recipientFistName: { type: String, required: true },
    recipientLastName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    pinCode: { type: String, required: true }
})

const LineItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'seller_item', required: true },
    sku: { type: Object },
    quantity: { type: Number, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'store', required: true },
    unitPrice: { type: Number, required: true },
    lineSubTotal: { type: Number, required: true },
    giftWrapCharges: { type: Number, default: 0 },
    shippingCharges: { type: Number, required: true, default: 0 },
    lineTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    giftWrapSelected: { type: Boolean, default: false },
    customize_selected: { type: Boolean, default: false },
    customize_text: { type: String, default: "" },
    customize_images: { type: Array, default: [] },
    gst: { type: Number, required: true, default: 0 },
    lineStatus: { type: Number, default: 0 },   // Init Pending 
    lineStatusMsg: { type: String, default: "Init" },
    lineStatusDate: { type: Date, default: new Date() }
})
const ordersSchema = new Schema({
    // orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    userContact: { type: Number, required: true },
    userEmail: { type: Number, required: true },
    checksum: { type: String },
    txn_id: { type: String },
    lineItems: [LineItemSchema],
    shippingAddress: ShippingAddressSchema,
    subTotal: { type: Number, required: true },
    finalTotal: { type: Number, required: true },
    shippingCharges: { type: Number },
    giftWrapCharges: { type: Number },
    gst: { type: Number },
    orderStatus: { type: Number, default: 0 },
    orderStatusMsg: { type: String, default: "Init" },
    paymentStatus: { type: String, default: "Init" },
    activated: { type: Boolean, required: false },
    paymentMethod: { type: String },
    createdBy: { type: String, required: true },
    lastUpdatedBy: { type: String }
}, { timestamps: true })


ordersSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['__v'];
        delete ret['_id'];
        delete ret['updatedAt'];
        return ret;
    },
    virtuals: true
});

ordersSchema.plugin(mongoosePaginate);
ordersSchema.plugin(aggregatePaginate);

ordersSchema.pre('save', async function (next) {
    this.orderId = this._id;
    next();
});

const model = mongoose.model('order', ordersSchema)

export const schema = model.schema
export default model