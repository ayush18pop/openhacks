# Prisma Schema Refactoring: Event-Based Authorization

## Summary

Successfully refactored the OpenHacks Prisma schema from a global role-based system to an event-specific authorization model. This change provides more flexibility and accurate representation of real-world hackathon permissions.

## Changes Made

### 1. User Model Modifications

- **Removed**: Global `role` field
- **Removed**: Role-specific fields:
  - `expertise` (judge-specific)
  - `company` (judge/organizer-specific)
  - `position` (judge/organizer-specific)
  - `yearsOfExp` (judge-specific)
  - `organization` (organizer-specific)
- **Retained**: Common fields available to all users:
  - `skills` (JSON array)
  - `university`
  - `graduationYear`
  - All social/contact fields
- **Updated Relations**:
  - `eventsCreated` → `organizedEvents`
  - Added `judgedEvents` many-to-many relation

### 2. Event Model Modifications

- **Renamed**: `createdById` → `organizerId` for clarity
- **Renamed**: `createdBy` relation → `organizer`
- **Added**: `judges` many-to-many relation to User model
- **Updated**: Foreign key references and relation names

### 3. Authorization Logic Changes

- **Before**: Global roles (PARTICIPANT, JUDGE, ORGANIZER)
- **After**: Event-specific permissions:
  - **Organizer**: User who created the event (`organizerId`)
  - **Judge**: User assigned to event via `judges` relation
  - **Participant**: Any other user (default)

### 4. API Updates

#### Profile API (`/api/profile`)

- Simplified to handle common fields only
- Added event statistics (organized/judged event counts)
- Removed role-specific field validation
- Updated response structure with event relationship data

#### Events API (`/api/events`)

- Updated to use new relation names (`organizer`, `judges`)
- Removed global role checks for event creation
- Any authenticated user can now create events

#### Auth Helpers (`/src/lib/auth.ts`)

- **Removed**: `requireRole()` function
- **Added**: Event-specific authorization functions:
  - `requireEventOrganizer(eventId)`
  - `requireEventJudge(eventId)`
  - `requireEventStaff(eventId)` (organizer OR judge)
  - `getUserEventRole(eventId, userId?)`

## Benefits of New Model

1. **Flexibility**: Users can have different roles across different events
2. **Scalability**: Easy to add/remove judges per event without global role changes
3. **Accuracy**: Better reflects real-world hackathon organization
4. **Simplicity**: Eliminates complex role-specific field management
5. **Security**: Event-specific permissions prevent unauthorized access

## Database Schema State

- ✅ Schema validated and pushed to Azure SQL Database
- ✅ Prisma Client regenerated with new types
- ✅ All TypeScript compilation errors resolved
- ✅ Build successful

## Migration Impact

- **Breaking Change**: Existing role-based code will need updates
- **Data Impact**: Global roles removed, event relationships need to be established
- **API Changes**: Profile and event endpoints have updated response structures

## Next Steps for Implementation

1. Update frontend components to work with new authorization model
2. Create event management UI for organizers to assign judges
3. Implement event-specific permission checks in protected routes
4. Add migration scripts if preserving existing role data is needed

## Files Modified

- `prisma/schema.prisma` - Core schema refactoring
- `app/api/profile/route.ts` - Profile CRUD with simplified model
- `app/api/events/route.ts` - Events API with new relations
- `src/lib/auth.ts` - Event-specific authorization helpers
- `src/lib/types/profile.ts` - Updated TypeScript types
