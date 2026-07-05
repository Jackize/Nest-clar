# AI Music Generation Platform

Web app cho phép người dùng nhập prompt (thể loại, mood, lời) để tạo nhạc bằng AI, lưu trữ vào thư viện cá nhân, nghe/tải/chia sẻ. Tài liệu này mô tả kiến trúc và checklist implement cho backend NestJS + frontend Next.js.

## 1. Mục tiêu & phạm vi

- **Trong phạm vi:** auth, tạo track qua prompt, xử lý bất đồng bộ (queue), fallback provider khi API lỗi, thư viện cá nhân, chia sẻ public link, quota người dùng.
- **Ngoài phạm vi (v1):** tự train/fine-tune model nhạc, thanh toán/subscription, mobile app.

## 2. Tech stack

| Layer                   | Công nghệ                                                  |
| ----------------------- | ---------------------------------------------------------- |
| Frontend                | Next.js (React) + Tailwind, Wavesurfer.js cho audio player |
| Backend                 | NestJS (REST API)                                          |
| Queue                   | BullMQ + Redis                                             |
| Database                | PostgreSQL + TypeORM                                       |
| Storage file audio      | S3-compatible bucket (hoặc Cloudinary)                     |
| Auth                    | JWT (access + refresh token)                               |
| AI Music API (chính)    | MiniMax Music qua fal.ai                                   |
| AI Music API (dự phòng) | Stable Audio (Stability AI)                                |

## 3. Cấu trúc thư mục backend

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt-auth.guard.ts
│   └── jwt.strategy.ts
├── users/
│   ├── entities/user.entity.ts
│   ├── users.module.ts
│   └── users.service.ts
├── tracks/
│   ├── dto/create-track.dto.ts
│   ├── entities/track.entity.ts
│   ├── entities/generation-job.entity.ts
│   ├── entities/track-share.entity.ts
│   ├── tracks.controller.ts
│   ├── tracks.service.ts
│   ├── music-generation.processor.ts
│   ├── music-provider.service.ts
│   └── tracks.module.ts
├── shares/
│   ├── shares.controller.ts
│   └── shares.service.ts
├── app.module.ts
└── main.ts
```

## 4. Database schema (ERD)

```
USERS ||--o{ TRACKS : creates
TRACKS ||--o{ GENERATION_JOBS : processed_by
TRACKS ||--o| TRACK_SHARES : shared_as
```

### users

| Cột             | Kiểu      | Ghi chú                                                      |
| --------------- | --------- | ------------------------------------------------------------ |
| id              | uuid PK   |                                                              |
| email           | string UK |                                                              |
| password_hash   | string    |                                                              |
| quota_remaining | int       | default 10 / tháng, trừ khi tạo track, hoàn khi job fail hẳn |
| created_at      | timestamp |                                                              |

### tracks

| Cột        | Kiểu                                            | Ghi chú               |
| ---------- | ----------------------------------------------- | --------------------- |
| id         | uuid PK                                         |                       |
| user_id    | uuid FK -> users                                |                       |
| title      | string                                          |                       |
| prompt     | text                                            |                       |
| genre      | string, nullable                                |                       |
| audio_url  | string, nullable                                | set khi job completed |
| status     | enum: pending / processing / completed / failed |                       |
| is_public  | boolean                                         | default false         |
| created_at | timestamp                                       |                       |

### generation_jobs

| Cột           | Kiểu                                            | Ghi chú                                               |
| ------------- | ----------------------------------------------- | ----------------------------------------------------- |
| id            | uuid PK                                         |                                                       |
| track_id      | uuid FK -> tracks                               | 1 track có thể có nhiều job (retry qua provider khác) |
| provider      | string                                          | 'minimax' \| 'stable-audio'                           |
| status        | enum: pending / processing / completed / failed |                                                       |
| error_message | text, nullable                                  |                                                       |
| started_at    | timestamp                                       |                                                       |
| completed_at  | timestamp, nullable                             |                                                       |

### track_shares

| Cột         | Kiểu              | Ghi chú                                            |
| ----------- | ----------------- | -------------------------------------------------- |
| id          | uuid PK           |                                                    |
| track_id    | uuid FK -> tracks |                                                    |
| share_token | string UK         | random, dùng trong URL public thay vì lộ uuid thật |
| view_count  | int               | default 0                                          |
| created_at  | timestamp         |                                                    |

## 5. Luồng xử lý tạo nhạc (job flow)

1. `POST /tracks` → validate quota → tạo record `tracks` (status=`pending`) → trừ quota → đẩy job vào queue `music-generation` → **trả response ngay lập tức**, không chờ AI xử lý.
2. Worker (`music-generation.processor.ts`) nhận job → set track status=`processing`.
3. Worker thử lần lượt provider theo thứ tự `['minimax', 'stable-audio']`:
   - Mỗi lần thử tạo 1 record `generation_jobs` mới.
   - Thành công → set track `status=completed`, `audio_url=<url>` → dừng vòng lặp.
   - Lỗi → set job đó `status=failed`, `error_message` → thử provider tiếp theo.
4. Nếu tất cả provider đều lỗi → track `status=failed` → hoàn `quota_remaining` cho user.
5. Client polling `GET /tracks/:id` (hoặc WebSocket, nếu implement ở v2) để cập nhật trạng thái theo thời gian thực.

> Quan trọng: KHÔNG dùng BullMQ auto-retry (`attempts > 1`) cho job này — logic retry-qua-provider-khác nằm trong code xử lý, không phải retry-lại-cùng-1-job.

## 6. API endpoints

| Method | Path              | Auth           | Mô tả                                                |
| ------ | ----------------- | -------------- | ---------------------------------------------------- |
| POST   | /auth/register    | Không          | Đăng ký                                              |
| POST   | /auth/login       | Không          | Đăng nhập, trả JWT                                   |
| POST   | /tracks           | Có             | Tạo track mới, đẩy job vào queue                     |
| GET    | /tracks/:id       | Có             | Xem chi tiết + trạng thái track                      |
| GET    | /tracks           | Có             | Danh sách track của user hiện tại                    |
| POST   | /tracks/:id/share | Có (chủ track) | Tạo `share_token`, set `is_public=true`              |
| GET    | /share/:token     | Không          | Xem track public qua share token (tăng `view_count`) |

## 7. Biến môi trường cần thiết

```
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=
JWT_SECRET=
JWT_REFRESH_SECRET=
FAL_AI_API_KEY=
STABILITY_AI_API_KEY=
S3_BUCKET_NAME=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

## 8. Checklist implement (theo thứ tự ưu tiên)

- [ ] Setup NestJS project, kết nối PostgreSQL (TypeORM) + Redis
- [ ] Module `auth`: register/login, JWT guard
- [ ] Module `users`: entity + quota logic
- [ ] Module `tracks`: entity `Track`, `GenerationJob`, `TrackShare`
- [ ] `TracksController` + `TracksService`: endpoint tạo track, kiểm tra quota, đẩy job vào BullMQ
- [ ] `MusicProviderService`: wrapper gọi MiniMax (fal.ai) và Stable Audio, chuẩn hoá response về cùng 1 interface `{ audioUrl: string }`
- [ ] `MusicGenerationProcessor`: xử lý job, logic fallback provider, cập nhật DB
- [ ] Endpoint chia sẻ: tạo `share_token`, endpoint public xem track
- [ ] Upload audio result lên S3, lưu `audio_url`
- [ ] Frontend: form tạo track, trang thư viện, audio player (Wavesurfer.js), polling trạng thái
- [ ] Rate limiting theo user (NestJS `ThrottlerModule`)
- [ ] Viết test cho `TracksService.createTrack` (case: đủ quota, hết quota) và `MusicGenerationProcessor` (case: provider chính lỗi → fallback thành công, cả 2 đều lỗi)

## 9. Nguyên tắc code cho agent

- Mọi entity dùng `uuid` làm primary key, không dùng auto-increment int.
- Mọi thao tác gọi API bên ngoài (MiniMax/Stable Audio) phải nằm trong `MusicProviderService`, không gọi trực tiếp từ processor hay controller.
- Không throw lỗi API provider thẳng ra client — luôn catch, log, và để job flow xử lý fallback.
- Timestamp dùng `timestamptz` ở Postgres, không dùng `timestamp` thường.
- Tên queue và tên job (`'music-generation'`, `'generate'`) phải giữ nguyên xuyên suốt giữa service, module, và processor.
