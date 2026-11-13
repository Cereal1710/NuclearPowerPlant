# Nuclear Plant Manager (Nuclearis Nuclear Power Plant)

**Nuclear Plant Manager** là một trò chơi mô phỏng quản lý nhà máy điện hạt nhân 3D hoàn chỉnh, lấy bối cảnh tại **Nuclearis Nuclear Power Plant** thuộc quyền quản lý của tập đoàn **Neutron Energy Corp.**

---

## ⚡ YÊU CẦU ĐẶC BIỆT: 100% 3D DIEGETIC — KHÔNG SỬ DỤNG WEBGL

Toàn bộ thế giới game được xây dựng hoàn toàn bằng không gian không gian ba chiều (3D Spatial Engine) thông qua **CSS 3D Transforms (`transform-style: preserve-3d; perspective: 1100px`)** với độ trễ tối thiểu, tốc độ dựng hình siêu nhanh và **hoàn toàn không phụ thuộc vào WebGL**:

- **Không dùng WebGL:** Không có `webgl` context, tránh mọi lỗi xung đột driver đồ họa, GPU crash hoặc giới hạn context trên trình duyệt.
- **Không có thành phần 2D/HUD overlay:** Không có thanh menu 2D, không popup HTML 2D, không floating text 2D trước camera.
- **Mọi thông tin đều hiển thị trong thế giới 3D (Diegetic 3D UI):**
  - Màn hình máy tính 3D trên từng bàn làm việc.
  - Bảng màn hình lớn 3D (Big Wall Screen) gắn trên tường phòng điều khiển.
  - Các nút bấm vật lý 3D, cần gạt, công tắc, nút SCRAM nấm đỏ dập cơ học.
  - Nút **◀ OVERVIEW / BACK 3D** đặt trực tiếp trên mặt bàn điều khiển để chuyển góc nhìn.
  - Nhân viên vận hành mô phỏng 3D ngồi trên ghế xoay văn phòng 3D, trang bị mũ bảo hộ và đồng phục mang logo Neutron Energy Corp.

---

## 🏢 Bố trí 6 Bàn điều khiển 3D (Control Stations)

1. **Station 01 — Reactor Engineer Desk:**
   - Điều khiển 4 cụm thanh điều khiển (Control Rod Banks #1, #2, #3, #4) từ 0% đến 100%.
   - Điều khiển 3 máy bơm làm mát sơ cấp (Coolant Pumps A, B, C) với công tắc bật/tắt và tốc độ RPM.
   - Theo dõi nhiệt độ lõi (°C), độ phản ứng (Reactivity %), áp suất hơi (Steam Pressure Bar), công suất nhiệt & phát điện.
   - **Hộp nút bấm khẩn cấp SCRAM 3D:** Khối kim loại viền sọc vàng-đen và nút nấm đỏ dập cơ học có phản hồi vật lý.

2. **Station 02 — Electrical Manager Desk:**
   - Điều phối tải điện cho 4 khu vực: Bệnh viện trung tâm (Hospital - Ưu tiên P1), Khu công nghiệp nặng (Industrial - P2), Khu dân cư (Residential - P3), Hệ thống đường sắt (Transit - P4).
   - Nút **Auto-Balance Grid** tự động cân bằng công suất theo thứ tự ưu tiên.
   - Quản lý hợp đồng thương mại điện: Municipal Base, Peak-Hour Surge Guarantee, Clean Energy Tier.
   - Theo dõi độ ổn định lưới (Grid Stability %) và uy tín nhà máy.

3. **Station 03 — Shift Manager Desk:**
   - Quản lý ca trực (Shift #, đồng hồ ca trực).
   - Điều chỉnh tốc độ thời gian: Tạm dừng (Pause), 1x, 2x và bật/tắt âm thanh (Web Audio API Synthesizer).
   - Điều phối danh sách nhân viên: Phân công bàn trực, cho nghỉ ngơi tại phòng nghỉ (Break Room).
   - Tuyển dụng nhân sự mới từ hội đồng Neutron Energy Corp.
   - Bấm **Complete & Audit Shift** để kết thúc ca trực, tính toán doanh thu, lương bổng, tiền phạt sự cố và nhận chứng chỉ xếp loại an toàn (Grade S/A/B/C/F).

4. **Station 04 — Maintenance Engineer Desk:**
   - Theo dõi độ hao mòn của 6 hệ thống: Bơm làm mát A & B, Tua-bin hơi, Máy biến áp, Vòng ngưng tụ, Máy phát điện dự phòng.
   - Điều động kỹ sư sửa chữa và đại tu thiết bị.
   - Quản lý kho phụ tùng: Phốt cơ khí (Seals), Vòng bi tua-bin (Bearings), Rơ-le bán dẫn (Relays), Lõi lọc (Filters).
   - Xe vận chuyển phụ tùng 3D với đồng hồ đếm ngược thời gian giao hàng.

5. **Station 05 — Safety Officer Desk:**
   - Điểm số an toàn và tuân thủ quy chuẩn nhà máy (Safety Compliance Index 0-100%).
   - Cảm biến bức xạ Geiger tại 4 khu vực: Vỏ lò phản ứng, Nhà máy tua-bin, Gian đường ống làm mát, Hàng rào ranh giới.
   - Đo áp suất chân không âm buồng chứa (-42 Pa) và áp suất hệ thống chữa cháy (12.4 Bar).
   - Kích hoạt kiểm định định kỳ (Regulatory Safety Audit) và xả kiểm tra hệ thống dập lửa.

6. **Station 06 — Waste Management Desk:**
   - Bể làm mát nhiên liệu đã qua sử dụng (Spent Fuel Pool): kiểm tra nhiệt độ nước và máy bơm tuần hoàn.
   - Cẩu chuyển nhiên liệu ngầm đóng gói 4 thanh nhiên liệu vào thùng chứa khô bọc bê tông (Dry Cask).
   - Khu bãi chứa thùng khô (Dry Cask Storage Yard) sức chứa 12 thùng.
   - Điều động đoàn xe vận tải đặc chủng chuyển chất thải về kho địa chất liên bang Neutron Energy Corp.

---

## 🚨 Hệ thống sự cố & Cơ chế SCRAM khẩn cấp

- Sự cố bất ngờ có thể phát sinh: *Tăng nhiệt đột ngột, quá tải tua-bin, nhảy áp suất van làm mát*.
- Khi sự cố nguy hiểm diễn ra:
  - 4 đèn xoay cứu nạn trên trần nhà (Emergency Revolving Beacons) đồng loạt nhấp nháy đỏ rực rỡ.
  - Còi báo động Klaxon hai tông phát ra qua bộ tổng hợp âm thanh Web Audio API.
  - Màn hình tường lớn và màn hình bàn lò phản ứng nhấp nháy cảnh báo với đồng hồ đếm ngược thử thách (5-6 giây).
  - Người chơi dập nút nấm **SCRAM 3D**: Nút nấm lún sâu xuống, lò phản ứng dập tắt an toàn, ngăn chặn thảm họa và ghi nhận xử lý thành công.

---

## 🎮 Cách điều khiển

- **Quan sát phòng điều khiển (Overview):** Di chuyển chuột nhẹ để tạo hiệu ứng thị sai (parallax 3D).
- **Chọn bàn làm việc:** Rê chuột lên bàn (bàn sẽ sáng viền neon và nhãn 3D phóng to), nhấp chuột để camera bay mượt mà đến cự ly gần của bàn đó.
- **Trở về góc nhìn toàn cảnh (Overview):** Nhấp vào nút **◀ OVERVIEW / BACK 3D** đặt trên bàn làm việc, hoặc nhấn phím **Space** / **Escape**.
- **Tương tác thiết bị:** Nhấp trực tiếp vào các nút bấm, công tắc, nút SCRAM trên bàn và trên màn hình 3D.

---

## 🚀 Khởi chạy dự án

Cài đặt và chạy môi trường phát triển:

```bash
# Cài đặt gói phụ thuộc
npm install

# Khởi chạy dev server
npm run dev

# Hoặc build và chạy bản production siêu nhẹ (chỉ ~56KB JS và 13KB CSS, build trong 1 giây)
npm run build
npm run preview
```

Mở trình duyệt tại: `http://localhost:5173`
