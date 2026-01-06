import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-700 text-white pt-20 pb-10 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <h2 className="text-4xl font-bold mb-6">Arjava</h2>
            <p className="text-gray-100 text-lg leading-relaxed max-w-sm font-light">
              The fastest way to mock REST & SOAP APIs. Unblock your teams and ship faster.
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-gray-100">Product</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">Features</a></li>
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">Pricing</a></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-gray-100">Product</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">Documents</a></li>
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">APIs Reference</a></li>
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">community</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-gray-100">Product</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">about</a></li>
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">careers</a></li>
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">contact</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-gray-100">Product</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">privacy</a></li>
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">terms</a></li>
                <li><a href="#" className="text-gray-100 hover:text-[#7e57ffff] transition-colors font-light">security</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-gray-100 pt-8 text-center">
          <p className="text-gray-100 font-light">© 2026 Arjava. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
