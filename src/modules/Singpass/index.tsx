import { Route, RouteProps, Routes } from "react-router-dom";
import { RESTRIVE_INFO_PATH, SUBMIT_PATH } from "common/path";
import RetrieveInfo from "./containers/RetrieveInfo";

const INNER_ROUTES = [
  {
    id: "restrive-info",
    path: RESTRIVE_INFO_PATH.RETRIEVE_INFO,
    Component: RetrieveInfo,
  },
] as RouteProps[];

function RestriveInfo(): JSX.Element {
  return (
    <Routes>
      {INNER_ROUTES.map((route) => (
        <Route {...route} key={route.id} />
      ))}
    </Routes>
  );
}

export default RestriveInfo;
