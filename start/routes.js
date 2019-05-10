'use strict'

const Route = use('Route')

Route.post('users', 'UserController.store')
Route.put('users', 'UserController.update').middleware('auth')

Route.post('sessions', 'SessionController.store')

Route.post('passwords', 'ForgotPasswordController.store')
Route.put('passwords', 'ForgotPasswordController.update')

Route.get('/files/:id', 'FileController.show')
Route.post('/files', 'FileController.store')
