const { body } = require("express-validator");

const validateCommentPerfume = [
  body("content").notEmpty().withMessage("Content is required"),
  body("rating").isInt({ min: 1, max: 3 }).withMessage("Invalid rating"),
];

const validatePerfume = [
  body("perfumeName").notEmpty().withMessage("Perfume name is required."),
  body("uri").notEmpty().withMessage("URI is required."),
  body("price")
    .isNumeric()
    .withMessage("Price must be a number.")
    .notEmpty()
    .withMessage("Price is required."),
  body("concentration").notEmpty().withMessage("Concentration is required."),
  body("description").notEmpty().withMessage("Description is required."),
  body("ingredients").notEmpty().withMessage("Ingredients are required."),
  body("volume")
    .isNumeric()
    .withMessage("Volume must be a number.")
    .notEmpty()
    .withMessage("Volume is required."),
  body("targetAudience").notEmpty().withMessage("Target audience is required."),
  body("brand")
    .notEmpty()
    .withMessage("Brand is required.")
    .isMongoId()
    .withMessage("Brand must be a valid ObjectId."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateCommentPerfume,
  validatePerfume,
};
