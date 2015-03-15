# ssacl attribute roles

[![Build Status](https://travis-ci.org/mickhansen/ssacl-attribute-roles.svg?branch=master)](https://travis-ci.org/mickhansen/ssacl-attribute-roles) [![Test Coverage](https://codeclimate.com/github/mickhansen/ssacl-attribute-roles/badges/coverage.svg)](https://codeclimate.com/github/mickhansen/ssacl-attribute-roles)

Simple attribute roles/ACL for Sequelize

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
```