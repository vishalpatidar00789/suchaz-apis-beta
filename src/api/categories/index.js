import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { index, getCategoryById, create, update, destroy } from './controller'
import { schema } from './model'
import { upload } from '../../services/multer'
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

/**
 * @api {get} /categories Retrieve categories
 * @apiName RetrieveCategories
 * @apiGroup Category
 * @apiPermission admin
 * @apiParam {String} access_token User access_token.
 * @apiUse listParams
 * @apiSuccess {Object[]} categories List of categories.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Admin access only.
 */
router.get('/',
    token({ required: true }),
    query(query_schema),
    index)

/**
 * @api {get} /categories/:id Retrieve category
 * @apiName RetrieveCategory
 * @apiGroup Category
 * @apiSuccess {Object} category data.
 * @apiError 404 Category not found.
 */
router.get('/:id',
    getCategoryById)


router.post('/',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    upload(process.env.CATEGORY_BUCKET),
    body({ title, slug }),
    create)

router.put('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    upload(process.env.CATEGORY_BUCKET),
    body(),
    update)

router.delete('/:id',
    token({ required: true, roles: [USER_TYPES.ADMIN] }),
    destroy)