const express = require("express");
const brandAPI = require("../controllers/brandController");
const {
  authenticateCookie,
  populateUserInfo,
  authorizeRoles,
} = require("../middleware/service/authMiddleware");
const { validateBrand } = require("../middleware/validation/brandValidator");

const router = express.Router();

router
  .route("/")
  .get(brandAPI.getAllBrands)
  .post(
    authenticateCookie,
    populateUserInfo,
    authorizeRoles(["admin"]),
    validateBrand,
    brandAPI.createBrand
  );

router
  .route("/:id")
  .post(
    authenticateCookie,
    populateUserInfo,
    authorizeRoles(["admin"]),
    validateBrand,
    brandAPI.updateBrand
  );

router.post(
  "/:id/delete",
  authenticateCookie,
  populateUserInfo,
  authorizeRoles(["admin"]),
  brandAPI.deleteBrand
);

module.exports = router;
