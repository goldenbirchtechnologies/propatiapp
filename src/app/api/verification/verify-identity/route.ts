import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { verifyIdentitySchema } from '@/lib/validators';
import { prembly } from '@/lib/prembly';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * POST /api/verification/verify-identity
 * Verify user identity via Prembly IdentityPass (NIN or BVN)
 *
 * Body: {
 *   verificationId: string,
 *   verificationType: 'nin' | 'bvn',
 *   number: string,
 *   firstName: string,
 *   lastName: string
 * }
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = verifyIdentitySchema.parse(body);

    // Fetch verification record
    const verification = await prisma.verification.findUnique({
      where: { id: validated.verificationId },
      include: {
        listing: true,
        owner: true,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'Verification record not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (verification.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if Layer 1 is approved
    if (verification.l1Status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Layer 1 must be approved before identity verification' },
        { status: 400 }
      );
    }

    // Call Prembly API based on verification type
    let premblyResponse;
    let identityData;

    try {
      if (validated.verificationType === 'nin') {
        premblyResponse = await prembly.verifyNIN(
          validated.number,
          validated.firstName,
          validated.lastName
        );

        if (premblyResponse.status === 'success') {
          identityData = {
            type: 'nin',
            number: validated.number,
            verified: true,
            firstName: premblyResponse.detail.firstname,
            lastName: premblyResponse.detail.surname,
            middleName: premblyResponse.detail.middlename,
            phone: premblyResponse.detail.phone,
            birthdate: premblyResponse.detail.birthdate,
            gender: premblyResponse.detail.gender,
            residenceState: premblyResponse.detail.residence_state,
            verificationReference: premblyResponse.verification_reference,
            verifiedAt: new Date().toISOString(),
          };
        } else {
          return NextResponse.json(
            {
              success: false,
              verified: false,
              message: 'NIN verification failed. Please check your details and try again.',
            },
            { status: 400 }
          );
        }
      } else if (validated.verificationType === 'bvn') {
        premblyResponse = await prembly.verifyBVN(
          validated.number,
          validated.firstName,
          validated.lastName
        );

        if (premblyResponse.status === 'success') {
          identityData = {
            type: 'bvn',
            number: validated.number,
            verified: true,
            firstName: premblyResponse.detail.firstname,
            lastName: premblyResponse.detail.surname,
            middleName: premblyResponse.detail.middlename,
            phone: premblyResponse.detail.phone,
            birthdate: premblyResponse.detail.birthdate,
            gender: premblyResponse.detail.gender,
            verificationReference: premblyResponse.verification_reference,
            verifiedAt: new Date().toISOString(),
          };
        } else {
          return NextResponse.json(
            {
              success: false,
              verified: false,
              message: 'BVN verification failed. Please check your details and try again.',
            },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid verification type' },
          { status: 400 }
        );
      }

      // Update verification record
      const updatedVerification = await prisma.verification.update({
        where: { id: verification.id },
        data: {
          l2Status: 'approved',
          l2IdType: validated.verificationType,
          l2VerifiedAt: new Date(),
          currentLayer: 3, // Move to Layer 3
          l3Status: 'pending',
          // Store identity data in a JSON field (you'll need to add this to schema)
          // identityData: identityData,
          // identityVerified: true,
          // identityVerificationType: validated.verificationType,
        },
      });

      // Update listing verification tier
      await prisma.listing.update({
        where: { id: verification.listingId },
        data: { verificationTier: 'verified' },
      });

      // Update user's identity verification status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          idVerified: true,
          idType: validated.verificationType,
        },
      });

      return NextResponse.json(
        {
          success: true,
          verified: true,
          message: 'Identity verified successfully!',
          data: {
            verification: updatedVerification,
            identityData: {
              firstName: identityData.firstName,
              lastName: identityData.lastName,
              birthdate: identityData.birthdate,
              phone: identityData.phone,
            },
          },
        },
        { status: 200 }
      );
    } catch (premblyError) {
      // Handle Prembly-specific errors
      if (premblyError instanceof Error) {
        const errorMessage = premblyError.message;

        if (errorMessage === 'PREMBLY_INVALID_CREDENTIALS') {
          return NextResponse.json(
            {
              success: false,
              error: 'Identity verification service is unavailable. Please try again later.',
            },
            { status: 503 }
          );
        }

        if (errorMessage === 'PREMBLY_RECORD_NOT_FOUND') {
          return NextResponse.json(
            {
              success: false,
              verified: false,
              message: `${validated.verificationType.toUpperCase()} not found. Please check the number and try again.`,
            },
            { status: 400 }
          );
        }

        if (errorMessage === 'PREMBLY_NAME_MISMATCH') {
          return NextResponse.json(
            {
              success: false,
              verified: false,
              message: 'Name does not match the records. Please check your details.',
            },
            { status: 400 }
          );
        }

        if (errorMessage === 'PREMBLY_RATE_LIMIT') {
          return NextResponse.json(
            {
              success: false,
              error: 'Too many verification attempts. Please try again in a few minutes.',
            },
            { status: 429 }
          );
        }

        if (errorMessage === 'PREMBLY_TIMEOUT') {
          return NextResponse.json(
            {
              success: false,
              error: 'Verification service timeout. Please try again.',
            },
            { status: 504 }
          );
        }
      }

      // Generic error
      console.error('Prembly verification error:', premblyError);
      return NextResponse.json(
        {
          success: false,
          error: 'Identity verification failed. Please try again later.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Identity verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
