const db = require("../config/db");
const logger = require("../config/logging");

async function checkIfProductsExist(user) {
	logger.info("checkIfProductsExist() executed for request by user " + user);
	const userDocRef = db.collection("users").doc(user);
	const userDoc = await userDocRef.get();
	if (!userDoc.exists) {
		return [];
	} else {
		return userDoc.get("products");
	}
}

async function showUserProducts(user) {
	logger.info("showUserProducts() executed for request by user " + user);
	const userDocRef = db.collection("users").doc(user);
	const userDoc = await userDocRef.get();
	const userProducts = userDoc.get("products");
	let message = "";
	userProducts.forEach(function (value, i) {
		message += i + 1 + ": " + value.productURL + "\n\n";
	});
	return message;
}

async function removeAllProducts(user) {
	logger.info("removeAllProducts() executed for request by user " + user);
	const userDocRef = db.collection("users").doc(user);
	await userDocRef.update({ products: [] });
}

async function addProductToUser(user, productURL) {
	logger.info(
		"addProductToUser() executed for request by user " +
			user +
			" and product URL: " +
			productURL
	);
	const userDocRef = db.collection("users").doc(user);
	const userDoc = await userDocRef.get();
	const userProducts = userDoc.get("products");
	userProducts.push({
		productURL: productURL,
		// Need to update here to fetch current price and send to db
		price: 0
	});
	await userDocRef.update({ products: userProducts });
}

function validateURL(productURL, user) {
	logger.info(
		"validateURL() executed for request by user " +
			user +
			" on product URL: " +
			productURL
	);
	if (productURL.includes("amazon")) {
		return true;
	}

	return false;
}

async function checkIfProductExists(user, productURL) {
	logger.info(
		"checkIfProductExists() executed for request by user " +
			user +
			" on product URL: " +
			productURL
	);
	const userDocRef = db.collection("users").doc(user);
	const userDoc = await userDocRef.get();
	const userProducts = userDoc.get("products");

	for (const product of userProducts) {
		if (product.productURL === productURL) {
			return true;
		}
	}
	return false;
}

async function removeProduct(user, productURL) {
	logger.info(
		"removeProduct() executed for request by user " +
			user +
			" and product URL: " +
			productURL
	);
	const userDocRef = db.collection("users").doc(user);
	const userDoc = await userDocRef.get();
	const userProducts = userDoc.get("products");
	for (let index = 0; index < userProducts.length; index++) {
		const product = userProducts[index];
		if (product.productURL === productURL) {
			userProducts.splice(index, 1);
			await userDocRef.update({ products: userProducts });
			return;
		}
	}
}

module.exports = {
	showUserProducts,
	checkIfProductsExist,
	removeAllProducts,
	addProductToUser,
	validateURL,
	checkIfProductExists,
	removeProduct
};
