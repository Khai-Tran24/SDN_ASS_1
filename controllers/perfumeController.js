const perfume = require("../models/perfume");
const brand = require("../models/brand");
const comment = require("../models/comment");
const { validationResult } = require("express-validator");

// Render Home Page
const renderHome = async (req, res) => {
  try {
    const selectedBrand = req.query.selectedBrand || "";

    const [perfumes, brands] = await Promise.all([
      perfume.find().populate("brand"),
      brand.find(),
    ]);
    res.render("home", { perfumes, brands, selectedBrand });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

// CRUD perfumes
const getPerfumeDetail = async (req, res) => {
  try {
    const perfumeDetail = await perfume
      .findById(req.params.id)
      .populate("brand")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name",
        },
      });
    res.render("detail", { perfume: perfumeDetail });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

const getAllPerfumes = async (req, res) => {
  try {
    const perfumes = await perfume.find().populate("brand");
    res.json(perfumes);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

const createPerfume = async (req, res) => {
  const errors = validationResult(req);
  try {
    const newPerfume = new perfume(req.body);
    await newPerfume.save();

    const [perfumes, brands] = await Promise.all([
      perfume.find().populate("brand"),
      brand.find(),
    ]);
    res.render("perfume-manager", { perfumes, brands });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

const updatePerfume = async (req, res) => {
  const errors = validationResult(req);
  try {
    const updatedPerfume = await perfume.findByIdAndUpdate(
      req.params.id,
      req.body
    );

    const [perfumes, brands] = await Promise.all([
      perfume.find().populate("brand"),
      brand.find(),
    ]);
    res.render("perfume-manager", { perfumes, brands });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

const deletePerfume = async (req, res) => {
  try {
    const deletedPerfume = await perfume.findByIdAndDelete(req.params.id);
    const deleteComment = await comment.deleteMany({
      _id: { $in: deletedPerfume.comments },
    });

    const [perfumes, brands] = await Promise.all([
      perfume.find().populate("brand"),
      brand.find(),
    ]);
    res.render("perfume-manager", { perfumes, brands });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

// Search and Filter perfumes
const searchPerfume = async (req, res) => {
  const query = req.query.query;
  const selectedBrand = req.query.selectedBrand || "";

  if (!query) {
    return res.redirect("/");
  }

  const searchRegex = new RegExp("\\b" + query + "\\b", "i");

  try {
    const perfumes = await perfume
      .find({
        perfumeName: searchRegex,
      })
      .populate("brand");

    const brands = await brand.find();

    res.render("home", {
      perfumes,
      query,
      brands,
      selectedBrand,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const filterPerfumeByBrand = async (req, res) => {
  try {
    const selectedBrand = req.query.selectedBrand || "";
    const perfumeQuery = selectedBrand !== "" ? { brand: selectedBrand } : {};

    const [perfumes, brands] = await Promise.all([
      perfume.find(perfumeQuery).populate("brand"),
      brand.find(),
    ]);

    res.render("home", { perfumes, brands, selectedBrand });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

// Handle comments perfumes
const addComment = async (req, res) => {
  try {
    const perfumeDetail = await perfume
      .findById(req.params.id)
      .populate("brand")
      .populate("comments");

    if (perfumeDetail.comments.length > 0) {
      const isCommented = perfumeDetail.comments.some(
        (comment) => comment.author.toString() === req.user._id.toString()
      );

      if (isCommented) {
        return res.render("detail", { perfume: perfumeDetail });
      }
    }

    const newComment = new comment(req.body);
    newComment.author = req.user._id;
    await newComment.save();

    perfumeDetail.comments.push(newComment);
    await perfumeDetail.save();

    res.render("detail", { perfume: perfumeDetail });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

// Handle perfumes manager

const getPerfumeManager = async (req, res) => {
  try {
    const [perfumes, brands] = await Promise.all([
      perfume.find().populate("brand"),
      brand.find(),
    ]);
    res.render("perfume-manager", { perfumes, brands });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

module.exports = {
  createPerfume,
  renderHome,
  getPerfumeDetail,
  updatePerfume,
  deletePerfume,
  searchPerfume,
  filterPerfumeByBrand,
  addComment,
  getAllPerfumes,
  getPerfumeManager,
};
