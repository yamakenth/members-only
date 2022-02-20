var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  last_name: { type: String, required: true, maxLength: 100 },
  username: { type: String, required: true },
  password: { type: String, required: true },
  member: { type: Boolean },
  admin: { type: Boolean }
});

UserSchema
  .virtual('full_name')
  .get(function() {
    return this.first_name + ' ' + this.last_name;
  });

UserSchema
  .virtual('initials')
  .get(function() {
    return this.first_name[0] + this.last_name[0];
  });

module.exports = mongoose.model('User', UserSchema);