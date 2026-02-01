"use client"

import { getToken } from "@/services/localstorageServices/getAndSave"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"

interface ReportData {
  rangeTotal: number;
  yearTotal: number;
  allTimeTotal: number;
}

const ExpenseReport = () => {
  const router = useRouter()
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const token = getToken()
    const url = `/api/v1/report?month=${month}&year=${year}`
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        router.replace('/signin')
        return
      }

      const result = await response.json()
      if (result.success) setData(result.data)
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }, [month, year, router])

  useEffect(() => { fetchData() }, [fetchData])

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  return (
    <div className="bg-[#F6FAFF] p-6 font-mono text-[#002366]">
      {/* Selection Controls */}
      <div className="flex gap-2 mb-8 justify-end">
        <select 
          value={month} 
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border-2 border-[#002366] p-1 rounded font-bold text-sm outline-none"
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>

        <select 
          value={year} 
          onChange={(e) => setYear(Number(e.target.value))}
          className="border-2 border-[#002366] p-1 rounded font-bold text-sm outline-none"
        >
          {[2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Main Stats Card */}
      <div className="border-2 border-[#002366] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center animate-pulse tracking-widest">LOADING_DATA...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-2 divide-[#002366]">
            
            {/* Range Total (Monthly) */}
            <div className="p-8 flex flex-col items-center justify-center bg-white">
              <span className="text-xs font-bold uppercase mb-2 opacity-70">Month Range</span>
              <div className="text-3xl font-black italic font-mono">
                ₹{data?.rangeTotal?.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Year Total */}
            <div className="p-8 flex flex-col items-center justify-center bg-[#002366] text-white">
              <span className="text-xs font-bold uppercase mb-2 opacity-80 text-blue-200">Year <span className="font-mono">{year}</span></span>
              <div className="text-3xl font-black italic font-mono">
                ₹{data?.yearTotal?.toLocaleString('en-IN')}
              </div>
            </div>

            {/* All Time Total */}
            <div className="p-8 flex flex-col items-center justify-center bg-white">
              <span className="text-xs font-bold uppercase mb-2 opacity-70">Cumulative Total</span>
              <div className="text-3xl font-black italic">
                ₹{data?.allTimeTotal?.toLocaleString('en-IN')}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default ExpenseReport