import { createUser, verifyAccountCreation,userLogin, userLogout, forgotPassword, resetPassword, getSingleUser, userDetail, updatePassword, updateUserProfile, getAllusers, updateUserRole, deleteUser } from "../controllers/userController.js";
import express from "express"
import { authorizedRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router=express.Router();

router.post("/register",createUser);

router.get("/register/verification/:token",verifyAccountCreation)

router.post("/login",userLogin)

router.get("/logout",userLogout);

router.post("/password/forgot",forgotPassword);

router.post("/password/reset/:resetPassToken",resetPassword);

router.get("/me",isAuthenticatedUser,userDetail);

router.put("/password/update",isAuthenticatedUser,updatePassword);

router.put("/me/update",isAuthenticatedUser,updateUserProfile);

router.get("/admin/users",isAuthenticatedUser,authorizedRoles("admin"),getAllusers);

router.get("/admin/user/:id",isAuthenticatedUser,authorizedRoles("admin"),getSingleUser).put("/admin/user/:id",isAuthenticatedUser,authorizedRoles("admin"),updateUserRole).delete("/admin/user/:id",isAuthenticatedUser,authorizedRoles("admin"),deleteUser);

export default router;