import { useAppSelector } from "appRedux";
import React from "react";
import { Navigate } from "react-router-dom";

const RetrieveInfo = () => {
  const { redirectUrl } = useAppSelector((state) => state.singpass);

  if (redirectUrl) return (window.location.href = redirectUrl);

  return <Navigate to="/"></Navigate>;
};

export default RetrieveInfo;
