import { success, notFound, fail } from '../../services/response/'
import { convertToSlug } from '../../helper'
import SuchazProduct from './model'
import { multiDelete } from '../../services/multer'

export const index = ({ querymen: { search, query, select, cursor } }, res, next) => {
    const conditions = {
        ...query,
        search
    }
    SuchazProduct.paginate(conditions, cursor)
    .then(products => products ? products : [])
    .then(success(res, 201))
    .catch(next)
}

export const create = async ({ bodymen: { body }, user, files }, res, next) => {
    const existing = await SuchazProduct.findOne({ title: body.title })
    if(existing)
        fail(res, 400, 'Suchaz product already exists.')
    SuchazProduct.create({
        title: body.title,
        slug: body.slug ? body.slug : convertToSlug(body.title),
        description: body.description,
        categoryCode: body.categoryCode,
        country: body.country ? body.country : 'IN',
        createdBy: user.id,
        images: files ? files.map(file => file.location) : [],
        pageTitle: body.pageTitle ? body.pageTitle : body.title,
        pageDescription: body.pageDescription ? body.pageDescription : body.description,
        keywords: body.keywords ? body.keywords : body.title,
        activated: body.activated ? body.activated : false
    })
    .then(product => product ? product : null)
    .then(success(res, 201))
    .catch(next)
}

export const update = ({ bodymen: { body }, params, user, files }, res, next) => {
    const existing = await SuchazProduct.findById({ _id: params.id })
    if (existing) {
        let images = files ? files.map(file => file.location): []

        let _images = existing.images;

        if (body.delete_image && body.delete_image.trim() !== "") { // Check for remove
            let _deleted = JSON.parse(body.delete_image)
            _deleted.map(v => {
                if (_images.indexOf(v) > -1) {
                    _images.splice(_images.indexOf(v), 1);
                }
            });
            multiDelete(process.env.BUCKET_NAME, body.delete_image, process.env.SUCHAZ_PRODUCT_KEY);
        }

        SuchazProduct.findByIdAndUpdate({ _id: params.id ? params.id : body._id }, {
            title: body.title,
            slug: body.slug ? body.slug : convertToSlug(body.title),
            description: body.description,
            categoryCode: body.categoryCode,
            country: body.country ? body.country : 'IN',
            lastUpdatedBy: user.id,
            images: images.concat(addedImages),
            pageTitle: body.pageTitle ? body.pageTitle : body.title,
            pageDescription: body.pageDescription ? body.pageDescription : body.description,
            keywords: body.keywords ? body.keywords : body.title,
            activated: body.activated ? body.activated : false
        }, { new: true })
        .then(product => product ? product : null)
        .then(success(res, 201))
        .catch(next)

    } else {
        fail(res, 404, 'Product not found.')
    }
}

export const getProductById = ({ params }, res, next) => {
    SuchazProduct.findById(params.id)
    .then(notFound(res))
    .then((product) => product ? product : null)
    .then(success(res))
    .catch(next)
}

export const destroy = ({ params }, res, next) => {
    SuchazProduct.findById(params.id)
    .then(notFound(res))
    .then((product) => { 
        // if (product) singleDelete(process.env.CATEGORY_BUCKET, category.image)
        return product ? product.remove() : null } )
    .then(success(res, 204))
    .catch(next)
}

export const aggregateList = ({ querymen: { search, query, select, cursor } }, res, next) => {
    const conditions = {
        search
    }

    const _aggr = SuchazProduct.aggregate([
        {
            $lookup: {
                from: "categories",
                localField: "categoryCode",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $match: conditions
        },
        {
            $sort: cursor.sort ? cursor.sort : { createdAt: -1 }
        }
    ])
    SuchazProduct.aggregatePaginate(_aggr, cursor)
    .then(products => products ? products : [])
    .then(success(res, 201))
    .catch(next)
}