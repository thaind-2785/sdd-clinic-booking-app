import Link from 'next/link';
import Button from '@/components/ui/Button';
import { getClinics } from '@/lib/supabase/queries/clinics';
import ClinicCard from '@/components/clinic/ClinicCard';

export default async function HomePage() {
  // Get featured clinics (first 6)
  const { data: clinics } = await getClinics({ limit: 6, offset: 0 });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="from-primary to-primary/80 bg-gradient-to-br py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Đặt lịch khám bệnh
              <br />
              Nhanh chóng & Tiện lợi
            </h1>
            <p className="mb-8 text-lg md:text-xl">
              Tìm phòng khám phù hợp, đặt lịch hẹn chỉ với vài cú nhấp chuột.
              Tiết kiệm thời gian, chăm sóc sức khỏe hiệu quả.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/clinics">
                <Button size="lg" variant="primary">
                  Tìm phòng khám
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="">
                  Đăng ký ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Tại sao chọn chúng tôi?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Tiết kiệm thời gian
              </h3>
              <p className="text-gray-600">
                Đặt lịch online 24/7, không cần gọi điện hay xếp hàng
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Dễ dàng quản lý
              </h3>
              <p className="text-gray-600">
                Xem lịch sử khám, nhận thông báo nhắc nhở tự động
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Nhiều lựa chọn
              </h3>
              <p className="text-gray-600">
                Hàng trăm phòng khám với đa dạng chuyên khoa
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clinics */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              Phòng khám nổi bật
            </h2>
            <Link href="/clinics">
              <Button variant="outline">Xem tất cả</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Sẵn sàng bắt đầu chưa?</h2>
          <p className="mb-8 text-lg">
            Đăng ký tài khoản để trải nghiệm dịch vụ đặt lịch khám bệnh tiện lợi
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Đăng ký miễn phí
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
