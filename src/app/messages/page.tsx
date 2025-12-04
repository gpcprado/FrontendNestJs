'use client';

import React, { useEffect, useState } from 'react';
import { getToken, logoutUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Menu, Send, X, Edit, Trash2 } from "lucide-react";

import { API_BASE } from '@/lib/config';

interface Messages {
  message_id?: number;
  message_code: string;
  message_content: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Messages[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messageCode, setMessageCode] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile use
  
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/');
      return;
    }

    fetchMessages();
  }, []);

  function authHeaders() {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  async function fetchMessages() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'GET',
        headers: authHeaders(),
      });

      if (res.status === 401) {
        logoutUser();
        router.push('/');
        return;
      }

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setMessages(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: Messages = { message_code: messageCode, message_content: messageContent };

    try {
      let res: Response;
      if (editingId) {
        res = await fetch(`${API_BASE}/messages/${editingId}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (res.status === 401) {
        logoutUser();
        router.push('/');
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Request failed: ${res.status}`);
      }

      setMessageCode('');
      setMessageContent('');
      setEditingId(null);
      setSelectedMessageId(null);
      await fetchMessages();
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    }
  }

  function selectMessage(msg: Messages) {
    setEditingId(msg.message_id ?? null);
    setSelectedMessageId(msg.message_id ?? null);
    setMessageCode(msg.message_code);
    setMessageContent(msg.message_content);
    setSidebarOpen(false); // for mobile use
  }

  function startEdit(p: Messages) {
    setEditingId(p.message_id ?? null);
    setMessageCode(p.message_code);
    setMessageContent(p.message_content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id: number) {
    if (!id) return;
    if (!confirm('Delete this message?')) return;
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/messages/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (res.status === 401) {
        logoutUser();
        router.push('/');
        return;
      }

      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

      if (editingId === id) {
        setEditingId(null);
        setSelectedMessageId(null);
        setMessageCode('');
        setMessageContent('');
      }

      await fetchMessages();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setSelectedMessageId(null);
    setMessageCode('');
    setMessageContent('');
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-1/3 lg:w-1/4`}>

        <div className="flex flex-col h-full">
          <header className="p-4 border-b bg-[#0c0a1e] text-white flex justify-between items-center">
            <h2 className="text-xl font-bold">Messages</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-white hover:bg-blue-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto p-2">
            {loading && <p className="text-center text-sm text-gray-500 py-4">Loading...</p>}
            {!loading && messages.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">No messages yet.</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.message_id}
                onClick={() => selectMessage(msg)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  msg.message_id === selectedMessageId
                    ? 'bg-blue-100 border-l-4 border-[#0c0a1e]'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <h3 className="font-semibold text-gray-800 truncate">{msg.message_code}</h3>
                <p className="text-sm text-gray-600 truncate">{msg.message_content}</p>
              </div>
            ))}
          </div>

          <footer className="p-4 border-t bg-gray-50">
            <Button
              className="w-full bg-[#0c0a1e] hover:bg-blue-500 text-white"
              onClick={() => router.push("/dashboard")}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </footer>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="p-4 border-b bg-white shadow-sm flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedMessageId ? `Editing: ${messageCode}` : 'Create Message'}
            </h2>
          </div>
          {selectedMessageId && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => startEdit(messages.find(m => m.message_id === selectedMessageId)!)}
              >
                <Edit className="h-4 w-4 bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] text-white" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(selectedMessageId)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </header>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 text-sm border-b">
            Error: {error}
          </div>
        )}

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {selectedMessageId || messageCode || messageContent ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="max-w-xs bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] text-white p-3 rounded-2xl rounded-br-md shadow-md">
                  <p className="text-xs font-mono opacity-80 mb-1">
                    Name: {messageCode || '(No Code)'}
                  </p>
                  <p>{messageContent || '(No Content)'}</p>
                </div>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                  {selectedMessageId ? 'Editing message' : 'Drafting new message'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-center">Select a message to edit or start creating a new one.</p>
            </div>
          )}
        </div>

        <footer className="p-4 border-t bg-white">
          <form onSubmit={handleCreateOrUpdate} className="flex space-x-2">
            <Input
              placeholder="Name"
              value={messageCode}
              onChange={(e) => setMessageCode(e.target.value)}
              required
              className="flex-1"
            />
            <Input
              placeholder="Message Content..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              required
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !messageCode || !messageContent}
              className="px-4 bg-[#0c0a1e] hover:bg-blue-500"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {editingId && (
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="mt-2 w-full bg-[#0c0a1e] 
              text-white hover:bg-blue-500"
            >
              Cancel Edit
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
