const transactionData = [
  { timestamp: new Date(2025, 10, 12).getTime(), amount: 12 },
  { timestamp: new Date(2025, 10, 13).getTime(), amount: 318 },
  { timestamp: new Date(2025, 10, 14).getTime(), amount: 780 },
  { timestamp: new Date(2025, 10, 15).getTime(), amount: 4316 },
  { timestamp: new Date(2025, 10, 16).getTime(), amount: 0 },
  { timestamp: new Date(2025, 10, 17).getTime(), amount: 245 },
  { timestamp: new Date(2025, 10, 18).getTime(), amount: 199 },
  { timestamp: new Date(2025, 10, 20).getTime(), amount: 127 },
  { timestamp: new Date(2025, 10, 21).getTime(), amount: 170 },
  { timestamp: new Date(2025, 10, 26).getTime(), amount: 485 },
  { timestamp: new Date(2025, 10, 27).getTime(), amount: 517 },
  { timestamp: new Date(2025, 10, 29).getTime(), amount: 290 },
  { timestamp: new Date(2025, 10, 30).getTime(), amount: 349 },

  { timestamp: new Date(2025, 11, 1).getTime(), amount: 840 },
  { timestamp: new Date(2025, 11, 2).getTime(), amount: 355 },
  { timestamp: new Date(2025, 11, 3).getTime(), amount: 865 },
  { timestamp: new Date(2025, 11, 4).getTime(), amount: 0 },
  { timestamp: new Date(2025, 11, 5).getTime(), amount: 540 },
  { timestamp: new Date(2025, 11, 8).getTime(), amount: 640 },
  { timestamp: new Date(2025, 11, 11).getTime(), amount: 1125 },
  { timestamp: new Date(2025, 11, 13).getTime(), amount: 225 },
  { timestamp: new Date(2025, 11, 14).getTime(), amount: 702 },
  { timestamp: new Date(2025, 11, 15).getTime(), amount: 6180 },
  { timestamp: new Date(2025, 11, 17).getTime(), amount: 385 },
  { timestamp: new Date(2025, 11, 19).getTime(), amount: 365 },
  { timestamp: new Date(2025, 11, 21).getTime(), amount: 430 },
  { timestamp: new Date(2025, 11, 22).getTime(), amount: 80 },
  { timestamp: new Date(2025, 11, 23).getTime(), amount: 320 },
  { timestamp: new Date(2025, 11, 25).getTime(), amount: 1902 },
  { timestamp: new Date(2025, 11, 27).getTime(), amount: 380 },
  { timestamp: new Date(2025, 11, 28).getTime(), amount: 422 },
  { timestamp: new Date(2025, 11, 30).getTime(), amount: 663 },
  { timestamp: new Date(2025, 11, 31).getTime(), amount: 870 },

  { timestamp: new Date(2026, 0, 1).getTime(), amount: 270 },
  { timestamp: new Date(2026, 0, 3).getTime(), amount: 530 },
  { timestamp: new Date(2026, 0, 7).getTime(), amount: 855 },
  { timestamp: new Date(2026, 0, 8).getTime(), amount: 202 },
  { timestamp: new Date(2026, 0, 9).getTime(), amount: 478 },
  { timestamp: new Date(2026, 0, 10).getTime(), amount: 0 },
  { timestamp: new Date(2026, 0, 12).getTime(), amount: 934 },
  { timestamp: new Date(2026, 0, 15).getTime(), amount: 120 },
  { timestamp: new Date(2026, 0, 16).getTime(), amount: 800 },
  { timestamp: new Date(2026, 0, 17).getTime(), amount: 302 },
  { timestamp: new Date(2026, 0, 18).getTime(), amount: 1000 },
  { timestamp: new Date(2026, 0, 20).getTime(), amount: 250 },
  { timestamp: new Date(2026, 0, 21).getTime(), amount: 420 },
  { timestamp: new Date(2026, 0, 23).getTime(), amount: 934 },
  { timestamp: new Date(2026, 0, 24).getTime(), amount: 35 },
  { timestamp: new Date(2026, 0, 25).getTime(), amount: 515 },
  { timestamp: new Date(2026, 0, 27).getTime(), amount: 615 },
  { timestamp: new Date(2026, 0, 29).getTime(), amount: 440 },
  { timestamp: new Date(2026, 0, 31).getTime(), amount: 515 }
];
(async () => {

  for (let i = 0; i < transactionData.length; i++) {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/subExpense",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTdmOTYyOTVjNTliM2QxYzZhNGI3YTciLCJpYXQiOjE3Njk5NjkxOTR9.2s2AX79L1yzLDAF4skM2u9nQQOMaPUjRDohRT2-ownQ",
          },
          body: JSON.stringify({
            expenseId: "697f966b5c59b3d1c6a4b7b1",
            date: transactionData[i].timestamp,
            totalAmount: transactionData[i].amount,
            isActive: false,
          }),
        }
      )

      if (!response.ok) {
        console.log("❌ HTTP error", response.status)
        continue
      }

      const data = await response.json()

      if (data.success) {
        console.log("✅ saved successfully")
      } else {
        console.log("❌ failed to save", data)
      }
    } catch (error) {
      console.error("🔥 request failed", error)
    }
  }

})()