import Order from "../models/orderModel.js";
import Product from "../models/productModel.js"
import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "express-async-errors"

// create new order

const newOrder=async(req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    }=req.body;

    const order=await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        user:req.user._id
    });

    res.status(201).json({
        success:true,
        order
    })
}

// get Single order

const getSingleOrder= async(req,res,next)=>{
    
    const orderId=req.params.id;
    const order=await Order.findById(orderId);

    if(!order)
    {
        return next(new ErrorHandler(400,"Order Id is invalid"));
    }

    order.populate('user',"name email");

    res.status(200).json({
        success:true,
        order
    })
}

// get logged in user orders

const myOrders=async(req,res,next)=>{
    const orders=await Order.find({user:req.user._id});

    res.status(200).json({
        success:true,
        orders
    })
}

// get all orders - Admin path

const getAllOrders=async(req,res,next)=>{
    const orders=await Order.find();

    let totalAmount=0;

    orders.forEach((order)=>{
        totalAmount+=order.totalPrice;
    })
    res.status(200).json({
        success:true,
        orders,
        totalAmount
    })
}

// update Order Status - Admin

const updateOrder=async(req,res,next)=>{
    const order=await Order.findOne({_id:req.params.id}); // earlier I was simply using Order.find() and it was giving an array, which resulted in issues

    if(!order)
    {
        return next(new ErrorHandler(400,"Invalid order id"));
    }

    if(order.orderStatus=="Delivered")
    {
        return next(new ErrorHandler(400,"Order already delivered"));
    }
    if(order.orderStatus=="Shipped")
    {
        return next(new ErrorHandler(400,"Order already shipped"));
    }

    if(req.body.status=="Shipped")
    {
        let items=order.orderItems;
        items.forEach(async (item)=>{
            await updateStock(item.product,item.quantity)
        })
    }

    order.orderStatus=req.body.status;


    await order.save();

    res.status(200).json({
        success:true,
    })
}

const updateStock=async (productId,quantity)=>{
    const product=await Product.findById(productId);
    product.stock-=quantity;

    await product.save();
}

// Delete Order - Admin

const deleteOrder=async(req,res,next)=>{
    const order=await Order.findById(req.params.id);

    if(!order)
    {
        return next(new ErrorHandler(404,"Invalid Order Id"));
    }

    await Order.deleteOne({_id:req.params.id});

    res.status(200).json({
        success:true,
        order
    })

}

export {newOrder,getAllOrders,getSingleOrder,deleteOrder,updateOrder,myOrders}