import { Button, Space, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import AdminResourcePage from '@/pages/admin/AdminResourcePage';

const TIER_COLOR = {
  bronze: 'default',
  silver: 'silver',
  gold: '#B08A4A',
  platinum: '#12332B',
};

const buildColumns = ({ onView, onEdit, onDelete }) => [
  {
    title: 'Customer',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
    render: (value) => value ?? '—',
  },
  {
    title: 'Orders',
    dataIndex: 'totalOrders',
    key: 'totalOrders',
    align: 'right',
    render: (value) => value ?? 0,
  },
  {
    title: 'Tier',
    dataIndex: 'tier',
    key: 'tier',
    render: (value) =>
      value ? (
        <Tag color={TIER_COLOR[value] ?? 'default'} className="capitalize">
          {value}
        </Tag>
      ) : (
        '—'
      ),
  },
  {
    title: 'Actions',
    key: 'actions',
    align: 'center',
    width: 120,
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="View">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          />
        </Tooltip>
        <Tooltip title="Edit">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
          />
        </Tooltip>
      </Space>
    ),
  },
];

const CustomersPage = () => {
  // TODO: replace with real handlers wired to API calls
  const handleView = (record) => {
    console.log('View customer:', record.id);
  };

  const handleEdit = (record) => {
    console.log('Edit customer:', record.id);
  };

  const handleDelete = (record) => {
    console.log('Delete customer:', record.id);
  };

  const columns = buildColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <AdminResourcePage
      title="Customers"
      description="Customer profiles, loyalty tiering, and account moderation."
      columns={columns}
      dataSource={[]}
      createButtonText="Add Customer"
      cardFields={[
        { key: 'name', label: 'Customer', dataIndex: 'name' },
        { key: 'email', label: 'Email', dataIndex: 'email' },
        { key: 'tier', label: 'Tier', dataIndex: 'tier' },
      ]}
    />
  );
};

export default CustomersPage;
