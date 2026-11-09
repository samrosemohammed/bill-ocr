"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/bills", { method: "POST", body: formData });
    const data = await res.json();
    console.log("Response:", data);

    setLoading(false);
    if (res.ok) setUrl(data.url);
    else alert(data.error);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" name="file" accept="image/*" required />
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {url && <img src={url} alt="Uploaded" width={300} />}
    </div>
  );
}
