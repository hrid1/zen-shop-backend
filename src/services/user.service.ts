import prisma from "../config/database";

export class UserService {
  // get user profile
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) throw new Error("User not found");

    return user;
  }

  //   update profile
  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phoneNumber?: string },
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
      },
    });

    return updatedUser;
  }

  //   get Addresses
  async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // create address
  async createAddress(
    userId: string,
    data: {
      addressType: "SHIPPING" | "BILLING" | "BOTH";
      fullName: string;
      phoneNumber: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault?: boolean;
    },
  ) {
    // If this is default, unset others first
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: { ...data, userId },
    });
  }

  //   udpate address
  async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<{
      fullName: string;
      phoneNumber: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
    }>,
  ) {
    // Verify ownership
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) throw new Error("Address not found");

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) throw new Error("Address not found");

    await prisma.address.delete({ where: { id: addressId } });
    return { message: "Address deleted" };
  }
}
