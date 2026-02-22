import { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  Space,
  Tag,
  Typography,
} from 'antd';
import { LogOut, Menu as MenuIcon, UserCircle2 } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { adminNavItems } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const adminTheme = {
  token: {
    colorPrimary: '#0FB5B5',
    colorInfo: '#0FB5B5',
    colorWarning: '#F4B740',
    colorText: '#0B1220',
    colorBgLayout: '#F6F7FB',
    colorBgContainer: '#FFFFFF',
    borderRadius: 12,
    fontFamily: 'IBM Plex Sans, sans-serif',
  },
  components: {
    Layout: {
      siderBg: '#0B1220',
      headerBg: '#FFFFFF',
      bodyBg: '#F6F7FB',
    },
    Menu: {
      darkItemBg: '#0B1220',
      darkSubMenuItemBg: '#111A2E',
      darkItemSelectedBg: '#0FB5B5',
      darkItemSelectedColor: '#0B1220',
      darkItemColor: '#D9E2F1',
      darkItemHoverColor: '#FFFFFF',
    },
  },
};

const getSelectedNavKey = (pathname) => {
  const sorted = [...adminNavItems].sort((a, b) => b.key.length - a.key.length);
  const match = sorted.find((item) => pathname === item.key || pathname.startsWith(`${item.key}/`));
  return match?.key || '/admin';
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles, signOut } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1200px)');
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedKey = getSelectedNavKey(location.pathname);

  const roleTag = useMemo(() => {
    if (!roles || roles.length === 0) {
      return 'guest';
    }

    return roles[0];
  }, [roles]);

  const onMenuClick = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const userItems = [
    {
      key: 'profile',
      label: 'Open customer profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'signout',
      label: 'Sign out',
      icon: <LogOut size={14} />,
      onClick: async () => {
        await signOut();
        navigate('/signin');
      },
    },
  ];

  const menu = (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[selectedKey]}
      items={adminNavItems}
      onClick={onMenuClick}
      style={{ height: '100%', borderInlineEnd: 0 }}
    />
  );

  return (
    <ConfigProvider theme={adminTheme}>
      <Layout className="portal-admin" style={{ minHeight: '100vh' }}>
        {isDesktop && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={260}
            style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <div className="flex h-16 items-center justify-center border-b border-white/10 px-3">
              <Title
                level={5}
                className="portal-title"
                style={{ margin: 0, color: '#D9E2F1', textAlign: 'center' }}
              >
                {collapsed ? 'AJS' : 'Aurelia Admin'}
              </Title>
            </div>
            {menu}
          </Sider>
        )}

        <Layout>
          <Header style={{ borderBottom: '1px solid rgba(11, 18, 32, 0.08)', padding: '0 16px' }}>
            <div className="flex h-full items-center justify-between gap-3">
              <Space>
                {!isDesktop && (
                  <Button icon={<MenuIcon size={18} />} onClick={() => setDrawerOpen(true)} />
                )}
                <div>
                  <Title className="portal-title" level={4} style={{ margin: 0, lineHeight: 1.2 }}>
                    Clean Ops Console
                  </Title>
                  <Text type="secondary">Operational control for catalog, orders, and campaigns</Text>
                </div>
              </Space>

              <Space>
                <Tag color="cyan" style={{ textTransform: 'uppercase', margin: 0 }}>
                  {roleTag}
                </Tag>
                <Dropdown menu={{ items: userItems }} trigger={['click']}>
                  <Button icon={<UserCircle2 size={16} />}>
                    <Space>
                      <Avatar size={24}>{(user?.name || 'A')[0].toUpperCase()}</Avatar>
                      <span>{user?.name || 'Operator'}</span>
                    </Space>
                  </Button>
                </Dropdown>
              </Space>
            </div>
          </Header>

          <Content>
            <Outlet />
          </Content>
        </Layout>

        <Drawer
          title="Admin Navigation"
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={300}
        >
          <Menu mode="inline" selectedKeys={[selectedKey]} items={adminNavItems} onClick={onMenuClick} />
        </Drawer>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
