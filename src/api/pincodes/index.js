import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { index, getPinById, getPinByPincode, create, update, destroy } from './controller'
import { schema } from './model'
import { USER_TYPES } from '../../constants'

const router = new Router()
const { pincode } = schema.tree

router.get('/',
    token({ required: true }),
    query(),
    index)

router.get('/:pincode',
    getPinByPincode)

router.post('/',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    body({ pincode }),
    create)

router.put('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    body(),
    update)

router.delete('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    destroy)