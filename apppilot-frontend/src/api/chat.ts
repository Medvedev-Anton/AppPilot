const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "http://127.0.0.1:5678/webhook/c01a0983-cced-45bc-8abb-f59628b6c0cb";

export async function sendMessage(message: string): Promise<any> {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}
