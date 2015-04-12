# ssacl: attribute roles

[![Build Status](https://travis-ci.org/mickhansen/ssacl-attribute-roles.svg?branch=master)](https://travis-ci.org/mickhansen/ssacl-attribute-roles) [![Test Coverage](https://codeclimate.com/github/mickhansen/ssacl-attribute-roles/badges/coverage.svg)](https://codeclimate.com/github/mickhansen/ssacl-attribute-roles)

Simple attribute whitelisting/blacklisting with roles for Sequelize

_A part of [ssacl](https://github.com/mickhansen/ssacl) but can be used standalone aswell_

## Install

```sh
npm install --save ssacl-attribute-roles
```

## Usage

```js
var ssaclAttributeRoles = require('ssacl-attribute-roles')
  , sequelize = new Sequelize()
  , User = sequelize.define('user', {});

ssaclAttributeRoles(sequelize);
ssaclAttributeRoles(User);

User = sequelize.define('user', {
  email: {
    type: Sequelize.STRING,
    roles: {
      admin: {get: true},
      self: true
    }
  },
  password: {
    type: Sequelize.STRING,
    roles: false
  },
  rank: {
    type: Sequelize.STRING,
    roles: {
      self: {set: false, get: true}
      admin: true
    }
  }
});

user.get(); // Will never include email or password
user.get({role: 'admin'}); // Will include email but not password
user.get({raw: true}); // Ignores roles, will include all

user.set({rank: 'UBER'}, {role: 'self'||undefined}); // Will be ignored
user.set({rank: 'UBER'}, {role: 'admin'}); // Will be set
```
