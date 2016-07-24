"use strict";

var Sequelize = require('sequelize')
  , init;

init = function(target) {
  if (target instanceof Sequelize.Model) {
    var $get = target.Instance.prototype.get;

    Object.keys(target.rawAttributes).forEach(function (attr) {
      if (target.rawAttributes[attr].roles !== undefined) {
        if (target.rawAttributes[attr].roles === false) {
          return;
        }

        Object.keys(target.rawAttributes[attr].roles).forEach(function (roleName) {
          var role = target.rawAttributes[attr].roles[roleName];

          if (roleName === 'default') {
            if(typeof role === "string"){
              role = target.rawAttributes[attr].roles.default = target.rawAttributes[attr].roles[role];
            }
          }

          if (typeof role === "boolean") {
            target.rawAttributes[attr].roles[roleName] = { set: role, get: role };
            return;
          }

          if (role.set === undefined) {
            role.set = true;
          }
          if (role.get === undefined) {
            role.get = true;
          }
        });
      }
    });
    
    var accessGranted = function(attr, options){
      return !attr 
        // If no role is given apply default if any
        || !options.role && (typeof attr.roles !== 'object' || (attr.roles.default||{}).get !== false)
        // If no roles defined in attribute or set to true
        || attr.roles === undefined || attr.roles === true
        // If role is given but not defined in attribute apply default if any
        || options.role && (typeof attr.roles === 'object' && attr.roles[options.role] === undefined && (attr.roles.default||{}).get !== false)
        // Apply given role if defined in attribute
        || (attr.roles[options.role]||{}).get === true;
    };

    target.Instance.prototype.get = function(key, options) {
      if (typeof key === "object" && !options) {
        options = key;
        key = undefined;
      }

      if (options === undefined) {
        options = {};
      }

      if (key !== undefined) {
        var attr = target.rawAttributes[key];

        if (accessGranted(attr, options)) {

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
        else if ( accessGranted(attr, options) ) {

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
