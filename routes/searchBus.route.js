const router = require('express').Router();

const {
    searchSchedule,
    searchShuttle
} = require('../controller/searchBusController');
const { findBusSchedule} = require("../controller/busScheduleController")

router.get("/", searchSchedule);
router.get("/shuttle",searchShuttle)
router.get("/bus",findBusSchedule)


module.exports = router
