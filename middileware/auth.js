const jwt = require("jsonwebtoken");
//TODO: For real application, should keep this secret an actual secret
//using environment variables or some other method and make sure you
//DO NOT commit it to version control if you happen to be using git
const secret = "This is a secret String";

//This middleware function will look for the token in the request body,
//query string, headers, or cookies in that order and then validate it.
const withAuth = function(req, res, next) {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.cookies.token;
  if (!token) {
    res.status(401).send("Unauthorized: No token provided");
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        res.status(401).send("Unauthorized: Invalid token");
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};

module.exports = withAuth;
