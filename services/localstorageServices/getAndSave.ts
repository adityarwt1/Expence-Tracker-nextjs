"use client"
export const getToken = ()=> localStorage.getItem(process.env.NEXT_PUBLIC_TOKEN_CONTEXT as string)
export const saveToken  = (token:string) => localStorage.setItem(process.env.NEXT_PUBLIC_TOKEN_CONTEXT as string, token)