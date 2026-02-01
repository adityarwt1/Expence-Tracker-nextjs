import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";
import { ItemAddResponse, ItemsAddInterface } from "@/interfaces/ApiReponses/v1/items/itemsRouteInterfaces";
import { mongoconnect } from "@/lib/mongodb";
import Items from "@/models/items";
import { verifyToken } from "@/services/token/tokenSevices";
import { badRequest, internalServerIssue, unAuthorized } from "@/utils/apiResponses";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ItemAddResponse>> {
  try {
    const authenticationInfo = await verifyToken(req)

    if (!authenticationInfo.isVerified || !authenticationInfo.user) {
      return unAuthorized()
    }

    const body: ItemsAddInterface = await req.json()

    if (!body?.categoryId || !body?.item) {
      return badRequest("field not provided properly!")
    }

    const isConnected = await mongoconnect()
    if (!isConnected) {
      return internalServerIssue(new Error("failed to connect database!"))
    }

    const data = await Items.create({
      categoryId: body.categoryId,
      item: body.item
    })

    return NextResponse.json(
      {
        status: HttpStatusCode.CREATED,
        success: true,
        data
      },
      { status: HttpStatusCode.CREATED }
    )
  } catch (error) {
    console.error(error)
    return internalServerIssue(error as Error)
  }
}
