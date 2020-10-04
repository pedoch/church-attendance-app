const jwt = require('jsonwebtoken');

let jwtSecret = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ errors: [{ message: "Not Authenticated" }]});
	}

	const token = authHeader.split(' ')[1];
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, jwtSecret);
	} catch (err) {
		err.statusCode = 500;
		throw err;
	}

	if (!decodedToken) {
		return res.status(401).json({ errors: [{ message: "Not Authenticated" }]});
	}

	req.userId = decodedToken.userId;
	return true
};
