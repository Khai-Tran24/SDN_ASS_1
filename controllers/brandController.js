const { validationResult } = require("express-validator");
const brand = require("../models/brand");
const perfume = require("../models/perfume");

const getAllBrands = async (req, res) => {
  try {
    const brands = await brand.find();
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

const getBrand = async (req, res) => {
  try {
    const oneBrand = await brand.findById(req.params.id);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};
const createBrand = async (req, res) => {
  const validationErrors = validationResult(req);
  try {
    if (!validationErrors.isEmpty()) {
      const brands = await brand.find();
      return res.render("brand-manager", {
        brands: brands,
        errorMessages: validationErrors.array(),
        successMessage: "",
      });
    }

    const newBrand = new brand(req.body);
    await newBrand.save();

    const brands = await brand.find();
    res.render("brand-manager", { brands: brands });
  } catch (error) {
    console.log(validationErrors);
    res.status(400).json("Error: " + error);
  }
};
const updateBrand = async (req, res) => {
  const validationErrors = validationResult(req);
  try {
    if (!validationErrors.isEmpty()) {
      const brands = await brand.find();
      return res.render("brand-manager", {
        brands: brands,
        errorMessages: validationErrors.array(),
        successMessage: "",
      });
    }

    await brand.findByIdAndUpdate(req.params.id, {
      brandName: req.body.brandName,
    });

    const brands = await brand.find();
    res.render("brand-manager", { brands: brands });
  } catch (error) {
    console.log(validationErrors);
    res.status(400).json("Error: " + error);
  }
};

const deleteBrand = async (req, res) => {
  try {
    const checkPerfume = await perfume.find({ brand: req.params.id });
    if (checkPerfume.length > 0) {
      const brands = await brand.find();
      return res.render("brand-manager", {
        brands: brands,
      });
    }
    await brand.findByIdAndDelete(req.params.id);

    const brands = await brand.find();
    res.render("brand-manager", { brands: brands });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

// handle brands manager

const getBrandManager = async (req, res) => {
  try {
    const brands = await brand.find();
    res.render("brand-manager", { brands: brands });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
};

module.exports = {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  getBrandManager,
};
