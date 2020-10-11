import crypto from 'crypto'
import { User } from '.'

let user

beforeEach(async () => {
  user = await User.create({ name: 'user', email: 'a@a.com', password: '123456' })
})

describe('set email', () => {
  it('sets name automatically', () => {
    user.name = ''
    user.email = 'test@example.com'
    expect(user.name).toBe('test')
  })

})

describe('view', () => {
  it('returns simple view', () => {
    const view = user.view()
    expect(view).toBeDefined()
    expect(view.id).toBe(user.id)
    expect(view.name).toBe(user.name)
  })

  it('returns full view', () => {
    const view = user.view(true)
    expect(view).toBeDefined()
    expect(view.id).toBe(user.id)
    expect(view.name).toBe(user.name)
    expect(view.email).toBe(user.email)
    expect(view.createdAt).toEqual(user.createdAt)
  })
})

describe('authenticate', () => {
  it('returns the user when authentication succeed', async () => {
    expect(await user.authenticate('123456')).toBe(user)
  })

  it('returns false when authentication fails', async () => {
    expect(await user.authenticate('blah')).toBe(false)
  })
})

describe('createFromService', () => {
  let serviceUser

  beforeEach(() => {
    serviceUser = {
      id: '123',
      name: 'Test Name',
      email: 'test@test.com'
    }
  })

  ;['facebook'].forEach((service) => {
    describe(service, () => {
      beforeEach(() => {
        serviceUser.service = service
      })

      it('updates user when email is already registered', async () => {
        const updatedUser = await User.createFromService({ ...serviceUser, email: 'a@a.com' })
        // keep
        expect(updatedUser.id).toBe(user.id)
        expect(updatedUser.email).toBe(user.email)
        // update
        expect(updatedUser.name).toBe(serviceUser.name)
        expect(updatedUser.services[service]).toBe(serviceUser.id)
      })

      it('updates user when service id is already registered', async () => {
        await user.set({ services: { [service]: serviceUser.id } }).save()
        const updatedUser = await User.createFromService(serviceUser)
        // keep
        expect(updatedUser.id).toBe(user.id)
        expect(updatedUser.email).toBe(user.email)
        // update
        expect(updatedUser.name).toBe(serviceUser.name)
        expect(updatedUser.services[service]).toBe(serviceUser.id)
      })

      it('creates a new user when neither service id and email was found', async () => {
        const createdUser = await User.createFromService(serviceUser)
        expect(createdUser.id).not.toBe(user.id)
        expect(createdUser.services[service]).toBe(serviceUser.id)
        expect(createdUser.name).toBe(serviceUser.name)
        expect(createdUser.email).toBe(serviceUser.email)
      })
    })
  })
})
