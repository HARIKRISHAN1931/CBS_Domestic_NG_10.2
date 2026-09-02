# Banking Customer Login Test Plan

## Application Overview

Application-specific customer login test plan for Banking with menuCode=CUSTOMER. Covers valid and invalid authentication, required field validation, password masking, forgot password navigation, and retry behavior in a fresh session.

## Test Scenarios

### 1. Banking Customer Login

**Seed:** `tests/seed.spec.ts`

#### 1.1. High - Successful customer login with valid credentials

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the banking login screen for menuCode=CUSTOMER in a fresh session.
    - expect: The login form loads successfully with visible User ID and Password fields.
  2. Enter a valid customer User ID and corresponding password.
    - expect: The entered values are accepted and the Password field remains masked.
  3. Click the Login button.
    - expect: The user is authenticated and redirected to the customer landing page or dashboard.
  4. Verify the authenticated session is active.
    - expect: Protected customer pages are accessible and no login error is shown.

#### 1.2. High - Failed login with incorrect password

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the banking login page in a fresh session.
    - expect: The login page is displayed with empty fields.
  2. Enter a valid customer User ID and an incorrect password.
    - expect: The password is masked while the User ID remains visible.
  3. Click the Login button.
    - expect: The system displays an invalid credentials error message.
  4. Confirm the user remains on the login page.
    - expect: The customer is not logged in and no dashboard navigation occurs.

#### 1.3. High - Failed login with unknown or incorrect User ID

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the login page.
    - expect: The login form is visible and ready.
  2. Enter an invalid or unregistered User ID and a valid password.
    - expect: The entered inputs are accepted by the form and the Password field stays masked.
  3. Click the Login button.
    - expect: An authentication error is displayed and login is rejected.
  4. Verify no protected page access is granted.
    - expect: The customer remains on the login page without an active session.

#### 1.4. High - Empty User ID validation

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the banking login page.
    - expect: The form is visible and enabled.
  2. Leave User ID blank and enter a valid password.
    - expect: The form keeps the User ID empty.
  3. Click the Login button.
    - expect: A validation message indicates that User ID is required.
  4. Verify the form does not submit.
    - expect: The user remains on the login page and is not redirected.

#### 1.5. High - Empty Password validation

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the login page.
    - expect: The page loads successfully.
  2. Enter a valid User ID and leave Password blank.
    - expect: The password field stays empty.
  3. Click the Login button.
    - expect: A validation message indicates that Password is required.
  4. Verify no login attempt is processed.
    - expect: The user remains on the login page without authentication.

#### 1.6. High - Forgot Password navigation

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the login page for the customer flow.
    - expect: The login form is visible.
  2. Click the Forgot Password link.
    - expect: The browser moves to the password reset page.
  3. Verify page intent.
    - expect: The reset page contains password recovery or account reset controls rather than the regular login form.

#### 1.7. High - Password field masking

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the login page.
    - expect: The User ID and Password fields are available.
  2. Enter a password such as SamplePass123! into the Password field.
    - expect: The password is shown as masked characters only.
  3. Check field behavior after blur and focus.
    - expect: The value remains hidden in the UI while continuing to function as an input.

#### 1.8. Medium - Both fields empty validation

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the banking login page.
    - expect: Both fields appear empty.
  2. Click the Login button without entering any values.
    - expect: Validation messages are shown for both User ID and Password.
  3. Confirm the form is blocked.
    - expect: The login request is not submitted and the user remains logged out.

#### 1.9. Medium - Whitespace-only input handling

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the login page.
    - expect: The form is ready for input.
  2. Type spaces or tabs into the User ID and Password fields.
    - expect: The values are treated as blank or invalid.
  3. Click Login.
    - expect: Validation messages appear instead of a successful authentication.
  4. Confirm no session is created.
    - expect: The user remains on the login page and cannot access customer pages.

#### 1.10. Medium - Special-character and mixed-case password input

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the login page.
    - expect: The customer login form is visible.
  2. Enter a valid User ID and a valid password containing uppercase, lowercase, and special characters.
    - expect: The password field remains masked and accepts the special characters without UI issues.
  3. Submit the form.
    - expect: Login succeeds if the test account password matches the provided valid value.

#### 1.11. Medium - Focus and blur behavior for password masking

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Open the login page and focus the Password field.
    - expect: The field is editable and displayed as a masked input.
  2. Type a valid password and move focus away from the field.
    - expect: The password remains masked after blur.
  3. Verify the entered value is not exposed in plain text.
    - expect: The UI continues to protect the password content.

#### 1.12. Low - Retry flow after failed login

**File:** `tests/banking-login/customer-login.spec.ts`

**Steps:**
  1. Attempt a failed login with invalid credentials.
    - expect: An error message is displayed and the user stays on the login screen.
  2. Refresh the page or use browser back navigation.
    - expect: The login page remains functional and the form is reset or reinitialized appropriately.
  3. Enter the correct credentials and login again.
    - expect: The user successfully authenticates on the second attempt.
