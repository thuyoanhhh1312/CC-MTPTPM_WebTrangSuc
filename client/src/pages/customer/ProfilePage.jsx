import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Tag, message } from 'antd';
import PageContainer from '@/components/common/PageContainer';
import useAuth from '@/hooks/useAuth';

const PHONE_REGEX = /^(0|\+84)[0-9]{9}$/;

const ProfilePage = () => {
  const { user, roles } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const initialValues = useMemo(
    () => ({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      password: '',
      confirmPassword: '',
    }),
    [user],
  );

  useEffect(() => {
    form.setFieldsValue(initialValues);
    setIsDirty(false);
  }, [form, initialValues]);

  const handleValuesChange = (_, allValues) => {
    const changed =
      allValues.name !== initialValues.name ||
      (allValues.phone ?? '') !== (initialValues.phone ?? '') ||
      Boolean(allValues.password);
    setIsDirty(changed);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // TODO: replace with real API call
      // await authApi.updateProfile({
      //   name: values.name,
      //   phone: values.phone || undefined,
      //   password: values.password || undefined,
      // });

      message.success('Profile updated successfully');
      form.setFieldsValue({ password: '', confirmPassword: '' });
      setIsDirty(false);
    } catch (error) {
      message.error(error.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Profile" subtitle="Cập nhật thông tin hồ sơ khách hàng.">
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          initialValues={initialValues}
        >
          <div className="grid grid-cols-4 gap-4 md:grid-cols-8 desktop:grid-cols-12">
            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="name"
              label="Full name"
              rules={[
                { required: true, message: 'Full name is required' },
                { min: 2, message: 'Full name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="Enter your full name" />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="email"
              label="Email"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="phone"
              label="Phone"
              rules={[
                {
                  pattern: PHONE_REGEX,
                  message: 'Phone must be a valid Vietnamese number (e.g. 09xxxxxxxx)',
                },
              ]}
            >
              <Input placeholder="09xxxxxxxx or +849xxxxxxxx" />
            </Form.Item>

            <div className="col-span-4 md:col-span-4 desktop:col-span-6 flex items-center gap-2 flex-wrap pb-1">
              {roles.map((role) => (
                <Tag key={role} color="blue" className="capitalize m-0">
                  {role}
                </Tag>
              ))}
            </div>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="password"
              label="New Password"
              rules={[{ min: 6, message: 'Password must be at least 6 characters' }]}
            >
              <Input.Password placeholder="Leave blank to keep current password" />
            </Form.Item>

            <Form.Item
              className="col-span-4 md:col-span-4 desktop:col-span-6"
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const pwd = getFieldValue('password');
                    if (!pwd || value === pwd) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Re-enter new password" />
            </Form.Item>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!isDirty}
          >
            Save changes
          </Button>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default ProfilePage;