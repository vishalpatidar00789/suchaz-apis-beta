import { sign } from '../../services/jwt'
import { success } from '../../services/response/'
import User, { schema } from '../user/model'

export const login = async ({ user } , res, next) => {
  sign(user._id)
    .then((token) => ({ token, user: user }))
    .then(success(res, 201))
    .catch(next)  
}
  
