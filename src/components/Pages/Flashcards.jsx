import { useState } from "react";
import {
  FiBook,
  FiRotateCw,
  FiTrash2,
  FiPlus,
  FiX,
  FiEye,
} from "react-icons/fi";
import { generateFlashcards } from "../../services/notesService";

const Flashcards = () => {
  const [inputText, setInputText] = useState("");
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingSet, setViewingSet] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const parseFlashcards = (flashcardsText) => {
    const cards = [];
    const lines = flashcardsText.split("\n").filter((line) => line.trim());

    let currentCard = {};

    for (let line of lines) {
      const trimmedLine = line.trim();

      // Handle both formats: "**Front:**" and "**Front (Question):**"
      if (
        trimmedLine.includes("**Front:**") ||
        trimmedLine.includes("**Front (Question):**") ||
        trimmedLine.includes("Front (Question):") ||
        trimmedLine.includes("Front:")
      ) {
        // If we have a previous card with both question and answer, save it
        if (currentCard.question && currentCard.answer) {
          cards.push(currentCard);
          currentCard = {};
        }

        // Extract the question text
        let question = trimmedLine
          .replace(/\*\*Front:\*\*/, "")
          .replace(/\*\*Front \(Question\):\*\*/, "")
          .replace(/Front \(Question\):/, "")
          .replace(/Front:/, "")
          .replace(/^\*\s*/, "") // Remove bullet point if present
          .trim();

        currentCard.question = question;
      }
      // Handle both formats: "**Back:**" and "**Back (Answer):**"
      else if (
        trimmedLine.includes("**Back:**") ||
        trimmedLine.includes("**Back (Answer):**") ||
        trimmedLine.includes("Back (Answer):") ||
        trimmedLine.includes("Back:")
      ) {
        let answer = trimmedLine
          .replace(/\*\*Back:\*\*/, "")
          .replace(/\*\*Back \(Answer\):\*\*/, "")
          .replace(/Back \(Answer\):/, "")
          .replace(/Back:/, "")
          .replace(/^\*\s*/, "")
          .trim();

        currentCard.answer = answer;
      } else if (
        currentCard.question &&
        !currentCard.answer &&
        trimmedLine &&
        !trimmedLine.includes("**") &&
        !trimmedLine.includes("Flashcard")
      ) {
        if (trimmedLine.length > 5) {
          currentCard.answer = trimmedLine.replace(/^\*\s*/, "").trim();
        }
      }
    }

    // Don't forget the last card
    if (currentCard.question && currentCard.answer) {
      cards.push(currentCard);
    }

    // Debug logging
    // console.log("Original flashcards text:", flashcardsText);
    // console.log("Parsed flashcards:", cards);

    return cards;
  };

  const handleGenerateFlashcards = async () => {
    if (!inputText.trim()) return;

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      if (!token) {
        alert("No authentication token found. Please log in.");
        return;
      }

      const result = await generateFlashcards(inputText, token);
      const parsedCards = parseFlashcards(result.flashcards);

      if (parsedCards.length === 0) {
        alert(
          "No flashcards could be parsed from the response. Please check the console for details and try again."
        );
        console.error(
          "Failed to parse flashcards. Response was:",
          result.flashcards
        );
        return;
      }

      const newFlashcardSet = {
        id: Date.now(),
        originalText: inputText,
        cards: parsedCards,
        createdAt: new Date().toISOString(),
      };

      setFlashcardSets([newFlashcardSet, ...flashcardSets]);
      setInputText("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteFlashcardSet = (id) => {
    setFlashcardSets(flashcardSets.filter((set) => set.id !== id));
    if (viewingSet && viewingSet.id === id) {
      setViewingSet(null);
    }
  };

  const startViewing = (set) => {
    setViewingSet(set);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (currentCardIndex < viewingSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
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

  if (viewingSet) {
    const currentCard = viewingSet.cards[currentCardIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setViewingSet(null)}
                  className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  <FiX />
                </button>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-white">
                    Flashcard Set #{viewingSet.id.toString().slice(-4)}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {viewingSet.cards.length} cards
                  </p>
                </div>
              </div>

              <div className="text-sm lg:text-base text-gray-300">
                {currentCardIndex + 1} / {viewingSet.cards.length}
              </div>
            </div>
          </div>

          {/* Flashcard viewer */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
            <div className="max-w-2xl w-full">
              {/* Card */}
              <div
                className="relative h-80 lg:h-96 cursor-pointer"
                onClick={flipCard}
                style={{ perspective: "1000px" }}
              >
                <div
                  className={`absolute inset-0 w-full h-full transition-transform duration-500 ${
                    isFlipped ? "" : ""
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front of card */}
                  <div
                    className="absolute inset-0 w-full h-full bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col justify-center items-center text-center"
                    style={{
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div className="mb-4">
                      <span className="text-purple-300 text-sm lg:text-base font-medium uppercase tracking-wide">
                        Question
                      </span>
                    </div>
                    <p className="text-white text-lg lg:text-xl leading-relaxed">
                      {currentCard?.question}
                    </p>
                    <div className="mt-6 text-gray-400 text-sm">
                      Click to reveal answer
                    </div>
                  </div>

                  {/* Back of card */}
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 lg:p-8 flex flex-col justify-center items-center text-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="mb-4">
                      <span className="text-cyan-300 text-sm lg:text-base font-medium uppercase tracking-wide">
                        Answer
                      </span>
                    </div>
                    <p className="text-white text-lg lg:text-xl leading-relaxed">
                      {currentCard?.answer}
                    </p>
                    <div className="mt-6 text-gray-400 text-sm">
                      Click to see question
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                >
                  Previous
                </button>

                <button
                  onClick={flipCard}
                  className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <FiRotateCw
                    className={`transition-transform duration-300 ${
                      isFlipped ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === viewingSet.cards.length - 1}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
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
                  <FiBook className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-white">
                    AI FLASHCARDS
                  </h1>
                  <p className="text-sm text-gray-400">smart study cards ✨</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center space-x-2 group text-sm lg:text-base"
              >
                <FiPlus className="group-hover:rotate-90 transition-transform duration-200" />
                <span className="hidden sm:inline">new flashcards</span>
                <span className="sm:hidden">new</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          {flashcardSets.length === 0 ? (
            <div className="text-center py-12 lg:py-20">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBook className="text-white text-2xl lg:text-3xl" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
                No flashcards yet
              </h2>
              <p className="text-gray-400 mb-6 text-sm lg:text-base px-4">
                Create your first AI-powered flashcard set to start studying
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all text-sm lg:text-base"
              >
                Create your first flashcards
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {flashcardSets.map((set) => (
                <div
                  key={set.id}
                  className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6 hover:bg-white/5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium mb-2 text-sm lg:text-base">
                        Flashcard Set #{set.id.toString().slice(-4)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(set.createdAt)} • {set.cards.length} cards
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={() => startViewing(set)}
                        className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
                        title="Study flashcards"
                      >
                        <FiEye className="text-sm" />
                      </button>
                      <button
                        onClick={() => deleteFlashcardSet(set.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                        title="Delete flashcard set"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-purple-300 text-xs lg:text-sm font-medium mb-2 uppercase tracking-wide">
                        Preview Cards
                      </h4>
                      <div className="space-y-2">
                        {set.cards.slice(0, 2).map((card, index) => (
                          <div
                            key={index}
                            className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50"
                          >
                            <p className="text-white text-xs lg:text-sm mb-1">
                              Q:{" "}
                              {card.question.length > 60
                                ? `${card.question.substring(0, 60)}...`
                                : card.question}
                            </p>
                            <p className="text-gray-400 text-xs">
                              A:{" "}
                              {card.answer.length > 60
                                ? `${card.answer.substring(0, 60)}...`
                                : card.answer}
                            </p>
                          </div>
                        ))}
                        {set.cards.length > 2 && (
                          <p className="text-gray-500 text-xs text-center">
                            +{set.cards.length - 2} more cards
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-gray-400 text-xs lg:text-sm font-medium mb-2 uppercase tracking-wide">
                        Source Text
                      </h4>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-gray-300 text-xs lg:text-sm leading-relaxed">
                          {set.originalText.length > 150
                            ? `${set.originalText.substring(0, 150)}...`
                            : set.originalText}
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

      {/* Create Flashcards Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-4 lg:p-6 w-full max-w-3xl mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                <FiBook className="text-purple-400" />
                create new flashcards
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
                  Study material
                </label>
                <textarea
                  placeholder="Paste your study material here to generate flashcards..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={8}
                  className="w-full p-3 lg:p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none text-sm lg:text-base leading-relaxed"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {inputText.length} characters • Will generate flashcards based
                  on your content
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
                  onClick={handleGenerateFlashcards}
                  disabled={!inputText.trim() || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 text-sm lg:text-base flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>generating...</span>
                    </>
                  ) : (
                    <>
                      <FiBook />
                      <span>create flashcards</span>
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

export default Flashcards;
