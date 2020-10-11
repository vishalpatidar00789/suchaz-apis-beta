import { success, notFound } from '../../services/response/'
import User from './model'
import Store from '../stores/model'
import { USER_TYPES } from './model'
import { sign } from '../../services/jwt'
import randtoken from 'rand-token'

export const index = ({ querymen: { search, query, select, cursor } }, res, next) => {
  const conditions = {
    ...query,
    search
  }
  console.log('conditions :: ', conditions)
  User.paginate(conditions, cursor)
  .then(result => {
    res.status(201).json({
      status: true,
      data: result,
    })
  }).catch(next)
}

export const show = ({ params }, res, next) =>
  User.findById(params._id)
    .then(notFound(res))
    .then((user) => user ? user.view() : null)
    .then(success(res))
    .catch(next)

export const isUserExist = ({ params }, res, next) =>
  User.findOne(params.email)
    .then(notFound(res))
    .then((user) => user ? true : false)
    .then(success(res))
    .catch(next)
  

export const showMe = ({ user }, res) =>
  res.json(user.view(true))

export const create = ({ bodymen: { body } }, res, next) => {
  console.log(body)
  User.create(body)
    .then(user => {
      sign(user._id)
        .then((token) => ({ token, user: user.view(true) }))
        .then(success(res, 201))
    })
    .catch((err) => {
      /* istanbul ignore else */
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: 'email',
          message: 'email already registered'
        })
      } else {
        next(err)
      }
    })
} 

export const registerCustomer = async ({ bodymen: { body } }, res, next) => {
  console.log(body)
  const existing = await User.findOne({ email: body.email})
  if (existing) {
    res.status(409).json({
      status: false,
      param: 'email',
      message: 'email already registered'
    })
  }
  User.create({
    email: body.email,
    name: body.name,
    phone: body.phone,
    password: body.password,
    'userProfile.gender': body.gender,
    'userProfile.contact': body.phone,
    'userProfile.fullName': body.name,
    roles: [USER_TYPES.GIFTER],
    activated: true,
    createdBy: body.email
  })
  .then(user => {
    sign(user._id)
    .then(token => {
      // send email to user with the credentials
      res.status(201).json({
        status: true,
        data: user.view(),
        token,
        message: 'User registered successfully'
      })
    })
  }).catch(err => {
    res.status(501).json({
      status: false,
      message: err.message
    })
  })
}

export const registerSeller = ({ bodymen: { body } }, res, next) => {
  console.log(body)
  User.findOne({ email: body.email})
  .then(user => {
    if (user) {
      res.status(409).json({
        status: false,
        param: 'email',
        message: 'Email already registered'
      })
    }
    const password = randtoken.generate(6)
    console.log('password is :: ', password)
    User.create({
      email: body.email,
      name: body.name,
      phone: body.phone,
      password: randtoken.generate(6),
      'userProfile.contact': body.phone,
      'userProfile.fullName': body.name,
      roles: [USER_TYPES.SELLER],
      activated: true,
      isVerified: true,
      verifiedBy: USER_TYPES.ADMIN,
      createdBy: USER_TYPES.ADMIN
    })
    .then(user => {
      Store.create({
        name: body.name,
        shop_name: body.shop_name,
        userId: user._id,
        email: body.email,
        contact_number: body.phone,
        description: body.description,
        country: body.country ? body.country : 'IN',
        gst_no: body.gst_no,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        activated: true,
        createdBy: USER_TYPES.ADMIN,
      }).then(store => {
        // send email to seller with the credentials
        res.status(201).json({
          status: true,
          data: store,
          message: 'Seller registered and Store is created successfully'
        })
      }).catch(err => {
        res.status(501).json({
          status: false,
          message: err.message
        })
      })
    }).catch(err => {
      res.status(501).json({
        status: false,
        message: err.message
      })
    })
  }).catch(err => {
    res.status(501).json({
      status: false,
      message: err.message
    })
  })
}

export const update = ({ bodymen: { body }, params, user }, res, next) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isAdmin = ( user.roles?.indexOf('ROLE_ADMIN') > -1 ) ? true: false
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).json({
          status: false,
          message: 'You can\'t change other user\'s data'
        })
        return null
      }
      return result
    })
    .then((user) => user ? Object.assign(user, body).save() : null)
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const updatePassword = ({ bodymen: { body }, params, user }, res, next) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate) {
        res.status(401).json({
          valid: false,
          param: 'password',
          message: 'You can\'t change other user\'s password'
        })
        return null
      }
      return result
    })
    .then((user) => user ? user.set({ password: body.password }).save() : null)
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? user.remove() : null)
    .then(success(res, 204))
    .catch(next)
