// Test script to send LINE Registration Success notification
import axios from 'axios';

const LINE_MESSAGING_URL = 'https://api.line.me/v2/bot/message';
const CHANNEL_ACCESS_TOKEN = '8wfUeylfQhX2QQJVJSdGg+WhRn2GEDEuvLIicbz6FWHlo2LBX4zWl3YOt2nxYOp1/95w0PxKRVn62ElqurGEIS2brcKvA1pwXBTtPSqAphoy7BdqIziU/t83jDex7ykyoOj802VeI6YqM66LKFqBEgdB04t89/1O/w1cDnyilFU=';
const USER_ID = 'Ud905176395c14ffb1d3947416de79c50';

// Test phone: 0912345678 -> 0912***678
const maskedPhone = '0912***678';

const flexMessage = {
    type: 'flex',
    altText: '註冊成功',
    contents: {
        type: 'bubble',
        hero: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: '註冊成功',
                    weight: 'bold',
                    size: 'xl',
                    color: '#5D4E37',
                    align: 'center'
                }
            ],
            backgroundColor: '#E8DDD4',
            paddingAll: '20px'
        },
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: '歡迎 測試用戶',
                    weight: 'bold',
                    size: 'md',
                    color: '#5D4E37',
                    margin: 'md'
                },
                {
                    type: 'text',
                    text: '您的帳號已建立成功',
                    size: 'sm',
                    color: '#8B7355',
                    margin: 'sm'
                },
                {
                    type: 'separator',
                    margin: 'lg',
                    color: '#D4C4B5'
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'lg',
                    spacing: 'sm',
                    contents: [
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                { type: 'text', text: '姓名', size: 'sm', color: '#8B7355', flex: 1 },
                                { type: 'text', text: '測試用戶', size: 'sm', color: '#5D4E37', flex: 2 }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                { type: 'text', text: '電話', size: 'sm', color: '#8B7355', flex: 1 },
                                { type: 'text', text: maskedPhone, size: 'sm', color: '#5D4E37', flex: 2 }
                            ]
                        }
                    ]
                }
            ]
        }
    }
};

async function sendTestNotification() {
    try {
        const response = await axios.post(
            `${LINE_MESSAGING_URL}/push`,
            {
                to: USER_ID,
                messages: [flexMessage]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
                }
            }
        );
        console.log('✅ 註冊通知發送成功！');
        console.log('Response:', response.status);
    } catch (error: any) {
        console.error('❌ 發送失敗：', error.response?.data || error.message);
    }
}

sendTestNotification();
