const ConfirmActionModal = ({
  title,
  message,
  confirmLabel,
  confirmStyle = "red", // "red" or "green"
  onConfirm,
  onCancel,
}) => {
  const confirmClass = confirmStyle === "green"
    ? "bg-green-600 hover:bg-green-700"
    : "bg-red-600 hover:bg-red-700";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center
                    justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
        <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm
                       font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 text-white rounded-lg text-sm
                        font-medium ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;