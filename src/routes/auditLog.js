const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/auditLogController');
const authMiddleware = require('../middleware/auth');

// POST /api/audit-logs - Crear nuevo registro de auditoría
router.post('/', authMiddleware.requireAuth, AuditLogController.create);

// Obtener audit logs por ID de persona
router.get('/person/:personId', authMiddleware.requireAuth, AuditLogController.getAuditLogsByPersonId);

module.exports = router;
