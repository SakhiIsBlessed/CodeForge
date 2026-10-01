# Security Specification: CodeForge

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created and updated by the authenticated user whose `request.auth.uid == userId`.
2. **Username Invariant**: A username claim at `/usernames/{username}` can only be claimed if it matches `^[a-zA-Z0-9_]{3,30}$` and `request.auth.uid == incoming().userId`. Once claimed, it cannot be modified by another user.
3. **Project Ownership Invariant**: A project at `/projects/{projectId}` can only be created with `incoming().ownerId == request.auth.uid`. During updates, `incoming().ownerId == existing().ownerId` (immutable).
4. **Project File Isolation**: A project file at `/projects/{projectId}/files/{fileId}` must belong to a project where the authenticated user is the project owner (checked via `get(/databases/$(database)/documents/projects/$(projectId)).data.ownerId == request.auth.uid`).
5. **Visibility Guard**: Private projects can only be read by their owner or an administrator. Public projects can be read by any user. Unlisted projects can be read if requested directly or via shared project tokens.
6. **Execution Log Ownership**: Execution logs at `/users/{userId}/executions/{executionId}` can only be written and read by the user `{userId}`.
7. **Admin Privilege Escalation Protection**: The `/admins/{userId}` collection is strictly read-only for authenticated users and can only be modified by existing verified administrators or bootstrapped system owners. Non-admins cannot grant themselves admin status.
8. **Report Submission**: Authenticated users can create moderation reports at `/reports/{reportId}` with `incoming().reporterId == request.auth.uid`, but only administrators can view and manage all reports.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1: Impersonate Project Owner on Create**
   - Attempt: User B creates a project with `ownerId: "user_a"`.
   - Result: REJECTED (`incoming().ownerId != request.auth.uid`).
2. **Payload 2: Steal Project Ownership via Update**
   - Attempt: User B sends update to project 123 modifying `ownerId: "user_b"`.
   - Result: REJECTED (`existing().ownerId != request.auth.uid` and immutability check).
3. **Payload 3: Unauthenticated Read of Private Project**
   - Attempt: Unauthenticated client requests `/projects/{privateProjectId}`.
   - Result: REJECTED (requires `auth != null && ownerId == auth.uid`).
4. **Payload 4: Tamper with Another User's File**
   - Attempt: User B sends write to `/projects/{userA_projectId}/files/main.py`.
   - Result: REJECTED (master gate checks project owner is not User B).
5. **Payload 5: Privilege Escalation via User Profile**
   - Attempt: User signs up with `{ uid: "abc", role: "admin", isAdmin: true }`.
   - Result: REJECTED (profile helper forbids unauthorized keys or role fields).
6. **Payload 6: Hijack Username Claim**
   - Attempt: User B overwrites `/usernames/johndoe` with their own UID.
   - Result: REJECTED (cannot overwrite existing username document).
7. **Payload 7: Read Another User's Execution History**
   - Attempt: User B reads `/users/user_a/executions/exec_999`.
   - Result: REJECTED (`request.auth.uid != user_a`).
8. **Payload 8: Self-Promote to Admin**
   - Attempt: User sets `/admins/{theirUid}` document.
   - Result: REJECTED (requires existing admin).
9. **Payload 9: Modify Moderation Report Status**
   - Attempt: Normal user changes `report.status` to "Dismissed".
   - Result: REJECTED (only admin can update report status).
10. **Payload 10: Inject Malicious Oversized Document ID**
    - Attempt: Writing to a document ID with 500 random characters or path traversal.
    - Result: REJECTED (`isValidId` regex and length constraint).
11. **Payload 11: Ghost Field Injection in Project**
    - Attempt: Project update adding `{ backdoor: true, isVerified: true }`.
    - Result: REJECTED (strict `affectedKeys().hasOnly(...)` enforcement).
12. **Payload 12: Forge Timestamp on Execution Record**
    - Attempt: Passing arbitrary `createdAt: "2020-01-01"` instead of server timestamp.
    - Result: REJECTED (`incoming().createdAt == request.time`).

## 3. Test Runner
Included in security suite test specification and validated against Firestore Rules engine.
