const express = require("express");
const app = express();

const logger = require("./config/logging");
require("./config/routes")(app);
require("./config/db");

const port = process.env.PORT || 3000;
app.listen(port, () => {
	logger.info(`Listening on Port ${port}`);
});
