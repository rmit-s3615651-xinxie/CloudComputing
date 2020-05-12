/**
 * dev-server - serves static resources for developing "earth" locally
 */

"use strict";

console.log("============================================================");
console.log(new Date().toISOString() + " - Starting");

var util = require("util");

/**
 * Returns true if the response should be compressed.
 */
function compressionFilter(req, res) {
  return /json|text|javascript|font/.test(res.getHeader("Content-Type"));
}

/**
 * Adds headers to a response to enable caching.
 */
function cacheControl() {
  return function(req, res, next) {
    res.setHeader("Cache-Control", "public, max-age=300");
    return next();
  };
}

function logger() {
  express.logger.token("date", function() {
    return new Date().toISOString();
  });
  express.logger.token("response-all", function(req, res) {
    return (res._header ? res._header : "").trim();
  });
  express.logger.token("request-all", function(req, res) {
    return util.inspect(req.headers);
  });
  return express.logger(
    ":date - info: :remote-addr :req[cf-connecting-ip] :req[cf-ipcountry] :method :url HTTP/:http-version " +
      '":user-agent" :referrer :req[cf-ray] :req[accept-encoding]\\n:request-all\\n\\n:response-all\\n'
  );
}

var port = process.argv[2];
var express = require("express");
var app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
var compression = require("compression");
var morgan = require("morgan");
var withAuth = require("./middileware/auth");
app.use(cacheControl());
app.use(compression({ filter: compressionFilter }));
app.use(morgan("dev"));
app.use(express.static("views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use(cors({
  origin: 'http://s3615651.mywire.org:8080'
}));

// ===================
//    Models & DB
// ===================
const url =
    "mongodb://developer:developer_password@cluster0-2hg4p.mongodb.net/cloudcomputing";
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.log(err));

// ====================
//       Routers
// ====================
const user = require("./routes/user");
const earth = require("./routes/earth");

app.use("/earth", earth);
app.use("/users", user);
//app.get("/", (req, res) => res.redirect("/landing.html"));
app.get("*", (req, res) => res.sendStatus(404));

app.listen(port);
console.log("Listening on port " + port + "...");
