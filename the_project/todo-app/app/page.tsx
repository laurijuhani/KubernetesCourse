"use client";
import Image from "next/image";
import TodoForm from "./TodoForm";
import { useEffect, useState } from "react";


export default function Home() {
  const [todos, setTodos] = useState<string[]>([]);

  const fetchTodos = async () => {
    try {
      const response = await fetch("http://localhost:8081/todos");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div>
      <h1>The project App</h1>
      <Image
        className="mb-4"
        src="/api/image"
        alt="Random Image"
        width={400}
        height={300}
        priority
      />

      <TodoForm fetchTodos={fetchTodos}/>
      

      <ul className="list-disc list-inside mb-2">
        {todos.map((todo, idx) => (
          <li key={idx}>{todo}</li>
        ))}
      </ul>

      <p>DevOps with Kubernetes 2025</p>
    </div>
  );
}
