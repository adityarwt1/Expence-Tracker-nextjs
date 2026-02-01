"use client"
export const convertToBase64URL = async (file:File):Promise<ArrayBuffer | string | Buffer | null>=>{
    return new Promise((resolve, reject)=>{
        const reader = new FileReader()

        reader.onload = ()=> resolve(reader.result)
        reader.onerror = (e)=>reject(e)
        reader.readAsDataURL(file)
    })
}