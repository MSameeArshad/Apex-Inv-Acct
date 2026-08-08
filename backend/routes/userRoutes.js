const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const { createUser, getUsers, updateUser, deleteUser, createRole, getRoles, updateRole } = require('../controllers/userController');

router.use(authenticate);
router.post('/', checkPermission('user', 'create'), createUser);
router.get('/', checkPermission('user', 'view'), getUsers);
router.put('/:id', checkPermission('user', 'edit'), updateUser);
router.delete('/:id', checkPermission('user', 'delete'), deleteUser);

router.post('/roles', checkPermission('user', 'create'), createRole);
router.get('/roles', checkPermission('user', 'view'), getRoles);
router.put('/roles/:id', checkPermission('user', 'edit'), updateRole);

module.exports = router;
