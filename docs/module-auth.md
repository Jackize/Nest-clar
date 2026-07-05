# Module Auth — Clean Architecture / DDD

Tài liệu này mô tả cách implement module `auth` theo Clean Architecture (3 lớp: domain, application, infrastructure), đồng bộ quy ước với module `users`/`tracks` đã có (entity TypeORM, NestJS module pattern). Agent implement theo checklist ở mục 3.

## 1. Nguyên tắc kiến trúc

**Chiều phụ thuộc chỉ được đi một hướng:**

```
infrastructure  →  application  →  domain
```

- `domain`: không import bất cứ thứ gì từ `application`/`infrastructure`, không import NestJS, không import TypeORM. Đây là logic nghiệp vụ thuần (pure TypeScript).
- `application`: định nghĩa use case + các **port** (interface) mà use case cần, nhưng không biết implementation cụ thể là gì (bcrypt hay argon2, JWT hay session cookie).
- `infrastructure`: implement các port đó bằng công nghệ cụ thể (TypeORM, bcrypt, `@nestjs/jwt`), và là nơi duy nhất chứa NestJS decorators (`@Controller`, `@Injectable`, `@Entity`).

> Quy tắc kiểm tra nhanh: nếu bạn xoá NestJS và TypeORM khỏi project, code trong `domain/` phải vẫn compile được.

## 2. Cấu trúc thư mục

```
src/auth/
├── domain/
│   ├── entities/
│   │   └── refresh-token.entity.ts       # entity nghiệp vụ thuần, KHÔNG phải @Entity TypeORM
│   ├── value-objects/
│   │   ├── email.vo.ts                   # validate format, immutable
│   │   └── hashed-password.vo.ts
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
│       ├── password-hasher.port.ts        # interface: hash(), compare()
│       ├── token-service.port.ts          # interface: sign(), verify()
│       └── user-repository.port.ts        # tái sử dụng nếu module users đã có sẵn interface tương tự
│
├── infrastructure/
│   ├── persistence/
│   │   ├── typeorm-refresh-token.repository.ts   # implements domain/repositories/refresh-token.repository.interface.ts
│   │   └── refresh-token.orm-entity.ts           # @Entity TypeORM, map sang domain entity
│   ├── security/
│   │   ├── bcrypt-password-hasher.service.ts     # implements password-hasher.port.ts
│   │   └── jwt-token.service.ts                  # implements token-service.port.ts
│   ├── http/
│   │   ├── auth.controller.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   └── auth.module.ts                     # wiring: bind port -> implementation qua useClass/useExisting
```

## 3. Checklist implement

### 3.1 Domain layer (làm trước tiên, không phụ thuộc gì)

- [ ] `email.vo.ts`: value object validate format email, throw exception nếu sai định dạng ngay tại constructor
- [ ] `hashed-password.vo.ts`: value object bọc chuỗi hash, **không bao giờ** cho phép truy cập raw password ở tầng domain
- [ ] `refresh-token.entity.ts`: field `token`, `userId`, `expiresAt`, `revoked`; method `isExpired(): boolean`, `revoke(): void`
- [ ] `invalid-credentials.exception.ts`, `token-expired.exception.ts`: extend một `DomainException` base chung
- [ ] `refresh-token.repository.interface.ts`: định nghĩa method `save()`, `findByToken()`, `revokeAllForUser()` — chỉ signature, không implementation

### 3.2 Application layer (phụ thuộc domain, KHÔNG phụ thuộc infrastructure)

- [ ] `password-hasher.port.ts`: interface `{ hash(plain: string): Promise<string>; compare(plain: string, hashed: string): Promise<boolean> }`
- [ ] `token-service.port.ts`: interface `{ signAccessToken(payload): string; signRefreshToken(payload): string; verify(token): Payload }`
- [ ] `user-repository.port.ts`: tái sử dụng convention từ module `users` — nếu module `users` chưa tách port/repository interface, đây là lúc refactor nó theo cùng pattern để nhất quán
- [ ] `register-user.use-case.ts`: nhận DTO → check email tồn tại (qua port) → hash password (qua port) → tạo user (qua port) → KHÔNG tự động login
- [ ] `login-user.use-case.ts`: tìm user theo email → compare password → nếu đúng, sinh access + refresh token → lưu refresh token
- [ ] `refresh-token.use-case.ts`: verify refresh token còn hạn & chưa bị revoke → sinh access token mới → (khuyến nghị) rotate refresh token, revoke token cũ
- [ ] `logout.use-case.ts`: revoke refresh token hiện tại (hoặc toàn bộ token của user nếu "logout all devices")
- [ ] Mỗi use case là 1 class với đúng 1 method `execute()` — không gộp nhiều nghiệp vụ vào 1 use case

### 3.3 Infrastructure layer (implement port, chứa toàn bộ NestJS/TypeORM code)

- [ ] `refresh-token.orm-entity.ts`: `@Entity('refresh_tokens')`, có mapper hai chiều sang/từ `domain/entities/refresh-token.entity.ts`
- [ ] `typeorm-refresh-token.repository.ts`: `@Injectable()`, implements `RefreshTokenRepositoryInterface`, dùng TypeORM `Repository<RefreshTokenOrmEntity>` bên trong, map kết quả về domain entity trước khi return
- [ ] `bcrypt-password-hasher.service.ts`: implements `PasswordHasherPort`, dùng `bcrypt` với `saltRounds >= 12`
- [ ] `jwt-token.service.ts`: implements `TokenServicePort`, dùng `@nestjs/jwt`; access token TTL ngắn (15p), refresh token TTL dài (7 ngày), 2 secret khác nhau cho access/refresh
- [ ] `jwt.strategy.ts`: Passport strategy, chỉ gọi use case `ValidateUserUseCase` hoặc `user-repository.port` để lấy user từ payload, không tự viết lại logic verify
- [ ] `jwt-auth.guard.ts`: extend `AuthGuard('jwt')`
- [ ] `auth.controller.ts`: mỗi endpoint chỉ gọi 1 use case tương ứng, KHÔNG chứa business logic — chỉ map HTTP request → DTO → use case → HTTP response
- [ ] `auth.module.ts`: bind từng port với implementation cụ thể, ví dụ:
  ```ts
  {
    provide: 'PasswordHasherPort',
    useClass: BcryptPasswordHasherService,
  },
  {
    provide: 'TokenServicePort',
    useClass: JwtTokenService,
  },
  {
    provide: 'RefreshTokenRepositoryInterface',
    useClass: TypeormRefreshTokenRepository,
  },
  ```

### 3.4 Đồng bộ với module `users` đã có

- [ ] Nếu `UsersService` hiện tại đang thao tác TypeORM trực tiếp (không tách port), tạo `user-repository.port.ts` trong `application/ports` của module `users` và viết `TypeormUserRepository implements UserRepositoryPort` trong `infrastructure/persistence` — để module `auth` gọi user qua port thay vì gọi thẳng `UsersService`
- [ ] Đảm bảo `quota_remaining` (đã có ở entity `User`) không bị đụng tới bởi module `auth` — tách biệt trách nhiệm, `auth` chỉ lo xác thực, không lo quota

## 4. Checklist testing & bảo mật cho API auth

### 4.1 Unit test (domain + application — không cần DB/HTTP thật)

- [ ] `email.vo.ts`: reject email sai định dạng, accept email hợp lệ
- [ ] `refresh-token.entity.ts`: `isExpired()` trả đúng true/false theo `expiresAt`
- [ ] `register-user.use-case.ts`: throw lỗi nếu email đã tồn tại; gọi đúng `passwordHasher.hash()` trước khi lưu user (mock port)
- [ ] `login-user.use-case.ts`: throw `InvalidCredentialsException` khi sai password; **không được để lộ** trong message là "sai email" hay "sai password" riêng biệt (tránh user enumeration)
- [ ] `refresh-token.use-case.ts`: throw `TokenExpiredException` khi token hết hạn; throw lỗi khi token đã bị revoke

### 4.2 Integration test (có DB test, dùng testcontainers hoặc SQLite in-memory)

- [ ] `POST /auth/register` → 201, user được lưu, password trong DB là hash chứ không phải plaintext
- [ ] `POST /auth/register` với email đã tồn tại → 409, không tạo user trùng
- [ ] `POST /auth/login` đúng credentials → trả access + refresh token
- [ ] `POST /auth/login` sai password → 401, thời gian phản hồi không lệch đáng kể so với case "email không tồn tại" (chống timing attack để dò email hợp lệ)
- [ ] `POST /auth/refresh` với refresh token hợp lệ → access token mới; refresh token cũ bị revoke (nếu có rotation)
- [ ] `POST /auth/refresh` với refresh token đã revoke/hết hạn → 401
- [ ] `GET /tracks` (route có `@UseGuards(JwtAuthGuard)`) không có token → 401; token hết hạn → 401; token hợp lệ → 200

### 4.3 Security checklist riêng cho auth

- [ ] **Password:** bcrypt/argon2 với cost factor đủ cao (bcrypt rounds ≥ 12), không bao giờ log raw password (kể cả log lỗi)
- [ ] **JWT:** access token và refresh token dùng **2 secret khác nhau**; access token TTL ngắn (10–15 phút)
- [ ] **Refresh token rotation:** mỗi lần refresh, revoke token cũ và cấp token mới — nếu 1 refresh token bị dùng lại sau khi đã revoke (dấu hiệu bị đánh cắp), revoke **toàn bộ** token của user đó
- [ ] **Rate limiting:** `POST /auth/login` và `POST /auth/register` giới hạn số request/IP (dùng `@nestjs/throttler`) để chống brute-force
- [ ] **Generic error message:** login sai luôn trả về message chung "Email hoặc mật khẩu không đúng", không phân biệt "email không tồn tại" vs "sai password"
- [ ] **HTTPS only cookie (nếu dùng cookie thay vì localStorage cho refresh token):** `httpOnly`, `secure`, `sameSite=strict`
- [ ] **Validate input:** DTO dùng `class-validator`, reject payload thiếu field hoặc field sai kiểu trước khi vào use case
- [ ] **Không trả stack trace / lỗi nội bộ** ra client khi có exception ở tầng infrastructure (dùng NestJS exception filter global)
- [ ] **Audit log:** log các sự kiện login thất bại liên tiếp (nhiều lần trong thời gian ngắn) để phát hiện tấn công, nhưng KHÔNG log password dù đã hash

## 5. Tiêu chí "Definition of Done" cho module auth

- [ ] `domain/` không có import nào từ `@nestjs/*` hoặc `typeorm`
- [ ] Tất cả use case trong `application/` có unit test riêng, coverage ≥ 80%
- [ ] Toàn bộ checklist mục 4.2 và 4.3 pass
- [ ] `auth.module.ts` là nơi duy nhất biết class implementation cụ thể nào được bind vào port nào
