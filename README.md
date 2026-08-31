# RMS Events Management System

A modern event management application built with React and Tailwind CSS. This application provides a complete solution for creating, managing, and tracking events.

## Features

### Pages

1. **Home Page** (`/home`)
   - View all events with different filter tabs (All, Live, Past, My events, Rejected)
   - Event cards with visual representation
   - Quick access to create new events
   - Recently used actions panel

2. **Requests Page** (`/requests`)
   - Manage event requests
   - Filter requests by status
   - Quick actions for approval/rejection
   - Visual status indicators

3. **Calendar Page** (`/calendar`)
   - Calendar view of all events
   - Month/Week/Day views
   - Event scheduling interface

4. **Create Event Page** (`/create-event`)
   - Multi-step form with tabs:
     - **Basic Info**: Event name, type, dates, location, description, banner
     - **Speakers**: Add speaker details with photos and contact information
     - **Sessions**: Schedule event sessions with timing and venue
     - **Partners**: Manage event sponsors and partners
     - **Attendees**: Upload or manually add attendee information
     - **Task Assign**: Assign tasks to team members
   - Form validation
   - Skip/Continue navigation between tabs

5. **Event Details Page** (`/event/:id`)
   - Comprehensive event information
   - Tabbed interface for different sections
   - Event statistics and metrics
   - Speaker, session, attendee, and partner management
   - Edit and share functionality

### Components

#### UI Components (`src/components/ui/`)

- **Button**: Customizable button component with variants
- **Card**: Flexible card component with header, content, and footer
- **Input**: Text input with label and validation support
- **Select**: Custom dropdown select component
- **Tabs**: Tab navigation component
- **ImageUpload**: Image upload with preview
- **Modal**: Modal dialog component

#### Common Components (`src/components/common/`)

- **FilterTabs**: Horizontal filter tabs with active state
- **Logo**: Application logo component
- **Icons**: SVG icon components
- **EventCard**: Event display card with status and details

#### Layout Components (`src/components/layout/`)

- **Header**: Top navigation bar with search and notifications
- **Sidebar**: Left navigation sidebar
- **Layout**: Main layout wrapper

## Tech Stack

- **React 18.2**: UI library
- **React Router DOM 6.8**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **React Scripts 5.0**: Build tooling

## Project Structure

```
SEA_EVENTS/
├── public/
│   └── index.html
├── src/
│   ├── assets/           # Static assets
│   ├── components/
│   │   ├── common/      # Reusable components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI primitives
│   ├── pages/           # Page components
│   ├── App.js           # Main app component
│   ├── index.js         # Entry point
│   └── index.css        # Global styles
├── package.json
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Runs tests
- `npm run eject` - Ejects from Create React App (irreversible)

## Design System

### Colors

- **Primary**: Cyan-600 (#0891b2)
- **Secondary**: Slate-600 (#475569)
- **Success**: Green-500
- **Warning**: Orange-500
- **Error**: Red-500
- **Background**: Slate-50 (#f8fafc)

### Typography

- **Headings**: DM Sans
- **Body**: Open Sans
- **Code**: Monospace

### Spacing

Following Tailwind's spacing scale (4px base unit)

## Component Usage Examples

### Button

```jsx
import Button from './components/common/Button';

<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
```

### Input

```jsx
import Input from './components/ui/Input';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>
```

### Card

```jsx
import Card from './components/ui/Card';

<Card>
  <Card.Header>Header Content</Card.Header>
  <Card.Content>Main Content</Card.Content>
  <Card.Footer>Footer Content</Card.Footer>
</Card>
```

### Select

```jsx
import Select from './components/ui/Select';

<Select
  label="Event Type"
  placeholder="Select type"
  options={[
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' }
  ]}
  value={selectedType}
  onChange={(e) => setSelectedType(e.target.value)}
/>
```

## Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components adapt to different screen sizes using Tailwind's responsive modifiers.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Backend API integration
- [ ] User authentication
- [ ] Real-time updates
- [ ] Email notifications
- [ ] Export to PDF/Excel
- [ ] Advanced search and filtering
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.
