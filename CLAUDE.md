# Money Tracker App — Project Documentation

This file is the source of truth for this project. Claude should re-read it at the
start of every session working on this app.

## 0. Who this project is for

The owner of this project has never coded before and is using Claude Code to build
the entire app. All explanations should be in plain, non-technical language.
Assume no prior knowledge of programming, frameworks, or tools unless it's been
explained earlier in this file.

## 1. Working Agreement (read this first, and follow it for the whole project)

**The owner will not provide technical requirements.** This is a firm, standing
rule for the duration of this project, not a one-time preference:

- Whenever a technical decision needs to be made (which framework/library to use,
  how to store data, how to package/distribute the app, how to test it, how to
  structure the code, etc.), Claude must **stop and present 2–4 concrete options
  in plain language**, each with clear pros and cons, and let the owner choose.
  Claude must not silently pick a technical approach on the owner's behalf.
- Decisions that have already been made (see "Technology Stack" below) are
  considered settled and should be treated as the default going forward, unless
  the owner explicitly asks to revisit them.
- Product/design questions that don't require technical knowledge (e.g., "what
  should this button say," "should categories be renamed") can be asked directly
  and don't need multiple options with trade-offs, though options are still
  welcome if it helps the owner decide.
- If Claude is ever unsure whether something counts as a "technical decision,"
  it should err on the side of asking rather than assuming.

## 2. Project Overview

A desktop app for recording personal expenses and income in US Dollars, and
showing the resulting balance. The app runs on Windows. The core action a user
performs, over and over, is: log a transaction (an expense or income) with an
amount, a date, and a category — quickly and without friction.

## 3. Functional Requirements

- **Add a transaction**: either an expense or income, with amount (USD), date,
  a category (see Section 4), and optionally a note/description and a
  merchant/payee/payer name.
- **Edit a transaction** after it's been recorded.
- **Delete a transaction**.
- **Browse / search / filter** past transactions by date range, type
  (expense/income), and category/subcategory.
- Expenses and income appear together in one combined list, distinguished by
  color (and filterable by type), rather than as two separate lists.
- **Balance**: the app shows the current balance (total income minus total
  expenses, starting from $0 — there is no separate "starting balance" concept
  for v1), along with total income and total expenses.
- All amounts are in USD only.

## 4. Category System

### 4a. Expense categories

A two-level system: each expense has one **primary category** and one
**subcategory** within it. This starting list can be freely renamed, added to,
or trimmed later — that's just data, not a technical decision, so the owner can
change it anytime without needing to ask Claude to "propose options."

| Primary Category | Subcategories |
|---|---|
| Housing | Rent/Mortgage, Utilities, Home Maintenance & Repairs, Home Insurance |
| Transportation | Fuel/Gas, Public Transit, Parking & Tolls, Vehicle Maintenance, Ride-share/Taxi, Auto Insurance |
| Food & Dining | Groceries, Restaurants & Takeout, Coffee & Snacks |
| Health & Wellness | Medical & Doctor, Pharmacy/Medication, Health Insurance, Fitness/Gym |
| Shopping & Personal | Clothing, Personal Care, Electronics & Gadgets, Subscriptions |
| Entertainment & Leisure | Movies/Events, Hobbies, Travel/Vacation, Books/Games |
| Education | Tuition & Fees, Books & Supplies, Courses |
| Financial | Debt Payments, Savings/Investments, Bank & ATM Fees, Taxes |
| Family, Pets & Giving | Childcare, Pet Care, Gifts & Donations |
| Miscellaneous | Other/Uncategorized |

### 4b. Income categories

A single-level system: each income entry has one category (no subcategories).
Like the expense categories, this list is just data and can be renamed/changed
freely without needing a technical discussion.

- Salary & Wages
- Freelance & Business
- Investment & Interest
- Gifts & Support
- Refunds & Reimbursements
- Other Income

## 5. Non-Functional Requirements

- Must run as a real installed app on Windows (not just source code that a
  developer would run).
- Expense data must persist between app launches — nothing is lost when the app
  is closed and reopened.
- The interface must be simple enough that a first-time computer user can add an
  expense in just a few clicks.

## 6. Technology Stack

**Decided:** Electron + React + TypeScript for the app itself, with a local
SQLite database for storing expenses.

*Why:* Electron has the largest ecosystem and the most examples/documentation of
any cross-platform desktop technology, which makes it the most reliable choice
for Claude to build and debug correctly for a first-time, non-technical owner.
The main downside is that the installed app is larger (roughly 100–150MB) and
uses more memory than some lighter alternatives — a trade-off worth accepting for
reliability.

**Alternatives that were considered and set aside** (kept here for context —
these were presented to the owner, who chose Electron above):

| Option | Pros | Cons |
|---|---|---|
| Tauri + React | Much smaller (~10–20MB) and faster installed app | Smaller community, so troubleshooting problems can take longer |
| Python + PySide6 | Python source code is generally easier for a beginner to read | Packaging into a double-click desktop app is historically more fragile |
| Local Flask web app | Fastest to get a first version working | Doesn't feel like a real installed app; a background process has to stay running; no dedicated icon/window |

**Data storage:** SQLite — a small database stored in a single local file inside
the app. No external database server, no account, and no internet connection
required.

## 7. Out of Scope for Version 1

To keep the first version realistic and shippable, the following are explicitly
**not** included yet (they're candidates for a future version, not forgotten):

- Multi-currency support (USD only for now).
- Cloud sync, multi-device access, or user accounts.
- Receipt photo capture / OCR scanning.
- Budgets, spending alerts, or recurring/automatic transactions.

## 8. Status

- [x] Product documentation (this file)
- [x] Project scaffolding (Electron + React + TypeScript setup, via Electron Forge)
- [x] Database schema for expenses/categories (SQLite via better-sqlite3, seeded with the category list above)
- [x] Add/edit/delete expense UI
- [x] Browse/filter expense history UI (filter by date range, category, and subcategory)
- [x] Packaging for Windows (Squirrel installer via Electron Forge, verified working)
- [x] Income tracking, combined expense/income transaction list, and balance display

Each unchecked item above involves technical decisions and, per the Working
Agreement in Section 1, should begin with Claude presenting options to the owner
before any code is written.
