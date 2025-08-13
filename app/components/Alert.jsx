// components/Alert.jsx
export default function Alert({ type = "success", message }) {
  if (!message) return null;

  const baseClasses = "p-3 mb-4 rounded border";

  // Tailwind style map for alert types
  const typeStyles = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <div className={`${baseClasses} ${typeStyles[type] || typeStyles.info}`}>
      {message}
    </div>
  );
}

{ /* Usage:
<Alert type="success" message="Operation completed successfully!" />
<Alert type="error" message="Something went wrong." />
<Alert type="warning" message="Please check your inputs." />
<Alert type="info" message="New update available." />
*/ }