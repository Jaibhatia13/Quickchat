import User from "../models/User.js";
import jwt from "jsonwebtoken";

//Middelware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.log("hi", error.message);
    res.json({ success: false, message: error.message });
  }
};
// export const protectRoute = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token =
//       authHeader && authHeader.startsWith("Bearer ")
//         ? authHeader.split(" ")[1]
//         : null;

//     if (!token) {
//       return res
//         .status(401)
//         .json({ success: false, message: "No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId).select("-password");

//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });

//     req.user = user;
//     next();
//   } catch (error) {
//     console.log("Error in protectRoute:", error.message);
//     res.status(401).json({ success: false, message: error.message });
//   }
// };
