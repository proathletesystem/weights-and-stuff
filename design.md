# Habit Tracker - Mobile App Design

## Design Philosophy
This app follows **Apple Human Interface Guidelines (HIG)** to feel like a native iOS app. The design prioritizes **one-handed usage** in **portrait orientation (9:16)**, with clear visual hierarchy and familiar iOS patterns.

## Color Scheme
- **Primary**: Vibrant teal (#0a7ea4) - for accent elements, active states, and completion indicators
- **Background**: Pure white (light) / Dark charcoal (#151718) (dark)
- **Surface**: Light gray (#f5f5f5) / Slightly lighter dark (#1e2022) for cards
- **Success**: Green (#22C55E / #4ADE80) - for completed habits
- **Warning**: Amber (#F59E0B / #FBBF24) - for streaks at risk
- **Foreground**: Near-black (#11181C) / Off-white (#ECEDEE) for primary text
- **Muted**: Gray (#687076 / #9BA1A6) for secondary text

## Screen List

### 1. Home Screen (Habits Today)
**Primary Content:**
- List of all active habits for today
- Each habit shows: name, icon/emoji, completion status, current streak
- Visual distinction between completed and pending habits
- Quick-tap to mark complete/incomplete

**Functionality:**
- Tap habit card to toggle completion
- Pull-to-refresh to reload
- Swipe actions: Edit, Delete
- Floating action button (FAB) to add new habit

**Layout:**
- Top: Date header showing "Today" or specific date
- Middle: Scrollable list of habit cards
- Bottom: Tab bar navigation

### 2. Add/Edit Habit Screen
**Primary Content:**
- Form to create or edit a habit
- Fields: Habit name, icon/emoji picker, frequency (daily/custom days)
- Optional: reminder time, notes

**Functionality:**
- Text input for habit name
- Icon/emoji selector (simple grid of common options)
- Frequency selector: Daily or specific days of week
- Save/Cancel buttons

**Layout:**
- Modal sheet presentation (iOS style)
- Keyboard-aware scrolling
- Clear save button at top-right

### 3. Statistics Screen
**Primary Content:**
- Overview of habit completion statistics
- Current streaks for each habit
- Completion rate (percentage)
- Calendar view showing completion history

**Functionality:**
- View overall progress
- See longest streaks
- Calendar heat map showing daily completion

**Layout:**
- Top: Summary cards (total habits, completion rate)
- Middle: List of habits with individual stats
- Bottom: Calendar view (optional, if space allows)

## Key User Flows

### Flow 1: Add a New Habit
1. User taps FAB on Home screen
2. Add Habit modal slides up from bottom
3. User enters habit name
4. User selects icon/emoji (optional)
5. User selects frequency (defaults to daily)
6. User taps "Save"
7. Modal dismisses, new habit appears in today's list

### Flow 2: Complete a Habit
1. User sees today's habit list
2. User taps on habit card
3. Card animates to show completion (checkmark, color change)
4. Streak counter increments
5. Haptic feedback confirms action

### Flow 3: View Progress
1. User taps "Statistics" tab
2. Screen shows overview of all habits
3. User sees current streaks and completion rates
4. User scrolls to view calendar history

### Flow 4: Edit/Delete a Habit
1. User swipes left on habit card
2. Edit and Delete buttons appear
3. User taps Edit → Edit modal appears
4. OR User taps Delete → Confirmation alert → Habit removed

## Navigation Structure
- **Tab Bar** (bottom):
  - Home (house.fill icon) - Today's habits
  - Statistics (chart.bar.fill icon) - Progress and stats

## Data Storage
- **Local-first approach**: Use AsyncStorage for all habit data
- No user authentication or cloud sync (unless explicitly requested later)
- Data structure:
  - Habits: id, name, icon, frequency, createdDate
  - Completions: habitId, date, completed (boolean)

## Visual Design Notes
- **Cards**: Rounded corners (12-16px), subtle shadows
- **Typography**: SF Pro (system default), clear hierarchy
- **Spacing**: Generous padding (16-24px) for touch targets
- **Animations**: Subtle scale on press (0.97), smooth transitions (200-300ms)
- **Icons**: SF Symbols on iOS, Material Icons on Android
- **Empty states**: Friendly illustrations/messages when no habits exist

## Interaction Patterns
- **Primary action**: Tap to complete habit (large touch target)
- **Secondary actions**: Swipe for edit/delete
- **Haptic feedback**: Light impact on completion toggle
- **Pull-to-refresh**: Standard iOS pattern on home screen
- **Modal sheets**: For add/edit forms (iOS native feel)

## App Icon & Branding
- **App Name**: "Habit Tracker"
- **Icon**: Simple, recognizable symbol representing habits/checkmarks/growth
- **Style**: Clean, modern, aligned with iOS aesthetic
