export async function GET() {
  return Response.json(
    {
      success: true,
      data: {
        status: "ok",
        service: "emprendelink-dps",
      },
      error: null,
    },
    { status: 200 }
  );
}
