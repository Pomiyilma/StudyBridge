// src/pages/HealthCheck.js
import { useEffect, useState } from "react";
import api from "../api/client"; // axios instance

export default function HealthCheck() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get("/health").then((res) => setStatus(res.data.status));
  }, []);

  return <p>Backend status: {status}</p>;
}
