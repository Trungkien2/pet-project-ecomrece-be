
# Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification - SRS)

## Thông tin chung

* **Tên hệ thống:** Hệ Thống Thương Mại Điện Tử Toàn Diện
* **Người viết:** Kiên (Cập nhật bởi Gemini AI theo yêu cầu)
* **Ngày tạo:** 24/05/2025
* **Phiên bản:** 1.1 (Cập nhật ngày 24/05/2025)

## 1. Mô tả tổng quan về hệ thống

Hệ thống Thương Mại Điện Tử Toàn Diện là một nền tảng trực tuyến được thiết kế để hỗ trợ doanh nghiệp trong việc trưng bày, quảng bá và bán sản phẩm cho người mua. Hệ thống cung cấp một giải pháp toàn diện từ quản lý sản phẩm, đơn hàng, khách hàng đến tích hợp thanh toán và vận chuyển, nhằm mang lại trải nghiệm mua sắm liền mạch cho người dùng và công cụ quản lý hiệu quả cho doanh nghiệp. Hệ thống này được xây dựng cho mô hình **một doanh nghiệp/cửa hàng bán sản phẩm của mình (single-store e-commerce)**.

---

## 2. Phạm vi hệ thống

### 2.1. Trong phạm vi:

* Cung cấp giao diện web **responsive** cho Khách hàng, Nhân viên và Quản trị viên.
* Quản lý toàn diện thông tin tài khoản người dùng và **phân quyền**.
* Quản lý chi tiết sản phẩm bao gồm danh mục, thuộc tính, biến thể, giá cả, tồn kho và khuyến mãi.
* Quy trình mua hàng hoàn chỉnh: tìm kiếm, xem sản phẩm, quản lý giỏ hàng, đặt hàng, thanh toán.
* Tự động hóa việc tạo và cập nhật trạng thái đơn hàng.
* Cập nhật số lượng tồn kho tự động dựa trên đơn hàng.
* Tích hợp với các cổng thanh toán trực tuyến phổ biến và hỗ trợ COD, chuyển khoản.
* Tích hợp với các đơn vị vận chuyển để tính phí và (tùy chọn) theo dõi đơn hàng.
* Cho phép khách hàng đánh giá và bình luận sản phẩm đã mua.
* Cung cấp các báo cáo, thống kê cơ bản về hoạt động kinh doanh.

### 2.2. Ngoài phạm vi (Ví dụ):

* Hệ thống quản lý kho vận nâng cao (WMS) với nhiều kho, quản lý vị trí.
* Module kế toán tài chính tích hợp sâu.
* Các công cụ marketing automation phức tạp (email marketing, CRM nâng cao).
* Phát triển ứng dụng di động native (trừ khi có yêu cầu phát triển API hỗ trợ).
* Hỗ trợ mô hình đa nhà cung cấp (multi-vendor marketplace).

---

## 3. Mục tiêu và lý do xây dựng hệ thống

* **Tối ưu hóa và nâng cao trải nghiệm mua sắm trực tuyến** cho khách hàng.
* Giúp doanh nghiệp **quản lý hoạt động bán hàng, sản phẩm, đơn hàng và khách hàng** một cách hiệu quả và tập trung.
* **Tăng cường khả năng tiếp cận thị trường** và gia tăng doanh số bán hàng.
* **Tự động hóa các quy trình thủ công**, giảm thiểu sai sót và tiết kiệm thời gian vận hành.
* **Thu thập dữ liệu kinh doanh** để hỗ trợ việc ra quyết định và cải thiện chiến lược.

---

## 4. Chức năng hệ thống (Tổng quan)

* **FE.01:** Quản lý Tài khoản Người dùng (Đăng ký, Đăng nhập, Quên mật khẩu, Hồ sơ cá nhân)
* **FE.02:** Duyệt và Tìm kiếm Sản phẩm (Xem danh mục, chi tiết sản phẩm, tìm kiếm, lọc, sắp xếp)
* **FE.03:** Quản lý Giỏ hàng
* **FE.04:** Quy trình Đặt hàng và Thanh toán
* **FE.05:** Xem Lịch sử Đơn hàng và Theo dõi Trạng thái (cho Khách hàng)
* **FE.06:** Đánh giá và Bình luận Sản phẩm
* **BE.01:** Quản lý Sản phẩm (Danh mục, Sản phẩm, Thuộc tính, Biến thể, Tồn kho, Khuyến mãi - cho Admin/Nhân viên)
* **BE.02:** Quản lý Đơn hàng (Xử lý, Cập nhật trạng thái - cho Admin/Nhân viên)
* **BE.03:** Quản lý Khách hàng (Xem thông tin - cho Admin/Nhân viên)
* **BE.04:** Quản lý Vận chuyển (Cấu hình, Tích hợp - cho Admin)
* **BE.05:** Quản lý Đánh giá và Bình luận (Kiểm duyệt - cho Admin)
* **BE.06:** Quản trị Hệ thống (Cấu hình chung, Quản lý người dùng Admin/Nhân viên, Phân quyền - cho Admin)
* **BE.07:** Báo cáo và Thống kê (cho Admin)

---

## 5. Yêu cầu chức năng (Chi tiết)

### **FE.01: Quản lý Tài khoản Người dùng**

* **FE.01.1: Đăng ký:**
    * Người dùng có thể đăng ký tài khoản bằng **Email hoặc Số điện thoại** và Mật khẩu.
    * Hệ thống yêu cầu xác thực Email (gửi link) hoặc Số điện thoại (gửi mã OTP).
    * Mật khẩu phải đáp ứng tiêu chí bảo mật (độ dài tối thiểu, ký tự đặc biệt - **TBD**).
* **FE.01.2: Đăng nhập:**
    * Người dùng có thể đăng nhập bằng Email/Số điện thoại và Mật khẩu đã đăng ký.
    * (Tùy chọn) Cho phép đăng nhập bằng tài khoản mạng xã hội (Google, Facebook).
    * Thông báo lỗi cụ thể khi đăng nhập sai thông tin hoặc tài khoản không tồn tại/bị khóa.
* **FE.01.3: Quên mật khẩu/Phục hồi mật khẩu:**
    * Người dùng có thể yêu cầu phục hồi mật khẩu thông qua Email hoặc Số điện thoại đã đăng ký.
    * Hệ thống gửi link đặt lại mật khẩu (qua email) hoặc mã OTP (qua SĐT) để xác minh.
* **FE.01.4: Quản lý Thông tin Cá nhân (Khách hàng):**
    * Xem và chỉnh sửa thông tin cá nhân (tên, ngày sinh, giới tính - **TBD**).
    * Quản lý sổ địa chỉ giao hàng (thêm, sửa, xóa, chọn địa chỉ mặc định).
    * Thay đổi mật khẩu tài khoản.
    * Xem lịch sử đơn hàng (tham chiếu FE.05).
* **FE.01.5: Đăng xuất:** Người dùng có thể đăng xuất khỏi tài khoản.

### **FE.02: Duyệt và Tìm kiếm Sản phẩm**

* **FE.02.1: Duyệt sản phẩm:**
    * Xem sản phẩm theo danh mục (đa cấp: cha-con).
    * Xem các bộ sưu tập sản phẩm nổi bật (ví dụ: sản phẩm mới, bán chạy - nếu có).
* **FE.02.2: Trang chi tiết sản phẩm:**
    * Hiển thị tên, mã SKU, mô tả chi tiết, nhiều hình ảnh (có zoom), giá (giá gốc, giá bán nếu có khuyến mãi).
    * Cho phép chọn các biến thể sản phẩm (màu sắc, size,...) nếu có; giá và hình ảnh có thể thay đổi theo biến thể.
    * Hiển thị trạng thái tồn kho (còn hàng, sắp hết hàng, hết hàng, cho đặt trước - **TBD**).
    * Hiển thị đánh giá và bình luận của khách hàng khác.
    * (Tùy chọn) Hiển thị sản phẩm liên quan/tương tự.
* **FE.02.3: Tìm kiếm sản phẩm:**
    * Tìm kiếm sản phẩm theo từ khóa (tên sản phẩm, mô tả ngắn, SKU).
    * Gợi ý kết quả tìm kiếm (auto-suggest - nếu có).
* **FE.02.4: Lọc sản phẩm:**
    * Lọc sản phẩm trong trang danh mục/kết quả tìm kiếm theo: khoảng giá, danh mục, thuộc tính (màu, size...), thương hiệu (nếu có).
* **FE.02.5: Sắp xếp sản phẩm:**
    * Sắp xếp sản phẩm theo: giá (tăng dần, giảm dần), mới nhất, bán chạy nhất (nếu có dữ liệu).
* **FE.02.6: Phân trang:** Áp dụng cho trang danh mục và kết quả tìm kiếm.

### **FE.03: Quản lý Giỏ hàng**

* **FE.03.1:** Khách hàng có thể thêm sản phẩm (và biến thể cụ thể) vào giỏ hàng từ trang danh sách hoặc trang chi tiết sản phẩm.
* **FE.03.2:** Xem chi tiết giỏ hàng: danh sách sản phẩm, hình ảnh, tên, biến thể, đơn giá, số lượng, thành tiền từng sản phẩm.
* **FE.03.3:** Cập nhật số lượng sản phẩm trong giỏ.
* **FE.03.4:** Xóa sản phẩm khỏi giỏ hàng.
* **FE.03.5:** Giỏ hàng tự động tính toán tổng tiền tạm tính.
* **FE.03.6:** Giỏ hàng được lưu trữ cho khách hàng đã đăng nhập khi họ điều hướng sang trang khác hoặc thoát và quay lại.

### **FE.04: Quy trình Đặt hàng và Thanh toán**

* **FE.04.1: Tiến hành đặt hàng:** Từ giỏ hàng, khách hàng chuyển sang quy trình thanh toán.
* **FE.04.2: Thông tin giao hàng:**
    * Khách hàng đã đăng nhập: chọn từ sổ địa chỉ hoặc nhập địa chỉ mới.
    * Khách chưa đăng nhập: nhập thông tin người nhận và địa chỉ giao hàng.
* **FE.04.3: Chọn phương thức vận chuyển:**
    * Hệ thống hiển thị các phương thức vận chuyển khả dụng và phí tương ứng dựa trên địa chỉ giao hàng và (tùy chọn) trọng lượng/kích thước đơn hàng.
* **FE.04.4: Chọn phương thức thanh toán:**
    * COD (Thanh toán khi nhận hàng).
    * Chuyển khoản ngân hàng (hiển thị thông tin tài khoản của cửa hàng).
    * Ví điện tử (Momo, ZaloPay, VNPay - tích hợp qua cổng thanh toán).
    * (Tùy chọn) Thẻ quốc tế (Visa, Mastercard - qua cổng thanh toán như PayPal hoặc cổng nội địa có hỗ trợ).
* **FE.04.5: Áp dụng mã khuyến mãi:** Nếu có, khách hàng nhập mã khuyến mãi để được giảm giá.
* **FE.04.6: Xem lại đơn hàng:** Hiển thị tóm tắt đơn hàng (sản phẩm, số lượng, giá, phí ship, giảm giá, tổng tiền cuối cùng) trước khi xác nhận.
* **FE.04.7: Xác nhận đặt hàng:**
    * Đối với COD/Chuyển khoản: Đơn hàng được tạo với trạng thái "Chờ xác nhận" hoặc "Chờ thanh toán".
    * Đối với thanh toán trực tuyến: Chuyển hướng đến trang của cổng thanh toán. Sau khi thanh toán thành công/thất bại, chuyển hướng về website với thông báo tương ứng.
* **FE.04.8: Thông báo đặt hàng thành công:** Hiển thị trang xác nhận đơn hàng thành công với mã đơn hàng và thông tin chi tiết. Gửi email xác nhận cho khách hàng.

### **FE.05: Xem Lịch sử Đơn hàng và Theo dõi Trạng thái (cho Khách hàng)**

* **FE.05.1:** Khách hàng đã đăng nhập có thể xem danh sách các đơn hàng đã đặt.
* **FE.05.2:** Xem chi tiết từng đơn hàng: mã đơn hàng, ngày đặt, sản phẩm, số lượng, giá, tổng tiền, địa chỉ giao hàng, phương thức thanh toán, trạng thái hiện tại của đơn hàng (ví dụ: Chờ xác nhận, Đang xử lý, Đang giao, Hoàn thành, Đã hủy).
* **FE.05.3:** (Tùy chọn) Khách hàng có thể yêu cầu hủy đơn hàng nếu đơn hàng chưa được xử lý/giao.

### **FE.06: Đánh giá và Bình luận Sản phẩm**

* **FE.06.1:** Chỉ những khách hàng đã mua và nhận thành công sản phẩm mới có quyền đánh giá.
* **FE.06.2:** Khách hàng có thể cho điểm sản phẩm (ví dụ: 1-5 sao) và viết bình luận.
* **FE.06.3:** Đánh giá và bình luận (sau khi được duyệt) sẽ hiển thị trên trang chi tiết sản phẩm tương ứng.

### **BE.01: Quản lý Sản phẩm (Admin/Nhân viên có quyền)**

* **BE.01.1: Quản lý Danh mục (Category):**
    * CRUD danh mục sản phẩm (tên, mô tả, hình ảnh đại diện - nếu có, danh mục cha).
    * Hỗ trợ danh mục đa cấp.
* **BE.01.2: Quản lý Sản phẩm:**
    * CRUD sản phẩm với các thông tin: Tên, Mã SKU (tự động tạo hoặc nhập tay), Mô tả ngắn, Mô tả chi tiết (rich text editor), Danh mục, Thương hiệu (nếu có).
    * Quản lý nhiều hình ảnh cho sản phẩm (upload, xóa, chọn ảnh đại diện).
    * Thiết lập trạng thái sản phẩm: Công khai (Published), Ẩn (Draft/Hidden), Hết hàng (Out of Stock).
* **BE.01.3: Quản lý Thuộc tính và Biến thể sản phẩm:**
    * Định nghĩa các thuộc tính chung (ví dụ: Màu sắc, Kích thước, Chất liệu).
    * Tạo các biến thể cho sản phẩm dựa trên thuộc tính (ví dụ: Áo Sơ Mi X - Màu Trắng - Size M).
    * Mỗi biến thể có thể có SKU riêng, giá riêng (hoặc chênh lệch so với giá gốc), số lượng tồn kho riêng, hình ảnh riêng.
* **BE.01.4: Quản lý Giá:**
    * Thiết lập giá gốc (Regular Price) và giá bán (Sale Price - nếu đang khuyến mãi).
* **BE.01.5: Quản lý Tồn kho:**
    * Nhập/cập nhật số lượng tồn kho cho sản phẩm gốc hoặc từng biến thể.
    * Hệ thống tự động giảm tồn kho khi đơn hàng được xác nhận/hoàn tất và tăng lại nếu đơn hàng bị hủy (và hàng hóa được hoàn kho).
    * (Tùy chọn) Cảnh báo khi tồn kho xuống mức thấp.
    * (Tùy chọn) Cho phép đặt hàng trước (pre-order) khi hết hàng.
* **BE.01.6: Quản lý Khuyến mãi:**
    * Tạo và quản lý các chương trình khuyến mãi:
        * Mã giảm giá (Coupon code).
        * Giảm giá theo % hoặc số tiền cố định cho sản phẩm/danh mục/toàn bộ đơn hàng.
        * Điều kiện áp dụng (giá trị đơn hàng tối thiểu, thời gian hiệu lực, số lần sử dụng giới hạn).
        * (Tùy chọn) Miễn phí vận chuyển.

### **BE.02: Quản lý Đơn hàng (Admin/Nhân viên có quyền)**

* **BE.02.1:** Xem danh sách tất cả đơn hàng với bộ lọc (theo trạng thái, ngày đặt, khách hàng, mã đơn hàng...) và tìm kiếm.
* **BE.02.2:** Xem chi tiết từng đơn hàng (thông tin khách hàng, sản phẩm, địa chỉ, thanh toán, vận chuyển, ghi chú).
* **BE.02.3:** Cập nhật trạng thái đơn hàng: Chờ xác nhận, Đã xác nhận, Đang chuẩn bị hàng, Đang giao hàng (nhập mã vận đơn nếu có), Giao hàng thành công, Hoàn tất, Đã hủy, (Tùy chọn: Chờ xử lý trả hàng/hoàn tiền).
* **BE.02.4:** Gửi email thông báo cho khách hàng khi trạng thái đơn hàng thay đổi (**TBD** về các trạng thái cụ thể sẽ gửi mail).
* **BE.02.5:** In hóa đơn bán hàng, phiếu giao hàng.
* **BE.02.6:** (Tùy chọn) Ghi chú nội bộ cho đơn hàng.

### **BE.03: Quản lý Khách hàng (Admin/Nhân viên có quyền)**

* **BE.03.1:** Xem danh sách khách hàng đã đăng ký.
* **BE.03.2:** Xem thông tin chi tiết khách hàng (thông tin cá nhân, lịch sử mua hàng, địa chỉ).
* **BE.03.3:** (Admin) Kích hoạt/Vô hiệu hóa tài khoản khách hàng.

### **BE.04: Quản lý Vận chuyển (Admin)**

* **BE.04.1: Cấu hình Phương thức Vận chuyển:**
    * Thêm/sửa/xóa các phương thức vận chuyển (ví dụ: Giao hàng tiêu chuẩn, Giao hàng nhanh).
    * Thiết lập biểu phí vận chuyển dựa trên: khu vực địa lý (tỉnh/thành, quận/huyện), trọng lượng/kích thước đơn hàng (nếu có), giá trị đơn hàng (ví dụ: miễn phí ship cho đơn hàng trên X đồng).
* **BE.04.2: Tích hợp Đơn vị Vận chuyển:**
    * Cấu hình kết nối API với các đơn vị vận chuyển (GHN, GHTK, ViettelPost).
    * Mức độ tích hợp: Tối thiểu là lấy phí vận chuyển tự động. Mở rộng: đẩy đơn hàng qua API, cập nhật trạng thái vận đơn tự động (**TBD**).

### **BE.05: Quản lý Đánh giá và Bình luận (Admin)**

* **BE.05.1:** Xem danh sách các đánh giá, bình luận đang chờ duyệt.
* **BE.05.2:** Duyệt (Chấp nhận/Từ chối) các đánh giá, bình luận.
* **BE.05.3:** (Tùy chọn) Trả lời bình luận của khách hàng.
* **BE.05.4:** Xóa các đánh giá, bình luận không phù hợp.

### **BE.06: Quản trị Hệ thống (Admin)**

* **BE.06.1: Quản lý Người dùng Nội bộ (Admin/Nhân viên):**
    * CRUD tài khoản Admin/Nhân viên.
    * Phân quyền chi tiết cho từng vai trò/nhân viên (ví dụ: Nhân viên A chỉ quản lý sản phẩm, Nhân viên B chỉ xử lý đơn hàng).
* **BE.06.2: Cấu hình Hệ thống Chung:**
    * Thông tin cửa hàng (tên, địa chỉ, SĐT, email, logo).
    * Cấu hình email hệ thống (SMTP).
    * Cấu hình các cổng thanh toán.
* **BE.06.3: (Tùy chọn) Quản lý Nội dung Trang Tĩnh:**
    * Tạo/sửa các trang nội dung như "Về chúng tôi", "Chính sách bảo mật", "Điều khoản sử dụng", "Hướng dẫn mua hàng".

### **BE.07: Báo cáo và Thống kê (Admin)**

* **BE.07.1: Báo cáo Doanh thu:** Theo ngày, tuần, tháng, năm hoặc khoảng thời gian tùy chọn.
* **BE.07.2: Báo cáo Sản phẩm:** Sản phẩm bán chạy (theo số lượng, theo doanh thu).
* **BE.07.3: Báo cáo Đơn hàng:** Số lượng đơn hàng theo trạng thái.
* **BE.07.4: (Tùy chọn) Báo cáo Khách hàng:** Số lượng khách hàng mới, khách hàng mua nhiều.
* **BE.07.5:** Khả năng xuất dữ liệu báo cáo cơ bản (Excel, CSV).

---

## 6. Yêu cầu phi chức năng

### 6.1. Hiệu năng (Performance):

* Thời gian tải trang chủ, trang danh mục, trang chi tiết sản phẩm: `< 3 giây` trong điều kiện mạng thông thường.
* Thời gian phản hồi cho các tác vụ người dùng chính (thêm vào giỏ, chuyển trang checkout, xác nhận đơn hàng): `< 2 giây`.
* Hệ thống có khả năng xử lý đồng thời ít nhất **[N1 - TBD]** lượt truy cập (active users) và **[N2 - TBD]** giao dịch đặt hàng mỗi giờ mà không suy giảm hiệu năng đáng kể.

### 6.2. Bảo mật (Security):

* Mã hóa mật khẩu người dùng sử dụng thuật toán băm mạnh (ví dụ: bcrypt, Argon2).
* Bảo vệ chống lại các tấn công web phổ biến: XSS, SQL Injection, CSRF (sử dụng các biện pháp như input validation, output encoding, anti-CSRF tokens).
* Toàn bộ giao tiếp qua website phải sử dụng HTTPS.
* (Tùy chọn) Xác thực hai yếu tố (2FA) cho tài khoản Admin.
* Thông tin nhạy cảm (ví dụ: API keys cổng thanh toán) phải được lưu trữ an toàn.
* Tuân thủ các nguyên tắc bảo mật dữ liệu khi xử lý thông tin cá nhân của người dùng.

### 6.3. Khả năng mở rộng (Scalability):

* Kiến trúc hệ thống cho phép mở rộng tài nguyên (CPU, RAM, lưu trữ) một cách linh hoạt (cả chiều dọc và chiều ngang nếu có thể) để đáp ứng sự tăng trưởng về lượng người dùng, sản phẩm và đơn hàng.
* Thiết kế API (nếu có) theo hướng module hóa, dễ dàng cho việc tích hợp với các hệ thống khác hoặc phát triển ứng dụng di động trong tương lai.

### 6.4. Tính sẵn sàng (Availability):

* Hệ thống phải đạt thời gian hoạt động (uptime) tối thiểu **99.9%** (ngoại trừ thời gian bảo trì theo kế hoạch).
* Thời gian bảo trì theo kế hoạch phải được thông báo trước cho người dùng (nếu ảnh hưởng đến họ).

### 6.5. Tính khả dụng (Usability):

* Giao diện người dùng (UI) phải trực quan, nhất quán và dễ sử dụng cho tất cả các nhóm người dùng (Khách hàng, Nhân viên, Admin).
* Thiết kế web **responsive**, đảm bảo trải nghiệm tốt trên các thiết bị: desktop, tablet, mobile.
* Luồng thao tác người dùng (UX) phải hợp lý, giảm thiểu số bước không cần thiết, đặc biệt là quy trình mua hàng.
* Thông báo lỗi phải rõ ràng, thân thiện và hướng dẫn người dùng cách khắc phục (nếu có thể).
* (Tùy chọn) Tuân thủ các tiêu chuẩn về khả năng tiếp cận web (ví dụ: WCAG AA).

### 6.6. Khả năng bảo trì (Maintainability):

* Mã nguồn phải được viết rõ ràng, có cấu trúc tốt, tuân theo các coding convention thống nhất.
* Có comment giải thích cho các đoạn code phức tạp.
* Hệ thống được chia thành các module logic, dễ dàng cho việc sửa lỗi, nâng cấp và phát triển tính năng mới.
* Có cơ chế ghi log (logging) đầy đủ cho các sự kiện quan trọng và lỗi hệ thống để hỗ trợ việc theo dõi và gỡ lỗi.

### 6.7. Độ tin cậy (Reliability):

* Đảm bảo tính toàn vẹn dữ liệu, đặc biệt là thông tin đơn hàng, thanh toán và tồn kho.
* Các giao dịch quan trọng (ví dụ: đặt hàng, thanh toán) phải đảm bảo tính nhất quán (atomicity).
* Có cơ chế sao lưu (backup) dữ kỳ và quy trình khôi phục (recovery) khi có sự cố.

### 6.8. Tính tương thích (Compatibility):

* Website phải hoạt động tốt trên các phiên bản mới nhất (N-1) của các trình duyệt web phổ biến: Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge.

---

## 7. Mô hình dữ liệu tổng quát

* **User:** (`id`, `role` (customer, staff, admin), `full_name`, `email`, `phone_number`, `password_hash`, `email_verified_at`, `phone_verified_at`, `avatar_url`, `status`, `created_at`, `updated_at`)
* **Address:** (`id`, `user_id`, `full_name`, `phone_number`, `street_address`, `ward_id`, `district_id`, `province_id`, `country_code`, `is_default`, `type` (shipping, billing), `created_at`, `updated_at`)
* **Category:** (`id`, `name`, `slug`, `parent_id`, `description`, `image_url`, `status`, `created_at`, `updated_at`)
* **Brand:** (`id`, `name`, `slug`, `logo_url`, `description`, `status`, `created_at`, `updated_at`) - Nếu có quản lý thương hiệu
* **Product:** (`id`, `category_id`, `brand_id`, `name`, `slug`, `sku_prefix`, `short_description`, `full_description`, `status` (published, draft, archived), `created_at`, `updated_at`)
* **ProductVariant:** (`id`, `product_id`, `sku`, `attributes` (JSON or EAV: e.g., `{"color": "Red", "size": "M"}`), `base_price`, `sale_price`, `stock_quantity`, `low_stock_threshold`, `allow_backorder`, `weight`, `dimensions` (l,w,h), `main_image_id`, `created_at`, `updated_at`)
* **ProductImage:** (`id`, `product_id`, `variant_id` (optional), `image_url`, `alt_text`, `display_order`, `is_primary_for_variant`, `created_at`, `updated_at`)
* **Promotion:** (`id`, `name`, `code`, `description`, `type` (percentage, fixed_amount, free_shipping), `value`, `start_date`, `end_date`, `usage_limit_per_customer`, `total_usage_limit`, `min_order_value`, `applicable_to` (all, specific_products, specific_categories), `status`, `created_at`, `updated_at`)
* **Cart:** (`id`, `user_id` (nullable for guest cart), `session_id` (for guest cart), `created_at`, `updated_at`)
* **CartItem:** (`id`, `cart_id`, `product_variant_id`, `quantity`, `unit_price_at_add`, `created_at`, `updated_at`)
* **Order:** (`id`, `user_id` (nullable for guest order), `order_number` (unique), `customer_name`, `customer_email`, `customer_phone`, `total_product_price`, `discount_amount`, `shipping_fee`, `final_total_amount`, `status` (pending\_confirmation, processing, shipped, delivered, completed, cancelled, payment\_failed), `shipping_address_id`, `billing_address_id` (optional), `shipping_method_id`, `payment_method_id`, `payment_status` (pending, paid, failed, refunded), `notes_from_customer`, `internal_notes`, `created_at`, `updated_at`)
* **OrderItem:** (`id`, `order_id`, `product_variant_id`, `product_name`, `variant_attributes_snapshot`, `quantity`, `unit_price`, `subtotal`, `created_at`, `updated_at`)
* **Review:** (`id`, `user_id`, `product_id`, `rating` (1-5), `comment`, `status` (pending, approved, rejected), `created_at`, `updated_at`)
* **PaymentTransaction:** (`id`, `order_id`, `gateway_transaction_id`, `amount`, `payment_method_name`, `status` (pending, success, failure), `gateway_response_data` (JSON), `created_at`, `updated_at`)
* **ShippingMethod:** (`id`, `name`, `description`, `cost_calculation_logic` (e.g., fixed, by\_weight, by\_region), `status`, `created_at`, `updated_at`)
* **SystemConfiguration:** (`id`, `key`, `value`, `description`, `created_at`, `updated_at`)

---

## 8. Giao diện người dùng (UI/UX)

* Giao diện web phải **thân thiện, hiện đại, trực quan và responsive**, đảm bảo trải nghiệm người dùng nhất quán trên các thiết bị desktop, tablet và mobile.
* Thiết kế UX tập trung vào việc **tối ưu hóa quy trình mua hàng**, mục tiêu là hoàn thành trong tối thiểu các bước trực quan (Ví dụ: Chọn sản phẩm → Giỏ hàng/Thông tin → Đặt hàng & Thanh toán).
* Các luồng người dùng chính cần được thiết kế chi tiết: Đăng ký/Đăng nhập, Duyệt và Tìm kiếm sản phẩm, Quản lý giỏ hàng, Quy trình Thanh toán, Quản lý tài khoản cá nhân, (Admin) Quản lý Sản phẩm, (Admin) Quản lý Đơn hàng.
* **Tham chiếu:** Chi tiết về wireframes, mockups, prototypes và style guide sẽ được cung cấp trong tài liệu thiết kế UI/UX riêng biệt (Ví dụ: [Link đến Figma/Adobe XD/Tài liệu thiết kế]).

---

## 9. Phân quyền hệ thống

* **Khách hàng (Customer):**
    * Đăng ký, đăng nhập, quản lý tài khoản cá nhân.
    * Duyệt, tìm kiếm sản phẩm, xem chi tiết sản phẩm.
    * Thêm sản phẩm vào giỏ hàng, quản lý giỏ hàng.
    * Đặt hàng và thanh toán.
    * Xem lịch sử đơn hàng, theo dõi trạng thái đơn hàng.
    * Viết đánh giá, bình luận cho sản phẩm đã mua.
* **Nhân viên (Staff):** (Quyền hạn cụ thể được Admin gán, có thể bao gồm một hoặc nhiều quyền sau)
    * Quản lý sản phẩm: Thêm, sửa, xóa sản phẩm, danh mục, thuộc tính, biến thể, cập nhật tồn kho.
    * Quản lý đơn hàng: Xem, xử lý đơn hàng, cập nhật trạng thái đơn hàng.
    * Quản lý đánh giá: Kiểm duyệt đánh giá, bình luận.
    * Xem báo cáo cơ bản (phần được phân quyền).
* **Quản trị viên (Admin):**
    * **Toàn quyền quản lý hệ thống.**
    * Thực hiện tất cả các chức năng của Nhân viên.
    * Quản lý tài khoản người dùng (Khách hàng, Nhân viên, Admin khác).
    * Phân quyền chi tiết cho Nhân viên.
    * Cấu hình hệ thống (thông tin cửa hàng, thanh toán, vận chuyển, email...).
    * Xem tất cả báo cáo và thống kê.
    * Quản lý nội dung trang tĩnh.

---

## 10. Rà soát nguyên nhân đặc thù / Xử lý ngoại lệ

* **10.1. Quên mật khẩu:** Cung cấp quy trình khôi phục an toàn qua email/OTP như mô tả ở FE.01.3.
* **10.2. API Cổng thanh toán timeout/lỗi:**
    * Nếu timeout `> 5-10 giây` (**TBD**) hoặc nhận phản hồi lỗi từ cổng thanh toán trong quá trình thanh toán.
    * Thông báo cho người dùng về sự cố và gợi ý thử lại sau hoặc chọn phương thức thanh toán khác.
    * Đơn hàng có thể được tạo với trạng thái "Chờ thanh toán" hoặc "Thanh toán thất bại".
    * Ghi log chi tiết lỗi để Admin kiểm tra.
* **10.3. Hết hàng trong quá trình thanh toán:**
    * Nếu sản phẩm trong giỏ hàng bị người khác mua hết trước khi khách hàng hoàn tất thanh toán.
    * Thông báo rõ ràng cho khách hàng về sản phẩm đã hết hàng, xóa khỏi giỏ hoặc yêu cầu cập nhật giỏ hàng trước khi tiếp tục.
* **10.4. Mã khuyến mãi không hợp lệ/hết hạn:**
    * Hiển thị thông báo lỗi cụ thể khi khách hàng nhập mã không hợp lệ, hết hạn, hoặc không đáp ứng điều kiện.
* **10.5. Lỗi xác thực địa chỉ giao hàng:**
    * Nếu tích hợp với dịch vụ kiểm tra địa chỉ, thông báo cho người dùng nếu địa chỉ không hợp lệ hoặc không tìm thấy. Cho phép người dùng sửa lại.
* **10.6. Lỗi hệ thống không mong muốn:**
    * Hiển thị trang lỗi thân thiện (ví dụ: lỗi 500) với thông tin liên hệ hỗ trợ.
    * Ghi log chi tiết lỗi để đội ngũ kỹ thuật xử lý.

---

## 11. KPI đánh giá hệ thống (Sau khi triển khai)

* **Người dùng:**
    * Số lượng người dùng đăng ký mới: đạt **1000 người dùng trong 3 tháng đầu**.
    * Tỷ lệ giữ chân người dùng (User Retention Rate - **TBD**).
* **Kinh doanh:**
    * Tỷ lệ chuyển đổi (Conversion Rate - đơn hàng thành công / lượt truy cập trang sản phẩm hoặc trang chủ): mục tiêu `>= 2%` (điều chỉnh theo ngành hàng).
    * Tỷ lệ chốt đơn (Số đơn hàng / Số giỏ hàng được tạo hoặc checkout bắt đầu): mục tiêu `>= 20%`.
    * Giá trị đơn hàng trung bình (Average Order Value - AOV).
    * Tổng doanh thu (Gross Merchandise Volume - GMV).
* **Thanh toán & Vận hành:**
    * Tỷ lệ thanh toán trực tuyến thành công: `>= 95%`.
    * Thời gian xử lý đơn hàng trung bình (từ lúc đặt đến lúc giao cho đơn vị vận chuyển).
    * Tỷ lệ hủy đơn hàng (do khách hàng, do hệ thống/cửa hàng).
* **Hệ thống:**
    * Thời gian hoạt động (Uptime): `>= 99.9%`.
    * Thời gian tải trang trung bình (Core Web Vitals).

---

## 12. Kế hoạch triển khai (Sơ bộ)

* **Sprint 1 (Nền tảng & Người dùng):**
    * Thiết lập môi trường, database cơ bản.
    * Module Đăng ký, Đăng nhập, Quên mật khẩu (FE.01).
    * Giao diện người dùng cơ bản (layout chung, trang chủ).
    * Quản lý Tài khoản Admin cơ bản (BE.06.1 phần quản lý Admin).
* **Sprint 2 (Sản phẩm & Giỏ hàng):**
    * Module Quản lý Danh mục, Sản phẩm (thuộc tính, biến thể cơ bản, tồn kho) (BE.01).
    * Module Duyệt và Tìm kiếm Sản phẩm (FE.02).
    * Module Quản lý Giỏ hàng (FE.03).
* **Sprint 3 (Đặt hàng & Thanh toán cơ bản):**
    * Quy trình Đặt hàng (FE.04 - chưa bao gồm tất cả cổng TT).
    * Tích hợp thanh toán COD, Chuyển khoản.
    * Module Quản lý Đơn hàng cơ bản (BE.02).
    * Xem Lịch sử Đơn hàng (FE.05).
* **Sprint 4 (Hoàn thiện Thanh toán & Vận chuyển):**
    * Tích hợp các cổng thanh toán trực tuyến (Momo, ZaloPay, VNPay).
    * Module Quản lý Vận chuyển (BE.04), tính phí ship.
* **Sprint 5 (Đánh giá & Báo cáo):**
    * Module Đánh giá và Bình luận Sản phẩm (FE.06, BE.05).
    * Module Báo cáo và Thống kê cơ bản (BE.07).
* **Sprint 6 (Hoàn thiện Quản trị & Tối ưu):**
    * Hoàn thiện các chức năng Quản trị Hệ thống (BE.06).
    * Quản lý Khuyến mãi (BE.01.6).
    * Kiểm thử toàn diện, tối ưu hóa hiệu năng, bảo mật. UAT.

---

## 13. Giả định và Ràng buộc

### 13.1. Giả định:

* Hệ thống được xây dựng cho mô hình **một doanh nghiệp/cửa hàng (single-store e-commerce)**. Nếu có nhu cầu phát triển thành multi-vendor marketplace, SRS này cần được mở rộng đáng kể.
* Đội ngũ phát triển có đủ kiến thức chuyên môn và nguồn lực cần thiết.
* API của các bên thứ ba (cổng thanh toán, đơn vị vận chuyển) hoạt động ổn định và có tài liệu rõ ràng, đầy đủ.
* Nội dung sản phẩm (hình ảnh, mô tả) sẽ được cung cấp bởi phía doanh nghiệp.

### 13.2. Ràng buộc:

* Ngân sách dự án: **[TBD]**.
* Thời gian hoàn thành dự kiến tổng thể: **[TBD]**.
* Công nghệ phát triển ưu tiên (nếu có): **[TBD, ví dụ: Laravel cho backend, ReactJS/VueJS cho frontend]**.

---

## 14. Phụ lục

### 14.1. Phụ lục A: Danh sách API của bên thứ ba (Ví dụ)

* **Cổng thanh toán VNPay:** [Link tài liệu API] - Mục tiêu: Thanh toán QR, thẻ nội địa.
* **Cổng thanh toán Momo:** [Link tài liệu API] - Mục tiêu: Thanh toán qua ví Momo.
* **Đơn vị vận chuyển Giao Hàng Nhanh (GHN):** [Link tài liệu API] - Mục tiêu: Tính phí, (Tùy chọn) Tạo đơn, Theo dõi.
* **Đơn vị vận chuyển Giao Hàng Tiết Kiệm (GHTK):** [Link tài liệu API] - Mục tiêu: Tính phí, (Tùy chọn) Tạo đơn, Theo dõi.

### 14.2. Phụ lục B: Sơ đồ Quan hệ Thực thể (ERD) chi tiết

* Sẽ được cung cấp dưới dạng tài liệu riêng hoặc hình ảnh đính kèm.

### 14.3. Phụ lục C: Tài liệu Thiết kế UI/UX

* Tham chiếu đến [Link Figma/Adobe XD/Tài liệu thiết kế UI/UX chi tiết].

---

## 15. Các vấn đề còn bỏ ngỏ / Cần xác định thêm (TBD)

* Chi tiết về thuật toán tính phí vận chuyển phức tạp (nếu có, ngoài các tiêu chí cơ bản).
* Quy trình xử lý trả hàng/hoàn tiền chi tiết (nếu có).
* Yêu cầu cụ thể về SEO on-page cho các trang sản phẩm, danh mục.
* Ngôn ngữ sử dụng trên website: Mặc định là Tiếng Việt. Có cần hỗ trợ đa ngôn ngữ không? Nếu có, các ngôn ngữ nào?
* Chính sách mật khẩu chi tiết (độ dài, độ phức tạp).
* Số lượng người dùng đồng thời (N1), số giao dịch/giờ (N2) mục tiêu cho yêu cầu hiệu năng.
* Quy trình cụ thể cho việc xác nhận thanh toán chuyển khoản (thủ công hay bán tự động).
* Mức độ tích hợp sâu với API đơn vị vận chuyển (chỉ tính phí, hay cả tạo đơn và theo dõi).
* Các trạng thái đơn hàng cụ thể nào sẽ kích hoạt gửi email thông báo cho khách hàng.

