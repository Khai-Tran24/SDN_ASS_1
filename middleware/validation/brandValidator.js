const { body } = require("express-validator");
const brand = require("../../models/brand");

const validateBrand = [
  body("brandName")
    .notEmpty()
    .withMessage("Content is required")
    .custom(async (value) => {
      const existingBrand = await brand.find({ brandName: value });
      if (existingBrand) {
        throw new Error("Brand already exists");
      }

      return true;
    }),
];

module.exports = {
  validateBrand,
};
