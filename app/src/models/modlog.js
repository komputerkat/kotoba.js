/**
 * Model for moderation log entries
 * @module models/modlog
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const flatten = require('flat');
const useragentSchema = require('./schema/useragent');
const changeSchema = require('./schema/change');
const crypto = require('crypto');


/**
 * Set of actions performed by user in one request
 * @class ModlogEntry
 * @extends external:Model
 */
const modlogEntrySchema = Schema({
  /**
   * When action was executed (filled automatically)
   * @type {Date}
   * @memberOf module:models/modlog~ModlogEntry
   * @instance
   * @readOnly
   */
  createdAt:           { type: Date, default: Date.now, immutable: true },
  /**
   * IP of user who initiated action
   * @type {String}
   * @memberOf module:models/modlog~ModlogEntry
   * @instance
   * @readOnly
   */
  ip:                  { type: String, required: true, immutable: true },
  /**
   * User IP md5 hash with salt
   * @type {String}
   * @memberOf module:models/post~Post
   * @instance
   * @readOnly
   */
  iphash:              { type: String, required: true, immutable: true },
  /**
   * useragent of user who initiated action
   * @type {module:models/schema/useragent~Useragent}
   * @memberOf module:models/modlog~ModlogEntry
   * @instance
   * @readOnly
   * @see module:models/schema/useragent
   */
  useragent:           { type: useragentSchema, required: true, immutable: true },
  /**
   * If user is logged in, profile of this user.
   * Can be empty if user was not logged in.
   * @type {ObjectId}
   * @memberOf module:models/modlog~ModlogEntry
   * @see module:models/user~User
   * @instance
   * @readOnly
   */
  user:                { type: ObjectId, ref: 'User', immutable: true },
  /**
   * Array of changes that were made
   * @type {Array.<module:models/schema/change~Change>}
   * @memberOf module:models/modlog~ModlogEntry
   * @instance
   * @see module:models/schema/change
   */
  changes:             [ changeSchema ],
  /**
   * Whether or not necessary pages were regenerated
   * @type {Boolean}
   * @memberOf module:models/modlog~ModlogEntry
   * @instance
   * @default false
   * @readOnly
   */
  regenerate:          { type: Boolean, default: false, immutable: true },
},
{
  collection: 'modlog',
  strict: true,
  minimize: true,
});


/**
 * Create list of changes by comparing unchanged object and object with
 *    changes
 * @param {String} model value of model field that will be present in each
 *    change object in list
 * @param {ObjectId} target id of object in database that is being changed
 * @param {Object} [oldValues={}] current object
 * @param {Object} [newValues={}] patch object, does not necessarily contains all
 *    the original object properties, just ones that must be changed
 * @param {Object} [priorities={}] priorities for new values
 * @param {Object} [roleNames={}] priorities for new values properties of nested
 *    objects are flatten to paths, i.e.
 * @example
 * {
 *   foo: {
 *     bar: 'baz'
 *   }
 * }
 * becomes
 * {
 *   'foo.bar': 'baz'
 * }
 * @see {@link models/schema/change}
 * @returns {Array.<Object>} Array of objects corresponding to changeSchema:
 * { target, model, property, oldValue, newValue }
 * @memberOf module:models/modlog~ModlogEntry
 * @alias module:models/modlog~ModlogEntry.diff
 * @static
 */
modlogEntrySchema.statics.diff = (model, target, oldValues, newValues, priorities, roleNames, prevChanges) => {
  oldValues = flatten(oldValues || {});
  newValues = flatten(newValues || {});
  priorities = flatten(priorities || {});
  roleNames = flatten(roleNames || {});
  prevChanges = flatten(prevChanges || {});
  const changes = Object
    .entries(newValues)
    .filter(([key, value]) =>
      oldValues[key] !== value && value !== undefined && (prevChanges[key] === undefined || priorities[key] !== prevChanges[key]))
    .map(([key, value]) => ({
        target:   target,
        model:    model,
        property: key,
        oldValue: oldValues[key],
        newValue: value,
        priority: priorities[key],
        roleName: roleNames[key],
    }));
  return changes;
};


modlogEntrySchema.pre('validate', function(next) {
  if (this.isNew) {
    this.iphash = crypto
      .createHmac('md5', process.env.RANDOM_SEED)
      .update(this.ip)
      .digest('hex');
  }
  next();
});


module.exports = mongoose.model('ModlogEntry', modlogEntrySchema);
