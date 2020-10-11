// const mongoose = require('mongoose');
// const mongoosePaginate = require('mongoose-paginate-v2');
// const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// const Schema = mongoose.Schema;

// const ShippingAddressSchema = mongoose.Schema({
//     recipientFistName: { type: String, required: true },
//     recipientLastName: { type: String, required: true },
//     addressLine1 : { type: String, required: true },
//     addressLine2 : { type: String },
//     city: { type: String, required: true },
//     state: {type: String },
//     pinCode: {type: String, required: true}
// }) 

// const LineItemSchema = mongoose.Schema({
//     productId: { type: Schema.Types.ObjectId,ref: 'vendor_item' , required: true },
//     quantity: { type: Number, required: true },
//     vendorId: { type: Schema.Types.ObjectId,ref: 'vendor' , required: true },
//     lineTotal: { type: Number, required: true},
//     giftWrapCharges: { type: Number, default:0},
//     shippingCharges: { type: Number, required: true,default:0},
//     finalTotal: { type: Number, required: true,default:0},
//     giftWrapSelected: { type: Boolean, default:false},
//     customize_selected: { type: Boolean, default:false},
//     customize_text: { type: String, default:""},
//     customize_images: { type: Array, default:[]},
//     gst: { type: Number, required: true,default:0 },
//     orderStatus: { type: Number,default:0 },   // Init Pending 
//     orderStatusMsg: { type: String,default:"Init" }, 
//     orderStatusDate: { type: Date,default:new Date()}
// })
// const OrdersSchema = mongoose.Schema({
//     orderId: { type: String},
//     userId: { type: Schema.Types.ObjectId,ref:'users'},
//     userEmail: { type: String, required: true},
//     txn_id : { type: String },
//     contact_no: {type: Number},
//     lineItems: [LineItemSchema],
//     shippingAddress: ShippingAddressSchema,
//     subTotal: { type: Number, required: true},
//     finalTotal: { type: Number, required: true,default:0},
//     shippingCharges: { type: Number},
//     giftWrapCharges: { type: Number},
//     gst: { type: Number},
//     orderStatus: { type: Number,default:0 }, 
//     orderStatusMsg: { type: String,default:"Init" }, 
//     paymentStatus: { type:String,default:"Init" }, 
//     status: { type: Boolean,required: false },
//     paymentMethod: { type: String }, 
//     createdBy: { type: String, required: true},
//     lastUpdatedBy: { type: String }
// }, { timestamps: true })


// OrdersSchema.set('toJSON', {
//     transform: function(doc, ret, opt) {
//             delete ret['__v'];
//             delete ret['_id'];
//             delete ret['updatedAt'];
//         return ret;
//     },
//     virtuals: true
// });

// OrdersSchema.plugin(mongoosePaginate);
// OrdersSchema.plugin(aggregatePaginate);

// OrdersSchema.pre('save', async function(next) {
//     this.orderId = this._id;
//     next();
// });


// module.exports = mongoose.model('Order', OrdersSchema);