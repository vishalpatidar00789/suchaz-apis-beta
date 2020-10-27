import { success, notFound, fail } from '../../services/response/'
import { convertToSlug } from '../../helper'
import SellerItem from './model'
import { multiDelete } from '../../services/multer'
import mongoose from 'mongoose'

export const index = ({ querymen: { search, query, select, cursor } }, res, next) => {
    const conditions = {
        ...query,
        search
    }
    SellerItem.paginate(conditions, cursor)
        .then(products => products ? products : [])
        .then(success(res, 201))
        .catch(next)
}

const transform = async (body) => {
    if (body) {
        return {
            title: body.title,
            slug: body.slug ? body.slug : convertToSlug(body.title),
            description: body.description,
            storeId: body.storeId,
            description: body.description,
            suchazProductId: body.suchazProductId,
            bestPrice: body.bestPrice,
            sellingPrice: body.sellingPrice,
            skus: body.skus,
            discountRate: 100 - Math.round((parseInt(body.bestPrice) * 100) / parseInt(body.sellingPrice)),
            gift_wrap_available: body.gift_wrap_available ? body.gift_wrap_available : false,
            gift_wrap_price: body.gift_wrap_price ? body.gift_wrap_price : 0,
            customization_available: body.customization_available ? body.customization_available : false,
            customization_text: body.customization_text ? body.customization_text : false,
            customization_maxtext: body.customization_maxtext ? body.customization_maxtext : 15,
            customization_maximage: body.customization_maximage ? body.customization_maximage : 1,
            customization_image: body.customization_image ? body.customization_image : false,
            customerAvgRating: 0,
            gst: body.gst,
            specification: body.specification ? body.specification : null,
            quantity: body.quantity ? body.quantity : 0,
            isFeatured: body.isFeatured,
            shippingCharge = body.shippingCharge && body.shippingCharge != "" ? body.shippingCharge : 0,
            country: body.country ? body.country : 'IN',
            pageTitle: body.pageTitle ? body.pageTitle : body.title,
            pageDescription: body.pageDescription ? body.pageDescription : body.description,
            keywords: body.keywords ? body.keywords : body.title,
            activated: body.activated ? body.activated : false
        }
    } else {
        return false
    }
}

export const create = async ({ bodymen: { body }, user, files }, res, next) => {
    const existing = await SellerItem.findOne({ title: body.title })
    if (existing)
        fail(res, 400, 'Seller product already exists.')
    else {
        const _payload = transform(body)
        _payload.createdBy = user.id
        _payload.images = files ? files.map(file => file.location) : []
        SellerItem.create(_payload)
        .then(product => product ? product : null)
        .then(success(res, 201))
        .catch(next)
    }
}

export const update = ({ bodymen: { body }, params, user, files }, res, next) => {
    const existing = await SellerItem.findById({ _id: params.id })
    if (existing) {
        let images = files ? files.map(file => file.location) : []

        let _images = existing.images;

        if (body.delete_image && body.delete_image.trim() !== "") { // Check for remove
            let _deleted = JSON.parse(body.delete_image)
            _deleted.map(v => {
                if (_images.indexOf(v) > -1) {
                    _images.splice(_images.indexOf(v), 1);
                }
            });
            multiDelete(process.env.BUCKET_NAME, body.delete_image, process.env.VENDER_ITEM_KEY);
        }
        const _payload = transform(body)
        _payload.lastUpdatedBy = user.id
        _payload.images = images.concat(addedImages)

        SellerItem.findByIdAndUpdate({ _id: params.id ? params.id : body._id }, _payload , { new: true })
            .then(product => product ? product : null)
            .then(success(res, 201))
            .catch(next)

    } else {
        fail(res, 404, 'Product not found.')
    }
}

export const getProductById = ({ params }, res, next) => {
    SellerItem.findById(params.id)
        .then(notFound(res))
        .then((product) => product ? product : null)
        .then(success(res))
        .catch(next)
}

export const destroy = ({ params }, res, next) => {
    SellerItem.findById(params.id)
        .then(notFound(res))
        .then((product) => {
            // if (product) singleDelete(process.env.CATEGORY_BUCKET, category.image)
            return product ? product.remove() : null
        })
        .then(success(res, 204))
        .catch(next)
}

export const aggregateList = ({ querymen: { search, store, select, cursor } }, res, next) => {
    const conditions = {
        search
    }
    if (store) {
        conditions.storeId = mongoose.Types.ObjectId(body.storeId)
    }
    const _aggr = SellerItem.aggregate([
        {
            $lookup:
            {
                from: "suchaz_products",
                localField: "suchazProductId",
                foreignField: "_id",
                as: "suchazProduct"
            }
        },
        {
            $unwind: {
                path: "$suchazProduct",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $lookup:
            {
                from: 'categories',
                localField: 'suchazProduct.categoryCode',
                foreignField: '_id',
                as: "suchazProduct.category"
            }
        },
        {
            $unwind: {
                path: "$suchazProduct.category",
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
    SellerItem.aggregatePaginate(_aggr, cursor)
        .then(products => products ? products : [])
        .then(success(res, 201))
        .catch(next)
}