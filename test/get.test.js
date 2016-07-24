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

  it('should include all attributes when no role is given to get', function(){
    var Model = sequelize.define('model', {
      attr1: Sequelize.STRING,
      attr2: {
        type: Sequelize.STRING,
        roles: false
      }
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
  });

  it('should not include attributes with roles: false', function () {
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

    values = instance.get({role: Math.random().toString()});

    expect(values.attr1).to.be.ok();
    expect(values.attr2).to.not.be.ok();
    expect(values.attr3).to.be.ok();

    values = instance.get();

    expect(values.attr1).to.be.ok();
    expect(values.attr2).to.be.ok();
    expect(values.attr3).to.be.ok();

    expect(instance.get('attr1', {role: Math.random().toString()})).to.be.ok();
    expect(instance.get('attr2', {role: Math.random().toString()})).to.not.be.ok();
    expect(instance.get('attr3', {role: Math.random().toString()})).to.be.ok();
  });

  it('should apply role "default" if none is given to get', function(){
    var Model = sequelize.define('model', {
      attr1: Sequelize.STRING,
      attr2: {
        type: Sequelize.STRING,
        roles: {
          default: false
        }
      },
      attr3: {
        type: Sequelize.STRING,
        roles: {
          default: {
            get: false
          }
        }
      },
      attr4: {
        type: Sequelize.STRING,
        roles: {
          default: {
            get: true
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
      attr3: Math.random().toString(),
      attr4: Math.random().toString()
    });

    values = instance.get();

    expect(values.attr1).to.be.ok();
    expect(values.attr2).to.not.be.ok();
    expect(values.attr3).to.not.be.ok();
    expect(values.attr4).to.be.ok();
  });

  it('should apply role referenced by "default" role if none is given to get', function(){
    var Model = sequelize.define('model', {
      attr1: {
        type: Sequelize.STRING,
        roles: {
          default: 'otherRole',
          otherRole: false
        }
      },
      attr2: {
        type: Sequelize.STRING,
        roles: {
          default: 'otherRole',
          otherRole: true
        }
      }
    })
      , instance
      , values;

    ssaclAttributeRoles(Model);

    instance = Model.build({
      attr1: Math.random().toString(),
      attr2: Math.random().toString()
    });

    values = instance.get();

    expect(values.attr1).to.not.be.ok();
    expect(values.attr2).to.be.ok();
  });

  it('should only apply the given role on attributes containing the role', function () {
    var Model = sequelize.define('model', {
      attr1: {
        type: Sequelize.STRING,
        roles: {
          rolea: false
        }
      },
      attr2: {
        type: Sequelize.STRING,
        roles: {
          rolea: {get: false},
          roleb: false
        }
      },
      attr3: {
        type: Sequelize.STRING,
        roles: {
          roleb: {
            get: false, set: false
          },
          rolec: false,
          rolea: {
            set: false
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

    expect(instance.get('attr1', {role: 'rolea'})).to.not.be.ok();
    expect(instance.get('attr1', {role: 'roleb'})).to.be.ok();

    values = instance.get({role: 'rolea'});
    expect(values.attr1).to.not.be.ok();
    expect(values.attr2).to.not.be.ok();
    expect(values.attr3).to.be.ok();

    values = instance.get({role: 'roleb'});
    expect(values.attr1).to.be.ok();
    expect(values.attr2).to.not.be.ok();
    expect(values.attr3).to.not.be.ok();

    values = instance.get({role: 'rolec'});
    expect(values.attr1).to.be.ok();
    expect(values.attr2).to.be.ok();
    expect(values.attr3).to.not.be.ok();
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
          system: false
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
    }, { include: [Company] });

    var values = user.get({role: 'self'});

    expect(values.companyId).to.be.ok();
    expect(values.email).to.be.ok();
    expect(values.password).to.not.be.ok();
    expect(values.company).to.be.ok();
    expect(values.company.name).to.be.ok();
    expect(values.company.price).to.be.ok();

    values = user.get({role: 'admin'});

    expect(values.companyId).to.be.ok();
    expect(values.email).to.be.ok();
    expect(values.password).to.not.be.ok();
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
          client: false
        }
      }
    });

    ssaclAttributeRoles(Account);

    var account = Account.build({
      active: true
    });

    var values = account.get({role: 'client'});

    expect(values.active).to.be.undefined;

    expect(account.get('active')).to.equal(true);
  });
});