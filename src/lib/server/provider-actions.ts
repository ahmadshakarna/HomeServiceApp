import { and, asc, eq } from "drizzle-orm";
import { db } from "./db/client";

import {
  providerServices,
  serviceProviders,
  services,
  providerAvailability,
} from "./db/schema";


// ========================================
// GET PROVIDERS BY SERVICE
// ========================================

export const getProvidersByService = async (
  serviceId: string
) => {
  const rows = await db
    .select({
      providerServiceId: providerServices.id,

      priceAgorot: providerServices.priceAgorot,

      provider: {
        id: serviceProviders.id,
        fullName: serviceProviders.fullName,
        phone: serviceProviders.phone,
        email: serviceProviders.email,
        profileImage: serviceProviders.profileImage,
        bio: serviceProviders.bio,
        city: serviceProviders.city,
        experienceYears:
          serviceProviders.experienceYears,
        isVerified:
          serviceProviders.isVerified,
      },
    })

    .from(providerServices)

    .innerJoin(
      serviceProviders,
      eq(
        providerServices.providerId,
        serviceProviders.id
      )
    )

    .where(
  and(
    eq(
      providerServices.serviceId,
      serviceId
    ),

    eq(
      providerServices.isAvailable,
      true
    ),

    eq(
      serviceProviders.isActive,
      true
    ),

    eq(
      serviceProviders.approvalStatus,
      "approved"
    )
  )
)

    .orderBy(
      asc(serviceProviders.fullName)
    );

  return rows;
};


// ========================================
// GET PROVIDER BY ID
// ========================================

export const getProviderById = async (
  providerId: string
) => {
  const providerRows = await db
    .select()
    .from(serviceProviders)

    .where(
  and(
    eq(
      serviceProviders.id,
      providerId
    ),

    eq(
      serviceProviders.isActive,
      true
    ),

    eq(
      serviceProviders.approvalStatus,
      "approved"
    )
  )
)

    .limit(1);

  const provider = providerRows[0];

  if (!provider) {
    return null;
  }


  // الخدمات التي يقدمها Provider
  const providerServiceRows = await db
    .select({
      providerServiceId:
        providerServices.id,

      priceAgorot:
        providerServices.priceAgorot,

      service: {
        id: services.id,
        categoryId: services.categoryId,
        name: services.name,
        slug: services.slug,
        description: services.description,
        icon: services.icon,
      },
    })

    .from(providerServices)

    .innerJoin(
      services,
      eq(
        providerServices.serviceId,
        services.id
      )
    )

    .where(
      and(
        eq(
          providerServices.providerId,
          providerId
        ),

        eq(
          providerServices.isAvailable,
          true
        ),

        eq(
          services.isActive,
          true
        )
      )
    );

    // أوقات دوام مقدم الخدمة
const availabilityRows = await db
  .select({
    id: providerAvailability.id,
    dayOfWeek: providerAvailability.dayOfWeek,
    startTime: providerAvailability.startTime,
    endTime: providerAvailability.endTime,
    isAvailable: providerAvailability.isAvailable,
  })
  .from(providerAvailability)
  .where(
    eq(
      providerAvailability.providerId,
      providerId
    )
  )
  .orderBy(
    asc(providerAvailability.dayOfWeek)
  );

  return {
    provider,
    services: providerServiceRows,
    availability: availabilityRows,
  };
};