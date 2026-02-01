"use client"
import { HttpStatusText } from "@/enums/HttpStatusCodeAndStatus";
import { expenseGetInterfaces, expenseInterFaceGetResponse, Pagination } from "@/interfaces/ApiReponses/v1/expense/expenseInterfaces";
import { getToken } from "@/services/localstorageServices/getAndSave";
import { useRouter } from "next/navigation";
import React, { useEffect, useState }  from "react";

const HomePage = ()=>{
  const [expenses, setExpenses] = useState<expenseInterFaceGetResponse[]>()
  const [isLoading,setIsLoading] = useState<boolean>(false)
  const [pagination, setPagination] = useState<Pagination>({
    page:1,
    limit:20,
    totalDocumentCount:0
  })
  const [error, setError] = useState<string>("")
  const router = useRouter()
  useEffect(()=>{
    (async ()=>{
      try {
        setIsLoading(true)
      const token = getToken()

      if(!token){
        router.replace("/signin")
        return 
      }
      const response = await fetch(process.env.NEXT_PUBLIC_EXPENSE as string,{
        method:"GET",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${token}`
        }
      })
      const data:expenseGetInterfaces = await response.json()
      if(data.success && data.pagination){
        setExpenses(data.data)
        setPagination(data.pagination)
      }else if(data.error == HttpStatusText.UNAUTHORIZED ){
        router.replace('/signin')
      } else if(!data.success){
        setError("Failed to fetch data!")
      } 
      } catch (error) {
        setError("Failed to fetch data!")
      } finally {
        setIsLoading(false)
      }
    })()
  },[])
  return (
    <div>Home page</div>
  )
}

export default HomePage