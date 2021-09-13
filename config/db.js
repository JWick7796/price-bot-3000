const admin = require("firebase-admin");
const serviceAccount = require("../price-tracker-bot-firebase-adminsdk-dfndr-4a8a16ab04.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

module.exports = db;
