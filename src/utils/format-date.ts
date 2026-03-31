const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export const formatDate = (date: string | Date) => dateFormatter.format(new Date(date));

export const formatShortDate = (date: string | Date) => shortDateFormatter.format(new Date(date));
