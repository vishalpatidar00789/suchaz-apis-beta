import passport from 'passport'
import { Schema } from 'bodymen'
import { BasicStrategy } from 'passport-http'
const LocalStrategy = require('passport-local').Strategy;
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { jwtSecret, masterKey } from '../../config'
import * as facebookService from '../facebook'
import User, { schema } from '../../api/user/model'

export const password = () => (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err && err.param) {
      return res.status(400).json(err)
    } else if (err || !user) {
      return res.status(401).json({
        status: false,
        message: err
      })
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) return res.status(401).end()
      next()
    })
  })(req, res, next)
}

export const facebook = () =>
  passport.authenticate('facebook', { session: false })

export const master = () => 
  passport.authenticate('master', { session: false })

export const token = ({ required, roles = User.roles } = {}) => (req, res, next) =>
  passport.authenticate('token', { session: false }, (err, user, info) => {
    const _is_role_found = roles?.some(el => user.roles?.indexOf(el) >=0 )
    if (err || (required && !user) || (required && ! _is_role_found )) {
      return res.status(401).end()
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) return res.status(401).end()
      next()
    })
  })(req, res, next)

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  (email, password, done) => {
    console.log('inside password strategy', email)
    const userSchema = new Schema({ email: schema.tree.email, password: schema.tree.password })

    userSchema.validate({ email, password }, (err) => {
      if (err) done(err)
    })

    User.findOne({ email }).then((user) => {
      if (!user) {
        done("Email is invalid. Please enter valid email.")
        return null
      }
      if (user && !user.activated) {
        done("User account is deactivated. Please contact admin.")
      }
      return user.authenticate(password, user.password).then((user) => {
        done(null, user)
        return null
      }).catch(done("Password is incorrect. Please enter valid password."))
    })
  }
))

passport.use('password', new BasicStrategy((email, password, done) => {
  console.log('inside password strategy', email)
  const userSchema = new Schema({ email: schema.tree.email, password: schema.tree.password })

  userSchema.validate({ email, password }, (err) => {
    console.log('in validate')
    console.log(email)
    console.log(password)
    if (err) done(err)
  })

  User.findOne({ email }).then((user) => {
    console.log('inside find one', email)
    if (!user) {
      done(true)
      return null
    }
    return user.authenticate(password, user.password).then((user) => {
      console.log('inside user pass auth', password)
      done(null, user)
      return null
    }).catch(done)
  })
}))

passport.use('facebook', new BearerStrategy((token, done) => {
  facebookService.getUser(token).then((user) => {
    return User.createFromService(user)
  }).then((user) => {
    done(null, user)
    return null
  }).catch(done)
}))

passport.use('master', new BearerStrategy((token, done) => {
  console.log(' use master service ')
  if (token === masterKey) {
    done(null, {})
  } else {
    done(null, false)
  }
}))

passport.use('token', new JwtStrategy({
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromUrlQueryParameter('access_token'),
    ExtractJwt.fromBodyField('access_token'),
    ExtractJwt.fromAuthHeaderWithScheme('Bearer')
  ])
}, ({ id }, done) => {
  User.findById(id).then((user) => {
    done(null, user)
    return null
  }).catch(done)
}))
