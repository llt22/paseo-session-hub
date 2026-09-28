export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  if (!timestamp || Number.isNaN(timestamp)) return "";
  const diffMs = now - timestamp;
  const seconds = Math.max(0, Math.floor(diffMs / 1000));

  if (seconds < 30) return "刚刚";
  if (seconds < 60) return `${seconds}秒前`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "昨天";
  if (days < 30) return `${days}天前`;

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
