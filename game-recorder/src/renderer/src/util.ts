export function recorderPath(path: string): string {
  return `recorder:///${path}`
}

export function getVideoName(name: string): string {
  return name || "Untitled"
}

export function getRelativeTime(date: Date): string {
  const diff = new Date().getTime() - date.getTime()

  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  if (diff < msPerMinute) {
    return Math.round(diff / 1000) + " seconds ago";
  } else if (diff < msPerHour) {
    return Math.round(diff / msPerMinute) + " minutes ago";
  } else if (diff < msPerDay) {
    return Math.round(diff / msPerHour) + " hours ago";
  } else if (diff < msPerMonth) {
    return Math.round(diff / msPerDay) + " days ago";
  } else if (diff < msPerYear) {
    return Math.round(diff / msPerMonth) + " months ago";
  } else {
    return Math.round(diff / msPerYear) + " years ago";
  }
}

export function getFizeSize(fileSize: number): string {

  if (fileSize < 1000) {
    return `${Math.floor(fileSize)} MB`
  } else {
    return `${Math.floor(fileSize / 1000)} GB`
  }
}
