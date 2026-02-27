import { useState } from 'react';
import { App, Button, Card, Form, Input, Space, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { resolveReturnUrl } from '@/utils/returnUrl';

const { Link, Text } = Typography;

const SignInPage = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { signIn } = useAuth();

  const returnUrl = resolveReturnUrl(searchParams.get('returnUrl'));

  const onFinish = async (values) => {
    setSubmitting(true);

    try {
      await signIn(values);
      message.success('Đăng nhập thành công');
      navigate(returnUrl, { replace: true });
    } catch (error) {
      message.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12">
      <Card title="Đăng Nhập">
        <Space direction="vertical" size={14} style={{ width: '100%' }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không đúng định dạng' },
              ]}
            >
              <Input placeholder="ban@example.com" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Button block type="primary" htmlType="submit" loading={submitting}>
              Đăng Nhập
            </Button>
          </Form>

          <div className="flex items-center justify-between">
            <Link onClick={() => navigate('/forgot-password')}>Quên mật khẩu?</Link>
            <Link onClick={() => navigate('/signup')}>Tạo tài khoản mới</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default SignInPage;
