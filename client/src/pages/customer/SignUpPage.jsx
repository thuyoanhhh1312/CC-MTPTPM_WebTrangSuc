import { useState } from 'react';
import { App, Button, Card, DatePicker, Form, Input, Select, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authApi';

const { Link } = Typography;

const SignUpPage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);

    // Format birthday to ISO date string (YYYY-MM-DD) expected by backend
    const payload = {
      ...values,
      birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined,
    };
    // Remove confirmPassword before sending to API
    delete payload.confirmPassword;

    try {
      await authApi.signUp(payload);
      message.success('Đăng ký thành công. Vui lòng đăng nhập.');
      navigate('/signin');
    } catch (error) {
      message.error(error.message || 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12">
      <Card title="Tạo Tài Khoản">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

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
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input placeholder="0901234567" />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select placeholder="Chọn giới tính">
              <Select.Option value="male">Nam</Select.Option>
              <Select.Option value="female">Nữ</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="birthday"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày sinh" format="DD/MM/YYYY" />
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

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu" />
          </Form.Item>

          <Button block type="primary" htmlType="submit" loading={submitting}>
            Đăng Ký
          </Button>
        </Form>

        <div className="mt-4 text-right">
          <Link onClick={() => navigate('/signin')}>Đã có tài khoản? Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
};

export default SignUpPage;
