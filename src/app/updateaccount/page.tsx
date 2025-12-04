"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveToken, getToken } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import { User, ChevronLeft, Save, ArrowLeft } from "lucide-react"; 

interface JwtPayload {
  sub?: number | string;
  username?: string;
}

export default function UpdateAccountPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<string | number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentToken = getToken();
    if (currentToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(currentToken);
        const id = decoded.sub || null;
        
        if (id) {
          setUserId(id);
        } else {
          setError("User ID could not be found in the token.");
        }
        if (decoded.username) {
          setUsername(decoded.username);
        }
      } catch (error) {
        console.error("Token decoding error:", error);
        setError("Invalid session. Please log in again.");
      }
    } else {
      setError("You must be logged in to update your account.");
    }
  }, []);

  const handleUpdateAccount = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const currentToken = getToken();
    if (!currentToken || !userId) {
      setError("Authentication failed. Please log in.");
      setIsSubmitting(false);
      return;
    }

    const requestBody: { username?: string; password?: string } = {};
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (trimmedUsername) {
      requestBody.username = trimmedUsername;
    }
    if (trimmedPassword) {
      requestBody.password = trimmedPassword;
    }

    if (Object.keys(requestBody).length === 0) {
      setError("Please enter a new username or password.");
      setIsSubmitting(false);
      return;
    }

    const API_BASE = "https://trialnestjs-fm3k.onrender.com"; 
    const updateUrl = `${API_BASE}/users/${userId}`;

    try {
      const res = await fetch(updateUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${currentToken}`,
        },
        body: JSON.stringify(requestBody), 
      });

      const data = await res.json();

      if (!res.ok) {
        setPassword("");
        setError(data.message || "Failed to update account");
        setIsSubmitting(false);
        return;
      }

      setSuccess("Account updated successfully! Redirecting...");

      if (data.accessToken) {
        saveToken(data.accessToken); 
      }

      setTimeout(() => {
        router.push("/profile");
      }, 1500);

    } catch (err) {
      setError("Network error: Could not connect to the server.");
      setIsSubmitting(false);
    }
  };

  if (!userId && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white 
      bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] p-4">

        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-white/80">
          Checking authentication...
        </p>
      </div>
    );
  }
  
  if (error && !userId) {
     return (
        <div className="flex flex-col items-center justify-center h-screen text-white bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] p-4 text-center">
            <User className="h-10 w-10 text-red-500 mb-4" />
            <p className="mb-6 text-red-400 font-semibold">{error}</p>
            <Button
                className="mt-2 text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                onClick={() => router.push("/profile")}
            >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Profile
            </Button>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] p-4">
      <Button 
        onClick={() => router.push("/profile")}
        variant="ghost" 
        className="absolute top-6 left-6 text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Back to Profile
      </Button>
      <Card 
        className="w-full max-w-sm bg-[#1b0a4d] border border-purple-500/30 shadow-3xl rounded-xl text-white transition-all duration-300 transform hover:scale-[1.01]"
      >
        <CardHeader className="p-8 pb-4 flex flex-col items-center">
          
          <div className="relative mx-auto mb-4 h-20 w-20 bg-[#0c0a1e] border-4 border-blue-900 rounded-full flex items-center justify-center overflow-hidden shadow-xl">
                    <Image 
                    src="/gweb.png"
                    alt="GRPWEB Logo"
                    width={50}
                    height={50}
                    priority
                    className="w-20 h-20 object-contain"
                    />
          </div>
          
          <CardTitle className="text-3xl font-bold text-white tracking-tight text-center">
            Modify Account
          </CardTitle>
          <CardDescription className="text-purple-300/80 text-center mt-2">
            Change your username or password below.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          <form onSubmit={handleUpdateAccount} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="Username" className="text-sm font-medium text-white/90">
                New Username
              </Label>
              <Input
                id="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
                className="bg-[#0c0a1e] border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-purple-500/50 placeholder:text-white/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-white/90">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (optional)"
                className="bg-[#0c0a1e] border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-purple-500/50 placeholder:text-white/50"
              />
            </div>

            {error && <p className="text-sm text-red-400 mt-2 text-center">{error}</p>}
            {success && <p className="text-sm text-green-400 mt-2 text-center">{success}</p>}

            <CardFooter className="p-0 flex flex-col items-start pt-2">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 shadow-lg shadow-purple-900/50 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="animate-spin w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 shadow-lg shadow-purple-900/50"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}