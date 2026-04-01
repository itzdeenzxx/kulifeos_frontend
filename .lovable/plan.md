

# KU LifeOS – AI-Powered Student Operating System

## Design System Foundation
- Custom color palette: Kasetsart Green (#006633), Soft Green (#4CAF50), Light Green Tint (#E8F5E9) on white
- Inter font via Google Fonts with bold/medium/regular weights
- 8px spacing grid, 12–16px rounded corners, soft shadows
- Smooth 200–300ms hover transitions throughout
- Green glow/lift micro-interactions on cards and buttons

## Layout Shell
- **Sidebar** (desktop): White background, icon + label nav items (Dashboard, My Profile, Team Matching, Projects, Career Insights, Settings), green vertical active indicator
- **Top Bar**: Page title, notification bell, profile avatar dropdown
- **Mobile**: Collapsible sidebar + bottom tab navigation
- **Responsive**: Desktop-first, tablet-adaptive, mobile-optimized

## Pages

### 1. Landing Page (Public — no sidebar)
- Hero section with headline, subheadline, two CTAs ("Get Started with LINE" + "Explore Features")
- Abstract green gradient background shapes
- 4 feature cards: Smart Skill Profiling, AI Team Matching, Intelligent Project Workspace, Career Path Recommendation
- Clean footer

### 2. Dashboard
- Welcome greeting with motivational line
- **Skill Radar Chart** (Recharts) as the main visual — green line, light green fill
- Skill tags displayed as green rounded pills (AI, Finance, Marketing, Data, Leadership)
- Right-side cards: Career Recommendation (title + match % + CTA), Upcoming Deadlines, Active Projects Overview

### 3. Profile Page
- Profile header: photo, name, faculty, year, edit button
- Large Skill Radar Chart
- Skill Badges grid (rounded, light green bg)
- Portfolio Projects as cards
- Experience Timeline (vertical clean timeline)

### 4. Team Matching Page
- Search bar + filter chips (AI, Finance, Marketing, Design, Data)
- 3-column student card grid with: photo, name, faculty, skill tags, green compatibility progress bar, invite button
- Card hover: lift + green glow

### 5. Project Workspace Page
- Kanban board: To Do / In Progress / Done columns
- Task cards with tags, assigned avatar, subtle shadow
- "AI Suggest Plan" green button → modal showing task breakdown, suggested roles, milestones
- Green animated progress bar

### 6. Career Insights Page
- Career Recommendation card (name, match %, description, required skills)
- Skill Gap Analysis bar chart (Recharts, green bars)
- Growth Timeline (horizontal, year markers)

## Data Approach
- All pages use realistic mock data (hardcoded JSON)
- Components structured with props/types so real data can replace mocks easily later

## Mobile Optimization
- Bottom navigation bar on small screens
- Stacked single-column layouts
- Radar chart scaled for small viewports
- Collapsible sidebar via SidebarProvider

