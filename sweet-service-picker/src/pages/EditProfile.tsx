import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, ArrowLeft } from 'lucide-react';
import MobileFrame from '@/components/MobileFrame';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import BirthdayPicker from '@/components/BirthdayPicker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { updateUserProfile, useAuthStore } from '@/services/auth.service';

type Gender = 'female' | 'male' | 'other';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        gender: '' as Gender | '',
        birthday: undefined as Date | undefined
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                gender: (user.gender as Gender) || '',
                birthday: user.birthday ? new Date(user.birthday) : undefined
            });
        }
    }, [user]);

    // Validate form
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = '請輸入姓名';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = '請輸入電話';
        } else if (!/^09\d{8}$/.test(formData.phone)) {
            newErrors.phone = '請輸入有效的手機號碼';
        }

        if (!formData.gender) {
            newErrors.gender = '請選擇性別';
        }

        if (!formData.birthday) {
            newErrors.birthday = '請選擇生日';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!user) {
            toast.error('找不到使用者資料，請重新登入');
            return;
        }

        setIsSubmitting(true);

        try {
            const updatedUser = await updateUserProfile(user.id, {
                name: formData.name,
                phone: formData.phone,
                gender: formData.gender as Gender,
                birthday: formData.birthday?.toISOString()
            });

            if (updatedUser) {
                toast.success('資料更新成功！');
                navigate('/member');
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            toast.error('儲存失敗，請稍後再試');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <MobileFrame>
                <div className="h-full flex items-center justify-center">
                    <p>請先登入</p>
                </div>
            </MobileFrame>
        );
    }

    return (
        <MobileFrame>
            <div className="h-full flex flex-col bg-background">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-3 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <h1 className="text-lg font-bold text-foreground">編輯個人資料</h1>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8">
                    <div className="w-full space-y-4">
                        {/* 姓名 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                姓名 *
                            </label>
                            <Input
                                placeholder="您的姓名"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={cn("h-12", errors.name && "border-destructive")}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name}</p>
                            )}
                        </div>

                        {/* 電話 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                電話 *
                            </label>
                            <Input
                                type="tel"
                                placeholder="0912345678"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className={cn("h-12", errors.phone && "border-destructive")}
                            />
                            {errors.phone && (
                                <p className="text-xs text-destructive">{errors.phone}</p>
                            )}
                        </div>

                        {/* 性別 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                性別 *
                            </label>
                            <div className="flex gap-3">
                                {[
                                    { value: 'female', label: '女' },
                                    { value: 'male', label: '男' },
                                    { value: 'other', label: '其他' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: option.value as Gender })}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl font-medium text-sm transition-all border",
                                            formData.gender === option.value
                                                ? "bg-milk-tea text-white border-milk-tea shadow-md"
                                                : "bg-background text-foreground border-border hover:border-milk-tea"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            {errors.gender && (
                                <p className="text-xs text-destructive">{errors.gender}</p>
                            )}
                        </div>

                        {/* 生日 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                生日 *
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "w-full px-4 py-3 bg-background rounded-xl border text-left flex items-center gap-3 hover:border-milk-tea transition-all h-12",
                                            errors.birthday ? "border-destructive" : "border-border",
                                            !formData.birthday && "text-muted-foreground/60"
                                        )}
                                    >
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        {formData.birthday ? format(formData.birthday, "yyyy/MM/dd") : "選擇生日"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <BirthdayPicker
                                        selected={formData.birthday}
                                        onSelect={(date) => setFormData({ ...formData, birthday: date })}
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.birthday && (
                                <p className="text-xs text-destructive">{errors.birthday}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            className="w-full h-12 text-lg mt-6"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '儲存中...' : '儲存變更'}
                        </Button>
                    </div>
                </div>
            </div>
        </MobileFrame>
    );
};

export default EditProfile;
