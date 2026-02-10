const API_ENDPOINT = "http://127.0.0.1:5678/webhook/c01a0983-cced-45bc-8abb-f59628b6c0cb";

export async function sendMessage(message) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}
