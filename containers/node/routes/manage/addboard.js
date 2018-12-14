const express = require('express');
const Board = require('../../models/board');

const router = express.Router();

router.get('/addboard',
  async (req, res) => {
    res.render('manage/boardopts', {
      activity: 'manage-page-addboard',
      boardDefaults: Board.defaults(),
      title: 'Add board'
    });
  }
);

module.exports = router;