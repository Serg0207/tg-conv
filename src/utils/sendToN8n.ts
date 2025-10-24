// src/utils/sendToN8n.ts
// Создайте этот НОВЫЙ файл

/**
 * Отправить данные в n8n webhook
 */
export async function sendToN8n(data: Record<string, any>): Promise<boolean> {
    // URL вашего n8n webhook
    const webhookUrl = 'https://shprotto.app.n8n.cloud/webhook/character-selection';
  
    try {
      console.log('Sending data to n8n:', data);
  
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('n8n response:', result);
  
      return true;
    } catch (error) {
      console.error('Error sending to n8n:', error);
      return false;
    }
  }