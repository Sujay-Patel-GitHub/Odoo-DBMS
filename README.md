# Odoo Expense Management System

An easy-to-use expense management web app built with Firebase, designed for teams and organizations. Track, submit, and approve expenses with distinct admin, manager, and employee views.

## 🚀 Live Demo

https://odoohackathondbms.netlify.app/

---

## 📋 Login Credentials

Use the following test accounts for demonstration:

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Admin    | sujaypatel07@gmail.com       | sujay1512   |
| Employee | janilmistry7@gmail.com       | janil1512   |
| Manager  | manager@gmail.com            | manager123  |

---

## ✨ Features

- Admin dashboard for user creation, approval rules, and user management
- Employee view for submitting expenses with receipts & OCR support
- Manager view for reviewing and approving/rejecting expense claims
- Multi-level conditional approval workflows
- Real-time currency conversion on claim submission
- History log for each expense with status and timestamps
- Email notifications for new users and password setup

---

## 🧑‍💼 User Roles Overview

- **Admin**
  - Creates users, sets roles (employee/manager), assigns reporting managers
  - Defines approval rules and workflows
  - Full overview & override rights

- **Employee**
  - Submits expenses, uploads receipts (supports image OCR)
  - Tracks status and history of own claims
  
- **Manager**
  - Gets notified of pending approvals
  - Approves or rejects claims with remarks
  - Sees only team’s expense requests

---

## 📝 Sample Data

Table columns include:
- Employee
- Description
- Date
- Category
- Created
- Paid By
- Remarks
- Amount
- Status

Example entries:
| Employee | Description       | Date        | Category | Created              | Paid By | Remarks            | Amount | Status    |
|----------|------------------|-------------|----------|----------------------|---------|--------------------|--------|-----------|
| Sujay    | Lunch with client| 2025-10-02  | Food     | 2025-10-02 13:15 IST | Sujay   | Client visit meet  | 650    | Submitted |
| Neha     | Team taxi fare   | 2025-10-01  | Travel   | 2025-10-01 10:00 IST | Neha    | Airport transfer   | 800    | Approved  |
| Rohan    | Internet recharge| 2025-09-30  | Utility  | 2025-09-30 09:00 IST | Rohan   | WFH connectivity   | 500    | Draft     |
| Priya    | Stationery       | 2025-09-29  | Supplies | 2025-09-29 17:45 IST | Priya   | New notebooks      | 900    | Draft     |
| Amit     | Dinner team meet | 2025-09-28  | Food     | 2025-09-28 21:20 IST | Amit    | Team celebration   | 1200   | Submitted |

---

## 🛠 Stack

- Firebase Authentication & Firestore
- React (web UI)
- OCR API for receipt scanning
- Real-time exchange rates API
- Email notifications for onboarding

---

## 💡 How to Use

1. Visit the [live web app](https://odoohackathon.netlify.app/).
2. Sign in with one of the test accounts above.
3. Explore admin, manager, and employee features according to user role.
4. Submit, approve, and track expense requests as per your assigned access.

---

## 📬 Support

For issues or questions, please open an issue in this repository or message the project maintainers.

<img width="1733" height="902" alt="Screenshot 2025-10-04 165352" src="https://github.com/user-attachments/assets/d279a6ae-8d92-4c8d-9ab3-dbcdfb40542a" />

<img width="1582" height="855" alt="Screenshot 2025-10-04 165434" src="https://github.com/user-attachments/assets/5ac203d5-08c3-44a8-9ad7-a6034b5886c8" />

<img width="1882" height="325" alt="Screenshot 2025-10-04 165417" src="https://github.com/user-attachments/assets/e2c2845a-7720-4eb1-8221-7b46fce5abd5" />

<img width="1903" height="923" alt="image" src="https://github.com/user-attachments/assets/6a0f6600-8267-421d-aa99-c79797db20a3" />





