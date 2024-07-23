import { PAPLoading } from 'core/pures';
import { Suspense, lazy } from 'react';
const ApplicationSubmit = lazy(() => import('.'));

function ApplicationSubmitSuspense(): JSX.Element {
  return (
    <Suspense fallback={<PAPLoading />}>
      <ApplicationSubmit />
    </Suspense>
  );
}

export default ApplicationSubmitSuspense;
