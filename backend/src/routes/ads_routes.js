const express = require("express");
const { 
    getAds, 
    getAdsById 
} = require("../controllers/ads_controller.js");


const router = express.Router();

router.get("/", getAds);

router.get("/:id", getAdsById);

module.exports = router;