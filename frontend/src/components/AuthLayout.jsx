export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-[380px] p-6 rounded-2xl shadow-xl space-y-4">
        
        <div className="text-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        {children}

      </div>
    </div>
  );
}