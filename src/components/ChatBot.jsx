import { useEffect } from 'react';

export default function ChatBot() {
  useEffect(() => {
        if (document.getElementById('bp-web-widget-container')) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.botpress.cloud/webchat/v1/inject.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.botpressWebChat.init({
        botId: '4f33fb44-6818-45f0-8140-06751d3b0a32', // Replace with your bot ID
        clientId: '4f33fb44-6818-45f0-8140-06751d3b0a32', // Replace with your bot ID
        hostUrl: 'https://cdn.botpress.cloud/webchat/v1',
        messagingUrl: 'https://messaging.botpress.cloud',

        botName: 'ShopNow Atelier',
        avatarUrl: 'https://cdn-icons-png.flaticon.com/512/263/263142.png',
        accentColor: '#42427D',
        backgroundColor: '#ffffff',
        userMessageBackgroundColor: '#42427D',
        userMessageTextColor: '#ffffff',
        layoutHeight: '600px',
        layoutWidth: '400px',
        composerPlaceholder: 'Chat with us!',
        enableReset: true,
        showPoweredBy: false,
      });
    };
  }, []);

  return null;
}
