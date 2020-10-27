import { success, notFound, fail } from '../../services/response/'
import Countries from './model'

export const index = (req, res, next) => {
    Countries.find({activated: true})
    .sort({title: 1})
    .then(obs => obs ? obs : [])
    .then(success(res, 201))
    .catch(next)
}

export const create = async ({ bodymen: { body }, user }, res, next) => {
    const existing = await Countries.findOne({ title: body.title })
    if(existing)
        fail(res, 400, 'Country already exists.')
    Countries.create({ ...body, createdBy: user.id })
    .then(obj => obj ? obj : null)
    .then(success(res, 201))
    .catch(next)
}

export const update = ({ bodymen: { body }, params, user }, res, next) => {
    const existing = await Countries.findById({ _id: params.id })
    if (existing) {
        Countries.findByIdAndUpdate({ _id: params.id ? params.id : body._id }, 
        { ...body, lastUpdatedBy: user.id }, { new: true })
        .then(o => o ? o : null)
        .then(success(res, 201))
        .catch(next)
    } else {
        fail(res, 404, 'Country not found.')
    }
}

export const destroy = ({ params }, res, next) => {
    Countries.findById(params.id)
    .then(notFound(res))
    .then((o) => o ? o.remove() : null  )
    .then(success(res, 204))
    .catch(next)
}
