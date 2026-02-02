# Kindora Monorepo

Chào mừng bạn đến với hệ sinh thái **Kindora**. Đây là một dự án monorepo được xây dựng trên nền tảng **Turborepo** và **pnpm**, giúp tối ưu hóa quy trình phát triển và quản lý mã nguồn giữa các ứng dụng và thư viện dùng chung.

## 🚀 Cấu trúc dự án

Dự án được chia thành hai khu vực chính:

### Apps

- `apps/api`: Backend được xây dựng bằng framework **NestJS**.

### Packages (Thư viện dùng chung)

- `@repo/ui`: Thư viện component React cơ bản.
- `@repo/eslint-config`: Cấu hình ESLint chuẩn hóa (bao gồm các plugin tối ưu như `import-x`).
- `@repo/prettier-config`: Cấu hình Prettier dùng chung.
- `@repo/typescript-config`: Các file `tsconfig.json` cho từng môi trường khác nhau.

## 🛠 Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **Package Manager**: [pnpm](https://pnpm.io/) (v9.0.0 trở lên)

## 🏗 Thiết lập dự án

1. **Cài đặt thư viện**:

   ```bash
   pnpm install
   ```

2. **Chạy dự án ở chế độ phát triển**:

   ```bash
   pnpm dev
   ```

3. **Xây dựng dự án cho production**:
   ```bash
   pnpm build
   ```

## 📜 Các lệnh quan trọng

| Lệnh               | Mô tả                                      |
| :----------------- | :----------------------------------------- |
| `pnpm dev`         | Chạy dev mode cho toàn bộ dự án bằng Turbo |
| `pnpm build`       | Build toàn bộ dự án                        |
| `pnpm lint`        | Kiểm tra lỗi code (Linting)                |
| `pnpm format`      | Tự động định dạng code bằng Prettier       |
| `pnpm check-types` | Kiểm tra lỗi TypeScript                    |

## 🤝 Quy định phát triển (Contribution)

### Conventional Commits

Dự án này sử dụng **Commitlint** để bắt buộc tuân thủ chuẩn [Conventional Commits](https://www.conventionalcommits.org/). Một commit message hợp lệ cần có cấu trúc:

`<type>(<scope>): <description>`

Ví dụ:

- `feat(api): thêm endpoint đăng ký người dùng`
- `fix(ui): sửa lỗi hiển thị nút bấm trên mobile`
- `chore: cập nhật dependencies`

### Linting & Formatting

Trước khi commit, hệ thống sẽ tự động chạy **lint-staged** để:

1. Định dạng lại code (`prettier --write`).
2. Kiểm tra và sửa lỗi lint (`eslint --fix`).
3. Chuẩn hóa file `package.json`.

## ⚙️ Cấu hình đặc biệt

- **Import-X**: Dự án sử dụng `eslint-plugin-import-x` để tối ưu hóa việc sắp xếp và kiểm tra lỗi import, giúp quy trình lint nhanh hơn.
- **Prettier Ignore**: Các file build (`dist`, `.turbo`, etc.) được liệt kê trong `.prettierignore` để tránh định dạng nhầm các file tự động phát sinh.

---

_Kindora - Xây dựng tương lai kết nối._
