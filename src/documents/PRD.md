# Tài liệu Đặc tả Yêu cầu Sản phẩm (PRD)

## 1. Giới thiệu

### 1.1 Mục tiêu sản phẩm

Hệ Thống Thương Mại Điện Tử Toàn Diện là một nền tảng trực tuyến giúp kết nối người mua và người bán, cho phép mua sắm, bán hàng, quản lý đơn hàng, thanh toán và giao hàng một cách tiện lợi và an toàn. Nền tảng hướng tới việc nâng cao trải nghiệm người dùng, đảm bảo sự minh bạch và an toàn trong giao dịch thương mại điện tử.

## 2. Đối tượng người dùng

* **Người dùng cuối (Khách hàng):** Người mua sắm trên hệ thống.
* **Người bán (Chủ shop):** Cá nhân hoặc doanh nghiệp đăng sản phẩm lên bán.
* **Quản trị viên hệ thống:** Người quản lý và giám sát hoạt động của toàn bộ nền tảng.

## 3. Các tính năng chính

### 3.1 Dành cho người dùng cuối

* Đăng ký / đăng nhập
* Tìm kiếm và duyệt sản phẩm
* Thêm sản phẩm vào giỏ hàng
* Đặt hàng và thanh toán
* Theo dõi đơn hàng
* Đánh giá và phản hồi sản phẩm
* Quản lý hồ sơ cá nhân

### 3.2 Dành cho người bán

* Đăng ký tài khoản người bán
* Đăng tải và quản lý sản phẩm
* Quản lý đơn hàng
* Quản lý tồn kho
* Quản lý khuyến mãi
* Thống kê doanh số

### 3.3 Dành cho quản trị viên

* Quản lý người dùng (khách hàng & người bán)
* Duyệt / kiểm duyệt sản phẩm
* Quản lý danh mục sản phẩm
* Quản lý đơn hàng
* Quản lý báo cáo và khiếu nại
* Hệ thống dashboard thống kê

## 4. Luồng người dùng (User Flows)

### 4.1 Đăng ký / Đăng nhập

* Người dùng truy cập trang → chọn "Đăng ký" → nhập thông tin → nhận mã xác thực → hoàn tất.
* Người dùng đăng nhập → nhập email/mật khẩu → xác thực → truy cập dashboard.

### 4.2 Đặt hàng

* Người dùng chọn sản phẩm → Thêm vào giỏ → Xem giỏ → Chọn phương thức thanh toán → Đặt hàng.

### 4.3 Quản lý sản phẩm (Người bán)

* Đăng nhập → Vào trang quản lý → Thêm sản phẩm → Nhập thông tin → Đăng tải.

### 4.4 Quản lý hệ thống (Admin)

* Đăng nhập → Dashboard → Quản lý tài khoản / sản phẩm / đơn hàng / khiếu nại.

## 5. Yêu cầu phi chức năng

* **Ứng dụng responsive:** Tương thích mọi thiết bị (desktop, mobile, tablet)
* **Tốc độ tải trang:** < 2 giây
* **Bảo mật:** mã hóa mật khẩu, xác thực JWT, chống CSRF, bảo vệ DDoS cơ bản
* **Khả năng mở rộng:** hỗ trợ hàng ngàn user đồng thời
* **Độ tin cậy:** uptime tối thiểu 99%

## 6. Mô hình dữ liệu (sơ lược)

* **User:** id, name, email, password, role, created\_at
* **Product:** id, seller\_id, name, description, price, stock, category\_id, status
* **Order:** id, buyer\_id, status, total\_price, created\_at
* **OrderItem:** id, order\_id, product\_id, quantity, price
* **Cart:** id, user\_id
* **CartItem:** id, cart\_id, product\_id, quantity
* **Review:** id, user\_id, product\_id, rating, comment
* **Report:** id, reporter\_id, target\_id, reason, type

## 7. Phân quyền người dùng (RBAC)

| Hành động           | Khách | Người dùng | Người bán | Admin |
| :------------------ | :---- | :-------- | :------- | :---- |
| Đăng ký / Đăng nhập | ✅    | ✅        | ✅       | ✅    |
| Mua hàng            | ❌    | ✅        | ✅       | ✅    |
| Bán hàng            | ❌    | ❌        | ✅       | ✅    |
| Quản lý hệ thống    | ❌    | ❌        | ❌       | ✅    |
| Đánh giá sản phẩm   | ❌    | ✅        | ✅       | ✅    |

## 8. Kế hoạch phát triển (Timeline)

* **Sprint 1:** Hệ thống đăng ký/đăng nhập, vai trò người dùng (1 tuần)
* **Sprint 2:** Tính năng mua hàng cơ bản (giỏ hàng, đặt hàng) (2 tuần)
* **Sprint 3:** Module người bán (quản lý sản phẩm, đơn hàng) (2 tuần)
* **Sprint 4:** Quản trị viên + Dashboard + báo cáo (2 tuần)
* **Sprint 5:** Hoàn thiện UI/UX, test toàn diện, triển khai (2 tuần)

## 9. Công nghệ và ràng buộc kỹ thuật

* **Frontend:** React, TailwindCSS
* **Backend:** NestJS, PostgreSQL, Prisma
* **Xác thực:** JWT, refresh token
* **Hạ tầng:** Vercel (FE), Render / Railway (BE), S3 (ảnh)
* **CI/CD:** GitHub Actions

## 10. Chỉ số thành công (KPI)

* Tối thiểu 100 người dùng đầu tiên trong tháng đầu tiên
* 80% đơn hàng hoàn tất không lỗi
* Trang chủ tải < 2 giây
* Hệ thống duy trì uptime ≥ 99%

Tài liệu này sẽ tiếp tục được cập nhật và điều chỉnh trong quá trình xây dựng hệ thống để đảm bảo phù hợp với mục tiêu và phản hồi thực tế từ người dùng.

Để xem thiết kế UI/UX của dự án, bạn có thể truy cập [Full E-Commerce Website UI/UX Design](https://www.figma.com/design/H4WtlK1nCtSDs44FwPPQRt/Full-E-Commerce-Website-UI-UX-Design--Community-?node-id=34-213&m=draw).