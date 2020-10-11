import crypto from 'crypto'
import bcrypt from 'bcrypt'
import randtoken from 'rand-token'
import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import { env } from '../../config'
const mongoosePaginate = require('mongoose-paginate-v2');

const roles = ['GIFTER', 'ADMIN', 'SELLER']

export const USER_TYPES = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  GIFTER: 'GIFTER'
}


const UserProfileSchema = new Schema({
  gender: { type: String, enum: ["male", "female", "others"] },
  age: { type: Schema.Types.ObjectId, ref: 'AgeGroup' },
  personalities: [],
  hobbies: [],
  profession: String,
  contact: { type: Number },
  fullName: { type: String },
  dob: Date,
  profilePic: String,
});

const UserAccountSchema = new Schema({
  shortListItems: [],
  wishListItems: [],
  cartItems: []
});

const userSchema = new Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: { type: String, required: false, unique: true },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    index: true,
    trim: true
  },
  activated: {
    type: Boolean,
    index: true,
    default: true
  },
  services: {
    facebook: String
  },
  roles: {
    type: Array,
    default: 'ROLE_USER'
  },
  verifyTokenExpDate: { type: Date },
  verifiedBy: { type: String },
  signupMethod: { type: String },
  verifyToken: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  reset_password_token:  { type: String },
  reset_password_expires: { type: String },
  userProfile: UserProfileSchema,
  userAccount: UserAccountSchema,
  isVerified: { type: Boolean, default: false },
  createdBy: { type: String },
  lastUpdatedBy: String,
}, { timestamps: true } )

userSchema.path('email').set(function (email) {

  if (!this.name) {
    this.name = email.replace(/^(.+)@.+$/, '$1')
  }

  return email
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()

  /* istanbul ignore next */
  const rounds = env === 'test' ? 1 : 12

  bcrypt.hash(this.password, rounds).then((hash) => {
    this.password = hash
    next()
  }).catch(next)
})

userSchema.methods = {
  view (full) {
    const view = {}
    let fields = ['_id', 'name']

    if (full) {
      fields = [...fields, 'email', 'activated', 'roles', 'createdAt']
    }

    fields.forEach((field) => { view[field] = this[field] })

    return view
  },

  authenticate (password) {
    return bcrypt.compare(password, this.password).then((valid) => valid ? this : false)
  }

}

userSchema.statics = {
  roles,

  createFromService ({ service, id, email, name }) {
    return this.findOne({ $or: [{ [`services.${service}`]: id }, { email }] }).then((user) => {
      if (user) {
        user.services[service] = id
        user.name = name
        return user.save()
      } else {
        const password = randtoken.generate(16)
        return this.create({ services: { [service]: id }, email, password, name })
      }
    })
  }
}

// userSchema.virtual('formated_date')
// .get(function() {
//     createdAt = "";
//     if (this.createdAt) {
//         var createdAt = moment(this.createdAt).utc().format('YYYY-MM-DD');
//     }
//     return createdAt;
// });

userSchema.set('toJSON', {
  transform: function(doc, ret, opt) {
      delete ret['__v'];
      delete ret['_id'];
      delete ret['password'];
      delete ret['updatedAt'];
      return ret;
  },
  virtuals: true
});

userSchema.plugin(mongoosePaginate)
userSchema.plugin(mongooseKeywords, { paths: ['email', 'name'] })

const model = mongoose.model('User', userSchema)

export const schema = model.schema
export default model
