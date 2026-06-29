# North Rift Connectivity Manager

A Vite and React application using Supabase Authentication, PostgreSQL, and Row Level Security.

## Features

* Admin and user authentication
* Role-based access
* Institution management
* Inventory management
* CSV import and export
* Supabase database integration
* Row Level Security

## Site Fields

The site register supports:

* Code
* Site Name
* County
* Subcounty
* Ward
* Category
* Project
* Access Point Number

AP means **Access Point**.

Existing database fields are reused as follows:

* `institution_nemis_code` = Code
* `institution_name` = Site Name

New Supabase columns:

* `ward`
* `category`
* `project`
* `access_point_number`

## Category Options

* Health Facility
* Police Station
* Primary School
* Secondary School
* TVET/TVC
* University
* Market
* Stadium/Garden
* Government/County Office
* ICT Hub
* Other

## Project Options

* NOFBI I
* NOFBI II
* NOFBI III
* DSH I
* DSH II
* GIGA UNICEF
* Public WiFi
* EARTTDFP
* KDEAP
* Other

## Inventory Module

The Inventory page manages equipment linked to each site.

### Site Switches

* Model
* OEM
* Serial number

### Access Switches

* Model
* OEM
* Serial number

### Routers

* Model
* OEM
* Serial number
* Connected router count

### UPS

* Model
* OEM
* Serial number
* Capacity
* Status

### TX Equipment

* DWDM
* OSN
* Model
* OEM
* Serial number

Before using Inventory, run:

```sql
supabase-inventory-migration.sql
```

Admins can add, edit, and delete inventory records.

Normal users have read-only access.

## for admin authentication

password 41734046

username :admin@connectivity.go.ke

## for user authentication

username:users@connectivity.go.ke

password:42734046

## CSV Import

The project includes:

```text
sample-inventory-import.csv
```

Existing records can be updated without creating duplicates.

## Run Locally

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Security

* Supabase Authentication controls login
* Admin users can create, update, and delete records
* Normal users have read-only access
* Never upload `.env.local` to GitHub
* Never publish user passwords
* Never use the Supabase secret or service-role key in the React frontend

## Repository

```bash
git clone https://github.com/kelvinyegon/connectivity-manager-newest.git
```

## Author

Kelvin Yegon
