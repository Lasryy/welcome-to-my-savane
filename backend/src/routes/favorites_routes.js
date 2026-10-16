const express = require("express");
const { getFavorites, addFavorite, removeFavorite } = require("../controllers/favorites_controller");

const router = express.Router();

router.get("/", getFavorites);
router.put("/:adId", addFavorite);
router.delete("/:adId", removeFavorite);

module.exports = router;
