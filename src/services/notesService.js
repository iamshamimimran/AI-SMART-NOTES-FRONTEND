import axios from "axios";
const API_BASE_URL = "https://ai-smart-notes-backend.onrender.com/";
// Create a note
export const createNote = async (noteData, token) => {
  const config = {
    headers: {
      "x-auth-token": token,
    },
  };
  const response = await axios.post(
    `${API_BASE_URL}api/notes`,
    noteData,
    config
  );
  return response.data;
};

// Get all notes
export const getNotes = async (token) => {
  const config = {
    headers: {
      "x-auth-token": token,
    },
  };
  const response = await axios.get(`${API_BASE_URL}api/notes`, config);
  return response.data;
};

// Update a note
export const updateNote = async (id, noteData, token) => {
  const config = {
    headers: {
      "x-auth-token": token,
    },
  };
  const response = await axios.put(
    `${API_BASE_URL}api/notes/${id}`,
    noteData,
    config
  );
  return response.data;
};

// Delete a note
export const deleteNote = async (id, token) => {
  const config = {
    headers: {
      "x-auth-token": token,
    },
  };
  await axios.delete(`${API_BASE_URL}api/notes/${id}`, config);
  return id;
};

// Summarize text
export const summarizeText = async (text, token) => {
  const config = {
    headers: {
      "x-auth-token": token,
    },
  };
  const response = await axios.post(
    `${API_BASE_URL}api/ai/summarize`,
    { text },
    config
  );
  return response.data;
};

// Generate flashcards
export const generateFlashcards = async (text, token) => {
  const config = {
    headers: {
      "x-auth-token": token,
    },
  };
  const response = await axios.post(
    `${API_BASE_URL}api/ai/flashcards`,
    { text },
    config
  );
  return response.data;
};
