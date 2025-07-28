// import { createContext, useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { io } from "socket.io-client";

// const backendUrl = import.meta.env.VITE_BACKEND_URL;
// axios.defaults.baseURL = backendUrl; // made change here

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [authUser, setAuthUser] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [socket, setSocket] = useState(null);

//   // check if user is authenticated and if so, set the user data and connect the socket

//   const checkAuth = async () => {
//     try {
//       const { data } = await axios.get("/api/auth/check");
//       if (data.success) {
//         setAuthUser(data.user);
//         connectSocket(data.user);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Login function to handle user authentication and socket connection

//   const login = async (state, credentials) => {
//     try {
//       const { data } = await axios.post(`/api/auth/${state}`, credentials);
//       if (data.success) {
//         setAuthUser(data.userData);
//         connectSocket(data.userData);
//         axios.defaults.headers.common["token"] = data.token;

//         setToken(data.token);
//         localStorage.setItem("token", data.token);
//         toast.success(data.message);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       // console.log(error.message);
//       toast.error(error.message);
//     }
//   };

//   // logout function to handle user logout and socket disconnection

//   const logout = async () => {
//     localStorage.removeItem("token");
//     setToken(null);
//     setAuthUser(null);
//     setOnlineUsers([]);
//     axios.defaults.headers.common["token"] = null;
//     toast.success("Logged out successfully");
//     socket.disconnect();
//   };

//   // update profile function to handle user profile updates;

//   const updateProfile = async (body) => {
//     try {
//       const { data } = await axios.put("/api/auth/update-profile", body);
//       if (data.success) {
//         setAuthUser(data.user);
//         toast.success("Profile Updated Successfully");
//       }
//     } catch (error) {
//       console.log(error.message);
//       toast.error(error.message);
//     }
//   };

//   // connect socket function to handle socket connection and online users updates
//   const connectSocket = (userData) => {
//     if (!userData || socket?.connected) return;

//     const newSocket = io(backendUrl, {
//       query: {
//         userId: userData._id,
//       },
//     });
//     newSocket.connect();
//     setSocket(newSocket);

//     newSocket.on("getOnlineUsers", (userIds) => {
//       setOnlineUsers(userIds);
//     });
//   };

//   useEffect(() => {
//     if (token) {
//       axios.defaults.headers.common["token"] = token;
//     }
//     checkAuth();
//   }, []);

//   const value = {
//     axios,
//     authUser,
//     onlineUsers,
//     socket,
//     login,
//     logout,
//     updateProfile,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

// Interceptor to attach token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token;
  }
  return config;
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      console.log("Auth check response:", data);
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Auth check error:", error.message);
    }
  };

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);

        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["token"] = data.token;

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    if (socket) socket.disconnect();
    toast.success("Logged out successfully");
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile Updated Successfully");
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    }
  };

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("Online users received:", userIds);
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      console.log("Token applied from localStorage:", token);
    }
    checkAuth();
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
