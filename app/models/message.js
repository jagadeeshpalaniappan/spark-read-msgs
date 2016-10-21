var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageSchema   = new Schema({
	msgId: String,
	roomId: String,
	roomType: String,
	text: String,
	personId: String,
	personEmail: String,
	html: String,
	mentionedPeople: String,
	created: String
});



module.exports = mongoose.model('Message', MessageSchema);