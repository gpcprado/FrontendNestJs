"use client";

import { getToken, logoutUser } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { User, MoreVertical, Shield, Hash, Edit, Trash2, Upload, Mail, ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Image from 'next/image';


interface JwtPayload {
  sub?: number | string;
  username?: string;
  role?: string;
  exp?: number;
  iat?: number;
  id?: string;
  fullId?: string | number; 
}

interface ProfileDetailProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  isLoading: boolean;
}


function useProfileData() {
  const token = getToken();
  const [profile, setProfile] = useState<{ 
    username: string; 
    role: string; 
    userId: string;
    fullUserId: string | number | undefined;
    loading: boolean 
  }>({
    username: "Loading...",
    role: "Loading...",
    userId: "Loading...",
    fullUserId: undefined,
    loading: true,
  });

  useEffect(() => {
    if (!token) {
      setProfile({ username: "Guest", role: "Unknown", userId: "N/A", fullUserId: undefined, loading: false });
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error("Token expired");
      }

      const decodedId = decoded.sub || decoded.id;

      const fullId = decoded.sub || decoded.id || decoded.fullId; 

      setProfile({
        username: decoded.username || "Guest",
        role: decoded.role || "Unknown",
        userId: decodedId ? String(decodedId).substring(0, 8) + "..." : "N/A",
        fullUserId: fullId, 
        loading: false,
      });

    } catch (error) {
      console.error("Error decoding token:", error);
      setProfile({ username: "Guest", role: "Unknown", userId: "N/A", fullUserId: undefined, loading: false });
    }
  }, [token]);

  return profile;
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({ icon: Icon, label, value, color, isLoading }) => (
  <div className="flex items-center space-x-3 p-4 bg-[#1b0a4d] border border-white/10 rounded-xl shadow-inner transition-colors duration-200 hover:bg-purple-900/20">
    <div className={`p-2 rounded-full ${color} bg-white/5`}>
      <Icon className="h-5 w-5"/>
    </div>
    
    <div>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      {isLoading ? (
        <div className="w-32 h-4 bg-gray-700 rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-white font-semibold text-base break-words">{value}</p>
      )}
    </div>
  </div>
);

export default function ProfilePage() {
  const router = useRouter();

  const { username, role, userId, loading } = useProfileData();



  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] p-4">
      <Card 
        className="w-full max-w-xl bg-[#1b0a4d] border border-purple-500/30 shadow-3xl relative overflow-hidden transition-all duration-300 transform hover:scale-[1.01]"
      >
        
        <CardHeader className="text-center pt-12 pb-8 relative border-b border-white/10">
          <div className="relative mx-auto mb-4 h-24 w-24 bg-[#0c0a1e] border-4 border-blue-900 
          rounded-full flex items-center justify-center overflow-hidden shadow-xl">

        <Image 
        src="/GWEB.png"
        alt="GRPWEB Logo"
        width={50}
        height={50}
        priority
        className="w-20 h-20 object-contain"
        />
          </div>
          
          <CardTitle className="text-4xl font-extrabold tracking-tight text-white mb-1">
            {username}
          </CardTitle>
            <p className="text-gray-400 text-sm">Member since {new Date().getFullYear()}</p>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-4">Account Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileDetail 
              icon={User} 
              label="Username" 
              value={username} 
              color="text-indigo-400" 
              isLoading={loading}
            />

            <ProfileDetail 
              icon={Shield} 
              label="Role" 
              value={role} 
              color="text-green-400" 
              isLoading={loading}
            />

            <ProfileDetail 
              icon={Hash} 
              label="User ID" 
              value={userId} 
              color="text-blue-400" 
              isLoading={loading}
            />
            
            <ProfileDetail
              icon={Mail} 
              label="Email Address" 
              value={`${username}@grpweb.com`}
              color="text-yellow-400" 
              isLoading={loading}
            />
          </div>
          
          <hr className="border-white/10 mt-6 mb-6" />
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 shadow-lg shadow-purple-900/50"
            onClick={() => router.push("/updateaccount")}
            disabled={loading}
          >
            <Edit className="h-4 w-4 mr-2" /> Modify Account Details
          </Button>
  
          <Button 
            onClick={() => router.push("/dashboard")}
            variant="ghost" 
            className="absolute top-6 left-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}