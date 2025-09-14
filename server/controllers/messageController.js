// import Message from "../models/Message.js";
// import User from "../models/User.js";
// import cloudinary from "../lib/cloudinary.js";
// import { io, userSocketMap } from "../server.js";

// // Get all user expect the logged in user

// export const getUserForSidebar = async (req, res) => {
//   try {
//     const userID = req.user._id;
//     const filterUsers = await User.find({ _id: { $ne: userID } }).select(
//       "-password"
//     );

//     //count number of messages not seen
//     const unseenMessages = {};
//     const promises = filterUsers.map(async (user) => {
//       const messages = await Message.find({
//         senderId: user._id,
//         receiverId: userID,
//         seen: false,
//       });

//       if (messages.length > 0) {
//         unseenMessages[user._id] = messages.length;
//       }
//     });
//     await Promise.all(promises);
//     res.json({ success: true, users: filterUsers, unseenMessages });
//   } catch (error) {
//     console.log("Error in getUserForSidebar", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get all messages for the selected user

// export const getMessages = async (req, res) => {
//   try {
//     const { id: selectedUserId } = req.params;
//     const myId = req.user._id;

//     const messages = await Message.find({
//       $or: [
//         { senderId: myId, receiverId: selectedUserId },
//         { senderId: selectedUserId, receiverId: myId },
//       ],
//     });

//     await Message.updateMany(
//       { senderId: selectedUserId, receiverId: myId },
//       { seen: true }
//     );
//     res.json({ success: true, messages });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // api to mark message as seen using message id

// export const markMessageAsSeen = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Message.findByIdAndUpdate(id, { seen: true });
//     res.json({ success: true });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Send message to selected user

// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image } = req.body;

//     const receiverId = req.params.id;
//     const senderId = req.user._id;

//     let imageUrl;
//     if (image) {
//       const uploadResponse = await cloudinary.uploader.upload(image);
//       imageUrl = uploadResponse.secure_url;
//     }

//     const newMessage = await Message.create({
//       senderId,
//       receiverId,
//       text,
//       image: imageUrl,
//     });

//     // Emit the new message to the receiver's socket
//     const receiverSocketId = userSocketMap[receiverId];
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", newMessage);
//     }

//     res.json({ success: true, newMessage });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get all users except the logged-in user
export const getUserForSidebar = async (req, res) => {
  try {
    const userID = req.user._id;

    const filterUsers = await User.find({ _id: { $ne: userID } }).select(
      "-password"
    );
    console.log("Filtered Users:", filterUsers);
    console.log("User ID:", userID);

    if (!filterUsers || filterUsers.length === 0) {
      return res
        .status(200)
        .json({ success: true, users: [], unseenMessages: {} });
    }

    const unseenMessages = {};
    const promises = filterUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userID,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    res.status(200).json({ success: true, users: filterUsers, unseenMessages });
  } catch (error) {
    console.error("Error in getUserForSidebar:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in markMessageAsSeen:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json({ success: true, newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
