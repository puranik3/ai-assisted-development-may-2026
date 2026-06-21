# ThreadHive — MongoDB Schema Design

**TL;DR** — ThreadHive is read-heavy with high-frequency vote writes. The optimal schema uses a hybrid approach: normalized collections with denormalized counters and lightweight author/community snapshots embedded in Posts and Comments, eliminating `$lookup` joins on the critical hot-path — the home feed.

---

## Phase 1 — Analysis

### Core Entities

| Entity | Description |
|---|---|
| `User` | Auth, profile, karma, OAuth |
| `Community` | Subreddit-equivalent, rules, settings |
| `Post` | text / image / link, belongs to a community |
| `Comment` | Nested tree, belongs to a post |
| `Vote` | Polymorphic — targets a post or comment |
| `CommunityMembership` | User ↔ Community with role (member / moderator / banned) |
| `Follow` | User → User directed relationship |
| `Notification` | Replies, mentions, mod actions, new followers |
| `DirectMessage` | Private 1-on-1 conversations |
| `Bookmark` | Saved posts/comments per user |
| `Report` | Moderation queue items |

### Relationships

```
USER ||--o{ POST : creates
USER ||--o{ COMMENT : writes
POST }o--|| COMMUNITY : belongs_to
COMMENT }o--|| POST : on
COMMENT }o--o| COMMENT : replies_to
USER }o--o{ COMMUNITY : membership
USER }o--o{ USER : follows
VOTE }o--|| USER : cast_by
VOTE }|--|| POST : targets
VOTE }|--|| COMMENT : targets
NOTIFICATION }o--|| USER : sent_to
REPORT }o--|| COMMUNITY : reviewed_in
```

### Query Patterns

| Pattern | Frequency | Cost Driver |
|---|---|---|
| Home feed (posts from joined communities) | Very high | Join: community membership + posts + authors |
| Comment tree for a post | High | Self-join on `parentId`, needs index on `postId` |
| Vote a post/comment | Very high (write) | Upsert vote + increment counter |
| User profile + post history | Medium | Filter by `authorId`, sort by date |
| Notifications for user | High | Filter by `recipientId`, `isRead` |
| Full-text search | Medium | Text index on `title` + `body` |
| Trending/hot posts | Medium | Sort by computed `hotScore` |
| Moderator report queue | Low | Filter by `communityId`, `status` |

---

## Phase 2 — Schema Design A: Fully Normalized

Every entity lives in its own collection with `ObjectId` references. No data duplication — author info is never embedded.

### `users`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `username` | String | unique, indexed |
| `email` | String | unique, indexed |
| `passwordHash` | String | bcrypt |
| `avatar` | String | CDN URL |
| `bio` | String | |
| `karma` | Number | denormalized score |
| `joinedAt` | Date | |
| `isEmailVerified` | Boolean | |
| `oauthProviders` | `[{provider, providerId}]` | embedded, bounded |
| `notificationSettings` | `{replies, mentions, dms, communityUpdates}` | embedded object |
| `role` | String | `user` \| `admin` |
| `isBanned` | Boolean | |
| `followerCount` | Number | denormalized counter |
| `followingCount` | Number | denormalized counter |

**Indexes:** `username` (unique), `email` (unique)

---

### `communities`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | unique slug, indexed |
| `displayName` | String | |
| `description` | String | |
| `avatar` | String | |
| `banner` | String | |
| `creatorId` | ObjectId | ref: User |
| `rules` | `[{title, description, order}]` | embedded, bounded (≤20 rules) |
| `availableFlairs` | `[{name, color}]` | embedded |
| `memberCount` | Number | denormalized |
| `postCount` | Number | denormalized |
| `isPrivate` | Boolean | |
| `isNSFW` | Boolean | |
| `settings` | `{allowImages, allowLinks, allowText}` | embedded |
| `createdAt` | Date | |

**Indexes:** `name` (unique), `memberCount` (for trending sort)

---

### `community_memberships`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `communityId` | ObjectId | ref: Community |
| `userId` | ObjectId | ref: User |
| `role` | String | `member` \| `moderator` \| `banned` |
| `joinedAt` | Date | |
| `bannedAt` | Date | nullable |
| `banReason` | String | nullable |

**Indexes:** `{communityId, userId}` (unique compound), `{userId: 1}` (user's community list)

---

### `posts`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `title` | String | |
| `type` | String | `text` \| `image` \| `link` |
| `body` | String | markdown |
| `imageUrl` | String | nullable |
| `linkUrl` | String | nullable |
| `linkMetadata` | `{title, description, image}` | nullable, embedded |
| `communityId` | ObjectId | ref: Community |
| `authorId` | ObjectId | ref: User |
| `flair` | String | nullable |
| `tags` | `[String]` | |
| `voteScore` | Number | denormalized (up − down) |
| `upvoteCount` | Number | denormalized |
| `downvoteCount` | Number | denormalized |
| `hotScore` | Number | computed ranking score |
| `commentCount` | Number | denormalized |
| `createdAt` | Date | |
| `updatedAt` | Date | |
| `isDeleted` | Boolean | soft delete |
| `isRemoved` | Boolean | removed by mod |
| `removedBy` | ObjectId | nullable |
| `removedReason` | String | nullable |
| `isLocked` | Boolean | no new comments |
| `isPinned` | Boolean | |
| `scheduledAt` | Date | nullable |
| `isPublished` | Boolean | |

**Indexes:**
- `{communityId: 1, hotScore: -1}` — community hot feed
- `{communityId: 1, createdAt: -1}` — community new feed
- `{communityId: 1, voteScore: -1}` — community top feed
- `{authorId: 1, createdAt: -1}` — user post history
- `{title: "text", body: "text"}` — full-text search
- `{tags: 1}` — tag filtering
- `{scheduledAt: 1}` (sparse) — scheduled post worker

---

### `comments`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `postId` | ObjectId | ref: Post |
| `authorId` | ObjectId | ref: User |
| `body` | String | markdown |
| `parentId` | ObjectId \| null | ref: Comment; null = top-level |
| `depth` | Number | 0-indexed nesting level |
| `path` | String | materialized path e.g. `"abc123/def456/ghi789"` |
| `voteScore` | Number | denormalized |
| `upvoteCount` | Number | |
| `downvoteCount` | Number | |
| `replyCount` | Number | denormalized |
| `createdAt` | Date | |
| `updatedAt` | Date | |
| `isDeleted` | Boolean | soft delete |
| `isRemoved` | Boolean | |
| `removedBy` | ObjectId | |

**Indexes:**
- `{postId: 1, parentId: 1, voteScore: -1}` — fetch top-level comments + replies
- `{postId: 1, path: 1}` — full comment tree by path
- `{authorId: 1, createdAt: -1}` — user comment history

---

### `votes`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `userId` | ObjectId | ref: User |
| `targetId` | ObjectId | post or comment |
| `targetType` | String | `post` \| `comment` |
| `value` | Number | `1` (up) or `-1` (down) |
| `createdAt` | Date | |

**Indexes:** `{userId, targetId, targetType}` (unique compound — prevents duplicate votes), `{targetId, targetType}` (aggregate votes per target)

---

### `follows`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `followerId` | ObjectId | ref: User |
| `followeeId` | ObjectId | ref: User |
| `createdAt` | Date | |

**Indexes:** `{followerId, followeeId}` (unique compound), `{followeeId: 1}` (follower count)

---

### `notifications`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `recipientId` | ObjectId | ref: User |
| `type` | String | `reply` \| `mention` \| `modAction` \| `newFollower` \| `communityUpdate` |
| `actorId` | ObjectId | ref: User |
| `targetId` | ObjectId | polymorphic (post/comment/community) |
| `targetType` | String | |
| `isRead` | Boolean | |
| `data` | Object | type-specific payload snapshot |
| `createdAt` | Date | TTL 90 days |

**Indexes:** `{recipientId: 1, isRead: 1, createdAt: -1}`, TTL index on `createdAt` (expireAfterSeconds: 7776000)

---

### `direct_messages`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `conversationId` | String | deterministic hash of sorted `[senderId, receiverId]` |
| `senderId` | ObjectId | |
| `receiverId` | ObjectId | |
| `body` | String | |
| `isRead` | Boolean | |
| `createdAt` | Date | |

**Indexes:** `{conversationId: 1, createdAt: -1}`, `{receiverId: 1, isRead: 1}`

---

### `bookmarks`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `userId` | ObjectId | |
| `targetId` | ObjectId | |
| `targetType` | String | `post` \| `comment` |
| `createdAt` | Date | |

**Indexes:** `{userId, targetId, targetType}` (unique compound), `{userId: 1, createdAt: -1}`

---

### `reports`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `reporterId` | ObjectId | |
| `targetId` | ObjectId | |
| `targetType` | String | `post` \| `comment` \| `user` |
| `reason` | String | |
| `communityId` | ObjectId | |
| `status` | String | `pending` \| `reviewed` \| `dismissed` |
| `reviewedBy` | ObjectId | nullable |
| `createdAt` | Date | |

**Indexes:** `{communityId: 1, status: 1, createdAt: -1}`, `{targetId: 1, targetType: 1}`

---

### Design A — Pros & Cons

**Pros**
- No data duplication — a username change updates exactly one document
- Strict data integrity — single source of truth for every field
- Easier to reason about and maintain

**Cons**
- Home feed requires `$lookup` (join) between `posts`, `users` (author), and `communities` on every page load — the most frequent, latency-critical query
- Comment feed also requires `$lookup` to get author info per comment
- More round-trips or expensive aggregation pipelines for basic reads

---

## Phase 3 — Schema Design B: Hybrid with Embedded Snapshots

Same collections as Design A, with one key difference: **Posts and Comments embed a frozen snapshot of the author and community at write time**, eliminating joins on the feed hot-path.

### Changes from Design A

**`posts`** — add two embedded snapshot fields:
```js
authorSnapshot: {
  _id: ObjectId,
  username: String,
  avatar: String
}

communitySnapshot: {
  _id: ObjectId,
  name: String,
  avatar: String
}
```

**`comments`** — add one embedded snapshot field:
```js
authorSnapshot: {
  _id: ObjectId,
  username: String,
  avatar: String
}
```

**`notifications`** — the `data` field already acts as a snapshot payload (actor username, post title preview, etc.) — no change needed.

Everything else (votes, follows, memberships, DMs, bookmarks, reports) stays identical to Design A.

### Trade-off: snapshot staleness

If a user changes their username or avatar, the snapshots in old posts/comments will show the old value. This is an **accepted trade-off** — both Reddit and Twitter use the same pattern. For a username change, a background migration can update snapshots if desired, or the UI can fall back to a live `$lookup` for profile pages only.

### Design B — Pros & Cons

**Pros**
- Feed queries (`GET /posts`, `GET /communities/:id/posts`) are single-collection reads — no `$lookup`, no aggregation pipeline for the common case
- Comment thread rendering requires no join — author name/avatar is inline
- Significantly lower read latency for the primary user-facing endpoints
- Scales horizontally more easily since each document is self-contained

**Cons**
- Snapshot fields add ~100–150 bytes per post/comment document
- Snapshot staleness on username/avatar changes (mitigated by async background job)
- Slightly more complex write path (must populate snapshot on create)

---

## Comparison & Recommendation

| Criterion | Design A (Normalized) | Design B (Hybrid Snapshots) |
|---|---|---|
| Feed read latency | Higher — needs `$lookup` | Lower — single collection read |
| Comment thread latency | Higher — needs `$lookup` | Lower — inline author info |
| Data integrity | Perfect | Snapshots can be stale |
| Write complexity | Simple | Slightly more complex |
| Storage | Minimal duplication | +~150 bytes/post/comment |
| Username change impact | None | Needs background migration |
| Scalability at volume | Aggregation pipeline bottleneck | Horizontal shard-friendly |

### Recommendation: Design B (Hybrid)

ThreadHive is a **read-dominant** platform — Reddit-like apps have read:write ratios on the order of 100:1 for feed browsing vs. posting. The home feed and comment threads are the most frequent, most latency-sensitive operations. Eliminating `$lookup` on those hot-paths is the single highest-ROI optimization available in MongoDB schema design.

The snapshot staleness risk is low (username/avatar changes are rare user actions) and is a well-established pattern used by Reddit, Twitter, and Stack Overflow at scale.

The only place where a `$lookup` is still needed is on the **user profile page** (to get up-to-date user info alongside post history) — which is low-frequency and already fetches a single user's data, making the join trivial.

---

## Collections Summary

| Collection | Design Pattern | Key Indexes |
|---|---|---|
| `users` | Normalized | `username` (unique), `email` (unique) |
| `communities` | Normalized + embedded rules/flairs | `name` (unique), `memberCount` |
| `community_memberships` | Junction table | `{communityId, userId}` (unique) |
| `posts` | Hybrid — embedded author/community snapshot | `{communityId, hotScore}`, `{communityId, createdAt}`, text index |
| `comments` | Hybrid — embedded author snapshot + materialized path | `{postId, parentId, voteScore}`, `{postId, path}` |
| `votes` | Normalized | `{userId, targetId, targetType}` (unique) |
| `follows` | Junction table | `{followerId, followeeId}` (unique) |
| `notifications` | Snapshot payload in `data` field | `{recipientId, isRead, createdAt}`, TTL |
| `direct_messages` | Normalized with `conversationId` | `{conversationId, createdAt}` |
| `bookmarks` | Normalized | `{userId, targetId, targetType}` (unique) |
| `reports` | Normalized | `{communityId, status, createdAt}` |

---

## Mongoose Model Files to Implement

- `src/models/User.js`
- `src/models/Community.js`
- `src/models/CommunityMembership.js`
- `src/models/Post.js`
- `src/models/Comment.js`
- `src/models/Vote.js`
- `src/models/Follow.js`
- `src/models/Notification.js`
- `src/models/DirectMessage.js`
- `src/models/Bookmark.js`
- `src/models/Report.js`
