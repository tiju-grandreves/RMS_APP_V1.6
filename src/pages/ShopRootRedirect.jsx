import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

const ShopRootRedirect = () => {
  const { shopSlug } = useParams();
  return <Navigate to={`/${shopSlug}/login`} replace />;
};

export default ShopRootRedirect;
