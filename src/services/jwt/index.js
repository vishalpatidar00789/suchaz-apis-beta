import jwt from 'jsonwebtoken'
import Promise from 'bluebird'
import { jwtSecret } from '../../config'

const jwtSign = Promise.promisify(jwt.sign)
const jwtVerify = Promise.promisify(jwt.verify)

export const sign = (id, options = { expiresIn: process.env.JWT_EXPIRES_IN }, method = jwtSign) =>
  method({ id }, jwtSecret, options)

export const signSync = (id, options = { expiresIn: process.env.JWT_EXPIRES_IN }) => sign(id, options, jwt.sign)

export const verify = (token) => jwtVerify(token, jwtSecret)
