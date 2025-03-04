var express = require("express");
const perfumeAPI = require("../controllers/perfumeController");
const memberAPI = require("../controllers/memberController");
const brandAPI = require("../controllers/brandController");
const {
  validateSignUp,
  validateSignIn,
} = require("../middleware/validation/userValidator");
const {
  populateUserInfo,
  preventLoggedInAccess,
  authenticateCookie,
  authorizeRoles,
  optionalAuthCheck,
} = require("../middleware/service/authMiddleware");

var router = express.Router();

// Render Home Page
router.get("/", optionalAuthCheck, populateUserInfo, perfumeAPI.renderHome);

// Search and filter perfume
router.get(
  "/search",
  optionalAuthCheck,
  populateUserInfo,
  perfumeAPI.searchPerfume
);
router.get(
  "/filterByBrand",
  optionalAuthCheck,
  populateUserInfo,
  perfumeAPI.filterPerfumeByBrand
);

//Render Register Page
router
  .route("/register")
  .get(preventLoggedInAccess, populateUserInfo, memberAPI.register)
  .post(validateSignUp, memberAPI.signUp);

//Render Login Page
router
  .route("/login")
  .get(preventLoggedInAccess, populateUserInfo, memberAPI.login)
  .post(validateSignIn, memberAPI.signIn);

// Logout
router.get("/logout", populateUserInfo, memberAPI.logout);

// Protected routes (user only)
router.get(
  "/profile",
  authenticateCookie,
  populateUserInfo,
  authorizeRoles(["user"]),
  memberAPI.getUserProfile
);

// Admin routes
router.get(
  "/admin/brands",
  authenticateCookie,
  populateUserInfo,
  authorizeRoles(["admin"]),
  brandAPI.getBrandManager
);

router.get(
  "/admin/perfumes",
  authenticateCookie,
  populateUserInfo,
  authorizeRoles(["admin"]),
  perfumeAPI.getPerfumeManager
);

// collectors routes

router.get(
  "/collectors",
  authenticateCookie,
  populateUserInfo,
  authorizeRoles(["admin"]),
  memberAPI.getAllMembers
);

module.exports = router;
