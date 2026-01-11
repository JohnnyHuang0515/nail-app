import axios from 'axios';

const LINE_API_URL = 'https://api.line.me/v2';
const LINE_MESSAGING_URL = 'https://api.line.me/v2/bot/message';

interface LineUserProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
}

/**
 * Verify LINE access token and get user profile
 * @param accessToken - LINE access token from frontend
 * @returns User profile from LINE
 */
export async function verifyLineToken(accessToken: string): Promise<LineUserProfile | null> {
    try {
        // Verify the token
        const verifyRes = await axios.get(`${LINE_API_URL}/oauth2/v2.1/verify`, {
            params: { access_token: accessToken }
        });

        if (verifyRes.data.expires_in <= 0) {
            console.error('LINE token expired');
            return null;
        }

        // Get user profile
        const profileRes = await axios.get(`${LINE_API_URL}/profile`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return profileRes.data as LineUserProfile;
    } catch (error) {
        console.error('LINE token verification failed:', error);
        return null;
    }
}

/**
 * Send a push message to a LINE user
 * @param userId - LINE user ID
 * @param message - Message text
 */
export async function sendLineMessage(userId: string, message: string): Promise<boolean> {
    const channelAccessToken = process.env.LINE_MESSAGING_ACCESS_TOKEN;

    if (!channelAccessToken) {
        console.error('LINE_MESSAGING_ACCESS_TOKEN not configured');
        return false;
    }

    try {
        await axios.post(
            `${LINE_MESSAGING_URL}/push`,
            {
                to: userId,
                messages: [
                    {
                        type: 'text',
                        text: message
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${channelAccessToken}`
                }
            }
        );
        return true;
    } catch (error) {
        console.error('Failed to send LINE message:', error);
        return false;
    }
}

/**
 * Send booking CREATED notification to customer (Flex Message)
 * Triggered when customer successfully creates a booking
 */
export async function sendBookingCreatedNotification(
    userId: string,
    customerName: string,
    serviceName: string,
    scheduledAt: Date,
    stylistName: string,
    totalPrice: number
): Promise<boolean> {
    const channelAccessToken = process.env.LINE_MESSAGING_ACCESS_TOKEN;

    if (!channelAccessToken) {
        console.error('LINE_MESSAGING_ACCESS_TOKEN not configured');
        return false;
    }

    const dateStr = scheduledAt.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const timeStr = scheduledAt.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Flex Message Card (奶茶色系 - 低飽和)
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
                        text: `親愛的 ${customerName}`,
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
                                    { type: 'text', text: dateStr, size: 'sm', color: '#5D4E37', flex: 2 }
                                ]
                            },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    { type: 'text', text: '時間', size: 'sm', color: '#8B7355', flex: 1 },
                                    { type: 'text', text: timeStr, size: 'sm', color: '#5D4E37', flex: 2 }
                                ]
                            },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    { type: 'text', text: '服務', size: 'sm', color: '#8B7355', flex: 1 },
                                    { type: 'text', text: serviceName, size: 'sm', color: '#5D4E37', flex: 2, wrap: true }
                                ]
                            },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    { type: 'text', text: '設計師', size: 'sm', color: '#8B7355', flex: 1 },
                                    { type: 'text', text: stylistName, size: 'sm', color: '#5D4E37', flex: 2 }
                                ]
                            },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                contents: [
                                    { type: 'text', text: '消費', size: 'sm', color: '#8B7355', flex: 1 },
                                    { type: 'text', text: `NT$ ${totalPrice.toLocaleString()}`, size: 'sm', color: '#5D4E37', weight: 'bold', flex: 2 }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    };

    try {
        await axios.post(
            `${LINE_MESSAGING_URL}/push`,
            {
                to: userId,
                messages: [flexMessage]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${channelAccessToken}`
                }
            }
        );
        console.log(`LINE notification sent to ${userId}`);
        return true;
    } catch (error: any) {
        console.error('Failed to send LINE message:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Mask phone number (e.g., 0912345678 -> 0912***678)
 * Shows first 4 digits, 3 stars, then last 3 digits
 */
function maskPhone(phone: string): string {
    if (!phone || phone.length < 10) return phone;
    return `${phone.substring(0, 4)}***${phone.substring(phone.length - 3)}`;
}

/**
 * Send registration success notification to new user (Flex Message)
 * Triggered when user registers via LINE Login for the first time
 */
export async function sendRegistrationSuccessNotification(
    userId: string,
    displayName: string,
    phone?: string
): Promise<boolean> {
    const channelAccessToken = process.env.LINE_MESSAGING_ACCESS_TOKEN;

    if (!channelAccessToken) {
        console.error('LINE_MESSAGING_ACCESS_TOKEN not configured');
        return false;
    }

    // Mask phone number if provided
    const maskedPhone = phone ? maskPhone(phone) : '未設定';

    // Flex Message Card (奶茶色系)
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
                        text: `歡迎 ${displayName}`,
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
                                    { type: 'text', text: displayName, size: 'sm', color: '#5D4E37', flex: 2 }
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

    try {
        await axios.post(
            `${LINE_MESSAGING_URL}/push`,
            {
                to: userId,
                messages: [flexMessage]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${channelAccessToken}`
                }
            }
        );
        console.log(`Registration notification sent to ${userId}`);
        return true;
    } catch (error: any) {
        console.error('Failed to send registration notification:', error.response?.data || error.message);
        return false;
    }
}

