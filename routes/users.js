const express = require("express");
const router = express.Router();

const memberAPI = require("../controllers/memberController");
const {
  validateUpdateProfile,
} = require("../middleware/validation/userValidator");
const {
  authenticateCookie,
  populateUserInfo,
} = require("../middleware/service/authMiddleware");

router
  .route("/:id")
  .post(
    authenticateCookie,
    populateUserInfo,
    validateUpdateProfile,
    memberAPI.updateMember
  )
  .delete(authenticateCookie, populateUserInfo, memberAPI.deleteMember);

module.exports = router;
