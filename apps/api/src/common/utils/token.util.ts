export const calcExpiresAt = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const numericValue = parseInt(value.slice(0, -1));
  const unit = value.slice(-1).toLowerCase();

  let maxAge: number;
  switch (unit) {
    case 'd':
      maxAge = numericValue * 24 * 60 * 60 * 1000;
      break;
    case 'h':
      maxAge = numericValue * 60 * 60 * 1000;
      break;
    case 'm':
      maxAge = numericValue * 60 * 1000;
      break;
    case 's':
      maxAge = numericValue * 1000;
      break;
    default:
      maxAge = 7 * 24 * 60 * 60 * 1000;
  }
  return maxAge;
};
