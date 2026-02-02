export default {
  async fetch(request, env) {
    // Handle contact form submissions
    if (request.method === 'POST' && request.url.includes('/api/contact')) {
      try {
        const data = await request.json();
        const { name, discord, message } = data;

        // Validate input
        if (!name || !discord || !message) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Send to Discord webhook (stored securely in environment variable)
        const webhookUrl = env.DISCORD_WEBHOOK_URL;
        if (!webhookUrl) {
          console.error('Discord webhook URL not configured');
          return new Response(JSON.stringify({ error: 'Server configuration error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const discordResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: 'New Contact Request',
              color: 0xff2a55,
              fields: [
                { name: 'Name', value: name, inline: true },
                { name: 'Discord', value: discord, inline: true },
                { name: 'Message', value: message }
              ],
              timestamp: new Date().toISOString()
            }]
          })
        });

        if (discordResponse.ok) {
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          console.error('Discord webhook failed:', discordResponse.status);
          return new Response(JSON.stringify({ error: 'Failed to send message' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.error('Error processing contact form:', error);
        return new Response(JSON.stringify({ error: 'Server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static assets for all other requests
    return env.ASSETS.fetch(request);
  }
};
