"use client"  

import React, { createContext, useContext, useState } from "react";  
import { useRouter } from "next/navigation";  
import { Input } from "@/components/ui/input"; // Adjust based on your actual UI library  
import { Button } from "@/components/ui/button"; // Adjust based on your actual UI library  
import { CardContainer } from "@/components/ui/card-container"; // Adjust based on your actual UI library  
import { Alert, AlertDescription } from "@/components/ui/alert"; // Adjust based on your actual UI library  
import Link from "next/link";  
import { motion } from "framer-motion";  

// Create the Auth Context  
const AuthContext = createContext();  

// Auth Provider Component  
export const AuthProvider = ({ children }) => {  
    const [user, setUser] = useState(null); // Holds the user data (if authenticated)  

    // Simulated sign-in function  
    const signIn = async (email, password) => {  
        // Normally, you'd call an API here to authenticate the user.  
        // This is just a mockup.  
        if (email === "user@example.com" && password === "password") {  
            setUser({ email }); // Set user if credentials are correct  
        } else {  
            throw new Error("Invalid email or password"); // Throw error on failure  
        }  
    };  

    const signOut = () => {  
        setUser(null); // Clear user on sign out  
    };  

    return (  
        <AuthContext.Provider value={{ user, signIn, signOut }}>  
            {children}  
        </AuthContext.Provider>  
    );  
};  

// Custom hook to use the Auth Context  
export const useAuth = () => {  
    return useContext(AuthContext);  
};  

// SignInForm Component  
const SignInForm = () => {  
    const [email, setEmail] = useState("");  
    const [password, setPassword] = useState("");  
    const [isLoading, setIsLoading] = useState(false);  
    const [error, setError] = useState(null);  
    const router = useRouter();  
    const { signIn } = useAuth(); // Using the auth context  

    const handleSubmit = async (e) => {  
        e.preventDefault();  
        setIsLoading(true);  
        setError(null);  

        try {  
            await signIn(email, password); // Attempt to sign in  
            router.push("/dashboard"); // Navigate to dashboard on success  
        } catch (err) {  
            setError(err); // Set error if sign in fails  
        } finally {  
            setIsLoading(false); // Reset loading state  
        }  
    };  

    return (  
        <div>  
            <motion.div>  
                <CardContainer>  
                    <form onSubmit={handleSubmit}>  
                        <Input   
                            type="email"  
                            placeholder="Email"  
                            value={email}  
                            onChange={(e) => setEmail(e.target.value)}  
                            required  
                        />  
                        <Input   
                            type="password"  
                            placeholder="Password"  
                            value={password}  
                            onChange={(e) => setPassword(e.target.value)}  
                            required  
                        />  
                        {error && (  
                            <Alert>  
                                <AlertDescription>{error.message}</AlertDescription>  
                            </Alert>  
                        )}  
                        <Button type="submit" disabled={isLoading}>  
                            {isLoading ? "Signing In..." : "Sign In"}  
                        </Button>  
                        <div className="text-center text-sm">  
                            <span className="text-gray-600">Don't have an account?</span>{" "}  
                            <Link href="/register" className="text-primary-600 hover:underline font-medium">  
                                Create Account  
                            </Link>  
                        </div>  
                    </form>  
                </CardContainer>  
            </motion.div>  
        </div>  
    );  
};  

// Main Application Component  
const MyApp = () => {  
    return (  
        <AuthProvider>  
            <SignInForm />  
        </AuthProvider>  
    );  
};  

export default MyApp;  
