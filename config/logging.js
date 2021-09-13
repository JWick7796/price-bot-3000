const winston = require("winston");
require("winston-daily-rotate-file");
var path = require("path");

const logPath = __dirname;
const transport = new winston.transports.DailyRotateFile({
	level: "info",
	datePattern: "DD-MM-yyyy",
	filename: path.join(logPath, "../logs/log-%DATE%.log"),
	colorize: true,
	prettyPrint: true
});
const logger = winston.createLogger({
	level: "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json()
	),
	transports: [transport]
});

process.on("unhandledRejection", async (err, req, res) => {
	logger.error(
		"Unhandled Uncaught Rejection:- \n\nError:- " +
			err +
			"\nError Message:- " +
			err.message +
			"\nError Stack:- " +
			err.stack
	);
});

process.on("uncaughtException", async (err) => {
	logger.error(
		"Unhandled Uncaught Exception:- \n\n Error:- " +
			err +
			"\nError Message:- " +
			err.message +
			"\nError Stack:- " +
			err.stack
	);
});

module.exports = logger;
