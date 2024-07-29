import { PAPLoading } from "core/pures";
import { Suspense, lazy } from "react";
const RestriveInfo = lazy(() => import("."));

function SingPassSuspense(): JSX.Element {
  return (
    <Suspense fallback={<PAPLoading />}>
      <RestriveInfo />
    </Suspense>
  );
}

export default SingPassSuspense;
