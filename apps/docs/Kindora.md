**1\. Document Overview**

This FSD outlines the **functional requirements** for the **Suneflower Organization Software**, designed to support the organization's mission: helping individuals access funds for medical, food, and educational needs, starting within a trusted circle of friends.

**1.1 Vision & Purpose**

We believe kindness is the seed that grows into a brighter world. At **Kindora**, we make kindness easy, joyful, and verified—connecting those who can help with those who need it most. Together, we build a community where kindness is not just a word, but a way of life.

**Kindora** is a platform where kindness is shared and verified—designed for **Lumis** (people in need) to share their authentic stories, and for **Kindoras** (the community) to offer their support.

![]() ![]()![]()

### 🌻 **Meaning of Kindora**

**Kindora** is a blend of two powerful concepts:

- **Kind**: from the word _kindness_—the core value of the platform, where people help each other from the heart.
- **Dora**: inspired by the idea of a _door_ (a gateway) or _aura_ (a sense of warmth). It also draws from **Pandora**, representing a _container_ or _repository_, but in a positive, reimagined light.

So **Kindora** means:
💛 _A gateway for kindness_
💛 _A container of compassion and giving_
💛 _A community where kindness flows_

🌻 _On Kindora, Flares rise up with a call for help, and Kindoras respond—spreading kindness without borders._

**Suneflower** is the **heart and soul** of the mission—guiding values, trust, and integrity.

🌻 _Love has no border. Sharing without barriers._

### Business Objectives

- Create a **user-friendly platform** where:
  - Trusted friends and community members can submit **fund requests**.

  - Donations can be made and tracked **transparently**.

  - Cases can be **verified** by the Suneflower team.

- Build **trust** through transparency, clear processes, and impact tracking.

Enable **scalability** for future growth (from small circle → larger community).

### 1.2 Platform focus

#### 1.2.1 Areas of Support

- - Medical
  - Education
  - Food

_(All requests are converted into_ **_monetary form_** _for transparency.)_

#### 1.2.2 Core Roles:

Role

Name

Meaning/Feel

Requesters

**Lumis**

Those shining a light on their needs

Givers

**Kindoras**

The community of verified givers

Platform

**Kindora**

The place where kindness flows

Admin/Verification

**Suneflower Admin**

The core team verifying and approving requests

Rewards/Recognition

**Suneflower Coin**

A token of appreciation for contributions

#### 1.2.3 Users:

- - Donors/ givers - called Kindoras
  - Fund Requesters - called Lumis
  - Suneflower Admins

#### 1.2.4 Core Modules:

1.  **User Roles & Privileges**
2.  **Data Security**
3.  **User Registration & Login**
4.  **Fund Request Creation - Share a Story** page
5.  **Verification Workflow
    **
6.  **Donation Process
    **
7.  **Case Status Tracking
    **
8.  **Impact Dashboard (for transparency)
    **
9.  **Admin Panel (for approvals, reports, and user management)**

**2\. Core Concepts**

Concept

Description

Verified Kindness

Every request is carefully checked by Suneflower Admins.

Transparency

Donors see where their support goes—down to the last detail.

Community-Led Giving

Kindoras can choose which Lumis they support, directly.

Trust Layer

The platform provides authentication, verification, and support for all actions.

**3\. Platform Structure**

### 3.1 Technology overview

Section

Details

Frontend

Web and mobile app for Lumis, Kindoras, Admins.

Backend

Secure, scalable infrastructure; APIs, databases, etc.

Payment Gateway

Secure, regulated payment processing.

Data Security

Encryption, privacy protections, KYC for trust.

Audit Trails

All actions logged for transparency and compliance.

KYC for trust: refers to the process of verifying the identities of all parties involved in a trust to ensure compliance with anti-money laundering (AML) regulations and prevent financial crimes:

✔ **Identify all parties** – Trustees, beneficiaries, and settlors must be verified.

✔ **Verify identities** – Collect proof of identity and address for each party.

✔ **Assess risk** – Determine if the trust structure poses a higher risk for financial crimes.

✔ **Monitor transactions** – Conduct ongoing checks to detect suspicious activity.

### 3.2 For Lumis (Requesters)

- Create and submit **verified requests** for help (medical, education, food)
- Upload **proof and supporting documents** for verification
- Receive support transparently

### 3.3 For Kindoras (Givers)

- Browse verified stories and needs
- Donate securely and transparently
- Track donation impact
- Earn **Suneflower Coins** as recognition for giving

### 3.4 For Admins (Suneflower Core Team)

- Review, verify, and approve Lumis' requests
- Maintain platform trust and integrity
- Manage platform content and operations
- Maintain brand vision: _Love has no border. Sharing without barriers_

**4\. Features & Functional Requirements**

**4.1 User Roles & Privileges**

Role

Access & Privileges

Lumis

\- Can view **Lumis** **Stories** page (fundraising posts history).

\- Can create a new fund request on **Share a Story** page

\- Can view **Support Received** (who donated to them - their own stories).

\- Can switch to **Kindora role** anytime (via "Become a Kindora" link).

Kindora

\- Can browse **Discover Stories** page.

\- Can donate to stories through “donate” button

\- Can view **My Kindness** (donation history).

\- Can switch to **Lumis role** anytime (via "Become a Lumis" link).

All users

\- **My Account**: profile details (username, name, age, etc.), activity summary.

\- **Suneflower Coins** (if implemented in the future).

Admin

\- Access **Admin Dashboard** only.

\- Manage users, stories, donations, reports, and platform settings.

\- Cannot create stories or make donations as a regular user.

**Role Switching Behavior:**

- Upon login, users are redirected to the last active role.
- Users can **switch roles** at any time via the link on the top bar.
- **Menus adapt:** Lumis = _Request-related pages_ / Kindora = _Donation-related pages_.

**Backend solution:**

- One user table.
- Role field: default role = Kindora or Lumis.
- Context field: current active mode (Lumis/Kindora).
- Menus load dynamically based on mode.
- History tables separate:
  - **LumisPosts** table: list of requests.
  - **KindoraDonations** table: list of donations.

#### 4.1.1 Lumis Flow

 **Homepage**: Lumis Stories (their own posts + option to edit).

 **Top Link**: "Become a Kindora" (to switch role).

 **Menu Items**:

- Lumis Stories
- Support Received
- Share a Story

Table with fields – No, title, content, target amount; support received; status; comment; date; view/edit/delete icon

UI design: [https://www.figma.com/design/G42uQ7H4uVWFjIVomNctqQ/Kindora?node-id=0-1&t=DD4RcrBaMtlHOwlm-1](https://www.figma.com/design/G42uQ7H4uVWFjIVomNctqQ/Kindora?node-id=0-1&t=DD4RcrBaMtlHOwlm-1)

![]()

![]()

![]()

#### 4.1.2 Kindora Flow

 **Homepage**: Discover Stories (browse & give kindness).

 **Top Link**: "Become a Lumis".

 **Menu Items**:

- Discover Stories
- My Kindness (donation history & totals)

![]()![]()

![]()

![]()

#### 4.1.3 Common Features (All Users) Flow

 **My Account**: username, profile details, activity summary

![]()

 **Suneflower Coins** (TBD)

#### 4.1.4 Admin Flow

**Homepage: Admin Dashboard** (manage users, stories, reports)

**4.2 Data security**

#### 4.2.1 Banking & Payment Data

1.  **Do NOT store sensitive payment information (bank account, credit card) on servers.**
2.  **Use a PCI-DSS compliant payment gateway (e.g., Stripe, PayPal, MoMo, ZaloPay, VNPay)** to handle all transactions.

- They store and encrypt payment details.
- **Only store** the **transaction reference ID** and **amount** in database.

1.  Users’ donation history (amounts, dates, stories they supported) will be stored—but never store full bank details or credit card numbers.

#### 4.2.2 Database Security Rules for Other Data

1.  **Passwords:**
    - Store only **hashed and salted** passwords using a strong algorithm (e.g., bcrypt, Argon2).
2.  **Emails, usernames:**
    - Store in encrypted form if possible, or at least ensure access is protected by authentication.
3.  **Donation History:**
    - Store amounts, timestamps, story IDs—but **never store actual payment methods**.
4.  **Role Management:**
    - Implement strict role-based access (RBAC):
      - Admins: manage and verify requests.
      - Lumis: create requests.
      - Kindoras: donate.

**4.3 User Registration & Login**

#### 4.3.1 Feature Overview

**User Types:** Lumis, Kindora, Admin

The **User Registration & Login** feature allows **Lumis** and **Kindoras** to create accounts, verify their email, and access the platform.

**Suneflower Admins** role are pre-created by the system.s

#### 4.3.2 Verification

- After clicking **Sign Up**, a **verification code** is sent to the user’s email.
- User enters the verification code on the **Email Verification** Page.
- User must **verify** via code to activate the account.
- Upon successful verification: Redirects to Login Page.
- If the code is incorrect → Shows error message "_Invalid verification code. Please check the code sent to your email and try again_.", retries allowed.
- If the code is expired → shows error message _"This verification code has expired. Please request a new code and try again."_
- Verification code:

✔ **Validity:** A unique 6-digit code, valid for **5 minutes**.

✔ **One-Time Use:** Each code can only be used once.

✔ **Auto-Resend Option:** Users can request a new code if needed, with a maximum of **5 requests**.

✔ **Countdown Timer Notification:** Display an expiration countdown to prompt users before the code expires.

- 🌸 **Email Template for User Sign-Up Verification**

**Subject**: 🌸 Verify Your Email for Kindora

Hello \[User’s Name\],

Welcome to Kindora! Thank you for signing up to join our community of kindness.

To complete your registration, please use the following 6-digit code to verify your email:

🌸 **Your Verification Code**:
\[6-DIGIT CODE\]

This code is valid for **5 minutes**. Please enter it on the Kindora website to proceed with your account setup.

If you did not request this email, please ignore it.

Thank you for being part of the Kindora family!
Let’s light the world together.

With care,
The Kindora Team

✅ **Trigger:**

- User clicks "Sign Up" and submits the form.
- Kindora system generates a **unique 6-digit verification code**, valid for **5 minutes** only.

✅ **Purpose:**

- Confirm user's email ownership.
- Provide a 6-digit code for verification.

✅ **Data to Include in Email:**

- User's name (if available)
- 6-digit verification code
- Expiration time
- Link or instructions for where to input the code (optional)

✅ **Rules:**

- Code must expire after 5 minutes.
- If the user requests a new code, the old one should be invalidated.
- Do **not** include personal details in the email for security reasons.

#### 4.3.3 Registration Fields

**Field**

**Validation Rule**

**Error Message**

Email

Must be a valid email format (e.g., name@domain.com).

Invalid email format.

Username

Unique across all users; 3-30 characters, alphanumeric only.

Username already exists. / Username must be 3-30 characters, alphanumeric only.

Password

\- Min. 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.

Password must be at least 8 characters, include an uppercase, lowercase, number, and special character.

Confirm Password

Must match Password.

Passwords do not match.

#### 4.3.4 Registration Flow

1.  Fills in **Email**, **Username**, **Password**, **Confirm Password**.
2.  Submits form.
3.  System validates fields:

- If invalid, shows errors and blocks submission.
- If valid, creates user account and sends welcome email.

1.  Redirects to **Login Page**.

#### 4.3.5 Login Fields

**Field**

**Validation Rule**

**Error Message**

Email/username

Must match a registered, verified email/ username

Invalid login credentials. Please try again.

Password

Must match the password for that email.

Invalid login credentials. Please try again.

#### 4.3.6 Login Flow

1.  User enters **Email** or **Username** and **Password**.
2.  System authenticates credentials:

- If valid: based on last active role to redirect page
  - **Kindora** → redirected to **Discover Stories/ Give Kindness** page.
  - **Lumis** → redirected to **Lumis Stories/** **fundraising posts** page.
  - **Admin** → redirected to **Admin Dashboard**.
  - **By default** the role for **new users** is **Kindora => Discover Stories** page
- If invalid, display error message.

#### 4.3.7 Reset Field

**Field**

**Validation Rule**

**Error Message**

Email

Must match a registered, verified email.

Invalid login credentials. Please try again.

#### 4.3.8 Reset Flow

#### 4.3.9 Logout Flow

#### 4.3.10 Security Considerations

✅ **Strong Password Policy** (see above).
✅ **Email verification** before account access.
✅ **Role-based redirection** after login.
✅ **No direct registration for Admins**—created by Super Admin only.

**4.4 Request Creation (Share a Story** page**)**

#### 4.4.1 Feature Overview

The **Request Creation** feature allows Lumis users to submit stories requesting support (for themselves or others). This feature is accessible via the **"Share a Story"** menu and is a central part of the Kindora platform.

Users can save **Lumis Identity** information after their first post, reducing repetitive input for future stories. Bank details are collected **after admin approval** to ensure secure processing of funds.

#### 4.4.2 User Roles & Access

**Role**

**Access to Request Creation**

Lumis

Full access to create and manage stories

Kindora

No access

Admin

Can view/edit/delete and approve/reject requests

#### 4.4.3 Functional Flow

#### A. Lumis Identity Section (Saved Profile Data)

This section is **required only on the first story submission**. After that, data is stored in the user's profile and can be **edited anytime via "My Account"**.

**Field**

**Type**

**Validation Rules**

**Error Message**

First Name

Text

Required, 2-50 characters

Required field—Please enter the necessary information.

Last Name

Text

Required, 2-50 characters

Required field—Please enter the necessary information.

Age

Number

Required, 16-120 years

Required field—Please enter the necessary information.

Country

Dropdown

Required, default: VN

Required field—Please enter the necessary information.

Address

Text

Required

Required field—Please enter the necessary information.

Phone Number

Text

Required, valid format (E.164 recommended)

Required field—Please enter the necessary information; invalid format

✅ Data saved in "My Account" → **Lumis Identity** section

#### B. Post Content Section (Per Story Submission)

**Field**

**Type**

**Validation Rules**

**Error Message**

Title

Text

Required, max 120 characters

Required field—Please enter the necessary information.

Story Content

Textarea

Required, max 1500 characters

Required field—Please enter the necessary information.

Currency

Dropdown

Required, default: VND

Required field—Please enter the necessary information.

Target amount

Number

Required, positive number only

Required field—Please enter the necessary information.

Are you posting for yourself or others?

Checkbox

Required (Boolean)

Required field—Please select an option

Upload Proofs

File Upload

\-Up to 10 files, each ≤ 5MB;

\-At least 1 proof document (e.g., ID, bill, or certificate);

\-Auto-renamed to unique IDs by the system (e.g., lumis1234_proof1.jpg);

\-Formats: PDF, JPG, PNG, JPEG

\-File size too large. Please upload files under 5 MB.

\-At least 1 document required. Please upload ID, bill, or certificate.

\-Unsupported file format. Please upload JPG, PNG, or PDF.

✅ After submission, story status = **Pending** (for Approval)

✅ **Display a note on the system:** _“You can upload additional proof documents anytime before final review. Please ensure your information is accurate. If your post is rejected, you may submit a new request.”_

**Upload Proofs**

#### 📂 Upload Requirements

✅ **Maximum Files**: Up to **10 files per request**
✅ **Maximum File Size**: Up to **5 MB per file**
✅ **Total Upload Limit**: 50 MB per request (soft limit for backend handling)
✅ **Minimum Required Files**: At least **1 proof document** (e.g., ID, bill, or certificate)
✅ **File Naming**: Auto-renamed to unique IDs by the system (e.g., _lumis1234_proof1_.jpg)

✅ **File Formats**: Only allow PDF, JPG, PNG, JPEG.

✅ **Supporting documents or images**: Identification Document; Medical Bills / Reports; School Certificates / Fee Receipts; Invoices / Receipts;…

#### ⚠️ Validation & Warnings

- Reject files **exceeding 5 MB** or unsupported formats.
- Show **friendly error messages**:
  - "File size too large. Please upload files under 5 MB."
  - "Unsupported file format. Please upload JPG, PNG, or PDF."
  - “At least 1 document required. Please upload ID, bill, or certificate.”
- After uploading, users can **preview thumbnails** and remove unwanted files before final submission.
- After uploading proof documents, Lumis will choose which images are visible to Kindoras by using the visibility toggle or checkbox.
- Please note: If no images are selected for public visibility, **Suneflower may decide to display certain proof images on the Lumis’ stories page without explicit consent,** to ensure transparency and community trust.

#### 🔐 Security Considerations

- Uploaded files stored in a **secure, access-controlled environment** (e.g., AWS S3 with strict access policies).
- Files are **encrypted at rest** and **served via secure URLs**.
- **Access permissions**:
  - Only Lumis can see their own uploaded proofs.
  - Kindoras cannot view proofs—**only Admins** see these during verification.

#### C. Beneficiary Bank Details (Post-Approval Step)

After admin approval, the user must complete bank details for fund transfers.

**Field**

**Type**

**Validation Rules**

**Error Message**

Bank Name

Text

Required

Required field—Please enter the necessary information.

SWIFT Code

Text

Required, valid SWIFT format

Required, standard SWIFT format (e.g., 8-11 characters)

Account Number

Text

Required

Required, numeric/alphanumeric, max 34 characters (IBAN)

Account Holder

Text

Required

Required, 2–100 characters

Term & agreement

Checkbox

Required; content:
“_I understand and agree that by providing my bank account details here, this information will be visible to potential donors (Kindoras) who may choose to support me directly. I take full responsibility for sharing my information.”_

You must agree to make your bank account information visible to Kindoras to proceed.

✅ Collected securely after admin approval
✅ Bank details are editable only before the fund request is marked as 'completed’.

✅ **Display a note on the system: “**_Please ensure your bank information is_ accurate _to avoid issues with receiving funds_”

#### 4.4.4 System Behaviors & Scenarios

**Scenario**

**Expected Behavior**

First-time Lumis creating a post

User must fill Lumis Identity + Post Content

Returning Lumis creating a new post

Lumis Identity auto-filled; user only fills Post Content

User uploads >10 files or files >5MB

Error message: "Maximum 10 files. Each file must be ≤5MB."

After submitting post

Status = Pending Approval; user cannot enter bank details yet

After post approved

User prompted to enter Bank Details

User edits existing story/ Bank Details

Allowed via "My Stories" page

User edits Lumis Identity

Allowed via "My Account"

#### 4.4.5 Data Security & Privacy Considerations

✅ All sensitive data (e.g., bank details) are stored in **encrypted fields** in the database.
✅ Donation history (without bank details) is visible to users for transparency.
✅ **Lumis can delete a post** **ONLY IF**:

- The post has **not yet been approved** by Admin.
- No Kindora donations have been made.

✅ **Once a post has been approved and/or funds raised**:

- The post becomes **read-only** (cannot delete or modify critical data like title, content, bank details directly).
- They can **request an update** via a **"Request Edit"** button (flagged for Admin approval).

✅ **Bank details**:

- Can only be **updated, not deleted**.
- If a Lumis needs to update bank details, it triggers an **Admin review process**.

✅ **Audit Logs**:

- Keep all **post histories and transaction logs** visible to Admin.
- For transparency, show **Kindora’s public donation records** and **Lumis’s story timeline**.

#### 4.4.6 Data Logging

- Upon **Lumis submitted the fund request, and Admin approved/rejected**, store in database:
  - **All the data in Lumis Identity section; Post content section; Beneficiary bank details section**
  - **The status of the fund request**
  - **Timestamp**

**4.5 Verification Workflow**

#### 4.5.1 Overview

Step

Status

Who Can Edit/Delete

Lumis Actions

Admin Roles

Public Visibility

Notes

1

Draft

Lumis: Edit all, Delete

Edit everything in the post

Lumis identity will be edited in "My Account"

Full access,

but Bank Info or Proofs

View-only

Hidden

Initial creation stage

Pending

Admin only

Cannot edit anything

Full access,

but Bank Info or Proofs

View-only;

Approve/Reject

Hidden

Submitted for admin review

2

Accepted

Lumis: Edit Proofs/Bank Info, Delete

Edit Proofs and Bank Info only Can delete post

Full access,

but Bank Info or Proofs

View-only

Hidden

Post ready for Lumis to update bank info and proofs

Rejected

Lumis: Delete only

Cannot edit

Can delete post

Full access,

but Bank Info or Proofs

View-only

Hidden

Rejected with reasons

3

Pending (Bank/

Proofs)

Admin only

Cannot edit anything

Full access,

but Bank Info or Proofs

View-only;

Approve/Reject

Hidden

After Lumis updates Bank Info/Proofs, waiting for admin review

4

Open

Admin: Full control (except Bank/Proofs) Lumis: Edit Feedback only

Edit Impact/Feedback Report section only

Full access,

but Bank Info or Proofs

View-only

Public

Donations are open

5

Suspended

Admin only

Cannot edit

Full access,

but Bank Info or Proofs

View-only

Hidden

Post hidden while under investigation

6

Rejected_After_Report

Admin only

Cannot edit

Full access,

but Bank Info or Proofs

View-only

Hidden

Post rejected after investigation

7

Completed

Lumis: Edit Feedback only

Upload Impact Report / Feedback

Full access,

but Bank Info or Proofs

View-only

Public

Donations completed, Lumis must report how funds are used

8

Closed

No edits

Cannot edit

Full access,

but Bank Info or Proofs

View-only

Archived (publicly visible)

Final stage: post archived after Lumis feedback reviewed

#### 4.5.2 Key Rules

✅ **Admin Powers:**

- Full access = Can **edit/delete/comment/change status** on any post at any time.
- Cannot edit Bank Info or Proofs (view-only).

✅ **Lumis Editing Rules by Status:**

Status

Lumis Can Edit

Lumis Can Delete

Draft

All post content

Yes

Pending

Nothing

No

Accepted

Bank Info & Proofs only

Yes

Open

Impact/Feedback Report only

No

Suspended

Nothing

No

Rejected_After_Report

Nothing

No

Completed

Impact/Feedback Report only

No

Closed

Nothing

No

Rejected

Nothing

Yes

✅ **Special Cases:**

- **Changing Bank Info after Open:** Lumis must submit a formal request via Kindora (e.g., "Change Bank Details" button) with a valid reason. (**To be implemented** later.)
- **Rejected Posts:** Lumis must create a new post to proceed.
- **Impact/Feedback Section:** Enabled once a post is Open or Completed.

**✅ Notes**

- “**open**” posts will be displayed on Lumis stories page
- “**completed**” posts will be displayed on Lumis success stories => **to be implemented later**
- “**closed**” posts will be displayed on Lumis impacts (show feedback, relevant info) => **to be implemented later**

#### 4.5.3 Email Requirements

1.  **Email for Admin Approval of Lumis Content** (Request for Bank Info)

✅ **Trigger**: After admin approves the content but bank info is still missing.
✅ **Purpose**: Ask Lumis to provide bank details and additional proofs (if required).
✅ **Data Included in Email**:

- Lumis name
- Post title
- Approved content
- Admin comments (if any)
- Reminder to provide bank details
  ✅ **Rules:**
- Send only when post is in **_Accepted_** status.
- Include a clear CTA (Call to Action) to update bank info.

**Subject:** 🌸 Your Story is Approved! Please Provide Bank Info for Next Step

Hello \[Lumis Name\],

Great news! Your story titled "**\[Post Title\]**" has been approved for publishing on Kindora! 💛

Before we can proceed, please provide your bank information so we can enable donations for your post.

👉 **Admin Comments (if any):**
\[Admin’s comments will be listed here.\]

To provide your bank details, please log in to Kindora and update your post.

Thank you for your kindness and for trusting Kindora. Let’s light the world together!

Warmly,
The Kindora Team

1.  **Email for Admin Approval of Bank Info** (Post Ready to Go Public)

✅ **Trigger**: After admin approves bank details.
✅ **Purpose**: Notify Lumis that their post is ready to go public.
✅ **Data Included**:

- Lumis name
- Post title
- Approved content
- Admin comments (if any)
- Reminder that post is now live

✅ **Rules:**

- Send only when post is in **_Open_** status.

**Subject:** 🌸 Your Story is Now Live on Kindora!

Hello \[Lumis Name\],

Congratulations! Your story titled "**\[Post Title\]**" is now live and ready to receive kindness from the Kindora community. 💛

👉 **Admin Comments (if any):**
\[Admin’s comments will be listed here.\]

Thank you for sharing your story and allowing others to support you.

Wishing you all the best,
The Kindora Team

1.  **Email for Rejection after Investigation** (Post Removal)

✅ **Trigger**: Admin removes post after verification/investigation.
✅ **Purpose**: Notify Lumis that their post has been removed, with reasons.
✅ **Data Included**:

- Lumis name
- Post title
- Reason for rejection (admin comments)
  ✅ **Rules:**
- Send when post is in **rejected** status.

**Subject:** 🌸 Update on Your Kindora Story

Hello \[Lumis Name\],

We wanted to update you regarding your post titled "**\[Post Title\]**."

Unfortunately, after careful review and verification, we are unable to continue supporting your post. Your story has been removed from public visibility for the following reason:

👉 **Admin Comments:**
\[Admin’s rejection reason will be listed here.\]

We appreciate your understanding and encourage you to reach out if you have any questions.

With care,
The Kindora Team

**4.6 Donation Process**

#### 4.6.1 Overview

The Donation Process enables **Kindoras (donors)** to contribute funds to **Lumis (beneficiaries)** by discovering their posts and pledging their support. The process is designed to ensure transparency, voluntary giving, and respect for user privacy, while encouraging accurate pledges.

#### 4.6.2 User Flow

#### **Discover Stories Page**

- Kindoras land on the **Discover Stories** page.
- The page displays a **list of Lumis’ posts** in a feed-like format (similar to Facebook).
- Each post has a **Donate** button located below the content.

#### **Donation Modal - Step 1: Pledge Details**

When Kindoras click **Donate**, a modal appears containing:

![]()

- **Amount Field** (Required):
  - Kindora must enter the amount they intend to donate.
  - Validation: Amount must be greater than 0.
- **Stay Anonymous Checkbox** (Optional):
  - If checked, the Kindora’s name will not be displayed publicly in the Lumis post (e.g., “Anonymous Kindora”).
- **Note:** A message below the fields will read:

_Please enter the amount you wish to donate. Your pledge helps us track support for Lumis. Your actual transfer will be made directly to Lumis’ bank account, as shown in the next step._

- **Buttons**:
  - **Next**: Proceed to view the beneficiary’s bank details.
  - **Cancel**: Close the modal without saving.

#### **Donation Modal - Step 2: Bank Details and Confirmation**

Upon clicking **Next**, the modal displays:

- **Lumis’ Bank Information**:
  - Beneficiary Name
  - Bank Name
  - Bank Account Number
  - (Optional fields if needed: Branch, Swift Code)
- **Reminder Note** (important, below the bank details):

_Please send your donation directly to the beneficiary’s bank account as shown above. Kindora does not hold funds, and we rely on your honesty and transparency in following through with your pledge. Every contribution, big or small, is deeply appreciated. Thank you for your kindness!_

- **Button**:
  - **Okay**: Close the modal.

#### 4.6.3 Edge Cases & Validations

- If **amount field is empty** or **invalid**, show error:

Please enter a valid amount before proceeding.

- Checkbox for anonymity is optional.
- Kindoras **cannot skip** entering the amount (required).

#### 4.6.4 Data Flow & Logging

- Upon **submitting the amount**, store in database:
  - **Kindora ID**
  - **Post ID** (fund request)
  - **Pledged Amount**
  - **Anonymous flag**
  - **Timestamp**
- This data is for tracking only; Kindora makes the **actual transfer directly to the Lumis**.

#### 4.6.5 Privacy & Transparency Notes

- **No payment integration** (e.g., Stripe, MoMo) at this stage; Kindora sends funds manually.
- Lumis bank details are public on the post only after pledging.
- A clear note clarifies that Kindora pledges are not binding; actual donation depends on their follow-through.

#### 4.6.6 Future Enhancements (Optional)

- Add reminders or follow-ups for Kindoras who pledged but may not have transferred yet.
- Implement "Change Pledge Amount" option.
- Build optional MoMo/Stripe integrations later if feasible.
- Payment Handling (through Stripe)

**4.7 Transparency & Impact Tracking (TBD)**

**Feature**

**Description**

Transaction Logs

...

Impact Reports

...

**4.8 Suneflower Coin (TBD)**

**Feature**

**Description**

Earn Coins

...

Use Coins

...

Rewards System

...

**4.9 Admin Features**

#### 4.6.1 All Posts page

![]()

Route: **LumisId/Posttitle**

![]()

#### 4.6.1 Pending Posts page

Can sort **date** field

![]()

Route: **Approval/LumisId/Posttitle**

![]()

**Feature**

**Description**

Request Moderation

...

Verification Tools

...

User Management

...

Reporting

...

**4.7 Notifications & Communication (TBD)**

**Feature**

**Description**

Email Notifications

...

In-app Messages

...

System Alerts

...

**4.8 Other Features (TBD)**

_(To be defined as we progress)_

**5\. Non-Functional Requirements**

**Aspect**

**Description**

Performance

Fast, responsive UI/UX; optimized backend. - System should handle 1000+ users concurrently

Security

Data encryption, secure payments, privacy compliance, GDPR-compliant data handling.

Scalability

Built for future growth and global impact (cloud-based hosting)

Accessibility

Mobile-responsive design

Transparency & Audit Logs:

Admin actions logged for accountability

**6\. Brand & Emotional Core**

Kindora will be the **platform** for kindness.
Suneflower will be the **movement** behind it—spreading love without borders, sharing without barriers.
Together, they will build a **legacy of kindness** for generations to come.
