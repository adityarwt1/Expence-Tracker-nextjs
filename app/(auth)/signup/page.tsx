"use client"
import { HttpStatusText } from "@/enums/HttpStatusCodeAndStatus";
import { SignupInterfacesBody } from "@/interfaces/ApiReponses/v1/auth/signup/signupinterfaces";
import { signupService } from "@/services/auth/signup/signupServices";
import { convertToBase64URL } from "@/services/images/convertobase64";
import { saveToken } from "@/services/localstorageServices/getAndSave";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";

const SignUpPage = ()=>{
    const [formData, setFormdata] = useState<SignupInterfacesBody>({
        email:"",
        fullName:"",
        password:"",
        dp:""
    })
    const [isLoading ,setIsloading] = useState<boolean>(false)
    const router = useRouter()
    const [error, setError] = useState<string>("")
    const [isShow, setIsshow] = useState<boolean>(false)
    // handle change for the field
    const handleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        const {name, value} = e.target

        setFormdata(prev => ({
            ...prev,
            [name]:value
        }))
    }

    // handle imagechange 
    const handleImageChange = async (e:ChangeEvent<HTMLInputElement>)=>{
        const file = e.target.files?.[0]
        const url = await convertToBase64URL(file as File)

        if(url){
            setFormdata(prev=> ({
                ...prev,
                dp:url as string
            }))
        }
    }

    const handleSubmit = async (e:React.SubmitEvent<HTMLFormElement>)=>{
        e.preventDefault()
       if (!formData.email  || !formData.fullName || !formData.password) {
        setError("Fill the fields first!")
        return
        }

        setIsloading(true)
        setError("")
        try {
            const response = await signupService(formData)

            if(response.success && response.token){
                saveToken(response.token)
                router.replace('/')
            } else{
               setError(response.error == HttpStatusText.CONFLICT && "User already exist!" || "Failed to signup!") 
            }
        } catch (error) {
            setError("Failed to signup!")
        } finally {
            setIsloading(false)
        }
    }

    const handleShowPassword = ()=> setIsshow(!isShow)
    return (
        <div>
  <form onSubmit={handleSubmit}>
    <label htmlFor="dp">Profile Pic</label>
    <input
      type="file"
      name="dp"
      id="dp"
      onChange={handleImageChange}
    />

    <label htmlFor="email">Email</label>
    <input
      type="text"
      name="email"
      id="email"
      placeholder="Enter your email"
      onChange={handleChange}
    />

    <label htmlFor="fullName">Full Name</label>
    <input
      type="text"
      name="fullName"
      id="fullName"
      placeholder="Enter your full name"
      onChange={handleChange}
    />

    <label htmlFor="password">Password</label>
    <input
      type={isShow ? "text" : "password"}
      name="password"
      id="password"
      placeholder="Enter your password"
      onChange={handleChange}
    />

    <button type="button" onClick={handleShowPassword}>
      {isShow ? "Hide" : "Show"}
    </button>

    <button type="submit" disabled={isLoading}>{isLoading? "SignUp...":"SignUp"}</button>
  </form>
  {error && (
    <div>{error}</div>
  )}
</div>

    )
}

export default SignUpPage