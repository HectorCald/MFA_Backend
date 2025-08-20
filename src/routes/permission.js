const PermissionController = require('../controllers/permissionController');
const express = require('express');
const router = express.Router();

router.get('/', PermissionController.getAllPermissions);

module.exports = router;