# LeadPilot release validation
# Run from leadpilot-plugin after npm install.
# Do not paste database credentials into GitHub issues or chats.
#
# DATABASE_URL must point to a dedicated staging Neon branch for the E2E suite.
# npm test
# node neon-integration.test.js
# node account-e2e.test.js
#
# The E2E test creates a disposable account. Use staging only.
# Never set Paystack live keys for test runs.
#
# Release gates:
# 1. CI green for current commit
# 2. Neon database health reports connected, schema_ready, quota_ready
# 3. Neon transaction quota boundary test passes
# 4. Account E2E signup, invalid login, valid login, quota limits, logout passes
# 5. Email verification and password reset are implemented and tested
# 6. Paystack signature verification, replay protection and durable subscription updates tested
# 7. Production deployment tested twice before inviting paying customers
