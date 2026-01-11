import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar } from 'lucide-react';
import MobileFrame from '@/components/MobileFrame';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import BirthdayPicker from '@/components/BirthdayPicker';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Gender = 'female' | 'male' | 'other';

const ProfileSetup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        gender: '' as Gender | '',
        birthday: undefined as Date | undefined
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setIsSubmitting(true);

        try {
            // TODO: Call API to save profile
            console.log('Submitting:', formData);
            toast.success('資料儲存成功！');

            // Navigate to home after success
            navigate('/');
        } catch (error) {
            console.error('Failed to save profile:', error);
            toast.error('儲存失敗，請稍後再試');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MobileFrame>
            <div className="h-full flex flex-col bg-background">
                {/* Header */}
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">完善您的資料</h1>
                    <p className="text-muted-foreground mb-8 text-center">
                        請填寫以下資料以完成註冊
                    </p>

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
                            {isSubmitting ? '處理中...' : '確認送出'}
                        </Button>
                    </div>
                </div>
            </div>
        </MobileFrame>
    );
};

export default ProfileSetup;
