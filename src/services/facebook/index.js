import request from 'request-promise'

export const getUser = (accessToken) =>
  request({
    uri: 'https://graph.facebook.com/me',
    json: true,
    qs: {
      access_token: accessToken,
      fields: 'id, name, email'
    }
  }).then(({ id, name, email }) => ({
    service: 'facebook',
    id,
    name,
    email
  }))
