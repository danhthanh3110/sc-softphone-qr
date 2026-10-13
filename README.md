# SC Softphone QR

Trang cấp QR đăng nhập máy lẻ WorldfonePBX cho SC Softphone 1.1.0 (pilot).

## Sử dụng

1. Mở trang GitHub Pages, nhập secret API được quản trị viên cấp.
2. Thêm máy lẻ/tên người dùng, hoặc dán danh sách nhiều dòng `máy_lẻ,tên` (tối đa 100).
3. Bấm **Tạo QR cho danh sách**. Tải PNG từng mã hoặc **In mã**.
4. Trên app: **Quét QR để đăng nhập** → cấp quyền camera → quét → kiểm tra máy lẻ → **Kết nối**.

Mã chứa secret và có thể dùng lại. Chỉ cấp cho đúng người; ai có ảnh mã đều có thể đọc secret. Không đưa secret/ảnh QR thật vào repository, issue hoặc log. Công cụ giữ dữ liệu trong bộ nhớ của trang, không gọi API, không dùng localStorage/cookie/analytics. Tải lại trang hoặc **Xóa thông tin phiên** để xóa dữ liệu trên trang; ảnh đã tải/in cần quản lý riêng.

Đây là công cụ quản trị chạy trong trình duyệt, không có backend xác thực, cơ chế thu hồi hoặc token dùng một lần. App gọi endpoint Worldfone cố định sau khi người dùng xác nhận.

## QR contract

```json
{"kind":"sc-softphone-login","version":1,"extension":"8150","secret":"EXAMPLE_ONLY"}
```

Không nhận URL, SIP password, API host tùy ý hoặc field ngoài contract. Secret tối đa 256 ký tự không chứa control characters; máy lẻ 1–16 chữ số. Tên người dùng chỉ hiển thị trên trang/ảnh in, không nằm trong payload.

## Development / GitHub Pages

Node >= 22.12; `npm ci`, `npm test`, `npm run build`.

Build dùng base `/sc-softphone-qr/`. Chép nội dung `dist/` vào `docs/`, thêm `docs/.nojekyll`, commit. GitHub Pages: Deploy from a branch, `main` / `/docs`. URL dự kiến: https://danhthanh3110.github.io/sc-softphone-qr/.

Thư viện qrcode được bundle cùng website; không tải JS từ CDN hoặc gửi dữ liệu tới dịch vụ tạo QR ngoài. Dependency code: [node-qrcode](https://github.com/soldair/node-qrcode), MIT.
