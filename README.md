# ssacl-attribute-roles

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