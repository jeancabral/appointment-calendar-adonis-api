'use strict'

const Appointment = use('App/Models/Appointment')
const moment = require('moment')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with appointments
 */
class AppointmentController {
  /**
   * Show a list of all appointments.
   * GET appointments
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response }) {
    const { page, date } = request.get()

    let query = Appointment.query().with('user')

    if (date) {
      query = query.whereRaw(`"when"::date = ?`, date)
    }

    const appointments = await query.paginate(page)

    return appointments
  }

  /**
   * Create/save a new appointment.
   * POST appointments
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth }) {
    const data = request.only(['name', 'where', 'when'])

    try {
      await Appointment.findByOrFail('when', data.when)

      return response.status(401).send({
        error: {
          message: 'You can not set two events at the same time.'
        }
      })
    } catch (err) {
      const appointment = await Appointment.create({
        ...data,
        user_id: auth.user.id
      })
      return appointment
    }
  }

  /**
   * Display a single appointment.
   * GET appointments/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, auth }) {
    const appointment = await Appointment.findOrFail(params.id)

    if (appointment.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'Only the owner of the event can see it.'
        }
      })
    }

    return appointment
  }

  /**
   * Update appointment details.
   * PUT or PATCH appointments/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, auth }) {
    const appointment = await Appointment.findOrFail(params.id)

    if (appointment.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'Only the owner of the event can edit it.'
        }
      })
    }

    const passed = moment().isAfter(appointment.when)

    if (passed) {
      return response.status(401).send({
        error: {
          message: 'You can not edit past events'
        }
      })
    }

    const data = request.only(['name', 'where', 'when'])

    try {
      const appointment = await Appointment.findByOrFail('when', data.when)
      if (appointment.id !== Number(params.id)) {
        return response.status(401).send({
          error: {
            message: 'You can not set two events at the same time.'
          }
        })
      }
    } catch (err) {}

    appointment.merge(data)

    await appointment.save()

    return appointment
  }
  /**
   * Delete a appointment with id.
   * DELETE appointments/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */

  /**
   * Delete a appointment with id.
   * DELETE appointments/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */ async destroy ({ params, response, auth }) {
    const appointment = await Appointment.findOrFail(params.id)

    if (appointment.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'Only the owner of the event can delete it.'
        }
      })
    }

    const passed = moment().isAfter(appointment.when)

    if (passed) {
      return response.status(401).send({
        error: {
          message: 'You can not edit past events.'
        }
      })
    }

    await appointment.delete()
  }
}

module.exports = AppointmentController
