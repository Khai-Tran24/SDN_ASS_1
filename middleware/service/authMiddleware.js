const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../../utils/jwt");
const member = require("../../models/member");

// Check if user is authenticated using cookies
const authenticateCookie = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.redirect("/login");
  }

  jwt.verify(accessToken, process.env.SECRET_TOKEN, (err, user) => {
    if (!err) {
      req.user = user;
      return next();
    }

    if (!refreshToken) {
      return res.redirect("/login");
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN,
      async (refreshErr, userData) => {
        if (refreshErr) {
          res.clearCookie("accessToken");
          res.clearCookie("refreshToken");
          return res.redirect("/login");
        }

        try {
          const currentUser = await member.findById(userData._id);

          if (!currentUser) {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return res.redirect("/login");
          }

          const newAccessToken = generateAccessToken(currentUser);

          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
          });

          req.user = {
            _id: currentUser._id,
            isAdmin: currentUser.isAdmin,
            name: currentUser.name,
          };

          next();
        } catch (error) {
          console.error("Token refresh error:", error);
          res.clearCookie("accessToken");
          res.clearCookie("refreshToken");
          return res.redirect("/login");
        }
      }
    );
  });
};

// Role-based middleware
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect("/login");
    }

    if (req.user.isAdmin && roles.includes("admin")) {
      return next();
    }

    if (!req.user.isAdmin && roles.includes("user")) {
      return next();
    }

    return res.redirect("/");
  };
};

// Middleware to add user info to all views
const populateUserInfo = (req, res, next) => {
  if (req.user) {
    res.locals.user = {
      name: req.user.name,
      isAdmin: req.user.isAdmin,
      isAuthenticated: true,
    };
  } else {
    res.locals.user = {
      isAuthenticated: false,
    };
  }
  next();
};

// Prevent accessing routes when already logged in (e.g., login, register pages)
const preventLoggedInAccess = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (accessToken) {
    try {
      jwt.verify(accessToken, process.env.SECRET_TOKEN);
      return res.redirect("/");
    } catch (err) {}
  }
  next();
};

// Optional authentication - checks for valid tokens but doesn't redirect if none found
const optionalAuthCheck = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    return next();
  }

  jwt.verify(accessToken, process.env.SECRET_TOKEN, (err, user) => {
    if (!err) {
      req.user = user;
      return next();
    }

    if (!refreshToken) {
      return next();
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN,
      async (refreshErr, userData) => {
        if (refreshErr) {
          return next();
        }

        try {
          const currentUser = await member.findById(userData._id);

          if (!currentUser) {
            return next();
          }

          const newAccessToken = generateAccessToken(currentUser);

          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
          });

          req.user = {
            _id: currentUser._id,
            isAdmin: currentUser.isAdmin,
            name: currentUser.name,
          };

          next();
        } catch (error) {
          console.error("Token refresh error:", error);
          next();
        }
      }
    );
  });
};

module.exports = {
  authenticateCookie,
  authorizeRoles,
  populateUserInfo,
  preventLoggedInAccess,
  optionalAuthCheck,
};
