import express from "express"
// import { uploadStorage } from "../middlewares/multer.js";

const router=express.Router();

import {getAllProducts,createProduct,updateProduct,deleteProduct,getProductDetails, getAdminProducts, createProductReview, getProductReviews, deleteReview} from  '../controllers/productController.js';
import { isAuthenticatedUser,authorizedRoles } from "../middlewares/auth.js";

router.get('/products',getAllProducts);
router.post('/admin/products/new',isAuthenticatedUser,authorizedRoles("admin"),createProduct);
router.put('/admin/products/:id',isAuthenticatedUser,authorizedRoles("admin"),updateProduct);
router.delete('/admin/products/:id',isAuthenticatedUser,authorizedRoles("admin"),deleteProduct);
router.get('/product/:id',getProductDetails);
router.get("/admin/products",isAuthenticatedUser,authorizedRoles("admin"),getAdminProducts);
router.post("/review",isAuthenticatedUser,createProductReview);
router.get("/reviews",getProductReviews);
router.delete("/reviews",isAuthenticatedUser,deleteReview);
export default router;