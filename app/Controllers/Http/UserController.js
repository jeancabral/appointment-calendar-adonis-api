'use strict'

const User = use('App/Models/User')
const Hash = use('Hash')

class UserController {
  async store ({ request }) {
    const data = request.only(['username', 'email', 'password'])

    const user = await User.create(data)

    return user
  }

  async update ({ request, response, auth: { user } }) {
    const data = request.only(['password', 'password_old', 'username'])
    console.log(user)
    if (data.password_old) {
      /**
      |--------------------------------------------------
      | Note: Since you cannot decrypt a hash, you can
      | verify the user input against the previously hashed value.
      | Ex.: const isSame = await Hash.verify('plain-value', 'hashed-value')
      |--------------------------------------------------
      */
      const isSame = await Hash.verify(data.password_old, user.password)

      if (!isSame) {
        return response.status(401).send({
          error: {
            message: 'A senha antiga não é válida'
          }
        })
      }

      if (!data.password) {
        return response.status(401).send({
          error: {
            message: 'Você não informou a nova senha'
          }
        })
      }

      delete data.password_old
    }

    if (!data.password) {
      delete data.password
    }

    user.merge(data)

    await user.save()

    return user
  }
}

module.exports = UserController
