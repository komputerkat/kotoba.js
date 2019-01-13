/**
 * Model for Modlog entries.
 * @module models/modlog
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;
const Int32 = require('mongoose-int32');
const flatten = require('flat');
const useragentSchema = require('./schema/useragent');
const changeSchema = require('./schema/change');


/**
 * Schema representing set of actions performed by user in one request
 */
const modlogEntrySchema = Schema({
  /** When action was executed (filled automatically) */
  timestamp:           { type: Date, default: Date.now },
  /** IP of user who initiated action */
  ip:                  { type: String, required: true },
  /** useragent of user who initiated action */
  useragent:           { type: useragentSchema, required: true },
  /**
   * If user is logged in, profile of this user.
   * Can be empty if user was not logged in.
   */
  user:                { type: ObjectId, ref: 'User' },
  /**
   * Array of changes that were made
   * @see {@link models/schama/change}
   */
  changes:             [ changeSchema ],
  /** Whether or not initiator entered correct password for target posts */
  isPasswordMatched:   { type: Boolean, default: false },
  /** Whether or not necessary pages were regenerated */
  regenerate:          { type: Boolean, default: false },
},
// options
{
  collection: 'modlog',
  strict: true,
  minimize: true,
});


/**
 * Create list of changes by comparing unchanged object and object with changes
 * @param {String} model - value of model field that will be present in each
 * change object in list
 * @param {ObjectId} target - id of object in database that is being changed
 * @param {Object} oldValues - current object
 * @param {Object} newValues - patch object, does not necessarily contains all
 * the original object properties, just ones that must be changed
 * @example
 * properties of nested objects are flatten to paths, i.e.
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
 * { target, modeule, property, oldValue, newValue }
 */
modlogEntrySchema.statics.diff = (model, target, oldValues, newValues) =>{
  oldValues = flatten(oldValues);
  newValues = flatten(newValues);
  const changes = [];
  Object
    .entries(newValues)
    .forEach(([key, value]) => {
      if (oldValues[key] !== value) {
        changes.push({
          target: target,
          model: model,
          property: key,
          oldValue: oldValues[key],
          newValue: value,
        });
      }
    });
  return changes;
};


module.exports = mongoose.model('ModlogEntry', modlogEntrySchema);