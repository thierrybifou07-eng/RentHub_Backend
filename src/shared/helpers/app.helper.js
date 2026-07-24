export const success = (message, data = null) => ({
  status: "success",
  message,
  data,
});

export const fail = (message, error = null) => ({
  status: "fail",
  message,
  error,
});
