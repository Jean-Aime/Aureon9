# AUREON9 External API Integration Guide

## For Teams Building ODIEXA, AAL, AUREX, Ont, and ODIEBOARD

This guide explains how to integrate your website with AUREON9's external API endpoints.

---

## 🔑 Quick Start

### 1. Get Your API Key
Contact AUREON9 admin to receive your unique API key for your website.

### 2. Set HTTP Headers
Every request must include:
```
X-API-Key: your-api-key-from-aureon9
X-Source-Website: ODIEXA (or AAL, AUREX, ONT, ODIEBOARD)
Content-Type: application/json
```

### 3. Call an Endpoint
```bash
curl -X POST https://aureon9.com/api/external/register \
  -H "X-API-Key: your-api-key" \
  -H "X-Source-Website: ODIEXA" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": null,
    "participantClass": "CUSTOMER",
    "referralCode": "REF123"
  }'
```

---

## 📋 Which Endpoint Should I Use?

| Team | Events | Endpoints | When to Call |
|------|--------|-----------|--------------|
| **ODIEXA** (Marketplace) | Purchase made | POST `/purchase` | After someone buys |
| **AAL** (Referrals) | Referral signup | POST `/referral-signup` | When referred member joins |
| **AUREX** (Wallet) | Deposit/Withdrawal/Settlement | POST `/deposit`, `/withdrawal`, `/settlement` | Wallet action completed |
| **Ont** (Developer APIs) | API usage | POST `/api-usage` | Track developer calls |
| **ODIEBOARD** (Admin) | Approval | POST `/approval` | After admin approves |
| **Any Team** | New registration | POST `/register` | Member signs up |
| **Any Team** | Check permissions | GET `/permissions` | Before allowing action |
| **Any Team** | Look up member | POST `/verify-member` | Verify member exists |

---

## 🚀 ODIEXA: Processing a Purchase

**When:** Customer clicks "Buy" and completes purchase

**Send:**
```json
POST /api/external/purchase
{
  "memberId": "mem_12345",
  "amount": 100.00,
  "currency": "USD",
  "productId": "prod_789",
  "sellerId": "mem_67890",
  "purchaseId": "pur_unique_id_456",
  "timestamp": "2026-04-28T10:00:00Z"
}
```

**Get Back:**
```json
{
  "success": true,
  "data": {
    "buyerReward": 5.50,
    "sellerReward": 2.00,
    "referrerReward": 1.00,
    "buyerNewBalance": 5250.50
  }
}
```

**What Happens:**
- Buyer gets 5% reward × tier multiplier (1.0x-2.5x)
- Seller gets 2% commission (if tier is STRATEGIC+)
- Referrer gets 1% if buyer was referred
- All wallets updated, transactions logged

---

## 👥 AAL: Processing a Referral Signup

**When:** Someone clicks referral link and signs up

**Send:**
```json
POST /api/external/referral-signup
{
  "referralCode": "JOHN12345AB",
  "newMemberId": "mem_67890",
  "newMemberEmail": "sarah@example.com",
  "timestamp": "2026-04-28T10:00:00Z"
}
```

**Get Back:**
```json
{
  "success": true,
  "data": {
    "referrerId": "mem_12345",
    "bonusAmount": 10,
    "referrerNewBalance": 5010
  }
}
```

**What Happens:**
- Referrer identified by referral code
- Bonus calculated by referrer's tier (5-100 ARX)
- Referrer wallet credited
- Referral record marked COMPLETED

---

## 💰 AUREX: Processing a Deposit

**When:** User deposits money to their AUREX wallet

**Send:**
```json
POST /api/external/deposit
{
  "memberId": "mem_12345",
  "amount": 500.00,
  "depositId": "dep_789",
  "source": "BANK_TRANSFER",
  "timestamp": "2026-04-28T10:00:00Z"
}
```

**Get Back:**
```json
{
  "success": true,
  "data": {
    "memberId": "mem_12345",
    "amount": 500.00,
    "newBalance": 600.00
  }
}
```

---

## 💸 AUREX: Processing a Withdrawal

**When:** User withdraws money from AUREX wallet

**Send:**
```json
POST /api/external/withdrawal
{
  "memberId": "mem_12345",
  "amount": 50.00,
  "withdrawalId": "wd_789",
  "destinationAddress": "0x123...",
  "status": "COMPLETED",
  "timestamp": "2026-04-28T10:00:00Z"
}
```

**Get Back:**
```json
{
  "success": true,
  "data": {
    "memberId": "mem_12345",
    "amount": 50.00,
    "status": "COMPLETED",
    "newBalance": 100.00
  }
}
```

---

## 🤝 Check Member Permissions

**When:** Before allowing member to do something

**Send:**
```
GET /api/external/permissions?memberId=mem_12345
```

**Get Back:**
```json
{
  "success": true,
  "data": {
    "memberId": "mem_12345",
    "canPurchase": true,
    "canSell": false,
    "canInvest": false,
    "canTrade": false,
    "canRefer": true,
    "canAccessAPI": true,
    "verificationLevel": "IDENTITY_VERIFIED",
    "tier": "ASSOCIATE",
    "reason": "OK"
  }
}
```

**Before allowing action:**
```javascript
const response = await fetch('https://aureon9.com/api/external/permissions', {
  headers: {
    'X-API-Key': 'your-key',
    'X-Source-Website': 'ODIEXA'
  }
});

if (response.data.canPurchase) {
  // Allow purchase
} else {
  // Show error: "You need to reach CERTIFIED tier to sell"
}
```

---

## 🔒 Idempotency (Safe Retries)

**Problem:** Network timeout during API call. Did the request go through?

**Solution:** Use idempotency keys

**How:**
1. Generate unique ID for each event (e.g., `purchaseId`)
2. Include it in request
3. If you retry with same ID, AUREON9 returns cached response (no duplicate reward)

**Example:**
```json
POST /api/external/purchase
{
  "purchaseId": "pur_unique_123",
  "memberId": "mem_12345",
  "amount": 100.00,
  ...
}
```

Retry with same `purchaseId` = Same response (safe!)

---

## ⚠️ Rate Limits

| Website | Limit | Window |
|---------|-------|--------|
| ODIEXA | 1000 | Per minute |
| AAL | 500 | Per minute |
| AUREX | 1000 | Per minute |
| Ont | 500 | Per minute |
| ODIEBOARD | 200 | Per minute |

If you exceed: HTTP 429 status code

---

## 🐛 Error Handling

All errors return this format:

```json
{
  "success": false,
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "Member with ID mem_12345 does not exist"
  }
}
```

**Common Codes:**
- `MEMBER_NOT_FOUND` - Member doesn't exist
- `INSUFFICIENT_BALANCE` - Not enough ARX to withdraw
- `INVALID_EMAIL` - Email format wrong
- `MISSING_CREDENTIALS` - Missing API key or source website header
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 📊 Audit Logs

Every external API call is logged in AUREON9's immutable audit trail:
- Who called (source website)
- What happened (action)
- When (timestamp)
- Full transaction details
- All retained forever for compliance

---

## 🔗 Integration Examples

### Python
```python
import requests
import json

url = "https://aureon9.com/api/external/purchase"
headers = {
    "X-API-Key": "your-api-key",
    "X-Source-Website": "ODIEXA",
    "Content-Type": "application/json"
}
data = {
    "memberId": "mem_12345",
    "amount": 100.00,
    "currency": "USD",
    "productId": "prod_789",
    "sellerId": "mem_67890",
    "purchaseId": "pur_unique_456"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

if result['success']:
    print(f"Buyer reward: {result['data']['buyerReward']}")
else:
    print(f"Error: {result['error']['code']}")
```

### JavaScript
```javascript
async function processPurchase(memberId, amount) {
  const response = await fetch('https://aureon9.com/api/external/purchase', {
    method: 'POST',
    headers: {
      'X-API-Key': 'your-api-key',
      'X-Source-Website': 'ODIEXA',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      memberId,
      amount,
      purchaseId: `pur_${Date.now()}`
    })
  });
  
  const result = await response.json();
  return result;
}
```

---

## 📞 Support

Questions? Contact the AUREON9 Integration Team at:
- **Email:** integrations@aureon9.com
- **Slack:** #aureon9-integrations
- **Docs:** https://docs.aureon9.com/external-api
