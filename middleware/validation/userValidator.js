const { body } = require("express-validator");
const member = require("../../models/member");

const validateSignUp = [
  body("name").notEmpty().withMessage("Full Name is required"),
  body("email")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const existingUser = await member.findOne({ email: value });
      if (existingUser) {
        throw new Error("User already exists");
      }
      return true;
    }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("passwordConfirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  body("YOB")
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("Invalid year of birth"),
  body("gender").notEmpty().withMessage("Gender is required"),
  body("termsAccepted")
    .equals("on")
    .withMessage("You must accept the terms and conditions"),
];

const validateSignIn = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password is required"),
];

const validateUpdateProfile = [
  body("name").notEmpty().withMessage("Full Name is required"),
  body("email")
    .isEmail()
    .withMessage("Invalid email address"),
  body("YOB")
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("Invalid year of birth"),
  body("gender").notEmpty().withMessage("Gender is required"),
];

module.exports = {
  validateSignUp,
  validateSignIn,
  validateUpdateProfile,
};
