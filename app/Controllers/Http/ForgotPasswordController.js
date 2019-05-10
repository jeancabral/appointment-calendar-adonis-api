'use strict'

const crypto = require('crypto')
const User = use('App/Models/User')
const m = require('moment')

const Mail = use('Mail')

class ForgotPasswordController {
  async update ({ request, view, response, auth }) {
    try {
      const { token, password } = request.only(['token', 'password'])

      const user = await User.findByOrFail('token', token)

      const tokenExpired = m()
        .subtract('2', 'days')
        .isAfter(user.token_created_at)

      if (tokenExpired) {
        return response
          .status(401)
          .send({ error: { message: 'O token está expirado' } })
      }

      user.token = null
      user.token_created_at = null
      user.password = password

      await user.save()
    } catch (error) {
      return response
        .status(error.status)
        .send({ error: { message: 'Algo deu errado ao resetar a sua senha' } })
    }
  }

  async store ({ request, view, response, auth }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgot_password'],
        {
          email,
          token: user.token,
          link: `${request.input('redirect_url')}?token=${user.token}`
        },
        message => {
          message
            .to(user.email)
            .from('adonisapi@adonisjs.com', 'Appointment Adonis API')
            .subject('Forgot Password')
        }
      )
    } catch (error) {
      return response
        .status(error.status)
        .send({ error: { message: 'E-mail não existe.' } })
    }
  }
}

module.exports = ForgotPasswordController
