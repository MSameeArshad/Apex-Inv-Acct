const User = require('../models/User');

const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate('role');
      const modulePerm = user.role.permissions.find(p => p.module === module);

      if (!modulePerm || !modulePerm.actions[action]) {
        return res.status(403).json({ success: false, message: 'Permission denied' });
      }

      if (user.role.name === 'Salesman' && req.query.partyId) {
        if (!user.assignedParties.map(String).includes(req.query.partyId)) {
          return res.status(403).json({ success: false, message: 'Not authorized for this party' });
        }
      }
      next();
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
};

module.exports = checkPermission;
