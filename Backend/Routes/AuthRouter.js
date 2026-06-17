const { Signup, Login, DashboardStats } = require("../Controllers/AuthController");
const { userVerification } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();

router.post("/signup",Signup);
router.post('/login',Login);
router.post('/dashboard',userVerification);
router.get("/dashboard-stats/:username", DashboardStats);

module.exports = router;