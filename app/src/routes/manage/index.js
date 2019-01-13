/**
 * Routes for admin interface
 * @module routes/manage
 * @see module:routes/manage/addboard
 * @see module:routes/manage/boardopts
 * @see module:routes/manage/delboard
 * @see module:routes/manage/maintenance
 * @see module:routes/manage/modlog
 * @see module:routes/manage/news
 * @see module:routes/manage/profile
 * @see module:routes/manage/sitesettings
 * @see module:routes/manage/spaceused
 * @see module:routes/manage/staff
 * @see module:routes/manage/uploads
 */

const express = require('express');
const router = express.Router();
const { authRequired } = require('../../middlewares/permission');
const { globalTemplateVariables } = require('../../middlewares/params');
const Post = require('../../models/post');
const Board = require('../../models/board');
const du = require('du');
const config = require('../../config.json');


router.use(authRequired);
router.use(globalTemplateVariables);
router.use('/manage/', require('./addboard'));
router.use('/manage/', require('./boardopts'));
router.use('/manage/', require('./delboard'));
router.use('/manage/', require('./maintenance'));
router.use('/manage/', require('./modlog'));
router.use('/manage/', require('./news'));
router.use('/manage/', require('./profile'));
router.use('/manage/', require('./roles'));
router.use('/manage/', require('./sitesettings'));
router.use('/manage/', require('./spaceused'));
router.use('/manage/', require('./staff'));
router.use('/manage/', require('./uploads'));

router.get('/manage/',
  async (req, res, next) => {
    try {
      const [postcount, boardcount, spaceused] = await Promise.all([
        Post.estimatedDocumentCount(),
        Board.estimatedDocumentCount(),
        new Promise((resolve, reject) => {
          du(config.html_path, (err, size) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(size);
          });
        }),
      ]);
      console.log(postcount);
      res.render('manage/managepage', {
        kot_routes: req.app.get('kot_routes'),
        kot_mongo_version: req.app.get('kot_mongo_version'),
        kot_mongoose_version: req.app.get('kot_mongoose_version'),
        kot_sharp_versions: req.app.get('kot_sharp_versions'),
        postcount: postcount,
        boardcount: boardcount,
        spaceused: spaceused,
      });
    } catch (err) {
      next(err);
    }
  }
);


/**
 * Express router.
 */
module.exports = router;