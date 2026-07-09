# Module Users — Clean Architecture / TDD

Tài liệu này mô tả cách implement (hoặc refactor lại) module `users` theo Clean Architecture, cùng convention với module `auth` (xem `auth-module-ddd.md`, mục 3.4 đã note việc này). Khác với auth, module này làm theo **TDD (Test-Driven Development)**: mọi behavior phải có test đỏ trước khi có code implement.

## 1. Nguyên tắc TDD áp dụng cho module này

Chu trình bắt buộc cho **mỗi behavior nhỏ**, không phải mỗi file:

1. **Red** — viết 1 test mô tả behavior mong muốn, chạy test, xác nhận nó fail (nếu fail vì lý do khác ngoài "chưa implement", ví dụ lỗi cú pháp, thì test đó chưa hợp lệ).
2. **Green** — viết code tối thiểu để test pass, không thêm logic thừa chưa có test yêu cầu.
3. **Refactor** — dọn code (đặt tên, tách hàm, xoá trùng lặp) trong khi giữ toàn bộ test vẫn xanh.

Agent implement module này **PHẢI** tạo file test trước file implementation trong mỗi mục ở checklist bên dưới. Nếu agent viết implementation trước rồi mới viết test khớp theo, coi như vi phạm quy trình — cần làm lại theo đúng thứ tự.

Cùng chiều phụ thuộc như module `auth`:

```
infrastructure  →  application  →  domain
```

`domain/` không import NestJS/TypeORM. Nếu `email.vo.ts` đã tồn tại ở module `auth`, di chuyển sang `src/shared/domain/value-objects/` và import dùng chung — không copy-paste lại value object.

## 2. Cấu trúc thư mục

```
src/users/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts                 # entity nghiệp vụ thuần
│   ├── value-objects/
│   │   └── quota-balance.vo.ts             # bọc số nguyên, không cho âm
│   ├── exceptions/
│   │   ├── user-not-found.exception.ts
│   │   └── insufficient-quota.exception.ts
│   └── repositories/
│       └── user-repository.interface.ts    # port dùng chung cho cả module auth
│
├── application/
│   ├── use-cases/
│   │   ├── create-user.use-case.ts         # dùng bởi auth.register-user.use-case
│   │   ├── get-user-profile.use-case.ts
│   │   ├── update-user-profile.use-case.ts
│   │   ├── deduct-quota.use-case.ts         # dùng bởi tracks.create-track
│   │   ├── refund-quota.use-case.ts         # dùng bởi music-generation.processor
│   │   └── delete-user.use-case.ts          # xoá tài khoản (GDPR)
│   └── dto/
│       ├── update-profile.dto.ts
│       └── user-response.dto.ts             # DTO output, KHÔNG bao giờ chứa password_hash
│
├── infrastructure/
│   ├── persistence/
│   │   ├── user.orm-entity.ts               # @Entity TypeORM, có password_hash, quota_remaining
│   │   └── typeorm-user.repository.ts       # implements user-repository.interface.ts
│   └── http/
│       ├── users.controller.ts
│       └── owner-or-admin.guard.ts          # chặn user A sửa/xem profile user B
│
└── __tests__/
    ├── domain/
    ├── application/
    └── infrastructure/
```

## 3. Checklist implement theo TDD (thứ tự bắt buộc: test trước, code sau)

### 3.1 Domain layer

- [ ] Test: `quota-balance.vo.ts` — khởi tạo với số âm phải throw lỗi → Code: constructor validate `value >= 0`
- [ ] Test: `quota-balance.vo.ts` — `decrement()` khi balance = 0 phải throw `InsufficientQuotaException` → Code: implement `decrement()`
- [ ] Test: `quota-balance.vo.ts` — `increment()` cộng đúng giá trị, không có giới hạn trần (v1) → Code: implement `increment()`
- [ ] Test: `user.entity.ts` — tạo user mới mặc định `quotaRemaining = 10` → Code: default value trong constructor/factory `User.create()`
- [ ] Test: `user.entity.ts` — `updateProfile()` không cho phép đổi `email` qua method này (chỉ đổi qua flow riêng có xác thực) → Code: `updateProfile()` chỉ nhận `displayName`, `avatarUrl`

### 3.2 Application layer

- [ ] Test: `create-user.use-case.ts` — gọi `userRepository.save()` đúng 1 lần với entity có quota mặc định → Code: implement use case (mock `UserRepositoryPort`)
- [ ] Test: `create-user.use-case.ts` — nếu `userRepository.findByEmail()` đã trả về user → throw lỗi trùng email → Code: thêm check trước khi save
- [ ] Test: `get-user-profile.use-case.ts` — user không tồn tại → throw `UserNotFoundException` → Code: implement
- [ ] Test: `get-user-profile.use-case.ts` — kết quả trả về **không chứa** `passwordHash` → Code: map sang `UserResponseDto` tường minh, không dùng spread `{...user}`
- [ ] Test: `update-user-profile.use-case.ts` — user gọi update profile của chính mình → thành công → Code: implement
- [ ] Test: `deduct-quota.use-case.ts` — quota đủ → trừ thành công, gọi `repository.save()` với giá trị mới → Code: implement
- [ ] Test: `deduct-quota.use-case.ts` — quota = 0 → throw lỗi, KHÔNG gọi `repository.save()` → Code: guard trước khi save
- [ ] Test: `refund-quota.use-case.ts` — cộng lại đúng 1 đơn vị quota → Code: implement
- [ ] Test: `delete-user.use-case.ts` — xoá user, đồng thời phải revoke toàn bộ refresh token liên quan (phối hợp với port của module `auth`) → Code: implement, inject `RefreshTokenRepositoryPort`

### 3.3 Infrastructure layer

- [ ] Test (integration, DB thật/in-memory): `typeorm-user.repository.ts` — `save()` rồi `findById()` trả đúng dữ liệu đã lưu → Code: implement repository
- [ ] Test (integration): `findByEmail()` với email không tồn tại trả `null`, không throw → Code: implement
- [ ] Test (e2e): `GET /users/:id` với JWT của chính user đó → 200, response không có `passwordHash` → Code: `users.controller.ts` + `UserResponseDto`
- [ ] Test (e2e): `GET /users/:id` với JWT của **user khác** (không phải chủ tài khoản, không phải admin) → 403 → Code: `owner-or-admin.guard.ts`
- [ ] Test (e2e): `PATCH /users/:id` gửi field lạ không có trong DTO (ví dụ `quotaRemaining`, `passwordHash`) → field đó bị bỏ qua, không update được → Code: bật `whitelist: true, forbidNonWhitelisted: true` ở `ValidationPipe` global

## 4. Checklist testing tổng hợp

### 4.1 Unit test (domain + application, mock toàn bộ port)

- [ ] Coverage ≥ 80% cho `domain/` và `application/`
- [ ] Mọi use case có ít nhất 1 test case "happy path" và 1 test case lỗi (exception)
- [ ] `QuotaBalance` VO test đầy đủ boundary case: 0, âm, số lớn

### 4.2 Integration test (repository + DB thật, dùng test DB riêng hoặc testcontainers)

- [ ] `TypeormUserRepository` CRUD đầy đủ: save, findById, findByEmail, delete
- [ ] Transaction: `deduct-quota` + tạo track (module `tracks`) phải atomic — nếu tạo track fail, quota không bị trừ (dùng `QueryRunner`/transaction của TypeORM)

### 4.3 E2E test (toàn bộ HTTP flow, dùng Supertest)

- [ ] `POST /users` (hoặc qua `/auth/register`) → user tạo thành công, quota mặc định đúng
- [ ] `GET /users/me` → trả đúng thông tin user đang đăng nhập
- [ ] `PATCH /users/:id` bởi chính chủ → 200, đổi được `displayName`/`avatarUrl`
- [ ] `PATCH /users/:id` bởi user khác → 403
- [ ] `DELETE /users/:id` bởi chính chủ → 200, user không còn login được sau đó (refresh token bị revoke)
- [ ] `DELETE /users/:id` bởi user khác (không phải admin) → 403

## 5. Security checklist riêng cho API user

- [ ] **IDOR (Insecure Direct Object Reference):** mọi endpoint có `:id` phải qua `owner-or-admin.guard.ts` — không tin `:id` trong URL trùng với user trong JWT, luôn so sánh với `req.user.id`
- [ ] **Mass assignment:** `UpdateProfileDto` chỉ khai báo field được phép sửa (`displayName`, `avatarUrl`); `ValidationPipe` global bật `whitelist` + `forbidNonWhitelisted` để chặn field lạ (`quotaRemaining`, `passwordHash`, `isAdmin`...)
- [ ] **Không lộ PII/field nhạy cảm:** mọi response luôn qua `UserResponseDto` tường minh (không `return user` trực tiếp từ entity/ORM), đảm bảo `passwordHash` không bao giờ serialize ra JSON
- [ ] **Rate limiting:** `PATCH /users/:id` và `DELETE /users/:id` cũng nên giới hạn request/phút, không chỉ riêng `/auth/*`
- [ ] **Quyền admin tách riêng:** nếu có field `role`/`isAdmin`, việc set field này KHÔNG được nằm trong bất kỳ DTO nào mà user tự gọi được — chỉ set qua migration/seed hoặc endpoint admin riêng có guard khác
- [ ] **Xoá tài khoản (GDPR-friendly):** `delete-user.use-case.ts` cần cân nhắc soft-delete (đánh dấu `deletedAt`) thay vì xoá cứng, để không phá vỡ foreign key với `tracks`/`generation_jobs`; đồng thời phải revoke hết session/refresh token
- [ ] **Không log dữ liệu nhạy cảm:** log truy cập `users.controller.ts` không được log full request body (có thể chứa dữ liệu cá nhân)
- [ ] **Kiểm tra lại sau khi refactor:** vì `auth` module sẽ gọi `user-repository.interface.ts` của module này (theo note ở `auth-module-ddd.md` mục 3.4), đảm bảo interface không vô tình để lộ method nào cho phép bypass validate (ví dụ 1 method `updateRaw()` update thẳng mọi field) — chỉ expose method có chủ đích rõ ràng (`updateProfile`, `deductQuota`, `refundQuota`)

## 6. Definition of Done

- [ ] Mọi file trong `application/use-cases/` có file test tương ứng được viết **trước**, có thể trace lại qua git history (test commit trước implementation commit)
- [ ] `domain/` không import `@nestjs/*` hoặc `typeorm`
- [ ] Toàn bộ checklist mục 4 và 5 pass
- [ ] `UserResponseDto` là con đường duy nhất dữ liệu user rời khỏi hệ thống qua HTTP
