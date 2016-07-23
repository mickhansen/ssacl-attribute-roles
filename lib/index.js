"use strict";

var Sequelize = require('sequelize')
  , init;

init = function(target) {
  if (target instanceof Sequelize.Model) {
    var $get = target.Instance.prototype.get;

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

    target.Instance.prototype.get = function(key, options) {
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
        if (!attr || !options.role || !attr.roles || attr.roles && attr.roles[options.role] && attr.roles[options.role].get) {
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
        if(!attr && val instanceof Sequelize.Instance) {
          response[key] = val.get.call(val, options);
        }
        else if (!attr || !options.role || !attr.roles || attr.roles && attr.roles[options.role] && attr.roles[options.role].get) {
          response[key] = val;
        }
      });

      return response;
    };
  } else {
    target.afterDefine(function (Model) {
      init(Model);
    });
  }
};

module.exports = init;
