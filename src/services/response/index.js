export const success = (res, status) => (entity) => {
  if (entity) {
    res.status(status || 200).json({
      status: true,
      data: entity
    })
  }
  return null
}

export const fail = (res, status, err) => {
  res.status(status || 500).json({
    status: false,
    message: err
  })
}

export const notFound = (res) => (entity) => {
  if (entity) {
    return entity
  }
  res.status(404).json({
    status: false
  })
  return null
}

export const authorOrAdmin = (res, user, userField) => (entity) => {
  if (entity) {
    const isAdmin = ( user.roles?.indexOf('ROLE_ADMIN') > -1 ) ? true: false
    const isAuthor = entity[userField] && entity[userField].equals(user.id)
    if (isAuthor || isAdmin) {
      return entity
    }
    res.status(401).end()
  }
  return null
}
