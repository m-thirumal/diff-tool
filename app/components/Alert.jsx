export default function Alert({ type = "info", message, onClose }) {
  const colorMap = {
    success: "bg-green-100 text-green-800 border-green-400",
    error: "bg-red-100 text-red-800 border-red-400",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
    info: "bg-blue-100 text-blue-800 border-blue-400",
  };

  if (!message) return null;

  return (
    <div
      className={`flex items-center justify-between border-l-4 p-4 mb-4 rounded ${colorMap[type]}`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-lg font-bold focus:outline-none"
      >
        ×
      </button>
    </div>
  );
}


{ /* Usage:
<Alert type="success" message="Operation completed successfully!" />
<Alert type="error" message="Something went wrong." />
<Alert type="warning" message="Please check your inputs." />
<Alert type="info" message="New update available." />
*/ }