const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menuController');
const { requireAuth } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Obtener menú del usuario autenticado (según sus permisos)
router.get('/user', MenuController.getUserMenu);


module.exports = router;
