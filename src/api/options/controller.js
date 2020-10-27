import { success, notFound, fail } from '../../services/response/'
import Options from './model'

export const index = ({ querymen: { search, group, cursor } }, res, next) => {
    const conditions = {
        search,
        group
    }
    Options.paginate(conditions, cursor)
    .then(qs => qs ? qs : [])
    .then(success(res, 201))
    .catch(next)
}

export const create = async ({ bodymen: { body }, user }, res, next) => {
    const existing = await Options.findOne({ title: body.title })
    if(existing)
        fail(res, 400, 'Option already exists.')
    Options.create({ ...body, createdBy: user.id })
    .then(q => q ? q : null)
    .then(success(res, 201))
    .catch(next)
}

export const update = ({ bodymen: { body }, params, user }, res, next) => {
    const existing = await Options.findById({ _id: params.id })
    if (existing) {
        Options.findByIdAndUpdate({ _id: params.id ? params.id : body._id }, 
        { ...body, lastUpdatedBy: user.id }, { new: true })
        .then(op => op ? op : null)
        .then(success(res, 201))
        .catch(next)
    } else {
        fail(res, 404, 'Option not found.')
    }
}

export const getOptionById = ({ params }, res, next) => {
    Options.findById(params.id)
    .then(notFound(res))
    .then((op) => op ? op : null)
    .then(success(res))
    .catch(next)
}

export const destroy = ({ params }, res, next) => {
    Options.findById(params.id)
    .then(notFound(res))
    .then((op) => op ? op.remove() : null  )
    .then(success(res, 204))
    .catch(next)
}
