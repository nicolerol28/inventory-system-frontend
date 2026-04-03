import axiosClient from "./axiosClient";

export async function getInventoryInsights() {
  const response = await axiosClient.post("/assistant/chat", {
    message:
      'Analiza el estado actual del inventario y dame exactamente 3 insights breves y accionables. Responde ÚNICAMENTE con un JSON array, sin texto extra, sin markdown, sin backticks. Formato: [{"tipo":"info|warning|critico","mensaje":"texto breve"}]',
  });
  return response.data.reply;
}
