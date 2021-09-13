const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const service = require("../service/bot.service");
const logger = require("../config/logging");

router.post("/", async (req, res, next) => {
	let requestMessage = req.body.Body.toLowerCase();
	let response = new MessagingResponse();
	let currentUser = req.body.From;
	logIncomingRequest(currentUser, requestMessage);
	if (requestMessage.trim().startsWith("1")) {
		res.send(
			response
				.message(
					"Enter the URL of the product you would like to track."
				)
				.toString()
		);
		logOutgoingResponse(
			currentUser,
			response.toString().split("<Message>")[1].split("</Message>")[0]
		);
	} else if (requestMessage.trim().startsWith("2")) {
		const productsExist = await service.checkIfProductsExist(currentUser);
		if (productsExist.length === 0) {
			res.send(
				response.message("No products are being watched.").toString()
			);
			logOutgoingResponse(
				currentUser,
				response.toString().split("<Message>")[1].split("</Message>")[0]
			);
			return;
		}
		await service
			.showUserProducts(currentUser)
			.then((data) => {
				res.send(response.message(data).toString());
				logOutgoingResponse(
					currentUser,
					response
						.toString()
						.split("<Message>")[1]
						.split("</Message>")[0]
				);
			})
			.catch((err) => {
				next(new Error(err));
			});
	} else if (requestMessage.trim().startsWith("3")) {
		await service
			.checkIfProductsExist(currentUser)
			.then((data) => {
				if (data.length === 0) {
					res.send(
						response
							.message("No products are being watched.")
							.toString()
					);
					logOutgoingResponse(
						currentUser,
						response
							.toString()
							.split("<Message>")[1]
							.split("</Message>")[0]
					);
				} else {
					res.send(
						response
							.message(
								"Enter the URL of the product you would like to remove from tracking."
							)
							.toString()
					);
					logOutgoingResponse(
						currentUser,
						response
							.toString()
							.split("<Message>")[1]
							.split("</Message>")[0]
					);
				}
			})
			.catch((err) => {
				next(new Error(err));
			});
	} else if (requestMessage.trim().startsWith("4")) {
		await service
			.removeAllProducts(currentUser)
			.then((data) => {
				if (data === false) {
					res.send(
						response
							.message("No products are being watched.")
							.toString()
					);
					logOutgoingResponse(
						currentUser,
						response
							.toString()
							.split("<Message>")[1]
							.split("</Message>")[0]
					);
				} else {
					res.send(
						response
							.message(
								"All products removed from the list of products you are tracking."
							)
							.toString()
					);
					logOutgoingResponse(
						currentUser,
						response
							.toString()
							.split("<Message>")[1]
							.split("</Message>")[0]
					);
				}
			})
			.catch((err) => {
				next(new Error(err));
			});
	} else if (requestMessage.trim().startsWith("http")) {
		let messages = await client.messages
			.list({
				from: currentUser,
				to: process.env.BOT_NUMBER,
				limit: 2
			})
			.then((messages) => {
				return messages;
			})
			.catch((err) => {
				next(new Error(err));
			});

		let lastSelected = messages[1].body;
		if (lastSelected === "1") {
			let validURL = service.validateURL(messages[0].body, currentUser);
			if (!validURL) {
				res.send(
					response
						.message("Invalid Product URL. Try again...")
						.toString()
				);
				logOutgoingResponse(
					currentUser,
					response
						.toString()
						.split("<Message>")[1]
						.split("</Message>")[0]
				);
				return;
			}

			await service
				.addProductToUser(currentUser, messages[0].body)
				.then(() => {
					res.send(
						response
							.message(
								"Product added successfully to the list of products you are tracking."
							)
							.toString()
					);
					logOutgoingResponse(
						currentUser,
						response
							.toString()
							.split("<Message>")[1]
							.split("</Message>")[0]
					);
				})
				.catch((err) => {
					next(new Error(err));
				});
		} else if (lastSelected === "3") {
			// Check if the user has products in the first place
			const productsExist = await service.checkIfProductsExist(
				currentUser
			);
			if (productsExist.length === 0) {
				res.send(
					response
						.message("No products are being watched.")
						.toString()
				);
				logOutgoingResponse(
					currentUser,
					response
						.toString()
						.split("<Message>")[1]
						.split("</Message>")[0]
				);
				return;
			}

			// check if the user is tracking the particular product
			const productExists = await service.checkIfProductExists(
				currentUser,
				messages[0].body
			);
			if (!productExists) {
				res.send(
					response
						.message("You are not tracking this product.")
						.toString()
				);
				logOutgoingResponse(
					currentUser,
					response
						.toString()
						.split("<Message>")[1]
						.split("</Message>")[0]
				);
				return;
			}
			await service
				.removeProduct(currentUser, messages[0].body)
				.then(() => {
					res.send(
						response
							.message(
								"Product removed successfully from the list of products you are tracking."
							)
							.toString()
					);
					logOutgoingResponse(
						currentUser,
						response
							.toString()
							.split("<Message>")[1]
							.split("</Message>")[0]
					);
				})
				.catch((err) => {
					next(new Error(err));
				});
		} else {
			res.send(
				response
					.message(
						"Please select an option (1 or 3) before entering the URL"
					)
					.toString()
			);
			logOutgoingResponse(
				currentUser,
				response.toString().split("<Message>")[1].split("</Message>")[0]
			);
		}
	} else if (
		requestMessage.includes("hi") ||
		requestMessage.includes("hello")
	) {
		res.send(
			response
				.message(
					"Hi, This is your personal Price Tracker Bot Ash. I can help you track the price fluctuations of your favorite products. Currently I support only Amazon.\nI can do the following Actions:- \n\n 1: Add a Product to the list of Products being tracked by you. \n 2: Show the list of Products being tracked by you. \n 3: Remove a product from the list of products being tracked by you. \n 4: Remove all product being tracked by you.\n\n\n Enter 1, 2, 3 or 4 to perform an action"
				)
				.toString()
		);
		logOutgoingResponse(
			currentUser,
			response.toString().split("<Message>")[1].split("</Message>")[0]
		);
	} else {
		res.send(
			response
				.message(
					"Sorry I didn't Catch That, I can do the following Actions:- \n\n 1: Add a Product to the list of Products being tracked by you. \n 2: Show the list of Products being tracked by you. \n 3: Remove a product from the list of products being tracked by you. \n 4: Remove all product being tracked by you.\n\n\n Enter 1, 2, 3 or 4 to perform an action"
				)
				.toString()
		);
		logOutgoingResponse(
			currentUser,
			response.toString().split("<Message>")[1].split("</Message>")[0]
		);
	}
});

function logIncomingRequest(user, message) {
	logger.info("Incoming Request from " + user + " : " + message);
}

function logOutgoingResponse(user, message) {
	logger.info("Outgoing Response to " + user + " : " + message);
}

module.exports = router;
