export function successResponse(data, status = 200) {
  return Response.json(
    {
      success: true,
      data,
      error: null,
    },
    { status }
  );
}

export function errorResponse(code, message, status = 400) {
  return Response.json(
    {
      success: false,
      data: null,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}
