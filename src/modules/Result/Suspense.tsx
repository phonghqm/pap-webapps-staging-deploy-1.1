import { PAPLoading } from 'core/pures';
import { Suspense, lazy } from 'react';

const Result = lazy(() => import('.'));

function ResultSuspense(): JSX.Element {
  return (
    <Suspense fallback={<PAPLoading />}>
      <Result />
    </Suspense>
  );
}

export default ResultSuspense;
