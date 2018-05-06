"use strict";

var Sequelize = require('sequelize')
  , init;

init = function(target) {
  if (target.prototype instanceof Sequelize.Model) {
    var $get = target.prototype.get;
    var $set = target.prototype.set;
    var $_initValues = target.prototype._initValues;

    Object.keys(target.rawAttributes).forEach(function (attr) {
      if (target.rawAttributes[attr].roles !== undefined) {
        if (target.rawAttributes[attr].roles === false) {
          target.rawAttributes[attr].roles = {};
          return;
        }

        Object.keys(target.rawAttributes[attr].roles).forEach(function (role) {
          if (typeof target.rawAttributes[attr].roles[role] === "boolean") {
            target.rawAttributes[attr].roles[role] = {
              set: target.rawAttributes[attr].roles[role],
              get: target.rawAttributes[attr].roles[role]
            };
            return;
          }

          if (target.rawAttributes[attr].roles[role].set === undefined) {
            target.rawAttributes[attr].roles[role].set = false;
          }
          if (target.rawAttributes[attr].roles[role].get === undefined) {
            target.rawAttributes[attr].roles[role].get = false;
          }
        });
      }
    });

    target.prototype.get = function(key, options) {
      if (typeof key === "object" && !options) {
        options = key;
        key = undefined;
      }

      if (options === undefined) {
        options = {};
      }

      if (options.raw === true) {
        return $get.call(this, key, options);
      }
      if (key !== undefined) {
        var attr = target.rawAttributes[key];
        if (!attr || !attr.roles || attr.roles && attr.roles[options.role] && attr.roles[options.role].get) {
          return $get.call(this, key, options);
        } else {
          return undefined;
        }
      }

      var values = $get.call(this, options)
        , response = {};

      Object.keys(values).forEach(function (key) {
        var attr = target.rawAttributes[key];

        var val = values[key];
        if(!attr && val instanceof Sequelize.Model) {
          response[key] = val.get.call(val, options);
        }
        else if (!attr || !attr.roles || attr.roles && attr.roles[options.role] && attr.roles[options.role].get) {
          response[key] = val;
        }
      });

      return response;
    };

    target.prototype.set = function(key, value, options) {
      options = options || {};

      if (typeof key === 'object' && key !== null) {
        return $set.call(this, key, value, options);
      }
      else {
        var attr = target.rawAttributes[key];
        if (options.raw || !attr || !attr.roles || attr.roles && attr.roles[options.role] && attr.roles[options.role].set) {
          return $set.call(this, key, value, options);
        }

        return target;
      }
    };

    // Extend _initValues to ensure the default values are set.
    target.prototype._initValues = function(values, options) {
      var filtered = {};
      values = values || {};
      options = options || {};

      Object.keys(values).forEach(function (key) {
        var attr = target.rawAttributes[key];
        var val = values[key];
        if (options.raw || !attr || !attr.roles || attr.roles && attr.roles[options.role] && attr.roles[options.role].set) {
          filtered[key] = val;
        }
      });

      return $_initValues.call(this, filtered, options);
    };
  } else {
    target.afterDefine(function (Model) {
      init(Model);
    });
  }
};

module.exports = init;
