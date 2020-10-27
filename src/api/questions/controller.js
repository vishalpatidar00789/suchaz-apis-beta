import { success, notFound, fail } from '../../services/response/'
import Questions from './model'

export const index = ({ querymen: { query, select, cursor } }, res, next) => {
    const aggr = [
        {
            "$lookup": {
                "from": "options",
                "localField": "optionsArray",
                "foreignField": "_id",
                "as": "options"
            }
        }, {
            "$match": { "activated": true }
        }, {
            "$unset": ["optionsArray", "status", "createdAt", "updatedAt", "-v", "options.createdAt", "options.updatedAt"]
        }
    ]
    Questions.aggregate(aggr)
    .then(qs => qs ? qs : [])
    .then(success(res, 201))
    .catch(next)
}

export const create = async ({ bodymen: { body }, user, file }, res, next) => {
    const existing = await Questions.findOne({ question: body.question })
    if(existing)
        fail(res, 400, 'Question already exists.')
    Questions.create({ ...body, createdBy: user.id })
    .then(q => q ? q : null)
    .then(success(res, 201))
    .catch(next)
}

export const update = ({ bodymen: { body }, params, user }, res, next) => {
    const existing = await Questions.findById({ _id: params.id })
    if (existing) {
        Questions.findByIdAndUpdate({ _id: params.id ? params.id : body._id }, 
        { ...body, lastUpdatedBy: user.id }, { new: true })
        .then(q => q ? q : null)
        .then(success(res, 201))
        .catch(next)
    } else {
        fail(res, 404, 'Question not found.')
    }
}

export const getQuestionById = ({ params }, res, next) => {
    Questions.findById(params.id)
    .then(notFound(res))
    .then((q) => q ? q : null)
    .then(success(res))
    .catch(next)
}

export const destroy = ({ params }, res, next) => {
    Questions.findById(params.id)
    .then(notFound(res))
    .then((q) => q ? q.remove() : null  )
    .then(success(res, 204))
    .catch(next)
}