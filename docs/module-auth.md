# Module Auth — Clean Architecture / TDD

Bản cập nhật của `auth-module-ddd.md`: chuyển từ checklist "implement rồi test sau" sang **TDD (Test-Driven Development)** đúng chuẩn, đồng bộ hoàn toàn với cách làm ở `user-module-tdd.md`. Kiến trúc 3 lớp (domain/application/infrastructure) giữ nguyên, chỉ thay đổi **thứ tự và cách viết checklist**.

## 1. Nguyên tắc

**Kiến trúc (không đổi):**

```
infrastructure  →  application  →  domain
```

- `domain`: không import NestJS, không import TypeORM. Logic nghiệp vụ thuần.
- `application`: use case + port (interface), không biết implementation cụ thể.
- `infrastructure`: implement port bằng công nghệ cụ thể, chứa toàn bộ NestJS decorator.

**TDD (thêm mới):** chu trình bắt buộc cho **mỗi behavior nhỏ**, không phải mỗi file:

1. **Red** — viết 1 test mô tả behavior mong muốn, chạy, xác nhận fail đúng lý do (chưa có implementation, không phải lỗi cú pháp).
2. **Green** — viết code tối thiểu để test pass, không thêm logic thừa chưa có test yêu cầu.
3. **Refactor** — dọn code, giữ toàn bộ test xanh.

Agent implement module này **PHẢI** tạo file test trước file implementation trong mọi mục ở checklist bên dưới — có thể trace lại qua git history (test commit trước implementation commit). Viết implementation trước rồi mới viết test khớp theo là vi phạm quy trình, cần làm lại.

## 2. Cấu trúc thư mục

```
src/auth/
├── domain/
│   ├── entities/
│   │   └── refresh-token.entity.ts       # entity nghiệp vụ thuần, KHÔNG phải @Entity TypeORM
│   ├── value-objects/
│   │   └── hashed-password.vo.ts         # email.vo.ts dùng chung từ src/shared/domain/value-objects/
│   ├── exceptions/
│   │   ├── invalid-credentials.exception.ts
│   │   └── token-expired.exception.ts
│   └── repositories/
│       └── refresh-token.repository.interface.ts   # port, chỉ định nghĩa method signature
│
├── application/
│   ├── use-cases/
│   │   ├── register-user.use-case.ts
│   │   ├── login-user.use-case.ts
│   │   ├── refresh-token.use-case.ts
│   │   └── logout.use-case.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   └── ports/
│       ├── password-hasher.port.ts
│       ├── token-service.port.ts
│       └── user-repository.port.ts       # tái sử dụng từ module users (đã tách sẵn theo user-module-tdd.md)
│
├── infrastructure/
│   ├── persistence/
│   │   ├── refresh-token.orm-entity.ts
│   │   └── typeorm-refresh-token.repository.ts
│   ├── security/
│   │   ├── bcrypt-password-hasher.service.ts
│   │   └── jwt-token.service.ts
│   ├── http/
│   │   ├── auth.controller.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   └── auth.module.ts
│
└── __tests__/
    ├── domain/
    ├── application/
    └── infrastructure/
```

> `email.vo.ts` không còn nằm trong `auth/domain/` — nếu bạn implement `users` trước theo `user-module-tdd.md`, di chuyển value object này sang `src/shared/domain/value-objects/` để dùng chung, tránh 2 module tự viết 2 bản validate email khác nhau.

## 3. Checklist implement theo TDD (thứ tự bắt buộc: test trước, code sau)

### 3.1 Domain layer

- [ ] Test: `hashed-password.vo.ts` — khởi tạo với chuỗi rỗng phải throw lỗi → Code: constructor validate không rỗng
- [ ] Test: `hashed-password.vo.ts` — không có method/getter nào trả về raw string ngoài `toString()` dùng nội bộ để so sánh → Code: implement value object, không expose plain password
- [ ] Test: `refresh-token.entity.ts` — `isExpired()` trả `true` khi `expiresAt` ở quá khứ, `false` khi ở tương lai → Code: implement `isExpired()`
- [ ] Test: `refresh-token.entity.ts` — gọi `revoke()` thì `revoked = true`, gọi `isExpired()` sau đó vẫn hoạt động đúng độc lập với `revoked` → Code: implement `revoke()`
- [ ] Test: `invalid-credentials.exception.ts` — message mặc định là generic ("Email hoặc mật khẩu không đúng"), không nhận tham số custom message tiết lộ lý do cụ thể → Code: implement exception class cố định message
- [ ] Test: `token-expired.exception.ts` — extend đúng `DomainException` base, có `name` riêng biệt để phân biệt khi catch → Code: implement

### 3.2 Application layer

- [ ] Test: `register-user.use-case.ts` — khi `userRepository.findByEmail()` trả về user đã tồn tại → throw lỗi, **không gọi** `passwordHasher.hash()` (verify bằng mock, đảm bảo không tốn công hash khi sẽ fail) → Code: implement guard trước
- [ ] Test: `register-user.use-case.ts` — khi email chưa tồn tại → gọi đúng `passwordHasher.hash(rawPassword)` **trước khi** gọi `userRepository.save()` → Code: implement luồng chính
- [ ] Test: `register-user.use-case.ts` — kết quả trả về không tự sinh token (không tự động login) → Code: đảm bảo return type chỉ có user, không có token
- [ ] Test: `login-user.use-case.ts` — email không tồn tại → throw `InvalidCredentialsException` (không phải lỗi khác) → Code: implement
- [ ] Test: `login-user.use-case.ts` — email tồn tại nhưng `passwordHasher.compare()` trả `false` → throw **cùng** `InvalidCredentialsException` như case trên (assert message giống hệt để test chống user-enumeration) → Code: implement, dùng chung 1 nhánh throw cho cả 2 case
- [ ] Test: `login-user.use-case.ts` — credentials đúng → gọi `tokenService.signAccessToken()` và `signRefreshToken()`, gọi `refreshTokenRepository.save()` đúng 1 lần → Code: implement luồng thành công
- [ ] Test: `refresh-token.use-case.ts` — token không tồn tại trong repository → throw lỗi → Code: implement
- [ ] Test: `refresh-token.use-case.ts` — token tồn tại nhưng `isExpired() === true` → throw `TokenExpiredException` → Code: implement
- [ ] Test: `refresh-token.use-case.ts` — token tồn tại nhưng `revoked === true` → throw lỗi (dùng lại token đã revoke = dấu hiệu bị đánh cắp) → Code: implement
- [ ] Test: `refresh-token.use-case.ts` — token hợp lệ → revoke token cũ, tạo token mới, trả access token mới (test rotation) → Code: implement
- [ ] Test: `logout.use-case.ts` — gọi đúng `refreshTokenRepository.revokeAllForUser()` hoặc revoke đúng 1 token tuỳ tham số truyền vào → Code: implement

### 3.3 Infrastructure layer

- [ ] Test (integration, DB test): `typeorm-refresh-token.repository.ts` — `save()` rồi `findByToken()` trả đúng bản ghi đã lưu, map đúng sang domain entity (không rò rỉ field ORM-only) → Code: implement repository
- [ ] Test (integration): `revokeAllForUser()` set `revoked = true` cho **toàn bộ** token của user đó, không đụng token của user khác → Code: implement
- [ ] Test (unit, không cần network): `bcrypt-password-hasher.service.ts` — `hash()` rồi `compare(plain, hashed)` trả `true`; `compare(wrongPlain, hashed)` trả `false` → Code: implement, `saltRounds >= 12`
- [ ] Test (unit): `jwt-token.service.ts` — `sign()` rồi `verify()` roundtrip đúng payload; token access và refresh dùng 2 secret khác nhau (verify access token bằng refresh secret phải throw) → Code: implement
- [ ] Test (e2e, Supertest): `POST /auth/register` → 201, kiểm tra password lưu trong DB là hash chứ không phải plaintext → Code: `auth.controller.ts` endpoint register
- [ ] Test (e2e): `POST /auth/login` sai password → 401, response message generic → Code: endpoint login
- [ ] Test (e2e): `POST /auth/refresh` với token hợp lệ → access token mới; gọi lại với token **cũ** (đã bị revoke do rotation) → 401 → Code: endpoint refresh
- [ ] Test (e2e): route có `@UseGuards(JwtAuthGuard)` không có token → 401; token hết hạn → 401; token hợp lệ → 200 → Code: `jwt-auth.guard.ts` + `jwt.strategy.ts`
- [ ] Test (unit): `auth.module.ts` — resolve được toàn bộ provider qua DI container (test bằng `Test.createTestingModule()` của NestJS, không cần bật HTTP server) → Code: hoàn thiện `auth.module.ts` bind port → implementation

### 3.4 Đồng bộ với module `users`

- [ ] Test: `register-user.use-case.ts` gọi `userRepository.save()` thông qua **port đã có sẵn** từ `user-module-tdd.md` (`UserRepositoryPort`) — không tự viết lại logic lưu user trong module `auth` → Code: inject port có sẵn, không tạo thêm interface trùng lặp
- [ ] Test: `deduct-quota`/`refund-quota` (thuộc module `users`) **không** bị gọi bởi bất kỳ use case nào trong `auth` — auth chỉ lo xác thực → Code: review lại, đảm bảo tách biệt trách nhiệm

## 4. Checklist testing tổng hợp

### 4.1 Unit test (domain + application, mock toàn bộ port)

- [ ] Coverage ≥ 80% cho `domain/` và `application/`
- [ ] Mọi use case có ít nhất 1 test "happy path" và 1 test exception, viết **trước** khi có file implementation
- [ ] `login-user.use-case.ts` có test riêng khẳng định message lỗi giống hệt nhau giữa "email sai" và "password sai"

### 4.2 Integration test (repository, DB test riêng hoặc SQLite in-memory)

- [ ] `TypeormRefreshTokenRepository`: save/find/revoke đầy đủ
- [ ] `BcryptPasswordHasherService`, `JwtTokenService`: test độc lập, không cần HTTP server

### 4.3 E2E test (toàn bộ HTTP flow, Supertest)

- [ ] `POST /auth/register` → 201, không trùng email
- [ ] `POST /auth/register` email trùng → 409
- [ ] `POST /auth/login` đúng/sai credentials
- [ ] `POST /auth/login` sai password → 401, thời gian phản hồi không lệch đáng kể so với case email không tồn tại (chống timing attack)
- [ ] `POST /auth/refresh` hợp lệ/hết hạn/đã revoke
- [ ] Route được `JwtAuthGuard` bảo vệ: không token / token hết hạn / token hợp lệ

## 5. Security checklist riêng cho auth

- [ ] **Password:** bcrypt/argon2, `saltRounds >= 12`, không log raw password
- [ ] **JWT:** access và refresh dùng 2 secret khác nhau; access token TTL 10–15 phút
- [ ] **Refresh token rotation:** mỗi lần refresh revoke token cũ; nếu token đã revoke bị dùng lại → revoke toàn bộ token của user (dấu hiệu bị đánh cắp) — **đã có test ở mục 3.2**
- [ ] **Rate limiting:** `POST /auth/login`, `POST /auth/register` giới hạn request/IP (`@nestjs/throttler`)
- [ ] **Generic error message:** đã enforce bằng test ở mục 3.2 (login-user.use-case), không cần review thủ công lại
- [ ] **Cookie (nếu dùng thay localStorage cho refresh token):** `httpOnly`, `secure`, `sameSite=strict`
- [ ] **Validate input:** DTO `class-validator`, reject payload sai kiểu trước khi vào use case
- [ ] **Không trả stack trace/lỗi nội bộ** ra client (exception filter global)
- [ ] **Audit log:** log login thất bại liên tiếp để phát hiện brute-force, không log password dù đã hash

## 6. Definition of Done

- [ ] Mọi file trong `application/use-cases/` có file test tương ứng viết **trước**, trace được qua git history
- [ ] `domain/` không import `@nestjs/*` hoặc `typeorm`
- [ ] Toàn bộ checklist mục 4 và 5 pass
- [ ] `auth.module.ts` là nơi duy nhất biết class implementation cụ thể nào bind vào port nào
- [ ] Không còn value object `email.vo.ts` trùng lặp giữa `auth` và `users` — đã dùng chung từ `src/shared/domain/`
