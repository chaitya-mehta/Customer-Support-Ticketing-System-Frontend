const NotificationItem = ({ item }: { item: any }) => {
  return (
    <div className={`p-3 border-b ${!item.isRead ? "bg-gray-100" : ""}`}>
      <h4 className="font-medium">{item.title}</h4>
      <p className="text-sm text-gray-600">{item.message}</p>
      <small className="text-xs text-gray-400">
        {new Date(item.createdAt).toLocaleString()}
      </small>
    </div>
  );
};

export default NotificationItem;
