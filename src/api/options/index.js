import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { index, getOptionById, create, update, destroy } from './controller'
import { schema } from './model'
import { USER_TYPES } from '../../constants'

const router = new Router()
const { title } = schema.tree
const query_schema = new Schema({
    sort: 'title',
    search: {
        type: RegExp,
        paths: ['title'],
        bindTo: 'search'
    },
    group: {
        type: String,
        paths: ['group_name'],
        bindTo: 'group'
    }
})

router.get('/',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    query(query_schema),
    index)

router.get('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    getOptionById)

router.post('/',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    body({ title }),
    create)

router.put('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    body(),
    update)

router.delete('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    destroy)