"use strict";

var ssaclAttributeRoles = require('../lib')
  , expect = require('expect.js')
  , Sequelize = require('sequelize')
  , sequelize = new Sequelize(null, null, null, {
      dialect: 'sqlite'
    });

describe('get', function () {
  it('should include attributes with no roles defined', function () {
    var Model = sequelize.define('model', {
        attr1: Sequelize.STRING,
        attr2: Sequelize.STRING
      })
      , instance
      , values;

    ssaclAttributeRoles(Model);

    instance = Model.build({
      attr1: Math.random().toString(),
      attr2: Math.random().toString()
    });

    values = instance.get();

    expect(values.attr1).to.be.ok();
    expect(values.attr2).to.be.ok();

    values = instance.get({role: Math.random().toString()});

    expect(values.attr1).to.be.ok();
    expect(values.attr2).to.be.ok();

    expect(instance.get('attr1')).to.be.ok();
    expect(instance.get('attr1', {role: Math.random().toString()})).to.be.ok();
  });

  it('should include not attributes with roles: false or roles: {}', function () {
    var Model = sequelize.define('model', {
        attr1: Sequelize.STRING,
        attr2: {
          type: Sequelize.STRING,
          roles: false
        },
        attr3: {
          type: Sequelize.STRING,
          roles: {}
        }
      })
      , instance
      , values;

    ssaclAttributeRoles(Model);

    instance = Model.build({
      attr1: Math.random().toString(),
      attr2: Math.random().toString(),
      attr3: Math.random().toString()
    });

    values = instance.get();

    expect(values.attr1).to.be.ok();
    expect(values.attr2).not.to.be.ok();
    expect(values.attr3).not.to.be.ok();

    values = instance.get({role: Math.random().toString()});

    expect(values.attr1).to.be.ok();
    expect(values.attr2).not.to.be.ok();
    expect(values.attr3).not.to.be.ok();

    values = instance.get({raw: true});
    
    expect(values.attr1).to.be.ok();
    expect(values.attr2).to.be.ok();
    expect(values.attr3).to.be.ok();

    expect(instance.get('attr2')).not.to.be.ok();
    expect(instance.get('attr2', {raw: true})).to.be.ok();
    expect(instance.get('attr3', {role: Math.random().toString()})).not.to.be.ok();
  });

  it('should only include attributes with the specific role', function () {
    var Model = sequelize.define('model', {
        attr1: {
          type: Sequelize.STRING,
          roles: {
            rolea: true
          }
        },
        attr2: {
          type: Sequelize.STRING,
          roles: {
            rolea: {get: true},
            roleb: true
          }
        },
        attr3: {
          type: Sequelize.STRING,
          roles: {
            roleb: {
              get: true, set: true
            },
            rolec: true,
            rolea: {
              set: true
            }
          }
        }
      })
      , instance
      , values;

    ssaclAttributeRoles(Model);

    instance = Model.build({
      attr1: Math.random().toString(),
      attr2: Math.random().toString(),
      attr3: Math.random().toString()
    });

    expect(instance.get('attr1', {role: 'rolea'})).to.be.ok();
    expect(instance.get('attr1', {role: 'roleb'})).not.to.be.ok();

    values = instance.get({role: 'rolea'});
    expect(values.attr1).to.be.ok();
    expect(values.attr2).to.be.ok();
    expect(values.attr3).not.to.be.ok();

    values = instance.get({role: 'roleb'});
    expect(values.attr1).not.to.be.ok();
    expect(values.attr2).to.be.ok();
    expect(values.attr3).to.be.ok();

    values = instance.get({role: 'rolec'});
    expect(values.attr1).not.to.be.ok();
    expect(values.attr2).not.to.be.ok();
    expect(values.attr3).to.be.ok();
  });
});