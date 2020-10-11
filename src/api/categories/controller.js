import { success, notFound, fail } from '../../services/response/'
import { convertToSlug } from '../../helper'
import Category from './model'
import { singleDelete } from '../../services/multer'

export const index = ({ querymen: { search, query, select, cursor } }, res, next) => {
    const conditions = {
        ...query,
        search
    }
    Category.paginate(conditions, cursor)
    .then(categories => categories ? categories : [])
    .then(success(res, 201))
    .catch(next)
}

export const create = async ({ bodymen: { body }, user, file }, res, next) => {
    const existing = await Category.findOne({ title: body.title })
    if(existing)
        fail(res, 400, 'Category already exists.')
    
    Category.create({
        title: body.title,
        slug: body.slug ? body.slug : convertToSlug(body.title),
        parentCategoryCode: body.parentCategoryCode ? body.parentCategoryCode : null,
        createdBy: user.id,
        image: file.location, // image url
        pageTitle: body.pageTitle ? body.pageTitle : body.title,
        pageDescription: body.pageDescription ? body.pageDescription : body.description,
        keywords: body.keywords ? body.keywords : body.title,
        activated: body.activated ? body.activated : true
    })
    .then(category => category ? category.view() : null)
    .then(success(res, 201))
    .catch(next)
}

export const update = ({ bodymen: { body }, params, user, file }, res, next) => {
    const existing = await Category.findById({ _id: params.id })
    if (existing) {
        if (file) singleDelete(process.env.CATEGORY_BUCKET, existing.image)
        Category.findByIdAndUpdate({ _id: params.id ? params.id : body._id }, {
            title: body.title,
            slug: body.slug ? body.slug : convertToSlug(body.title),
            parentCategoryCode: body.parentCategoryCode ? body.parentCategoryCode : null,
            lastUpdatedBy: user.id,
            image: file.location,
            pageTitle: body.pageTitle ? body.pageTitle : body.title,
            pageDescription: body.pageDescription ? body.pageDescription : body.description,
            keywords: body.keywords ? body.keywords : body.title,
            activated: body.activated ? body.activated : true
        }, { new: true })
        .then(category => category ? category.view() : null)
        .then(success(res, 201))
        .catch(next)
    } else {
        fail(res, 404, 'Category not found.')
    }
}

export const getCategoryById = ({ params }, res, next) => {
    Category.findById(params.id)
    .then(notFound(res))
    .then((category) => category ? category.view() : null)
    .then(success(res))
    .catch(next)
}

export const getCategoriesByParent = ({ params }, res, next) => {

}

export const destroy = ({ params }, res, next) => {
    Category.findById(params.id)
    .then(notFound(res))
    .then((category) => { 
        if (category) singleDelete(process.env.CATEGORY_BUCKET, category.image)
        return category ? category.remove() : null } )
    .then(success(res, 204))
    .catch(next)
}