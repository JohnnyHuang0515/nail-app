// LINE Login Section Component
// Shows LINE login button when not logged in, or user info when logged in

import { useState } from 'react';
import { useAuthStore } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// LINE green color
const LINE_GREEN = '#06C755';

interface LineLoginSectionProps {
    onLoginSuccess?: () => void;
}

const LineLoginSection = ({ onLoginSuccess }: LineLoginSectionProps) => {
    const { user, isLoading, setLoading, setUser, setAccessToken } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    const handleLineLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            // In production, use LIFF SDK:
            // await liff.login();
            // const accessToken = liff.getAccessToken();

            // For now, simulate login with mock data for testing
            // TODO: Replace with actual LIFF SDK integration
            const mockUser = {
                id: 'test-user-id',
                name: '王小美',
                phone: '0912345678',
                gender: 'female' as const,
                birthday: '1995-06-15',
                lineUserId: 'U1234567890',
                // avatarUrl will be populated from LINE profile when using real LIFF SDK
            };

            setUser(mockUser);
            setAccessToken('mock-access-token');
            onLoginSuccess?.();

        } catch (err) {
            console.error('LINE login error:', err);
            setError('登入失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    // Not logged in - show LINE login button
    if (!user) {
        return (
            <div className="bg-card rounded-2xl p-6 border border-border text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#06C755]/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill={LINE_GREEN}>
                        <path d="M19.365 9.89c.50 0 .906.405.906.906 0 .500-.405.906-.906.906H17.61v1.238h1.755c.50 0 .906.405.906.905 0 .500-.405.906-.906.906h-2.66c-.501 0-.907-.405-.907-.906v-5.73c0-.501.406-.906.906-.906h2.66c.501 0 .907.405.907.906 0 .500-.406.905-.907.905H17.61v1.87h1.755zm-4.698 2.907c0 .382-.24.727-.596.857-.358.13-.76.028-1.005-.255l-2.403-2.925v2.323c0 .50-.406.906-.907.906-.5 0-.906-.406-.906-.906v-5.73c0-.382.24-.727.596-.857.357-.13.76-.028 1.004.255l2.403 2.925v-2.323c0-.5.406-.906.907-.906.5 0 .906.406.906.906v5.73zm-6.25-.048c0 .5-.406.906-.907.906-.5 0-.906-.406-.906-.906v-5.73c0-.501.406-.906.906-.906.501 0 .907.405.907.906v5.73zm-2.707 0c0 .5-.405.906-.906.906H2.143c-.5 0-.906-.406-.906-.906 0-.5.406-.906.906-.906h1.755v-4.824c0-.501.406-.906.906-.906.501 0 .906.405.906.906v5.73zM24 10.537C24 5.037 18.627.916 12 .916S0 5.038 0 10.537c0 4.756 4.226 8.737 9.934 9.492.387.083.912.253 1.045.58.118.299.077.767.038 1.069 0 0-.14.836-.17 1.013-.052.3-.238 1.175 1.03.64 1.267-.534 6.837-4.027 9.325-6.894C22.875 14.47 24 12.597 24 10.537z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    使用 LINE 登入
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    登入後即可完成預約並享有會員優惠
                </p>

                {error && (
                    <p className="text-sm text-destructive mb-3">{error}</p>
                )}

                <Button
                    onClick={handleLineLogin}
                    disabled={isLoading}
                    className="w-full h-12 text-white font-bold text-base"
                    style={{ backgroundColor: LINE_GREEN }}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="white">
                            <path d="M19.365 9.89c.50 0 .906.405.906.906 0 .500-.405.906-.906.906H17.61v1.238h1.755c.50 0 .906.405.906.905 0 .500-.405.906-.906.906h-2.66c-.501 0-.907-.405-.907-.906v-5.73c0-.501.406-.906.906-.906h2.66c.501 0 .907.405.907.906 0 .500-.406.905-.907.905H17.61v1.87h1.755zm-4.698 2.907c0 .382-.24.727-.596.857-.358.13-.76.028-1.005-.255l-2.403-2.925v2.323c0 .50-.406.906-.907.906-.5 0-.906-.406-.906-.906v-5.73c0-.382.24-.727.596-.857.357-.13.76-.028 1.004.255l2.403 2.925v-2.323c0-.5.406-.906.907-.906.5 0 .906.406.906.906v5.73zm-6.25-.048c0 .5-.406.906-.907.906-.5 0-.906-.406-.906-.906v-5.73c0-.501.406-.906.906-.906.501 0 .907.405.907.906v5.73zm-2.707 0c0 .5-.405.906-.906.906H2.143c-.5 0-.906-.406-.906-.906 0-.5.406-.906.906-.906h1.755v-4.824c0-.501.406-.906.906-.906.501 0 .906.405.906.906v5.73zM24 10.537C24 5.037 18.627.916 12 .916S0 5.038 0 10.537c0 4.756 4.226 8.737 9.934 9.492.387.083.912.253 1.045.58.118.299.077.767.038 1.069 0 0-.14.836-.17 1.013-.052.3-.238 1.175 1.03.64 1.267-.534 6.837-4.027 9.325-6.894C22.875 14.47 24 12.597 24 10.537z" />
                        </svg>
                    )}
                    LINE 登入
                </Button>
            </div>
        );
    }

    // Logged in - show user info
    return (
        <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            👤
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                        👋 歡迎，{user.name}
                    </h3>
                    {user.phone && (
                        <p className="text-sm text-muted-foreground">
                            {user.phone.substring(0, 4)}***{user.phone.substring(user.phone.length - 3)}
                        </p>
                    )}
                </div>
                <span className="text-xs bg-[#06C755]/10 text-[#06C755] px-2 py-1 rounded-full font-medium">
                    已連結 LINE
                </span>
            </div>
        </div>
    );
};

export default LineLoginSection;
