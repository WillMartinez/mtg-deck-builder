export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm">
            <p>© {new Date().getFullYear()} MTG Deck Builder</p>
            <p className="text-gray-400 text-xs mt-1">
              Card data from Scryfall • Not affiliated with Wizards of the Coast
            </p>
          </div>

          <div className="flex space-x-6 text-sm">
            <a
              href="https://scryfall.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Scryfall API
            </a>
            <a
              href="https://edhrec.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              EDHREC
            </a>
            <a
              href="https://mtgcommander.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Commander Rules
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
