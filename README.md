# 🏥 Clinic Booking App

Ứng dụng đặt lịch khám bệnh trực tuyến, giúp bệnh nhân tìm kiếm phòng khám và đặt lịch hẹn một cách nhanh chóng, tiện lợi. Hệ thống cũng hỗ trợ phòng khám quản lý lịch hẹn, xác nhận và từ chối yêu cầu đặt lịch.

## ✨ Tính năng chính

### Dành cho Bệnh nhân (Patient)
- 🔍 Tìm kiếm phòng khám theo chuyên khoa
- 📅 Đặt lịch hẹn khám bệnh trực tuyến
- 👤 Quản lý hồ sơ cá nhân và lịch sử khám bệnh
- 🔔 Nhận thông báo email khi lịch hẹn được xác nhận/từ chối
- 📊 Xem trạng thái lịch hẹn (Pending, Confirmed, Rejected, Cancelled)

### Dành cho Phòng khám (Clinic Staff)
- 📋 Quản lý danh sách yêu cầu đặt lịch
- ✅ Xác nhận hoặc từ chối lịch hẹn
- 👥 Xem thông tin bệnh nhân
- 📈 Dashboard tổng quan lịch hẹn
- 🔔 Hệ thống thông báo email tự động

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes, Server Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Email**: Supabase Edge Functions
- **Testing**: 
  - Vitest (Unit Tests)
  - Playwright (E2E Tests)
  - Testing Library (Integration Tests)
- **Code Quality**: ESLint, Prettier
- **Security**: Row-Level Security (RLS) policies

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- **Node.js** >= 18.x
- **npm** >= 9.x (hoặc yarn/pnpm)
- **Git**
- Tài khoản **Supabase** (miễn phí tại [supabase.com](https://supabase.com))

## 🚀 Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd sdd-demo/clinic-booking-app
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Thiết lập Supabase

#### a. Tạo project mới trên Supabase
1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Tạo project mới
3. Đợi database được khởi tạo

#### b. Chạy migrations
```bash
# Cài đặt Supabase CLI (nếu chưa có)
npm install -g supabase

# Đăng nhập Supabase
npx supabase login

# Link project của bạn
npx supabase link --project-ref <your-project-ref>

# Chạy migrations
npx supabase db push
```

### 4. Cấu hình Environment Variables

Tạo file `.env.local` từ template:

```bash
cp .env.example .env.local
```

Cập nhật các giá trị trong `.env.local`:

```env
# Lấy từ Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Lưu ý**: Tìm thông tin này tại:
- Supabase Dashboard → Project Settings → API
- Copy `Project URL` và `anon/public key`

### 5. Chạy development server

```bash
npm run dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000)

### 6. Tạo tài khoản đầu tiên

1. Truy cập [http://localhost:3000/login](http://localhost:3000/login)
2. Nhấn "Đăng ký" để tạo tài khoản mới
3. Nhập email, mật khẩu, họ tên và chọn vai trò (Patient hoặc Clinic Staff)
4. Đăng nhập và bắt đầu sử dụng

## 📁 Cấu trúc project

```
sdd-demo/
├── clinic-booking-app/        # Main application
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth route group (login, signup)
│   │   ├── (patient)/        # Patient route group
│   │   ├── (clinic)/         # Clinic route group
│   │   ├── api/              # API routes
│   │   └── clinics/          # Public clinic listing
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── auth/             # Authentication components
│   │   ├── clinic/           # Clinic-specific components
│   │   └── appointment/      # Appointment components
│   ├── lib/                   # Utilities & helpers
│   │   ├── supabase/         # Supabase client & queries
│   │   ├── auth/             # Auth logic
│   │   ├── services/         # Business logic
│   │   └── validations/      # Zod schemas
│   ├── supabase/             # Database migrations & functions
│   │   ├── migrations/       # SQL migrations
│   │   └── functions/        # Edge functions
│   └── tests/                # Test files
│       ├── unit/             # Unit tests
│       ├── integration/      # Integration tests
│       └── e2e/              # End-to-end tests
└── specs/                    # Project specifications
    └── 001-clinic-booking/   # Feature specifications
```

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit              # Chạy tất cả unit tests
npm run test:unit:watch        # Watch mode
npm run test:coverage          # Xem coverage
```

### E2E Tests
```bash
npm run test:e2e               # Chạy E2E tests
npm run test:e2e:ui            # Chạy với UI
```

## 📝 Scripts có sẵn

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Kiểm tra code với ESLint
npm run format       # Format code với Prettier
npm run format:check # Kiểm tra formatting
```

## 🔒 Security

Dự án sử dụng Row-Level Security (RLS) policies để đảm bảo:
- Bệnh nhân chỉ xem được lịch hẹn của mình
- Nhân viên phòng khám chỉ xem được lịch hẹn của phòng khám mình làm việc
- Dữ liệu nhạy cảm được bảo vệ ở database level

## 🐛 Troubleshooting

### Lỗi kết nối Supabase
- Kiểm tra `.env.local` có đúng URL và anon key
- Kiểm tra project Supabase đã được khởi tạo đầy đủ

### Lỗi migrations
```bash
# Reset database (CHÚ Ý: Sẽ xóa toàn bộ dữ liệu)
npx supabase db reset
```

### Lỗi TypeScript
```bash
# Regenerate types từ database
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
```

## 📚 Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập và demo.
