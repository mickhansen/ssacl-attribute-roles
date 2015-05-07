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

  it('should not include attributes with roles: false or roles: {}', function () {
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

  it('should work with includes', function () {
    var User = sequelize.define('user', {
      companyId: {
        type: Sequelize.INTEGER,
        roles: {
          system: true
        }
      },
      email: {
        type: Sequelize.STRING,
        roles: {
          self: true
        }
      },
      password: {
        type: Sequelize.STRING,
        roles: false
      }
    });

    var Company = sequelize.define('company', {
      price: {
        type: Sequelize.FLOAT,
        roles: {
          admin: true
        }
      },
      name: Sequelize.STRING
    });

    ssaclAttributeRoles(User);
    ssaclAttributeRoles(Company);

    User.belongsTo(Company, {foreignKey: 'companyId'});

    var user = User.build({
      id: 12,
      companyId: 14,
      email: Math.random().toString(),
      password: Math.random().toString(),
      company: {
        id: 14,
        price: Math.random(),
        name: Math.random().toString()
      }
    }, {
      role: 'system',
      include: [Company]
    });

    var values = user.get({role: 'self'});

    expect(values.companyId).not.to.be.ok();
    expect(values.email).to.be.ok();
    expect(values.password).not.to.be.ok();
    expect(values.company).to.be.ok();
    expect(values.company.name).to.be.ok();
    expect(values.company.price).not.to.be.ok();

    values = user.get({role: 'admin'});

    expect(values.companyId).not.to.be.ok();
    expect(values.email).not.to.be.ok();
    expect(values.password).not.to.be.ok();
    expect(values.company).to.be.ok();
    expect(values.company.name).to.be.ok();
    expect(values.company.price).to.be.ok();
  });

  it('should work with getters', function () {
    var Account = sequelize.define('Account', {
      active: {
        type: Sequelize.INTEGER,
        get: function() {
          return !!this.getDataValue('active');
        },
        set: function(value) {
          this.setDataValue('active', value ? 1 : 0);
        },
        roles: {
          admin: true
        }
      }
    });

    ssaclAttributeRoles(Account);

    var account = Account.build({
      active: true
    }, {
      role: 'admin'
    });

    var values = account.get({role: 'admin'});

    expect(values.active).to.equal(true);

    expect(account.get('active', {role: 'admin'})).to.equal(true);
  });
});