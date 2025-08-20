const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Rutas para crear usuario
router.post('/', UserController.createUser);

// Rutas para obtener todos los usuarios
router.get('/', UserController.getAllUsers);

// Rutas para eliminar usuario
router.delete('/:id', UserController.deleteUser);

// Rutas para obtener usuario por id
router.get('/:id', UserController.getUserById);

// Rutas para actualizar usuario
router.put('/:id', UserController.updateUser);

// Rutas para actualizar contraseña de usuario
router.put('/password/:id', UserController.updateUserPassword);

// Rutas para desactivar usuario
router.put('/deactivate/:id', UserController.deactivateUser);

// Rutas para activar usuario
router.put('/activate/:id', UserController.activateUser);

module.exports = router;