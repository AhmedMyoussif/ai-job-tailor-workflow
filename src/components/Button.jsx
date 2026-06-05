export default function Button({ children, type = 'button', variant = 'primary', isLoading, ...props }) {
  const baseStyle = "w-full py-3 px-4 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400"
  };

  return (
    <button
      type={type}
      disabled={isLoading}
      className={`${baseStyle} ${variants[variant]} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>جاري التحميل...</span>
        </div>
      ) : children}
    </button>
  );
}