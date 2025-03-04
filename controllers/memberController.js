const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const member = require("../models/member");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

// Register controller
const register = async (req, res) => {
  try {
    res.render("register", { errorMessages: [], formData: {} });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

const signUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("register", {
        errorMessages: errors.array(),
        formData: req.body,
      });
    }

    const newMember = new member(req.body);
    bcrypt.hash(newMember.password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      newMember.password = hash;
      newMember
        .save()
        .then((user) => {
          res.redirect("/login");
        })
        .catch(next);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    res.render("login", { errorMessages: [], formData: {} });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await member.findOne({ email });

    if (!user) {
      return res.render("login", {
        errorMessages: [{ msg: "Invalid email or password" }],
        formData: req.body,
      });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect("/");
      } else {
        res.render("login", {
          errorMessages: [{ msg: "Invalid email or password" }],
          formData: req.body,
        });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout controller
const logout = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.redirect("/login");
};

// Render Profile
const getUserProfile = async (req, res) => {
  try {
    const oldProfileData = await member.findById(req.user._id);

    res.render("profile", {
      errorMessages: [],
      formData: oldProfileData,
      successMessage: "",
    });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

// CRUD controllers
const getAllMembers = async (req, res) => {
  try {
    const members = await member.find();
    res.render("collectors", { collectors: members });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

const updateMember = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const userData = await member.findById(req.params.id);
      return res.render("profile", {
        formData: userData,
        errorMessages: errors.array(),
        successMessage: "",
      });
    }

    const { currentPassword, newPassword, confirmPassword, ...updateData } =
      req.body;

    if (currentPassword && newPassword) {
      const currentUser = await member.findById(req.params.id);
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );

      if (!passwordMatch) {
        const userData = await member.findById(req.params.id);
        return res.render("profile", {
          formData: userData,
          errorMessages: [{ msg: "Current password is incorrect" }],
          successMessage: "",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    const updatedMember = await member.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    return res.render("profile", {
      formData: updatedMember,
      successMessage: "Profile updated successfully",
      errorMessages: [],
    });
  } catch (error) {
    console.error("Update error:", error);

    const userData = await member.findById(req.params.id);
    return res.render("profile", {
      formData: userData,
      errorMessages: [{ msg: "An error occurred while updating your profile" }],
      successMessage: "",
    });
  }
};

const deleteMember = async (req, res) => {
  try {
    const deletedMember = await member.findByIdAndDelete(req.params.id);
    res.json(deletedMember);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

module.exports = {
  signUp,
  register,
  login,
  signIn,
  updateMember,
  deleteMember,
  logout,
  getUserProfile,
  getAllMembers,
};
