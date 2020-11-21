import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, callback} from './controller'
import { schema } from './model'
import { uploadMultiple } from '../../services/multer'
import { USER_TYPES } from '../../constants'

// const query_schema = new Schema({
//     sort: '-createdAt',
//     search: {
//         type: RegExp,
//         paths: ['title', 'description'],
//         bindTo: 'search'
//     },
//     store: {
//         type: String,
//         bindTo: 'store'
//     }
// })

const router = new Router()
// const { title } = schema.tree

// API: Place order api
router.post('/',
    token({ required: true, roles: [USER_TYPES.GIFTER] }),
    // uploadMultiple(process.env.VENDER_ITEM_BUCKET),
    // body({ title }),
    create)


// callback api, called by paytm
router.post('/callback', callback)

