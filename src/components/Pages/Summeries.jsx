import React, { useState } from "react";
import { FiZap, FiCopy, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { summarizeText } from "../../services/notesService";
const Summaries = () => {
  const [inputText, setInputText] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token"); // Get token from session storage

      if (!token) {
        alert("No authentication token found. Please log in.");
        return;
      }

      const result = await summarizeText(inputText, token);

      const newSummary = {
        id: Date.now(),
        originalText: inputText,
        summary: result.summary || result, // Adjust based on your API response structure
        createdAt: new Date().toISOString(),
      };

      setSummaries([newSummary, ...summaries]);
      setInputText("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error summarizing text:", error);
      alert("Failed to summarize text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const deleteSummary = (id) => {
    setSummaries(summaries.filter((summary) => summary.id !== id));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FiZap className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-white">
                    AI SUMMARIES
                  </h1>
                  <p className="text-sm text-gray-400">
                    smart text summarization ✨
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center space-x-2 group text-sm lg:text-base"
              >
                <FiPlus className="group-hover:rotate-90 transition-transform duration-200" />
                <span className="hidden sm:inline">new summary</span>
                <span className="sm:hidden">new</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          {summaries.length === 0 ? (
            <div className="text-center py-12 lg:py-20">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiZap className="text-white text-2xl lg:text-3xl" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
                No summaries yet
              </h2>
              <p className="text-gray-400 mb-6 text-sm lg:text-base px-4">
                Create your first AI-powered summary to get started
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all text-sm lg:text-base"
              >
                Create your first summary
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {summaries.map((summary) => (
                <div
                  key={summary.id}
                  className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6 hover:bg-white/5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium mb-2 text-sm lg:text-base">
                        Summary #{summary.id.toString().slice(-4)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(summary.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => copyToClipboard(summary.summary)}
                        className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                        title="Copy summary"
                      >
                        <FiCopy className="text-sm" />
                      </button>
                      <button
                        onClick={() => deleteSummary(summary.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                        title="Delete summary"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-purple-300 text-xs lg:text-sm font-medium mb-2 uppercase tracking-wide">
                        Summary
                      </h4>
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                        <p className="text-white text-sm lg:text-base leading-relaxed">
                          {summary.summary}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-gray-400 text-xs lg:text-sm font-medium mb-2 uppercase tracking-wide">
                        Original Text
                      </h4>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10 max-h-32 overflow-y-auto">
                        <p className="text-gray-300 text-xs lg:text-sm leading-relaxed">
                          {summary.originalText.length > 200
                            ? `${summary.originalText.substring(0, 200)}...`
                            : summary.originalText}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Summary Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-4 lg:p-6 w-full max-w-3xl mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                <FiZap className="text-purple-400" />
                create new summary
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text to summarize
                </label>
                <textarea
                  placeholder="Paste your text here to get an AI-powered summary..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={8}
                  className="w-full p-3 lg:p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none text-sm lg:text-base leading-relaxed"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {inputText.length} characters
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-sm lg:text-base"
                >
                  cancel
                </button>
                <button
                  onClick={handleSummarize}
                  disabled={!inputText.trim() || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 text-sm lg:text-base flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>summarizing...</span>
                    </>
                  ) : (
                    <>
                      <FiZap />
                      <span>create summary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summaries;
