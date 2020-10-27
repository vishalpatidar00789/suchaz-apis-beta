import { success, notFound, fail } from '../../services/response/'
import Pincode from './model'

export const index = ({ querymen: { query, select, cursor } }, res, next) => {
    const conditions = {
        ...query,
    }
    Pincode.paginate(conditions, cursor)
    .then(pins => pins ? pins : [])
    .then(success(res, 201))
    .catch(next)
}

export const create = async ({ bodymen: { body }, user, file }, res, next) => {
    const existing = await Pincode.findOne({ pincode: body.pincode })
    if(existing)
        fail(res, 400, 'pincode already exists.')
    Pincode.create({ ...body, createdBy: user.id })
    .then(pin => pin ? pin : null)
    .then(success(res, 201))
    .catch(next)
}

export const update = ({ bodymen: { body }, params, user }, res, next) => {
    const existing = await Pincode.findById({ _id: params.id })
    if (existing) {
        Pincode.findByIdAndUpdate({ _id: params.id ? params.id : body._id }, 
        { ...body, lastUpdatedBy: user.id }, { new: true })
        .then(pin => pin ? pin : null)
        .then(success(res, 201))
        .catch(next)
    } else {
        fail(res, 404, 'pin not found.')
    }
}

export const getPinById = ({ params }, res, next) => {
    Pincode.findById(params.id)
    .then(notFound(res))
    .then((pin) => pin ? pin : null)
    .then(success(res))
    .catch(next)
}

export const getPinByPincode = ({ params }, res, next) => {
    Pincode.findOne({ pincode: params.pincode })
    .then(notFound(res))
    .then((pin) => pin && pin.active ? pin : null)
    .then(success(res))
    .catch(next)
}

export const destroy = ({ params }, res, next) => {
    Pincode.findById(params.id)
    .then(notFound(res))
    .then((pin) => pin ? pin.remove() : null  )
    .then(success(res, 204))
    .catch(next)
}