var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema(
  {
    title: { type: String, required: true, maxLenght: 50 },
    text: { type: String, required: true, maxLenght: 140 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date.now()
  }
);

module.exports = mongoose.model('Message', MessageSchema);