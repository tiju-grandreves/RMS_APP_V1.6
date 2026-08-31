import React from 'react';

const NoShopLinkPage = () => (
  <div className="h-screen flex items-center justify-center" style={{ background: '#f0f4f8' }}>
    <div
      className="text-center max-w-[420px] p-8"
      style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 2px 32px rgba(26,46,56,0.08)' }}
    >
      <h2 className="font-extrabold mb-2" style={{ fontSize: '20px', color: '#1a2e38' }}>
        This isn't your shop's login link
      </h2>
      <p className="text-sm" style={{ color: '#8896a7' }}>
        Please use the login link provided by your administrator
        (e.g. www.fixit.com/your-shop-slug/login).
      </p>
    </div>
  </div>
);

export default NoShopLinkPage;
