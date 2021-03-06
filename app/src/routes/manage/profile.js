const express = require('express');
const User = require('../../models/user');
const { authRequired } = require('../../middlewares/permission');

const router = express.Router();

router.get('/profile',
  authRequired,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      res.render('manage/profile', {
        activity: 'manage-page-profile',
        title: 'Profile',
        user: user
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
