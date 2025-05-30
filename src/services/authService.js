import axios from "axios";
// import { API_BASE_URL } from "../utils/api";
const API_BASE_URL = "https://ai-smart-notes-backend.onrender.com/";
// Register user
export const registerUser = async (userData) => {
  const response = await axios.post(
    `${API_BASE_URL}api/auth/register`,
    userData
  );
  return response.data;
};

// Login user
export const loginUser = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}api/auth/login`, userData);
  return response.data;
};
