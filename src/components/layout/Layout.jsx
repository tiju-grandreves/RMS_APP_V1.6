import React, { useState } from 'react';
import Logo from '../common/Logo';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, pageTitle, onSearch, showBack, showSearch, contentClassName, breadcrumbs }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerShowSearch = showSearch !== false;

  return (
    <div className="h-screen bg-[#E2F9FA]/40 flex overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 md:ml-[102px] ml-0">
        <div className="hidden md:block absolute top-4 left-4 z-10">
          <Logo />
        </div>

        <Header
          title={pageTitle}
          onSearch={onSearch}
          showBack={showBack}
          showSearch={headerShowSearch}
          breadcrumbs={breadcrumbs}
          onMobileMenuOpen={() => setSidebarOpen(true)}
        />

        <div className={`flex-1 overflow-y-auto overflow-x-hidden ${contentClassName || ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;