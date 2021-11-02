const router = require('express').Router()
const {createUser,login, getUserProfile ,uploadPicture,updateUserProfile} = require('../controller/userController')
const {changePassword} = require("../controller/passwordController")
const {isLogin , authorize} =require('../middleware/auth')
const { upload } = require('../middleware/uploadfile')
const {registerValidate , loginValidate,changePasswordValidate,updateProfileValidate} = require("../middleware/validation/userValidation")
const timeout = require('connect-timeout')


router.get("/",isLogin,getUserProfile)
router.post("/register",registerValidate,createUser)
router.post("/login",loginValidate,login)
router.post("/updatePicture",timeout("30s"),isLogin,upload,uploadPicture)
router.patch("/profile",isLogin,updateProfileValidate,updateUserProfile)
router.patch("/",isLogin,changePassword)


module.exports = router