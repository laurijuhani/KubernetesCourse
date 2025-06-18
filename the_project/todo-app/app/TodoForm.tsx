"use client";

import { useState } from "react";

interface TodoFormProps {
  fetchTodos: () => Promise<void>;
}

const TodoForm = ({ fetchTodos }: TodoFormProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.length > 0 && input.length <= 140) {
      await fetch("http://localhost:8081/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todo: input }),
      });
      setInput("");
      await fetchTodos(); 
    }
  }

  return (
    <form onSubmit={handleSubmit}>
        <input 
          className="bg-white text-black" 
          value={input}
          onChange={(e) => setInput(e.target.value)} 
          type="text" 
          maxLength={140} 
          required />
        <button 
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 p-1 rounded ml-2"  
        >
          Create todo</button>
      </form>
  )
}

export default TodoForm
