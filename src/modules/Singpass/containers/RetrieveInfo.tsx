import { useAppSelector } from "appRedux";
import React from "react";

const RetrieveInfo = () => {
  const { redirectUrl } = useAppSelector((state) => state.singpass);
  console.log("redirectUrl: ", redirectUrl);

  return <div>h2</div>;
};

export default RetrieveInfo;
