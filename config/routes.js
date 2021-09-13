const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

module.exports = function (app) {
	dotenv.config();
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(express.json());
	app.use(cors());

	app.use("/api/bot", require("../routes/bot"));
	// Use error middleware always at the end
	app.use(require("../middlewares/errors"));
};
