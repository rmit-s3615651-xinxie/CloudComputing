const express = require("express");
const router = express.Router();
const withAuth = require("../middileware/auth");

router.get("/", withAuth, (req, res) => res.render("earth.html"));

module.exports = router;
