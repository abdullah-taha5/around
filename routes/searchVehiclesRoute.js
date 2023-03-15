const router = require("express").Router();
const { searchVehicles } = require("../controllers/searchVehicleController");

// /api/vehicles
router.get("/", searchVehicles);

module.exports = router;
