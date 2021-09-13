const MessagingResponse = require("twilio").twiml.MessagingResponse;
const logger = require("../config/logging");

module.exports = function (err, req, res, next) {
	let response = new MessagingResponse();
	res.send(
		response
			.message(
				"Something went wrong on our side. We'll get around to fix this ASAP. Sorry for the trouble"
			)
			.toString()
	);
	logger.error(
		"Error:- " +
			err +
			"\nError Message:- " +
			err.message +
			"\nError Stack:- " +
			err.stack
	);
	logger.info(
		currentUser,
		response.toString().split("<Message>")[1].split("</Message>")[0]
	);
};
