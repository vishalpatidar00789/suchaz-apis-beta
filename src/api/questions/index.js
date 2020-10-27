import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { index, getQuestionById, create, update, destroy } from './controller'
import { schema } from './model'
import { USER_TYPES } from '../../constants'

const router = new Router()
const { question } = schema.tree

router.get('/',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    query(),
    index)

router.get('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    getQuestionById)

router.post('/',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    body({ question }),
    create)

router.put('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    body(),
    update)

router.delete('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    destroy)