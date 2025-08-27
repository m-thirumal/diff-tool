import { motion, AnimatePresence } from "framer-motion";

export default function PopupAlert({ type = "info", message, onClose }) {
  const colorMap = {
    success: "bg-green-100 text-green-800 border-green-400",
    error: "bg-red-100 text-red-800 border-red-400",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
    info: "bg-blue-100 text-blue-800 border-blue-400",
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed top-4 right-4 z-50" // ⬅️ changed position
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          <motion.div
            className={`relative p-4 rounded-xl shadow-lg border ${colorMap[type]}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-3 text-xl font-bold"
            >
              ×
            </button>
            <p className="text-sm font-medium">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
