# notification_system_design.md

## 1. Overview
This system is designed to handle the delivery, storage, and lifecycle of user notifications. Unlike our existing backend, which handles core scheduling, this microservice focuses on ensuring users get the right information at the right time without slowing down the rest of the ecosystem.

**Core Requirements:**
*   **Real-time delivery:** Immediate alerts for high-priority events.
*   **Scalability:** Handling "fan-out" events where one action triggers thousands of notifications.
*   **State Tracking:** Knowing exactly what is unread.
*   **Prioritization:** Surfacing critical alerts over routine updates.

---

## 2. API Design
We’ll use versioned REST endpoints to ensure we don't break clients during future updates.

### Endpoints
*   **`POST /v1/notifications`**: Internal trigger to create a notification.
    *   *Request:* `{ "student_id": 101, "type": "ALARM", "content": {...} }`
    *   *Response:* `201 Created`
*   **`GET /v1/notifications`**: Retrieve user notifications.
    *   *Status:* `200 OK`
*   **`PATCH /v1/notifications/{id}/read`**: Mark a specific alert as seen.
    *   *Status:* `200 OK` or `204 No Content`

### Practical Constraints
*   **Pagination:** We use **cursor-based pagination** (using an ID or timestamp) instead of `OFFSET`. `OFFSET` is a performance killer because the database has to scan and discard `N` rows before reaching the target. Cursors allow for a constant-time "seek".
*   **Rate Limiting:** A Redis-backed **Token Bucket** algorithm will prevent any single service or user from spamming the system.
*   **AuthN/AuthZ:** All requests require a valid JWT. The application layer must enforce that `student_id` in the token matches the resource being requested to prevent cross-user data leaks.

### Real-Time Strategy
We’ll use **Server-Sent Events (SSE)**. It's lighter than WebSockets for one-way communication and handles reconnection out-of-the-box. For legacy clients, we fallback to simple **long polling**.

---

## 3. Database Design
PostgreSQL is our choice here due to its excellent support for JSONB and indexing.

**Schema:**
*   `id`: UUID (Primary Key)
*   `student_id`: INT (Foreign Key)
*   `type`: VARCHAR (e.g., 'MAINTENANCE', 'SYSTEM')
*   `content`: JSONB (Flexible metadata)
*   `is_read`: BOOLEAN (Default: false)
*   `priority`: INT
*   `created_at`: TIMESTAMP
*   `read_at`: TIMESTAMP (Nullable)

**Optimization:**
*   **Composite Index:** `(student_id, is_read, created_at DESC)` allows the DB to instantly find a specific user’s unread messages in order.
*   **Partial Index:** `CREATE INDEX idx_unread ON notifications (student_id) WHERE is_read = false;` This keeps the index small and fast for the most common query.
*   **Partitioning:** We'll use **time-based partitioning** (e.g., monthly tables). Old notifications are rarely accessed; this keeps the "active" table lean and speeds up vacuuming.

---

## 4. Query Optimization
Consider this common query:
```sql
SELECT * FROM notifications 
WHERE student_id = 1042 AND is_read = false 
ORDER BY created_at DESC;
```
**The Problem:** Without an index, the DB performs a full table scan, checking every single notification ever sent. 
**The Fix:** Our composite index allows the DB to jump straight to `student_id 1042`, filter `is_read`, and read the results in order.
**The Pagination Fix:** `OFFSET 1000` makes the DB count 1,000 rows just to throw them away. By using `WHERE id < {last_seen_id}`, we jump straight to the next page.

---

## 5. Performance Optimization
*   **Redis Caching:** We store the `unread_count` and the 10 most recent notifications in Redis. This covers 90% of user interactions without touching the DB.
*   **Batching Writes:** Instead of hitting the DB for every single notification, workers gather notifications in small batches (e.g., every 100ms) to reduce IOPS.
*   **Load Reduction:** Heavily used static assets (like notification icons) should be served via **CDN**.

---

## 6. Scalable Architecture
We must avoid synchronous processing. 

**Bad Code:**
```javascript
for (const student of students) {
    await sendEmail(student);
    await sendPush(student);
}
```
**Why it fails:** If one email takes 2 seconds, 1,000 students take 33 minutes. If the script crashes halfway, you have no idea who got what.

**The Solution:** An **Event-Driven Design**. The API pushes a message to a queue (Kafka or BullMQ). **Async Workers** pick up these messages and handle the heavy lifting. This decouples the "request" from the "delivery."

---

## 7. Fan-out Strategy
*   **Fan-out on Write:** When an event occurs, we immediately create notification rows for every user. 
    *   *Pro:* Fast reads.
    *   *Con:* Heavy "write amplification" during big events.
*   **Fan-out on Read:** We store one "Global Event" and check it when the user logs in.
    *   *Pro:* Very cheap writes.
    *   *Con:* Massive query load when everyone logs in at once.

**Recommendation:** A **Hybrid Approach**. For standard groups, use fan-out on write. For system-wide announcements to millions, use fan-out on read to avoid crashing the worker nodes.

---

## 8. Priority Notifications
We rank notifications using a simple scoring model to ensure important alerts aren't buried:

$$priorityScore = type\_weight + recency\_decay$$

Critical alerts (like system failures) get a high `type_weight`. As time passes, `recency_decay` lowers the score. We can store these scores in **Redis Sorted Sets**, allowing us to fetch the "Top N" notifications for a user in $O(\log N)$ time.

---

## 9. Failure Handling
*   **Exponential Backoff:** If a push provider (like Firebase) is down, we don't just retry immediately. We wait 1s, then 2s, then 4s... to avoid self-DDOSing.
*   **Dead-Letter Queue (DLQ):** If a notification fails 5 times, it moves to a DLQ for manual inspection instead of clogging the main queue.
*   **Idempotency:** Every notification gets a unique hash. If the worker retries, it checks Redis first to ensure it doesn't send the same email twice.
*   **Degraded Mode:** If Redis fails, the system bypasses the cache and hits the DB directly. It’s slower, but the system stays alive.