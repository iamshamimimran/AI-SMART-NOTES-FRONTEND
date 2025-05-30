import { useState, useEffect } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiSave,
  FiX,
  FiZap,
  FiBookmark,
} from "react-icons/fi";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  summarizeText,
} from "../../services/notesService";
import { useNavigate } from "react-router-dom";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: [] });
  const [tagInput, setTagInput] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [error, setError] = useState(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  // Get token from sessionStorage
  const getToken = () => sessionStorage.getItem("token");

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) throw new Error("No authentication token found");

        const notesData = await getNotes(token);
        setNotes(notesData);
        setFilteredNotes(notesData);
      } catch (err) {
        setError("Failed to load notes. Please try again.");
        console.error("Error fetching notes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Filter and search notes
  useEffect(() => {
    let filtered = notes;

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (note.tags &&
            note.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      );
    }

    if (activeFilter !== "all") {
      filtered = filtered.filter(
        (note) => note.tags && note.tags.includes(activeFilter)
      );
    }

    setFilteredNotes(filtered);
  }, [notes, searchQuery, activeFilter]);

  // Create a new note
  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;

    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("No authentication token found");

      const noteData = {
        ...newNote,
        tags: tagInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      const createdNote = await createNote(noteData, token);

      setNotes((prev) => [createdNote, ...prev]);
      setNewNote({ title: "", content: "", tags: [] });
      setTagInput("");
      setShowCreateModal(false);
      setSelectedNote(createdNote);
    } catch (error) {
      setError("Failed to create note");
      console.error("Error creating note:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing note
  const handleUpdateNote = async () => {
    if (!selectedNote) return;

    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("No authentication token found");

      const updatedNote = await updateNote(
        selectedNote._id,
        selectedNote,
        token
      );

      setNotes((prev) =>
        prev.map((note) => (note._id === updatedNote._id ? updatedNote : note))
      );
      setSelectedNote(updatedNote);
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update note");
      console.error("Error updating note:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a note
  const handleDeleteNote = async (id) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token found");

      await deleteNote(id, token);

      setNotes((prev) => prev.filter((note) => note._id !== id));
      if (selectedNote?._id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      setError("Failed to delete note");
      console.error("Error deleting note:", error);
    }
  };

  // Generate AI summary
  const handleAISummarize = async () => {
    if (!selectedNote?.content) return;

    try {
      setAiLoading(true);
      const token = getToken();
      if (!token) throw new Error("No authentication token found");

      const { summary } = await summarizeText(selectedNote.content, token);
      setAiSummary(summary);
      setSummaryModalOpen(true);
    } catch (error) {
      setError("Failed to generate summary");
      console.error("Error generating summary:", error);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle logout
  const handleLogOut = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/login"; // Redirect to login page
  };
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24 && now.getDate() === date.getDate())
      return `${diffHours}h ago`;

    // If it was yesterday (but more than 24h ago, e.g., due to time zone differences)
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "yesterday";
    }

    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Get all unique tags
  const allTags = [...new Set(notes.flatMap((note) => note.tags || []))];

  // Error display
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button
            onClick={() => setError(null)}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const summaries = () => {
    navigate("/summaries");
  };
  const qna = () => {
    navigate("/flashcards");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      <div className="relative z-10 flex h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-black/20 backdrop-blur-xl border-b lg:border-r lg:border-b-0 border-white/10 flex flex-col h-auto lg:h-full">
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-white/10">
            <div className="flex items-center justify-between lg:justify-start lg:space-x-3 mb-4 lg:mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FiBookmark className="text-white text-base lg:text-lg" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-white">
                    AI NOTEBOOK
                  </h1>
                </div>
              </div>
              {/* Mobile toggle button could go here if needed */}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="search your thoughts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 lg:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm lg:text-base"
              />
            </div>

            {/* Create button */}
            <div className=" flex flex-col space-y-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-2 lg:py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center space-x-2 group text-sm lg:text-base"
              >
                <FiPlus className="group-hover:rotate-90 transition-transform duration-200" />
                <span>new note</span>
              </button>
              <button
                onClick={summaries}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-2 lg:py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center space-x-2 group text-sm lg:text-base"
              >
                <FiPlus className="group-hover:rotate-90 transition-transform duration-200" />
                <span>Summarize</span>
              </button>
              <button
                onClick={qna}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-2 lg:py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center space-x-2 group text-sm lg:text-base"
              >
                <FiPlus className="group-hover:rotate-90 transition-transform duration-200" />
                <span>Know Q & A</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-3 lg:p-4 border-b border-white/10">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm transition-all ${
                  activeFilter === "all"
                    ? "bg-purple-500 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                all
              </button>
              {allTags.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm transition-all ${
                    activeFilter === tag
                      ? "bg-purple-500 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 lg:space-y-3 max-h-64 lg:max-h-none">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                    selectedNote?._id === note._id
                      ? "bg-white/10 border border-purple-500/30"
                      : "bg-white/5 border border-transparent"
                  }`}
                >
                  <h3 className="text-white font-medium mb-2 truncate text-sm lg:text-base">
                    {note.title}
                  </h3>
                  <p className="text-gray-400 text-xs lg:text-sm mb-2 lg:mb-3 line-clamp-2">
                    {note.content.substring(0, 100)}
                    {note.content.length > 100 ? "..." : ""}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 lg:py-12 text-gray-400">
                <p className="text-sm lg:text-base">No notes found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            onClick={handleLogOut}
            className="p-3 lg:p-4 border-t border-white/10 font-bold text-sm lg:text-md text-white hover:text-white hover:bg-red-500 text-center"
          >
            <button className="uppercase">logout</button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedNote ? (
            <>
              {/* Note header */}
              <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4 lg:p-6">
                <div className="flex items-start lg:items-center justify-between mb-4 flex-col lg:flex-row gap-3 lg:gap-0">
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={selectedNote.title}
                        onChange={(e) =>
                          setSelectedNote({
                            ...selectedNote,
                            title: e.target.value,
                          })
                        }
                        className="text-xl lg:text-2xl font-bold text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-purple-500 w-full"
                      />
                    ) : (
                      <h1 className="text-xl lg:text-2xl font-bold text-white truncate">
                        {selectedNote.title}
                      </h1>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={handleAISummarize}
                      disabled={aiLoading}
                      className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <FiZap className={aiLoading ? "animate-spin" : ""} />
                    </button>

                    {isEditing ? (
                      <>
                        <button
                          onClick={handleUpdateNote}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                        >
                          <FiSave />
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                        >
                          <FiX />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(selectedNote._id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 lg:space-x-4 text-xs lg:text-sm text-gray-400 flex-wrap">
                  <span>created {formatDate(selectedNote.createdAt)}</span>
                  <span className="hidden lg:inline">•</span>
                  <span>updated {formatDate(selectedNote.updatedAt)}</span>
                </div>

                {selectedNote.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-purple-500/20 text-purple-300 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Note content */}
              <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                {isEditing ? (
                  <textarea
                    value={selectedNote.content}
                    onChange={(e) =>
                      setSelectedNote({
                        ...selectedNote,
                        content: e.target.value,
                      })
                    }
                    className="w-full h-full bg-transparent text-white resize-none focus:outline-none text-base lg:text-lg leading-relaxed"
                    placeholder="start typing..."
                  />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <pre className="text-white text-base lg:text-lg leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedNote.content}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <FiBookmark className="text-white text-xl lg:text-3xl" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
                  {notes.length === 0 ? "No notes yet" : "No note selected"}
                </h2>
                <p className="text-gray-400 mb-4 lg:mb-6 text-sm lg:text-base px-4">
                  {notes.length === 0
                    ? "Create your first note to get started"
                    : "Select a note from the sidebar or create a new one"}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium hover:shadow-lg transition-all text-sm lg:text-base"
                >
                  {notes.length === 0
                    ? "Create your first note"
                    : "Create new note"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-4 lg:p-6 w-full max-w-2xl mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-white">
                create new note
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="note title..."
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm lg:text-base"
              />

              <textarea
                placeholder="what's on your mind?"
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                rows={4}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none text-sm lg:text-base"
              />

              <input
                type="text"
                placeholder="tags (separated by commas)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm lg:text-base"
              />

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-sm lg:text-base"
                >
                  cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  disabled={!newNote.title.trim() || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 text-sm lg:text-base"
                >
                  {loading ? "creating..." : "create note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {summaryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-4 lg:p-6 w-full max-w-xl mx-4 border border-white/10 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                <FiZap className="text-purple-400" />
                AI Summary
              </h3>
              <button
                onClick={() => setSummaryModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX />
              </button>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                <p className="text-white whitespace-pre-wrap text-sm lg:text-base">
                  {aiSummary}
                </p>
              </div>
            </div>

            <div className="mt-4 lg:mt-6 flex justify-end">
              <button
                onClick={() => setSummaryModalOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all text-sm lg:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
