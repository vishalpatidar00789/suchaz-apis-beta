import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
const mongoosePaginate = require('mongoose-paginate-v2');

const categorySchema = new Schema({
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    parentCategoryCode: { type: Schema.Types.ObjectId, default: null },
    image: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    pageTitle: { type: String, default: "" },
    pageDescription: { type: String, default: "" },
    keywords: { type: String, default: "" },
    activated: { type: Boolean, default: false },
    createdBy: { type: String },
    lastUpdatedBy: { type: String },
    deletedAt: { type: String }
}, { timestamps: true });

categorySchema.plugin(mongoosePaginate)
categorySchema.plugin(mongooseKeywords, { paths: ['title', 'description'] })

categorySchema.methods = {
    view (full) {
      const view = {}
      let fields = ['_id', 'title']
  
      if (full) {
        fields = [...fields, 'slug', 'activated', 'description', 'parentCategoryCode', 
        'pageTitle', 'pageDescription', 'keywords', 'isFeatured', 'createdAt']
      }
  
      fields.forEach((field) => { view[field] = this[field] })
  
      return view
    }
}

categorySchema.virtual('parent', {
    ref: 'categories',
    localField: 'parentCategoryCode',
    foreignField: '_id'
});

categorySchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['__v'];
        delete ret['_id'];
        delete ret['updatedAt'];
        return ret;
    },
    virtuals: true
});

const model = mongoose.model('category', categorySchema)

export const schema = model.schema
export default model