export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>
            © 2025 Observatorio IA México · Iniciativa ciudadana de transparencia
          </p>
          <p className="text-gray-500">
            Datos actualizados automáticamente mediante agentes de IA
          </p>
        </div>
      </div>
    </footer>
  );
}
