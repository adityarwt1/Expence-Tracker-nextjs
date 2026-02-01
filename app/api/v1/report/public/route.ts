import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import SubExpense from "@/models/SubExpense";
import { badRequest, internalServerIssue, unAuthorized } from "@/utils/apiResponses";
import { mongoconnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    // const auth = await verifyToken(req);

    // if (!auth.isVerified || !auth.user) {
    //   return unAuthorized();
    // }
     const isconnected = await mongoconnect()
    
        if(!isconnected){
            return internalServerIssue(new Error("Faile to cnnect databse!"))
        }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")

    if(!id){
        return badRequest("id not provided")
    }
    const authorId =new mongoose.Types.ObjectId( id)
    

    // Get params
    const now = new Date();
    const year = Number(searchParams.get("year")) || now.getFullYear();
    const month = Number(searchParams.get("month")) || now.getMonth() + 1;

    // Define Ranges
    const rangeStart = new Date(year, month - 1, 1);
    const rangeEnd = new Date(year, month, 1);
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);

    const pipeline: mongoose.PipelineStage[] = [
      // 1. Initial Join with Expense to filter by Author
      {
        $lookup: {
          from: "expenses", // ensure this matches your DB collection name
          localField: "expenseId",
          foreignField: "_id",
          as: "parentExpense",
        },
      },
      { $unwind: "$parentExpense" },
      { $match: { "parentExpense.authorId": authorId } },

      // 2. Lookup Categories/Items if you need to check for item-level sums
      // Note: Based on your logic, we check if item.amount exists. 
      // If items are in a different collection, lookup them here.
      {
        $lookup: {
          from: "categories",
          localField: "_id", // Assuming subExpenseId is in category
          foreignField: "subExpenseId",
          as: "categories",
        },
      },

      // 3. Calculate the 'finalAmount' for each SubExpense doc
      {
        $project: {
          date: 1,
          finalAmount: {
            $cond: {
              if: { $gt: [{ $size: "$categories" }, 0] }, 
              then: { $sum: "$categories.amount" }, // Replace with your actual item field
              else: "$totalAmount"
            }
          }
        }
      },

      // 4. Parallel Processing using $facet
      {
        $facet: {
          rangeTotal: [
            { $match: { date: { $gte: rangeStart, $lt: rangeEnd } } },
            { $group: { _id: null, total: { $sum: "$finalAmount" } } }
          ],
          yearTotal: [
            { $match: { date: { $gte: yearStart, $lt: yearEnd } } },
            { $group: { _id: null, total: { $sum: "$finalAmount" } } }
          ],
          allTimeTotal: [
            { $group: { _id: null, total: { $sum: "$finalAmount" } } }
          ]
        }
      },

      // 5. Format the Facet output
      {
        $project: {
          rangeTotal: { $ifNull: [{ $arrayElemAt: ["$rangeTotal.total", 0] }, 0] },
          yearTotal: { $ifNull: [{ $arrayElemAt: ["$yearTotal.total", 0] }, 0] },
          allTimeTotal: { $ifNull: [{ $arrayElemAt: ["$allTimeTotal.total", 0] }, 0] }
        }
      }
    ];

    const [result] = await SubExpense.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      data: {
        rangeTotal: result?.rangeTotal || 0,
        yearTotal: result?.yearTotal || 0,
        allTimeTotal: result?.allTimeTotal || 0,
      },
      meta: { year, month }
    });

  } catch (error) {
    console.error("Aggregation Error:", error);
    return internalServerIssue(error as Error);
  }
}