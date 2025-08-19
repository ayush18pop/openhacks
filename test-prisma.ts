// Test file to verify Prisma types
import { prisma } from "./src/lib/prisma";

async function testPrismaTypes() {
  // Test if EventRole model exists
  const eventRoles = await prisma.eventRole.findMany();
  console.log("EventRole model works:", eventRoles);

  // Test if User includes eventRoles
  const user = await prisma.user.findFirst({
    include: {
      eventRoles: true,
    }
  });
  console.log("User with eventRoles works:", user);
}

export default testPrismaTypes;
