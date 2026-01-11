// Test script to send LINE Flex Message
import axios from 'axios';

const LINE_MESSAGING_URL = 'https://api.line.me/v2/bot/message';
const CHANNEL_ACCESS_TOKEN = '8wfUeylfQhX2QQJVJSdGg+WhRn2GEDEuvLIicbz6FWHlo2LBX4zWl3YOt2nxYOp1/95w0PxKRVn62ElqurGEIS2brcKvA1pwXBTtPSqAphoy7BdqIziU/t83jDex7ykyoOj802VeI6YqM66LKFqBEgdB04t89/1O/w1cDnyilFU=';
const USER_ID = 'Ud905176395c14ffb1d3947416de79c50';

const flexMessage = {
    type: 'flex',
    altText: '預約成功通知',
    contents: {
        type: 'bubble',
        hero: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: '預約成功',
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
                    text: '親愛的 測試用戶',
                    weight: 'bold',
                    size: 'md',
                    color: '#5D4E37',
                    margin: 'md'
                },
                {
                    type: 'text',
                    text: '您的預約已成功送出',
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
                                { type: 'text', text: '日期', size: 'sm', color: '#8B7355', flex: 1 },
                                { type: 'text', text: '2026年1月12日', size: 'sm', color: '#5D4E37', flex: 2 }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                { type: 'text', text: '時間', size: 'sm', color: '#8B7355', flex: 1 },
                                { type: 'text', text: '14:00', size: 'sm', color: '#5D4E37', flex: 2 }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                { type: 'text', text: '服務', size: 'sm', color: '#8B7355', flex: 1 },
                                { type: 'text', text: '單色凝膠手部, 手部基礎保養, 卸甲', size: 'sm', color: '#5D4E37', flex: 2, wrap: true }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                { type: 'text', text: '設計師', size: 'sm', color: '#8B7355', flex: 1 },
                                { type: 'text', text: 'Mika', size: 'sm', color: '#5D4E37', flex: 2 }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                { type: 'text', text: '消費', size: 'sm', color: '#8B7355', flex: 1 },
                                { type: 'text', text: 'NT$ 2,500', size: 'sm', color: '#5D4E37', weight: 'bold', flex: 2 }
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
        console.log('✅ 發送成功！請檢查您的 LINE');
        console.log('Response:', response.status);
    } catch (error: any) {
        console.error('❌ 發送失敗：', error.response?.data || error.message);
    }
}

sendTestNotification();
