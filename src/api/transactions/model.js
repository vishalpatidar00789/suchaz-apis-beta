import mongoose, { Schema } from 'mongoose'

const transactions = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: 'orders' },
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    transaction: { type: Object, default: {} },
}, { timestamps: true })


transactions.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['__v'];
        delete ret['_id'];
        delete ret['updatedAt'];
        return ret;
    },
    virtuals: true
});

const model = mongoose.model('transaction', transactions)

export const schema = model.schema
export default model