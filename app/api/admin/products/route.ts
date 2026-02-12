import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";

    const backendUrl = `http://localhost:5000/products?page=${page}&limit=${limit}&search=${search}`;

    const res = await fetch(backendUrl);

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
