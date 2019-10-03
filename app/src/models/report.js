/**
 * Model of report
 * @module models/report
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

const reflinkSchema = require('./schema/reflink');
const useragentSchema = require('./schema/useragent');


/**
 * Report Mongoose model
 * @class Report
 * @extends external:Model
 */
const reportSchema = Schema({
  /**
   * Date of reporting.
   * @type {Date}
   * @memberOf module:models/report~Report
   * @instance
   */
  timestamp:           { type: Date, default: Date.now },
  /**
   * Poster IP. Users are required to have role on post's board with
   *    permission.
   * @type {String}
   * @memberOf module:models/report~Report
   * @instance
   */
  ip:                  { type: String, required: true },
  /**
   * Poster IP md5 hash with salt. Users are required to have role on post's
   *    board with permission.
   * @type {String}
   * @memberOf module:models/report~Report
   * @instance
   */
  iphash:              { type: String, required: true },
  /**
   * Parsed useragent of poster.
   * @see models/schema/useragent
   * @type {Useragent}
   * @memberOf module:models/report~Report
   * @instance
   */
  useragent:           { type: useragentSchema, required: true },
  /**
   * INPUT. Refs to posts that are reported.
   * @see models/schema/reflink
   * @type {Array<module:models/schema/reflink~Reflink>}
   * @memberOf module:models/report~Report
   * @instance
   */
  reflinks:          [ reflinkSchema ],
  /**
   * INPUT. Report text written by complainant. Plain Text.
   * @type {String}
   * @memberOf module:models/report~Report
   * @instance
   */
  reason:              { type: String, default: '', maxlength: 280 },
  /**
   * Deleted flag. Can be set/unset by user with corresponding permission.
   * @type {Boolean}
   * @memberOf module:models/report~Report
   * @instance
   * @default false
   */
  isDeleted:           { type: Boolean, default: false },
});


/**
 * Array of reported posts documents
 * @type {Array<Post>}
 * @memberOf module:models/report~Report
 * @alias module:models/report~Report#posts
 * @instance
 */
reportSchema.virtual('posts', {
  ref: 'Post',
  localField: 'reflinks.src',
  foreignField: '_id',
  justOne: false,
  options: { sort: { timestamp: 1 } }
});


reportSchema.pre('validate', function(next) {
  if (this.isNew) {
    this.iphash = crypto
      .createHmac('md5', process.env.RANDOM_SEED)
      .update(this.ip)
      .digest('hex');
  }
  next();
});


module.exports = mongoose.model('Report', reportSchema);
