# Test Suite for SE-main backend

This folder contains example Jest-based tests for the Node/Express backend of the food delivery app.
They are organized per your requested structure:

tests/
├── unit/
│   ├── test_user_model.test.js
│   └── test_auth_middleware.test.js
├── integration/
│   └── test_auth_routes.test.js
└── system/
    └── test_end_to_end.test.js

How to use
1. From `SE-main/backend` run:
   - `npm install --save-dev jest supertest`
   - Optionally: `npm install --save-dev jest-mock` (not required with modern jest)
2. In your `package.json` add:
   {
     "scripts": {
       "test": "jest --runInBand --detectOpenHandles"
     }
   }
3. Run tests:
   - `npm test`

Notes
- Tests mock mongoose models so they run without a database.
- You may need to adapt mocks for your exact model implementation if your code differs.
- If you prefer an in-memory MongoDB during integration/system tests, consider `mongodb-memory-server`.
