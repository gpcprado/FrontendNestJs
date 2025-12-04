'use client';

import Image from 'next/image';
import { getToken, logoutUser } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from "react";
import {User, LogOut, Key, Feather, Settings, MessageSquare, MoreVertical, Copy, Check, Zap, BellRing, XCircle} from "lucide-react" 

import { API_BASE } from '@/lib/config';

const quotes = [
    { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Happiness is not something readymade. It comes from your own actions.", author: "Dalai Lama" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { text: "It is better to be hated for what you are than to be loved for what you are not.", author: "André Gide" },
    { text: "Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that.", author: "Martin Luther King Jr." },
    { text: "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.", author: "Oprah Winfrey" },
    { text: "The past is a place of reference, not a place of residence; the past is a place of learning, not a place of living.", author: "Roy T. Bennett" },
    { text: "Change the world by being yourself.", author: "Amy Poehler" },
    { text: "Perfection is not attainable, but if we chase perfection we can catch excellence.", author: "Vince Lombardi" },
    { text: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.", author: "Martin Luther King Jr." },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas A. Edison" },
    { text: "We accept the love we think we deserve.", author: "Stephen Chbosky" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { text: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost" },
    { text: "You must do the things you think you cannot do.", author: "Eleanor Roosevelt" },
    { text: "Keep your eyes on the stars, and your feet on the ground.", author: "Theodore Roosevelt" },
    { text: "Tough times never last, but tough people do.", author: "Robert H. Schuller" },
    { text: "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.", author: "Helen Keller" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Try to be a rainbow in someone's cloud.", author: "Maya Angelou" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "The mind is its own place, and in itself can make a heaven of hell, a hell of heaven.", author: "John Milton" },
    { text: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah Gray" },
    { text: "A reader lives a thousand lives before he dies . . . The man who never reads lives only one.", author: "George R.R. Martin" },
    { text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.", author: "Thomas A. Edison" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { text: "The measure of a man is what he does with power.", author: "Plato" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle Onassis" }
];

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
  exp: number;
  iat: number;
}

interface SystemMessage {
  message_id?: number;
  message_code: string;
  message_content: string;
}

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#1b0a4d] rounded-xl shadow-2xl p-6 ${className}`}>
    {children}
  </div>
);

export default function DashboardHome() {
  const router = useRouter();

  const [username, setUsername] = useState("Guest");
  const [copySuccess, setCopySuccess] = useState(false);
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
  const [messageError, setMessageError] = useState<string | null>(null);
  
  const [currentQuote, setCurrentQuote] = useState(quotes[0].text);
  const [currentAuthor, setCurrentAuthor] = useState(quotes[0].author);

  const token = getToken();

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }
    const generateRandomQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    setCurrentQuote(quote.text);
    setCurrentAuthor(quote.author);
  }, []);

  const fetchSystemMessages = useCallback(async () => {
    if (!token) return;
    setMessageError(null);

    try {
        const res = await fetch(`${API_BASE}/messages`, {
            method: 'GET',
            headers: authHeaders(),
        });

        if (res.status === 401) {
            return;
        }

        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);      
        const data: SystemMessage[] = await res.json();         
        
        setSystemMessages(data);

    } catch (e: any) {
        if (token) {
          setMessageError('Failed to load system messages: ' + (e?.message || 'Unknown error'));
        }
    }
  }, [token]);

  const handleLogout = useCallback(() => {
    logoutUser();
    router.push('/');
  }, [router]);

  const handleCopyToken = useCallback(async () => {
    if (!token) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(token);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = token;
        textArea.style.position = 'fixed'; 
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) {
          throw new Error('Fallback copy failed');
        }
      }

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      console.log("Token copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy token:", err);
      alert("Error: Could not automatically copy token.");
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      console.log("No token found. Redirecting to login.");
      router.push('/');
      return; 
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) { 
          throw new Error("Token expired");
      }

      if (isMounted) {
        setUsername(decoded.username || 'User');
      }
      fetchSystemMessages();
      generateRandomQuote();

    } catch (e) {
      console.error("Token invalid or expired. Redirecting.", e);
      logoutUser();
      router.push('/');
    }

    return () => {
      isMounted = false;
    };
  }, [router, token, fetchSystemMessages, logoutUser, generateRandomQuote]);

  return (
    <div className="p-8 bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] min-h-screen text-white font-sans">
      
      <header  className="flex justify-between items-center pb-4 border-b border-white/10 mb-8"> 
      <div className="flex items-center space-x-3">
         <Image 
          src="/GWEB.png"
          alt="GRPWEB Logo"
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
        />
        <h1 className="text-3xl font-extrabold tracking-tight">GRPWEB</h1> 
       </div> 
     </header>
     
     <main className="mt-8">
       <h2 className="text-4xl font-light mb-8">
         Welcome, <span className="font-medium text-purple-300">{username}</span>
       </h2>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         
         <Card className="md:col-span-1">
           <h3 className="text-xl font-bold mb-3 flex items-center">
             <Key className="mr-2 h-5 w-5 text-blue-400" />
             Your Bearer Token
           </h3>
           <p className="text-white/70 text-sm mb-4">
             This token grants access to your account APIs. <span className="font-semibold text-red-300">Keep this secure and do not share it.</span>
           </p>
           
           <div className="flex items-center space-x-2">
             <input
               value={token || 'Not logged in or token expired...'}
               readOnly
               className="flex-1 px-4 py-3 border border-white/10 rounded-lg bg-[#0c0a1e] text-green-300 text-xs font-mono truncate shadow-inner focus:outline-none"
               />
             
             <Button
               onClick={handleCopyToken}
               variant="ghost" 
               size="icon"
               aria-label="Copy Token"
               className={`w-10 h-10 rounded-lg transition-all duration-300 ${copySuccess ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#0c0a1e] text-white hover:bg-blue-500'}`}
             >
               {copySuccess ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
             </Button>
             
           </div>
           <div className="h-4 mt-2">
             {copySuccess && <span className="text-green-400 text-xs flex items-center">Token Copied!</span>}
           </div>
         </Card>

        <Card className="md:col-span-1">
          <h3 className="text-xl font-bold mb-3 flex items-center text-left w-full">
            <Feather className="mr-2 h-5 w-5 text-blue-400" />
            Inspirational Quote
          </h3>
          <div className="h-32 flex flex-col justify-between">
            <blockquote className="text-white/90 italic text-lg leading-relaxed mb-3">
              &ldquo;{currentQuote}&rdquo;
            </blockquote>
            <p className="text-purple-300 font-semibold text-right">
              — {currentAuthor}
            </p>
          </div>
          <Button
            onClick={generateRandomQuote}
            className="bg-purple-600 hover:bg-purple-700 w-full mt-4 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
          >
            <Feather className="h-4 w-4" />
            <span>New Quote</span>
          </Button>
        </Card>

         <Card className="md:col-span-1">
           <h3 className="text-xl font-bold mb-3 flex items-center">
             <BellRing className="mr-2 h-5 w-5 text-blue-400 " />
             Messages
           </h3>
           {messageError ? (
             <p className="text-red-400 text-sm flex items-center">
               <XCircle className="h-4 w-4 mr-1"/>{messageError}
             </p>
           ) : systemMessages.length > 0 ? (
             <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
               {systemMessages.map((msg, index) => (
                 <div key={msg.message_id || index} className="bg-[#0c0a1e] p-3 rounded-lg border border-blue-500/30">
                   <p className="text-white/90 text-sm">{msg.message_content}</p>
                   <p className="text-xs text-blue-200 mt-1">Name: {msg.message_code}</p>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-white/70 text-sm">No messages available.</p>
           )}
             <Button
               onClick={() => router.push('/messages')}
               className="bg-blue-700 hover:bg-blue-800 w-full mt-2 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
             >
               <MessageSquare className="h-4 w-4" />
               <span>Edit Message</span>
             </Button>
         </Card>

         <Card className="md:col-span-2 lg:col-span-3 bg-[#1b0a4d] rounded-xl shadow-2xl p-6">
           <h3 className="text-xl font-bold mb-3 flex items-center">
             <Zap className="mr-2 h-5 w-5 text-yellow-400" />
             Quick Actions
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <Button
               onClick={() => router.push('/profile')}
               className="bg-blue-800 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
             >
               <User className="h-4 w-4" />
               <span>View Profile</span>
             </Button>
             <Button
               onClick={() => router.push('/posDashboard')}
               className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
             >
               <Settings className="h-4 w-4" />
               <span>Position Dashboard</span>
             </Button>
             <Button
               onClick={() => window.location.href = 'creator'}
               className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
             >
               <MessageSquare className="h-4 w-4" />
               <span>Creator Website</span>
             </Button>
               <Button
               onClick={handleLogout}
               className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
             >
               <LogOut className="h-4 w-4" />
               <span>Logout</span>
             </Button>
           </div>
         </Card>
       </div>
     </main>
   </div>
 );
}
