const express = require('express');
const router = express.Router();
const eventTypeController = require('../controllers/eventTypeController');
const { requireAuth } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth);

// GET /api/event-types - Obtener todos los tipos de eventos activos
router.get('/', eventTypeController.getAllEventTypes);

// GET /api/event-types/code/:code - Obtener tipo de evento por código
router.get('/code/:code', eventTypeController.getEventTypeByCode);

// GET /api/event-types/:id - Obtener tipo de evento por ID
router.get('/:id', eventTypeController.getEventTypeById);

// POST /api/event-types - Crear nuevo tipo de evento
router.post('/', eventTypeController.createEventType);

// PUT /api/event-types/:id - Actualizar tipo de evento
router.put('/:id', eventTypeController.updateEventType);

// DELETE /api/event-types/:id - Desactivar tipo de evento
router.delete('/:id', eventTypeController.deactivateEventType);

module.exports = router;
