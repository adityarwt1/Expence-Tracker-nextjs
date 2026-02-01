"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"

interface ReportData {
  rangeTotal: number
  yearTotal: number
  allTimeTotal: number
}

const ExpenseReport = () => {
  const params = useParams()
  const id = params.id

  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/v1/report/public?month=${month}&year=${year}&id=${id}`
      )
      const result = await res.json()
      if (result.success) setData(result.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [month, year, id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ]

  return (
    <div
      className="
        h-screen 
        w-full 
        flex 
        flex-col 
        items-center 
        justify-center 
        font-mono 
        text-[#002366]
        bg-white
        bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]
        bg-[size:40px_40px]
      "
    >

      {/* FILTERS */}
      <div className="flex gap-4 mb-10">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="
            w-44 
            border-2 
            border-[#002366] 
            p-2 
            rounded-md 
            font-bold 
            outline-none 
            bg-white
          "
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="
            w-44 
            border-2 
            border-[#002366] 
            p-2 
            rounded-md 
            font-bold 
            outline-none 
            bg-white
          "
        >
          {[2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* CARD */}
      <div className="w-full max-w-5xl border-2 border-[#002366] rounded-xl overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="p-16 text-center tracking-widest animate-pulse">
            LOADING_DATA...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-2 divide-[#002366]">

            {/* MONTH */}
            <div className="p-10 flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-widest opacity-70 mb-2">
                Month Total
              </span>
              <span className="text-4xl font-black font-mono">
                ₹{data?.rangeTotal?.toLocaleString("en-IN")}
              </span>
            </div>

            {/* YEAR */}
            <div className="p-10 flex flex-col items-center justify-center bg-[#002366] text-white">
              <span className="text-xs uppercase tracking-widest opacity-80 mb-2">
                Year {year}
              </span>
              <span className="text-4xl font-black font-mono">
                ₹{data?.yearTotal?.toLocaleString("en-IN")}
              </span>
            </div>

            {/* ALL TIME */}
            <div className="p-10 flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-widest opacity-70 mb-2">
                All Time
              </span>
              <span className="text-4xl font-black font-mono">
                ₹{data?.allTimeTotal?.toLocaleString("en-IN")}
              </span>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default ExpenseReport
