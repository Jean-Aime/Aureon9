/**
 * AUREON9 External API Documentation
 * These endpoints allow other websites (ODIEXA, AAL, AUREX, Ont, ODIEBOARD) 
 * to integrate with the AUREON9 membership hub
 * 
 * @version 1.0.0
 * @date 2026-04-28
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * AUTHENTICATION
 * ═══════════════════════════════════════════════════════════════════
 * 
 * All external API calls MUST include these headers:
 * 
 * X-API-Key: Your unique API key (provided by AUREON9 admin)
 * X-Source-Website: Your website code (ODIEXA, AAL, AUREX, ONT, ODIEBOARD)
 * 
 * Example:
 * ```
 * curl -X POST https://aureon9.com/api/external/register \
 *   -H "Content-Type: application/json" \
 *   -H "X-API-Key: your-api-key-here" \
 *   -H "X-Source-Website: ODIEXA" \
 *   -d '{"email":"user@example.com",...}'
 * ```
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * RATE LIMITING
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Rate limits per minute per website:
 * - ODIEXA: 1000 requests/min
 * - AAL: 500 requests/min
 * - AUREX: 1000 requests/min
 * - ONT: 500 requests/min
 * - ODIEBOARD: 200 requests/min
 * 
 * Responses with 429 status indicate rate limit exceeded
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ENDPOINT 1: POST /api/external/register
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Called when someone registers on any ecosystem website
 * 
 * Request Body:
 * {
 *   "email": "john@example.com" (required),
 *   "name": "John Doe" (required),
 *   "password": "hashedPassword" (optional - null if OAuth),
 *   "participantClass": "CUSTOMER" (required - see enum),
 *   "sourceWebsite": "ODIEXA" (from header),
 *   "returnUrl": "https://odiexa.com/products/123" (optional),
 *   "referralCode": "JOHN123" (optional),
 *   "externalId": "reg_unique_id" (optional - for idempotency)
 * }
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "data": {
 *     "memberId": "mem_abc123",
 *     "userId": "usr_xyz789",
 *     "walletId": "wal_def456",
 *     "referralCode": "JOH12345AB",
 *     "tier": "MEMBER",
 *     "verificationLevel": "UNVERIFIED",
 *     "email": "john@example.com",
 *     "name": "John Doe"
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * What happens internally:
 * 1. Creates User record
 * 2. Creates MemberProfile with default tier (MEMBER) and verification (UNVERIFIED)
 * 3. Creates AUREX wallet with balance 0
 * 4. Generates unique referral code
 * 5. If referralCode provided, links to referrer and credits referral bonus
 * 6. Records in audit trail
 * 7. Returns member details
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ENDPOINT 2: POST /api/external/purchase
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Called when someone makes a purchase on ODIEXA
 * 
 * Request Body:
 * {
 *   "memberId": "mem_12345" (required),
 *   "amount": 100.00 (required),
 *   "currency": "USD" (required),
 *   "productId": "prod_789" (required),
 *   "sellerId": "mem_67890" (optional),
 *   "purchaseId": "pur_456" (required - unique ID from ODIEXA),
 *   "timestamp": "2026-04-28T10:00:00Z" (required),
 *   "sourceWebsite": "ODIEXA" (from header)
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "buyerReward": 5.50,
 *     "sellerReward": 2.00,
 *     "referrerReward": 1.00,
 *     "buyerNewBalance": 5250.50
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * Reward Calculation:
 * - Buyer: 5% of amount × tier multiplier (1.0x to 2.5x)
 * - Seller: 2% of amount (if seller tier is STRATEGIC+)
 * - Referrer: 1% of amount (if buyer was referred)
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ENDPOINT 3: POST /api/external/referral-signup
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Called when someone signs up using a referral link
 * 
 * Request Body:
 * {
 *   "referralCode": "JOHN123" (required),
 *   "newMemberId": "mem_67890" (required),
 *   "newMemberEmail": "sarah@example.com" (required),
 *   "sourceWebsite": "AAL" (from header),
 *   "timestamp": "2026-04-28T10:00:00Z" (required),
 *   "externalId": "ref_unique_id" (optional - for idempotency)
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "referrerId": "mem_12345",
 *     "bonusAmount": 10,
 *     "referrerNewBalance": 5010
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * Bonus amounts by tier:
 * - MEMBER: 5 ARX
 * - ASSOCIATE: 10 ARX
 * - CERTIFIED: 15 ARX
 * - EXECUTIVE: 25 ARX
 * - STRATEGIC: 40 ARX
 * - FOUNDING: 75 ARX
 * - SOVEREIGN: 100 ARX
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ENDPOINT 4: POST /api/external/withdrawal
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Called when someone withdraws from AUREX wallet
 * 
 * Request Body:
 * {
 *   "memberId": "mem_12345" (required),
 *   "amount": 50.00 (required),
 *   "withdrawalId": "wd_789" (required),
 *   "destinationAddress": "0x123..." (required),
 *   "status": "COMPLETED" (or PENDING, FAILED),
 *   "timestamp": "2026-04-28T10:00:00Z" (required),
 *   "sourceWebsite": "AUREX" (from header)
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "memberId": "mem_12345",
 *     "amount": 50.00,
 *     "status": "COMPLETED",
 *     "newBalance": 100.00
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * Notes:
 * - Only COMPLETED withdrawals deduct from balance
 * - PENDING and FAILED withdrawals are logged but don't affect balance
 * - If insufficient balance, returns error
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ENDPOINT 5: POST /api/external/deposit
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Called when someone deposits into AUREX wallet
 * 
 * Request Body:
 * {
 *   "memberId": "mem_12345" (required),
 *   "amount": 500.00 (required),
 *   "depositId": "dep_789" (required),
 *   "source": "BANK_TRANSFER" (BANK_TRANSFER, CRYPTO, CARD),
 *   "timestamp": "2026-04-28T10:00:00Z" (required),
 *   "sourceWebsite": "AUREX" (from header)
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "memberId": "mem_12345",
 *     "amount": 500.00,
 *     "newBalance": 600.00
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * Notes:
 * - All deposits are immediately credited to wallet
 * - Transaction is recorded in audit trail
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ENDPOINT 6: POST /api/external/settlement
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Called when a trade operator completes a settlement
 * 
 * Request Body:
 * {
 *   "operatorId": "mem_77777" (required),
 *   "tradeAmount": 10000.00 (required),
 *   "operatorFee": 250.00 (optional - auto-calculated if not provided),
 *   "settlementId": "stl_123" (required),
 *   "participants": ["mem_111", "mem_222", "mem_333"] (optional),
 *   "timestamp": "2026-04-28T10:00:00Z" (required),
 *   "sourceWebsite": "AUREX" (from header)
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "operatorId": "mem_77777",
 *     "operatorCredited": 250.00,
 *     "operatorNewBalance": 1250.00
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * Operator fee calculation (if not provided):
 * - MEMBER: 1.0%
 * - ASSOCIATE: 1.5%
 * - CERTIFIED: 2.0%
 * - EXECUTIVE: 2.5%
 * - STRATEGIC: 3.0%
 * - FOUNDING: 4.0%
 * - SOVEREIGN: 5.0%
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ENDPOINT 7: POST /api/external/api-usage
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Called when developers use Ont platform APIs
 * 
 * Request Body:
 * {
 *   "developerId": "mem_dev_123" (required),
 *   "endpoint": "/api/v1/transactions" (required),
 *   "callCount": 147 (required),
 *   "timestamp": "2026-04-28T10:00:00Z" (required),
 *   "sourceWebsite": "ONT" (from header),
 *   "externalId": "api_unique_id" (optional - for idempotency)
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "developerId": "mem_dev_123",
 *     "callCount": 147,
 *     "rewardAmount": 0.00147,
 *     "rewardCredited": true
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * Reward Calculation:
 * - Formula: 0.01 ARX per 1000 API calls
 * - Example: 147 calls = 147 × (0.01 / 1000) = 0.00147 ARX
 * - Rewards only credited if > 0
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ENDPOINT 8: POST /api/external/approval
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Called when ODIEBOARD admin approves verification, tier upgrade, etc
 * 
 * Request Body:
 * {
 *   "memberId": "mem_12345" (required),
 *   "approvalType": "VERIFICATION" (VERIFICATION, TIER_UPGRADE, CAPITAL_ACCESS),
 *   "newVerificationLevel": "CAPITAL_VERIFIED" (required if approvalType=VERIFICATION),
 *   "newTier": "STRATEGIC" (required if approvalType=TIER_UPGRADE),
 *   "approvedBy": "admin@odieboard.com" (required),
 *   "timestamp": "2026-04-28T10:00:00Z" (required),
 *   "sourceWebsite": "ODIEBOARD" (from header),
 *   "externalId": "app_unique_id" (optional - for idempotency)
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "memberId": "mem_12345",
 *     "approvalType": "VERIFICATION",
 *     "updatedFields": {
 *       "verificationLevel": "CAPITAL_VERIFIED"
 *     }
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * Notes:
 * - Updates member profile with approved status
 * - Records in audit trail
 * - Sends webhook notification to other websites if needed
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ENDPOINT 9: GET /api/external/permissions
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Check what actions a member can perform
 * 
 * Query Parameters:
 * - memberId (required): Member ID to check permissions for
 * 
 * Example: GET /api/external/permissions?memberId=mem_12345
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "memberId": "mem_12345",
 *     "canPurchase": true,
 *     "canSell": false,
 *     "canInvest": false,
 *     "canTrade": false,
 *     "canRefer": true,
 *     "canAccessAPI": true,
 *     "verificationLevel": "IDENTITY_VERIFIED",
 *     "tier": "ASSOCIATE",
 *     "reason": "OK"
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * Permission Rules:
 * - canPurchase: tier >= MEMBER && verification >= UNVERIFIED
 * - canSell: tier >= CERTIFIED && verification >= IDENTITY_VERIFIED
 * - canInvest: tier >= EXECUTIVE && verification >= CAPITAL_VERIFIED
 * - canTrade: tier >= STRATEGIC && verification >= COMMERCIAL_VERIFIED
 * - canRefer: tier >= MEMBER && verification >= UNVERIFIED
 * - canAccessAPI: tier >= MEMBER && verification >= IDENTITY_VERIFIED
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ENDPOINT 10: POST /api/external/verify-member
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Look up member information
 * 
 * Request Body:
 * {
 *   "memberId": "mem_12345" (required),
 *   "fields": ["email", "tier", "verificationLevel"] (optional),
 *   "sourceWebsite": "ODIEXA" (from header)
 * }
 * 
 * Available fields:
 * - email
 * - tier
 * - verificationLevel
 * - participantClass
 * - name
 * - displayName
 * - country
 * - businessName
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "exists": true,
 *     "isActive": true,
 *     "data": {
 *       "email": "john@example.com",
 *       "tier": "EXECUTIVE",
 *       "verificationLevel": "COMMERCIAL_VERIFIED",
 *       "participantClass": "PARTNER"
 *     }
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * If member not found:
 * {
 *   "success": true,
 *   "data": {
 *     "exists": false,
 *     "isActive": false,
 *     "data": null
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * ERROR RESPONSES
 * ═══════════════════════════════════════════════════════════════════
 * 
 * All errors follow this format:
 * 
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Human readable error message"
 *   },
 *   "timestamp": "2026-04-28T10:00:00Z"
 * }
 * 
 * Common HTTP Status Codes:
 * - 200: Success
 * - 201: Created
 * - 400: Bad Request (validation error, member not found, etc)
 * - 401: Unauthorized (missing API key, invalid source website)
 * - 429: Rate Limit Exceeded
 * - 500: Internal Server Error
 * 
 * Common Error Codes:
 * - MEMBER_NOT_FOUND
 * - INVALID_PARTICIPANT_CLASS
 * - USER_ALREADY_EXISTS
 * - INSUFFICIENT_BALANCE
 * - INVALID_EMAIL
 * - REFERRAL_CODE_NOT_FOUND
 * - MISSING_CREDENTIALS
 * - INVALID_API_KEY
 * - RATE_LIMIT_EXCEEDED
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * IDEMPOTENCY
 * ═══════════════════════════════════════════════════════════════════
 * 
 * To prevent duplicate processing of events:
 * 
 * 1. Include unique "externalId" in request body (e.g., purchaseId, withdrawalId)
 * 2. Combination of sourceWebsite + externalId must be unique
 * 3. If same request sent twice, AUREON9 returns cached response
 * 
 * This guarantees:
 * - No duplicate rewards
 * - No double-crediting
 * - Safe retry mechanisms
 * 
 * Example:
 * First request: POST /api/external/purchase with purchaseId="pur_123"
 * Response: { "buyerReward": 5.50, ... }
 * 
 * Retry (network timeout): POST /api/external/purchase with purchaseId="pur_123"
 * Response: Same as above (cached response, no duplicate reward)
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * AUDIT LOGGING
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Every external API call is logged with:
 * - sourceWebsite: Which website made the request
 * - externalId: Unique ID from source website
 * - entityType: What was affected (User, Wallet, Referral, etc)
 * - action: What was done (CREATE_MEMBER, PURCHASE_REWARD, etc)
 * - payloadJson: Full details of the transaction
 * - timestamp: When it happened
 * 
 * Logs are immutable and retained forever for compliance
 */

export default {};
