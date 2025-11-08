const { v4: uuid } = require('uuid');

function nowIso() {
  return new Date().toISOString();
}

module.exports = {
  uuid,
  nowIso,
};
