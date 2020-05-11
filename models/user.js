const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");

// the cost factor
const saltRounds = 10;

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true, // RegExp for email address
    match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  },
  password: { type: String, required: true }
});

userSchema.pre("save", function(next) {
  // Check if document is new or a new password has been set
  if (this.isNew || this.isModified("password")) {
    // Saving reference to this because of changing scopes
    const document = this;
    bcrypt.hash(document.password, saltRounds, function(err, hashedPassword) {
      if (err) {
        next(err);
      } else {
        document.password = hashedPassword;
        next();
      }
    });
  } else {
    next();
  }
});
userSchema.methods.isCorrectPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, same) {
    if (err) {
      callback(err);
    } else {
      callback(err, same);
    }
  });
};
function validateRegister(user) {
  const schema = {
    firstName: Joi.string()
      .min(1)
      .max(100)
      .required(),
    lastName: Joi.string()
      .min(1)
      .max(100)
      .required(),
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{3,30}$/)
      .required()
  };

  return Joi.validate(user, schema);
}

function validateChange(user) {
  const schema = {
    firstName: Joi.string()
      .min(1)
      .max(100),
    lastName: Joi.string()
      .min(1)
      .max(100)
  };

  return Joi.validate(user, schema);
}

exports.User = mongoose.model("User", userSchema);
exports.validateRegister = validateRegister;
exports.validateChange = validateChange;
