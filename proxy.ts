import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req:NextRequest) {
    const token = (await cookies()).get(process.env.COOKIE_NAME as string)

    if(!token){
        const url = new URL("/sigin")
    }
    return NextResponse.next()
}

