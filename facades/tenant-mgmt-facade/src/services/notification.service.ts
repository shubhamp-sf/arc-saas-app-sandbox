export class NotificationService{
    constructor(){}

    send=async (email:string,notification:string,data:any)=> {
        const webhookUrl = 'https://hooks.slack.com/services/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';

        const message = {
            text: `${email} ${notification}  ${JSON.stringify(data)}` 
        };

        
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });
            
            if (response.ok) {
                console.log('Message sent successfully to Slack');
            } else {
                console.error('Failed to send message to Slack:', await response.text());
            }
        } catch (error) {
            console.error('Error sending message to Slack:', error);
        }
    }
}

export type NotificationPayload={
   msg:any
}