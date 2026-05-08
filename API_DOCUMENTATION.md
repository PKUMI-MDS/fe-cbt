# CBT TOAFL API Documentation

## Base URL
```
/api
```

## Response Format
All responses follow this standard format:
```json
{
  "code": 200,
  "status": "success",
  "message": "...",
  "data": {}
}
```

File preview/export endpoints return binary file responses instead of JSON.

## Authentication
Use Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Public Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user (status: pending_verification) |
| POST | `/api/login` | Login (only active accounts can login) |

---

## Authenticated Endpoints (User)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/logout` | Logout and revoke token |
| GET | `/api/me` | Get current user profile |

### Payment Proof
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment-proofs` | List user's payment proofs |
| POST | `/api/payment-proofs` | Upload payment proof (jpg,png,pdf, max 5MB) |

### User Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/my/profile` | Get profile |
| GET | `/api/my/test-approvals` | List test approvals |
| GET | `/api/my/exam-sessions` | List assigned exam sessions |
| GET | `/api/my/active-attempt` | Get active exam attempt |
| GET | `/api/my/results` | List exam results |

### Exam Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exam-sessions/{session}/start` | Start exam session |
| GET | `/api/exam-attempts/{attempt}/resume` | Resume active exam |
| GET | `/api/exam-attempts/{attempt}/questions/{number}` | Get question by number |
| POST | `/api/exam-attempts/{attempt}/answers` | Save answer |
| POST | `/api/exam-attempts/{attempt}/mark-doubt` | Mark doubtful |
| POST | `/api/exam-attempts/{attempt}/navigate` | Navigate questions |
| POST | `/api/exam-attempts/{attempt}/heartbeat` | Heartbeat & check timeout |
| POST | `/api/exam-attempts/{attempt}/submit` | Submit exam |
| GET | `/api/exam-attempts/{attempt}/result` | Get result (respects show_result setting) |
| POST | `/api/exam-attempts/{attempt}/violations` | Log violation |
| POST | `/api/exam-attempts/{attempt}/audio-play` | Log audio play |

#### Save Answer Payload

`question_id` in this endpoint refers to `exam_attempt_questions.id`, not the original `questions.id` from the question bank.

```json
{
  "question_id": 1,
  "selected_option_id": 1
}
```

- `question_id` is required and must exist in `exam_attempt_questions`.
- `selected_option_id` is nullable and must exist in `question_options` when provided.
- The backend calculates `is_correct` and `score_value` from the selected option.

---

## Admin Endpoints (require admin role)

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/{id}` | Show user detail |
| PATCH | `/api/admin/users/{id}/approve-account` | Activate user account |
| PATCH | `/api/admin/users/{id}/reject-account` | Reject user account |
| PATCH | `/api/admin/users/{id}/reset-password` | Reset user password |

### Payment Proof Review
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/payment-proofs` | List all payment proofs |
| GET | `/api/admin/payment-proofs/{id}` | Show payment proof detail |
| GET | `/api/admin/payment-proofs/{id}/preview` | Preview payment proof file inline (jpg,png,pdf) |
| PATCH | `/api/admin/payment-proofs/{id}/approve` | Approve & generate test approval |
| PATCH | `/api/admin/payment-proofs/{id}/reject` | Reject with reason |

### Test Approval
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/test-approvals` | List all test approvals |
| GET | `/api/admin/test-approvals/{id}` | Show test approval detail |

### Question Bank
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/question-banks` | List question banks |
| POST | `/api/admin/question-banks` | Create question bank |
| GET | `/api/admin/question-banks/{id}` | Show question bank |
| PATCH | `/api/admin/question-banks/{id}` | Update question bank |
| DELETE | `/api/admin/question-banks/{id}` | Delete question bank |

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/questions` | List questions |
| POST | `/api/admin/questions` | Create question with options & media |
| GET | `/api/admin/questions/{id}` | Show question |
| PATCH | `/api/admin/questions/{id}` | Update question |
| DELETE | `/api/admin/questions/{id}` | Soft delete question |

#### Question Payload

Question endpoints support multiple choice questions with text, image, audio, or mixed media.

Supported `question_type` values:

- `multiple_choice_text`
- `multiple_choice_image`
- `multiple_choice_audio`
- `multiple_choice_mixed`

Example JSON payload for a text question:

```json
{
  "question_bank_id": 1,
  "section_type": "reading",
  "question_type": "multiple_choice_text",
  "difficulty_level": "easy",
  "stem_html": "<p>Contoh soal API: jawaban yang benar adalah A.</p>",
  "explanation_html": "<p>Ini hanya data dummy untuk testing.</p>",
  "audio_max_play_count": 1,
  "options": [
    {
      "option_html": "<p>Jawaban A</p>",
      "is_correct": true
    },
    {
      "option_html": "<p>Jawaban B</p>",
      "is_correct": false
    },
    {
      "option_html": "<p>Jawaban C</p>",
      "is_correct": false
    }
  ]
}
```

For media questions, send the request as `multipart/form-data` and include:

- `image` for `multiple_choice_image`
- `audio` for `multiple_choice_audio`
- `image` or `audio` for `multiple_choice_mixed`

Validation rules:

- `question_bank_id` must exist in `question_banks`.
- `section_type` must match the backend section enum.
- `stem_html` is required.
- `difficulty_level` is optional.
- `audio_max_play_count` is optional and defaults to `1` when omitted.
- `options` is required and must contain at least 2 options.
- Exactly 1 option must have `is_correct = true`.
- `option_html` is required for every option.

### Exam Package
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/exam-packages` | List packages |
| POST | `/api/admin/exam-packages` | Create package |
| GET | `/api/admin/exam-packages/{id}` | Show package |
| PATCH | `/api/admin/exam-packages/{id}` | Update package |
| DELETE | `/api/admin/exam-packages/{id}` | Delete package |

#### Exam Package Payload

Exam package creation must include bank mappings in `banks`. These mappings determine which question bank and section will be used when an exam attempt snapshot is generated.

```json
{
  "code": "PKG-001",
  "title": "Paket Ujian Test",
  "description": "Paket dummy untuk test API",
  "duration_minutes": 120,
  "shuffle_questions": true,
  "shuffle_options": true,
  "max_tab_switch": 3,
  "max_fullscreen_exit": 3,
  "is_active": true,
  "banks": [
    {
      "question_bank_id": 1,
      "section_type": "reading",
      "question_count": 1,
      "sort_order": 1
    }
  ]
}
```

Validation rules:

- `banks` is required when creating a package.
- `banks` must contain at least 1 item.
- `banks.*.question_bank_id` must exist in `question_banks`.
- `banks.*.section_type` must match the backend section enum.
- `banks.*.question_count` must be at least 1.
- `banks.*.sort_order` is optional and must be 0 or greater when provided.
- The same `question_bank_id` and `section_type` combination cannot be duplicated in one package.
- `question_count` cannot exceed the number of active questions available for that bank and section.

Important notes:

- `question_count` is not the package total question value written manually.
- `question_count` means how many active questions should be taken from a specific bank and section.
- `total_questions` on an attempt is calculated automatically when the user starts the exam and the backend creates `exam_attempt_questions`.

### Exam Session
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/exam-sessions` | List sessions |
| POST | `/api/admin/exam-sessions` | Create session |
| GET | `/api/admin/exam-sessions/{id}` | Show session |
| PATCH | `/api/admin/exam-sessions/{id}` | Update session |
| PATCH | `/api/admin/exam-sessions/{id}/publish` | Publish session |
| PATCH | `/api/admin/exam-sessions/{id}/close` | Close session |

### Session Participants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/exam-sessions/{id}/participants` | List participants |
| POST | `/api/admin/exam-sessions/{id}/participants/manual-assign` | Manual assign |
| POST | `/api/admin/exam-sessions/{id}/participants/auto-generate` | Auto generate |
| DELETE | `/api/admin/exam-sessions/{id}/participants/{registrationId}` | Remove participant |

### Monitoring
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/exam-attempts` | List attempts |
| GET | `/api/admin/exam-attempts/{id}` | Show attempt detail |
| GET | `/api/admin/results` | List results |
| GET | `/api/admin/violations` | List violations |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/export/results` | Export results to Excel |

---

## Default Admin Account
```
Email: admin@cbt.test
Password: password
```

## Setup
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
