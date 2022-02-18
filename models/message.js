var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var { DateTime } = require('luxon');

var MessageSchema = new Schema({
  title: { type: String, required: true, maxLength: 50 },
  text: { type: String, required: true, maxLength: 140 },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: Date
});

MessageSchema
  .virtual('timestamp_formatted')
  .get(function() {
    var date_formatted = DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED);
    var time_formatted = DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.TIME_SIMPLE);
    return date_formatted + ' | ' + time_formatted;
  });

module.exports = mongoose.model('Message', MessageSchema);