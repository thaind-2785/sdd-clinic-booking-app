# Phase 5 Setup Guide - Google OAuth & Email Notifications

Hướng dẫn setup từng bước để Phase 5 hoạt động.

---

## Bước 1: Setup Google OAuth trong Supabase

### 1.1. Tạo Google OAuth Client

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện tại
3. Vào **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Chọn **Application type**: Web application
6. Điền thông tin:
   - **Name**: Clinic Booking App
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-domain.com (nếu có)
     ```
   - **Authorized redirect URIs**:
     ```
     https://rkrogsnwjrgxupbvfwlt.supabase.co/auth/v1/callback
     http://localhost:54321/auth/v1/callback (cho local dev)
     ```
7. Click **Create** và copy:
   - **Client ID**
   - **Client Secret**

### 1.2. Configure trong Supabase Dashboard

1. Truy cập: https://supabase.com/dashboard/project/rkrogsnwjrgxupbvfwlt
2. Vào **Authentication** → **Providers**
3. Tìm **Google** và click **Enable**
4. Paste:
   - **Client ID** (từ bước 1.1)
   - **Client Secret** (từ bước 1.1)
5. Click **Save**

### 1.3. Test Google OAuth

```bash
# Start dev server
npm run dev

# Mở browser: http://localhost:3000/login
# Click "Đăng nhập với Google"
# Nếu thành công → redirect về /patient-dashboard
```

---

## Bước 2: Setup Email Service với Resend

### 2.1. Tạo Resend Account

1. Truy cập: https://resend.com/signup
2. Đăng ký tài khoản miễn phí
3. Verify email

### 2.2. Lấy API Key

1. Sau khi login, vào **API Keys**
2. Click **Create API Key**
3. Đặt tên: `clinic-booking-production`
4. Click **Add** và **Copy** API key ngay (chỉ hiển thị 1 lần!)
5. Lưu vào file an toàn (sẽ dùng ở bước 3)

### 2.3. Verify Domain (Optional - cho production)

**Lưu ý**: Free tier có thể gửi tới email verified, production cần verify domain.

1. Vào **Domains** → **Add Domain**
2. Nhập domain của bạn (vd: `clinic-booking.com`)
3. Thêm DNS records theo hướng dẫn
4. Chờ verify (thường 5-10 phút)

**Để test ngay**: Skip bước này, Resend free tier cho gửi tới email bạn đã verify.

---

## Bước 3: Deploy Supabase Edge Function

### 3.1. Setup Supabase CLI (nếu chưa có)

```bash
# Đã login rồi, bỏ qua bước này
npx supabase login
```

### 3.2. Set Environment Variables cho Edge Function

```bash
# Set Resend API Key
npx supabase secrets set RESEND_API_KEY=re_YOUR_RESEND_API_KEY_HERE

# Set App URL
npx supabase secrets set APP_URL=http://localhost:3000

# Secrets sẽ tự động có SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY
```

### 3.3. Deploy Edge Function

```bash
# Deploy function
npx supabase functions deploy send-email

# Nếu thành công, output sẽ có URL:
# Function URL: https://rkrogsnwjrgxupbvfwlt.functions.supabase.co/send-email
```

### 3.4. Verify Deployment

```bash
# Test function (thay YOUR_APPOINTMENT_ID bằng ID thật)
curl -X POST 'https://rkrogsnwjrgxupbvfwlt.functions.supabase.co/send-email' \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "YOUR_APPOINTMENT_ID",
    "notificationType": "appointment_created"
  }'
```

**Lỗi thường gặp**:

- `RESEND_API_KEY not found`: Chạy lại bước 3.2
- `Template not found`: Edge Function không load được template files → Sẽ fix ở bước 3.5

### 3.5. Fix Template Loading (Nếu gặp lỗi template)

Edge Function cần deploy cả templates folder. Tạo file config:

```bash
# Tạo supabase/functions/send-email/deno.json
cat > supabase/functions/send-email/deno.json << 'EOF'
{
  "imports": {
    "supabase": "https://esm.sh/@supabase/supabase-js@2"
  }
}
EOF

# Deploy lại với --include-templates
npx supabase functions deploy send-email --include-templates
```

---

## Bước 4: Apply Database Migration (Email Triggers)

```bash
# Push migration mới (15_email_triggers.sql)
npx supabase db push

# Output sẽ hỏi confirm:
# Do you want to push these migrations to the remote database?
#  • 20251230000015_email_triggers.sql
# [Y/n] Y

# Verify trigger đã tạo
npx supabase db execute "
  SELECT trigger_name, event_manipulation, action_statement
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  AND event_object_table = 'appointments';
"
```

**Expected output**:

```
trigger_notify_appointment_created | INSERT | EXECUTE FUNCTION notify_appointment_change()
trigger_notify_appointment_updated | UPDATE | EXECUTE FUNCTION notify_appointment_change()
```

---

## Bước 5: Update Environment Variables

### 5.1. Update .env.local

```bash
# Thêm vào .env.local
cat >> .env.local << 'EOF'

# Email Service (không cần thiết nếu dùng Edge Function trigger)
# Nhưng để backup cho manual sending
RESEND_API_KEY=re_YOUR_RESEND_API_KEY_HERE

# App URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### 5.2. Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```

---

## Bước 6: Testing Phase 5

### Test 1: Google OAuth Login

```bash
# 1. Mở: http://localhost:3000/login
# 2. Click "Đăng nhập với Google"
# 3. Chọn Google account
# 4. Grant permissions
# 5. Kiểm tra redirect về /patient-dashboard
# 6. Verify user trong Supabase:
#    Dashboard → Authentication → Users
#    Nên thấy user mới với Google provider
```

### Test 2: Email Notification - Appointment Created

```bash
# 1. Login với Google (như Test 1)
# 2. Vào http://localhost:3000/clinics
# 3. Click vào "Phòng khám Đa khoa ABC"
# 4. Chọn time slot
# 5. Điền form booking và Submit
# 6. Kiểm tra email (email của Google account bạn dùng login)
# 7. Nên nhận được email "Yêu cầu đặt lịch đã được tạo"
```

### Test 3: Email Notification - Appointment Confirmed

**Cần tài khoản clinic_staff để test. Tạm thời test bằng SQL**:

```bash
# Update 1 appointment thành Confirmed
npx supabase db execute "
  UPDATE appointments
  SET status = 'Confirmed',
      approved_by = 'Admin Test',
      approved_at = NOW()
  WHERE id = 'YOUR_APPOINTMENT_ID';
"

# Kiểm tra email → Nên nhận "Lịch khám đã được xác nhận"
```

### Test 4: Email Notification - Appointment Rejected

```bash
# Update 1 appointment thành Rejected
npx supabase db execute "
  UPDATE appointments
  SET status = 'Rejected',
      rejection_reason = 'Thời gian không phù hợp'
  WHERE id = 'YOUR_APPOINTMENT_ID';
"

# Kiểm tra email → Nên nhận "Lịch khám đã bị từ chối"
```

### Test 5: Verify Notifications Table

```bash
# Check notification logs
npx supabase db execute "
  SELECT
    notification_type,
    recipient_email,
    delivery_status,
    sent_at
  FROM notifications
  ORDER BY sent_at DESC
  LIMIT 5;
"
```

---

## Troubleshooting

### Issue 1: Google OAuth không redirect về app

**Nguyên nhân**: Redirect URI không khớp

**Fix**:

```bash
# Check redirect URI trong Google Console
# Phải match chính xác với Supabase callback URL:
# https://rkrogsnwjrgxupbvfwlt.supabase.co/auth/v1/callback

# Check trong Supabase Dashboard → Authentication → URL Configuration
# Site URL: http://localhost:3000
# Redirect URLs: http://localhost:3000/**
```

### Issue 2: Email không gửi được

**Kiểm tra theo thứ tự**:

1. **Edge Function có deploy không?**

   ```bash
   npx supabase functions list
   # Nên thấy: send-email
   ```

2. **Secrets có set chưa?**

   ```bash
   npx supabase secrets list
   # Nên thấy: RESEND_API_KEY, APP_URL
   ```

3. **Resend API Key đúng chưa?**

   ```bash
   # Test trực tiếp Resend API
   curl -X POST 'https://api.resend.com/emails' \
     -H "Authorization: Bearer re_YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "your@email.com",
       "subject": "Test",
       "html": "<p>Hello</p>"
     }'
   ```

4. **Check Edge Function logs**:

   ```bash
   # Xem logs realtime
   npx supabase functions logs send-email --follow

   # Hoặc trong Dashboard:
   # Edge Functions → send-email → Logs
   ```

### Issue 3: Trigger không fire

**Kiểm tra**:

```bash
# 1. Verify trigger tồn tại
npx supabase db execute "
  SELECT * FROM pg_trigger WHERE tgname LIKE 'trigger_notify%';
"

# 2. Check function exists
npx supabase db execute "
  SELECT proname FROM pg_proc WHERE proname = 'notify_appointment_change';
"

# 3. Test manual invoke
npx supabase db execute "
  INSERT INTO appointments (
    patient_id, clinic_id, time_slot_id, reason_for_visit, status
  ) VALUES (
    'YOUR_USER_ID',
    'YOUR_CLINIC_ID',
    'YOUR_TIMESLOT_ID',
    'Test',
    'Pending'
  );
"
# Check logs để xem trigger có chạy không
```

### Issue 4: Template not found trong Edge Function

**Fix**: Templates phải nằm trong function folder

```bash
# Verify structure
ls -la supabase/functions/send-email/
# Nên có:
# - index.ts
# - templates/
#   - appointment-created.html
#   - appointment-confirmed.html
#   - appointment-rejected.html

# Deploy lại
npx supabase functions deploy send-email
```

---

## Verification Checklist

- [ ] Google OAuth login thành công
- [ ] User mới được tạo trong database với role 'patient'
- [ ] Patient profile được tạo tự động
- [ ] Appointment creation gửi email
- [ ] Email template render đúng với data
- [ ] Notification record được tạo trong DB
- [ ] Appointment approval trigger email
- [ ] Appointment rejection trigger email
- [ ] Edge Function logs không có error

---

## Next Steps

Sau khi Phase 5 hoạt động:

1. **Update Navigation**: Thêm Login/Logout button
2. **Protect Routes**: Wrap protected pages với ProtectedRoute
3. **Test Full Flow**: Patient login → Book → Clinic approve → Emails
4. **Phase 6**: Polish, performance, error handling

---

## Quick Commands Reference

```bash
# Deploy Edge Function
npx supabase functions deploy send-email

# Set secrets
npx supabase secrets set KEY=value

# View logs
npx supabase functions logs send-email --follow

# Push migrations
npx supabase db push

# Execute SQL
npx supabase db execute "SELECT * FROM appointments;"

# Restart dev
npm run dev
```

---

**Bắt đầu từ Bước 1 và làm tuần tự!**
