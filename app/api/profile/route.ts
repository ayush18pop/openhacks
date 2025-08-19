import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Type for user profile update data - simplified for new schema
interface UserUpdateData {
  name?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  skills?: string;
  university?: string;
  graduationYear?: number;
}

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const user = await requireAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Get additional data about user's event relationships
    const userWithEvents = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organizedEvents: {
          select: { id: true, title: true, startAt: true }
        },
        judgedEvents: {
          select: { id: true, title: true, startAt: true }
        },
        _count: {
          select: {
            registrations: true,
            organizedEvents: true,
            judgedEvents: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        website: user.website,
        github: user.github,
        linkedin: user.linkedin,
        twitter: user.twitter,
        skills: user.skills ? JSON.parse(user.skills) : [],
        university: user.university,
        graduationYear: user.graduationYear,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Event relationship counts
        stats: {
          registrations: userWithEvents?._count.registrations || 0,
          organizedEvents: userWithEvents?._count.organizedEvents || 0,
          judgedEvents: userWithEvents?._count.judgedEvents || 0,
        },
        // Recent events
        recentOrganizedEvents: userWithEvents?.organizedEvents.slice(0, 3) || [],
        recentJudgedEvents: userWithEvents?.judgedEvents.slice(0, 3) || [],
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate and sanitize input - all users can update these fields
    const updateData: UserUpdateData = {};
    
    // Common fields that all users can update
    if (body.name !== undefined) updateData.name = body.name;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.github !== undefined) updateData.github = body.github;
    if (body.linkedin !== undefined) updateData.linkedin = body.linkedin;
    if (body.twitter !== undefined) updateData.twitter = body.twitter;
    if (body.university !== undefined) updateData.university = body.university;

    // Skills handling
    if (body.skills !== undefined) {
      const skills = Array.isArray(body.skills) ? body.skills : [];
      updateData.skills = JSON.stringify(skills);
    }

    // Graduation year validation
    if (body.graduationYear !== undefined) {
      const year = parseInt(body.graduationYear);
      if (!isNaN(year) && year > 1900 && year < 2100) {
        updateData.graduationYear = year;
      }
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        website: updatedUser.website,
        github: updatedUser.github,
        linkedin: updatedUser.linkedin,
        twitter: updatedUser.twitter,
        skills: updatedUser.skills ? JSON.parse(updatedUser.skills) : [],
        university: updatedUser.university,
        graduationYear: updatedUser.graduationYear,
        updatedAt: updatedUser.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/profile - Delete current user's account
export async function DELETE() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizedEvents: true,
        ownedTeams: true,
        registrations: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for dependencies that prevent deletion
    const dependencies = [];
    if (user.organizedEvents.length > 0) {
      dependencies.push(`${user.organizedEvents.length} organized events`);
    }
    if (user.ownedTeams.length > 0) {
      dependencies.push(`${user.ownedTeams.length} owned teams`);
    }

    if (dependencies.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete account',
        message: `Account has dependencies: ${dependencies.join(', ')}. Please transfer ownership or delete these items first.`,
        dependencies: {
          organizedEvents: user.organizedEvents.length,
          ownedTeams: user.ownedTeams.length,
        }
      }, { status: 409 });
    }

    // Delete user and related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete user registrations
      await tx.registration.deleteMany({
        where: { userId: user.id }
      });

      // Delete user scores (as judge)
      await tx.score.deleteMany({
        where: { judgeId: user.id }
      });

      // Remove user from teams they're members of
      await tx.user.update({
        where: { id: user.id },
        data: {
          memberOfTeams: {
            set: [] // Remove from all teams
          }
        }
      });

      // Remove user from judge relationships
      await tx.user.update({
        where: { id: user.id },
        data: {
          judgedEvents: {
            set: [] // Remove from all judge relationships
          }
        }
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: user.id }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
