const express = require("express");
const perfumeAPI = require("../controllers/perfumeController");
const {
  optionalAuthCheck,
  populateUserInfo,
  authenticateCookie,
  authorizeRoles,
} = require("../middleware/service/authMiddleware");
const {
  validateCommentPerfume,
  validatePerfume,
} = require("../middleware/validation/perfumeValidator");

const router = express.Router();

router
  .route("/")
  .get(
    authenticateCookie,
    populateUserInfo,
    authorizeRoles(["admin"]),
    perfumeAPI.getAllPerfumes
  )
  .post(
    authenticateCookie,
    populateUserInfo,
    authorizeRoles(["admin"]),
    validatePerfume,
    perfumeAPI.createPerfume
  );

router
  .route("/:id")
  .get(optionalAuthCheck, populateUserInfo, perfumeAPI.getPerfumeDetail)
  .post(
    authenticateCookie,
    populateUserInfo,
    authorizeRoles(["admin"]),
    validatePerfume,
    perfumeAPI.updatePerfume
  );

router
  .route("/:id/delete")
  .post(
    authenticateCookie,
    populateUserInfo,
    authorizeRoles(["admin"]),
    perfumeAPI.deletePerfume
  );

router
  .route("/:id/comment")
  .post(
    authenticateCookie,
    populateUserInfo,
    validateCommentPerfume,
    perfumeAPI.addComment
  );

module.exports = router;
