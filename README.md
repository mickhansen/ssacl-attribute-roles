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
      default: 'client',
      system: {get: true},
      client: true
    }
  },
  password: {
    type: Sequelize.STRING,
    roles: false
  },
  rank: {
    type: Sequelize.STRING,
    roles: {
      default: 'client',
      client: {set: false, get: true}
      system: true
    }
  }
});

user.get(); // Applies default roles and include all the rest
user.get({role: 'system'}); // Will include email and rank but not password

user.set({rank: 'UBER'}, {role: 'client'}); // Will be ignored
user.set({rank: 'UBER'}, {role: 'system'}); // Will be set
user.set({rank: 'UBER'}); // Will be ignored, default is client
```
