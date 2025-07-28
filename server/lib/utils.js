import jwt from "jsonwebtoken";

//Function to generate a token for a User

export const generateToken = (userID) => {
  const token = jwt.sign({ userID }, process.env.JWT_SECRET);
  return token;
};
