# WeDeliverTech Reception Management Dashboard

## Project Structure

Documentation/
- Jira.pdf

Web Application/
- CSS/
  - style.css          # Main stylesheet
- HTML /
  - index.html         # Main HTML file
- Images/
  - Company_logo.png   # Company logo image
- JS/
  - wdt_app.js         # Main application JavaScript
- Libraries/
  - jquery-3.7.1.js    # jQuery library
  - jquery.validate.min.js # jQuery validation plugin
- README.md            # This documentation

## Features

- **Staff Management**
  - Track staff presence (in/out status)
  - Record staff departure times and expected return times
  - Automatic notifications for late returning staff

- **Delivery Management**
  - Schedule deliveries with customer information
  - Track delivery vehicles and drivers
  - Monitor expected return times for deliveries
  - Automatic notifications for late returning drivers

- **Dashboard View**
  - Real-time digital clock display
  - Staff status board
  - Delivery tracking board

## Usage

1. Open the `index.html` file in your web browser

2. The application will automatically load and fetch staff data from the randomuser.me API

### Using the Staff Management Features

- Staff members are fetched automatically from the randomuser.me API
- Click on a staff member to select them (row will highlight)
- Use the "Out" button to mark a staff member as out and set their expected return time
- Use the "In" button to mark a selected staff member as returned
- Late staff members will trigger automatic notifications

### Using the Delivery Management Features

- Fill out the "Schedule Delivery" form with all required information
- Vehicle types can be selected from the dropdown (car or motorcycle)
- Click "Add" to add a delivery to the tracking board
- Click on a delivery in the board to select it (row will highlight)
- Use the "Clear" button to remove a selected delivery
- Late deliveries will trigger automatic notifications

## Dependencies

The application uses several external libraries:

- **Bootstrap 5.3.3** - For UI components and responsive layout
  - Loaded via CDN: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`
  - JS: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js`

- **jQuery 3.7.1** - JavaScript library for DOM manipulation
  - Located in `Libraries/jquery-3.7.1.js`

- **jQuery Validation Plugin** - Form validation
  - Located in `Libraries/jquery.validate.min.js`

- **Font Awesome** - Icon set
  - Loaded via CDN: `https://kit.fontawesome.com/e07a57fee5.js`

- **SweetAlert2** - Enhanced alert dialogs
  - Loaded via CDN: `https://cdn.jsdelivr.net/npm/sweetalert2@11`

- **RandomUser API** - For fetching random staff profiles
  - API Endpoint: `https://randomuser.me/api/`