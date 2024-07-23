import { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { Button, Form, Input } from 'antd';
import { PAPLoading } from 'core/pures';
import apis from 'modules/Auth/api';
import './App.css';

const PAPApp = lazy(() => import('./PapApp'));

type PasswordFormType = {
  password?: string;
};

function PreventPassword({ onApprove }: { onApprove: () => void }) {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = useCallback((values: PasswordFormType) => {
    const password = values?.password || null;
    if (!password) return;
    setLoading(true);
    apis
      .checkWebappPassword({ password })
      .then(() => {
        if (err) setErr(null);
        onApprove && onApprove();
      })
      .catch((e: Error) => {
        setErr(e.message || 'Xác thực không thành công!');
      })
      .finally(() => setLoading(false));
  }, [err, setLoading, onApprove]);

  const onError = useCallback((error: any) => {
    setErr(error?.toString() || 'Xác thực mật khẩu thất bại')
  }, [setErr]);

  return (
    <div className='pw-container'>
      <Form
        onFinish={onFinish}
        onError={onError}
        autoComplete="off"
      >
        <Form.Item<PasswordFormType>
          label="Nhập mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          validateStatus={err ? 'error' : undefined}
          help={err || undefined}
          required
        >
          <Input type="password" />
        </Form.Item>
        <Form.Item>
          <Button
            disabled={loading}
            type="primary"
            htmlType="submit"
          >
            {loading ? 'Đang kiểm tra ...' : 'Xác thực'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default function App() {
  const [isVerified, setIsVerified] = useState(false);

  const isPrevent = useMemo(
    () => {
      const devMode = process.env.NODE_ENV === 'development';
      return !isVerified && devMode;
    },
    [isVerified]
  );

  if (isPrevent) {
    return (
      <PreventPassword
        onApprove={() => setIsVerified(true)}
      />
    );
  }
  return (
    <Suspense fallback={<PAPLoading />}>
      <PAPApp />
    </Suspense>
  );
}
