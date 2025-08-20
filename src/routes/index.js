const { Router } = require('express');
const router = Router();
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.send('API funcionando');
});

const authRoutes = require('./auth');
router.use('/auth', authRoutes);

// Rutas para tipos de clientes empresariales - REQUIERE AUTENTICACIÓN
const businessClientTypeRoutes = require('./businessClientType');
router.use('/business-client-types', requireAuth, businessClientTypeRoutes);

// Rutas para países - REQUIERE AUTENTICACIÓN
const countryRoutes = require('./country');
router.use('/countries', requireAuth, countryRoutes);

// Rutas para ciudades - REQUIERE AUTENTICACIÓN
const cityRoutes = require('./city');
router.use('/cities', requireAuth, cityRoutes);

// Rutas para registro de clientes empresariales - REQUIERE AUTENTICACIÓN
const businessClientRegistrationRoutes = require('./businessClientRegistration');
router.use('/business-client-registration', requireAuth, businessClientRegistrationRoutes);

// Rutas para tipos de roles - REQUIERE AUTENTICACIÓN
const roleTypeRoutes = require('./roleType');
router.use('/role-types', requireAuth, roleTypeRoutes);

// Rutas para personas - REQUIERE AUTENTICACIÓN
const personRoutes = require('./person');
router.use('/persons', requireAuth, personRoutes);

// Rutas para oficinas - REQUIERE AUTENTICACIÓN
const officeRoutes = require('./office');
router.use('/offices', requireAuth, officeRoutes);

// Rutas para tipos de oficina - REQUIERE AUTENTICACIÓN
const officeTypeRoutes = require('./officeType');
router.use('/office-types', requireAuth, officeTypeRoutes);

// Rutas para roles - REQUIERE AUTENTICACIÓN
const roleRoutes = require('./role');
router.use('/roles', requireAuth, roleRoutes);

// Rutas para permisos - REQUIERE AUTENTICACIÓN
const permissionRoutes = require('./permission');
router.use('/permissions', requireAuth, permissionRoutes);

// Rutas para menús - REQUIERE AUTENTICACIÓN
const menuRoutes = require('./menu');
router.use('/menus', requireAuth, menuRoutes);

// Rutas para usuarios - REQUIERE AUTENTICACIÓN
const userRoutes = require('./user');
router.use('/users', requireAuth, userRoutes);

// Rutas para auditoría - REQUIERE AUTENTICACIÓN
const auditLogRoutes = require('./auditLog');
router.use('/audit-logs', requireAuth, auditLogRoutes);

// Rutas para tipos de eventos - REQUIERE AUTENTICACIÓN
const eventTypeRoutes = require('./eventType');
router.use('/event-types', requireAuth, eventTypeRoutes);



module.exports = router;