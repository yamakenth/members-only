var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  last_name: { type: String, required: true, maxLength: 100 },
  username: { type: String, required: true },
  password: { type: String, required: true }
});

UserSchema
  .virtual('full_name')
  .get(function() {
    return this.first_name + ' ' + this.last_name;
  });

UserSchema
  .virtual('is_member')
  .get(function() {
    return false;
  });

module.exports = mongoose.model('User', UserSchema);