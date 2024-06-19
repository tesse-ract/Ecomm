import express from "express"
import { deleteOrder, getAllOrders, getSingleOrder, myOrders, newOrder, updateOrder } from "../controllers/orderController.js";
import { authorizedRoles, isAuthenticatedUser } from "../middlewares/auth.js";


const router=express.Router();

router.post("/order/new",isAuthenticatedUser, newOrder);
router.get("/order/:id",isAuthenticatedUser,getSingleOrder);
router.get("/orders/me",isAuthenticatedUser,myOrders);
router.get("/admin/orders",isAuthenticatedUser,authorizedRoles("admin"),getAllOrders);
router.put("/admin/order/:id",isAuthenticatedUser,authorizedRoles("admin"),updateOrder);
router.delete("/admin/order/:id",isAuthenticatedUser,authorizedRoles("admin"),deleteOrder);

export default router;