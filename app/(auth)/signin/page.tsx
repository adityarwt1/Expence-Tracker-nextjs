"use client"
import { HttpStatusText } from "@/enums/HttpStatusCodeAndStatus";
import { SignInBody } from "@/interfaces/ApiReponses/v1/auth/signin/signinInterface";
import { signInServices } from "@/services/auth/signinservices/signin";
import { saveToken } from "@/services/localstorageServices/getAndSave";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
const SingInPage  = ()=>{
    const [formData, setFormData ] = useState<SignInBody>({
        email:"",
        password:""
    })
    const [isLoading ,setIsloading] = useState<boolean>()
    const [error, setError] = useState<string>()
    const router = useRouter()
    const [isShow, setIsShow] =useState<boolean>(false)
    const handleChange = (e:ChangeEvent<HTMLInputElement>)=>{
        const {name, value} = e.target
        
        setFormData(prev=>({
            ...prev,
            [name]:value
        }))
    }
    
    const handleSubmit = async (e:React.SubmitEvent<HTMLFormElement>)=>{
        e.preventDefault()
        if(!formData.email || !formData.password){
            setError("Provide information first!")
            return 
        }
        setIsloading(true)
        setError("")
        try {
            const response = await signInServices(formData)
            
            if(response.success && response.token){
                saveToken(response.token)
                router.replace('/')
            } else if(response.error == HttpStatusText.NOT_FOUND ){
                setError("User record not found please signup First!")
            } else if(response.error){
                setError(response.error)
            }
        } catch (error) {
            console.log(error)
            setError("Failed to signin!")
        } finally {
            setIsloading(false)
        }
    }
    const handleShow = ()=> setIsShow(!isShow)
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input type="text" name="email" onChange={handleChange}  />
                <label htmlFor="password">Password</label>
                <input type={isShow ?"text":"password"} name="password" onChange={handleChange} />
                <button type="button" onClick={handleShow}>{isShow ? "Hide":"Show"}</button>
                <button type="submit">{isLoading ? "SignIn...":"SignIn"}</button>
            </form>
            {error && (
                <div>{error}</div>
            )}
        </div>
    )
}

export default SingInPage