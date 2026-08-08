const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const m = require('../controllers/masterController');

router.use(authenticate);

router.post('/accounts', checkPermission('account', 'create'), m.createAccountGroup);
router.get('/accounts/tree', checkPermission('account', 'view'), m.getAccountTree);
router.get('/accounts/leaves', checkPermission('account', 'view'), m.getLeafAccounts);

router.post('/parties', checkPermission('party', 'create'), m.createParty);
router.get('/parties', checkPermission('party', 'view'), m.getParties);
router.put('/parties/:id', checkPermission('party', 'edit'), m.updateParty);

router.post('/items', checkPermission('item', 'create'), m.createItem);
router.get('/items', checkPermission('item', 'view'), m.getItems);
router.put('/items/:id', checkPermission('item', 'edit'), m.updateItem);

router.post('/godowns', checkPermission('godown', 'create'), m.createGodown);
router.get('/godowns', checkPermission('godown', 'view'), m.getGodowns);

module.exports = router;
