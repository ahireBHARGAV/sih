import { prisma } from './prisma';

export async function getActiveMenteeCount(mentorId: string) {
  return prisma.pitch.count({
    where: { 
      mentorId, 
      status: { in: ["CONFIRMED", "DRAFT_WITH_MENTOR"] } 
    },
  });
}

export async function getMentorsWithLoad() {
  const mentors = await prisma.mentorProfile.findMany({
    where: { available: true },
    include: { user: true }
  });

  return Promise.all(mentors.map(async mentor => {
    const activeMenteeCount = await getActiveMenteeCount(mentor.id);
    return {
      ...mentor,
      activeMenteeCount
    };
  }));
}
