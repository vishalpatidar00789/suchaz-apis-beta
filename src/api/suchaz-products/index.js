import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { index, aggregateList, getProductById, create, update, destroy } from './controller'
import { schema } from './model'
import { uploadMultiple } from '../../services/multer'
import { USER_TYPES } from '../../constants'

const query_schema = new Schema({
    sort: '-createdAt',
    search: {
        type: RegExp,
        paths: ['title', 'description'],
        bindTo: 'search'
    }
})

const router = new Router()
const { title, slug } = schema.tree

router.get('/',
    token({ required: true }),
    query(query_schema),
    aggregateList)

router.get('/:id',
    getProductById)


router.post('/',
    token({ required: true, roles: [USER_TYPES.ADMIN, USER_TYPES.SELLER] }),
    uploadMultiple(process.env.CATEGORY_BUCKET),
    body({ title, slug }),
    create)

router.put('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    uploadMultiple(process.env.CATEGORY_BUCKET),
    body(),
    update)

router.delete('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    destroy)