import { VerificationState } from "@prisma/client";

export function computeMatch(
  requiredSkillIds: string[], 
  studentSkills: { skillId: string; state: VerificationState }[]
) {
  const verifiedStates = ["MENTOR_ENDORSED", "VERIFIED", "INDUSTRY_VERIFIED"];
  const studentMap = new Map(studentSkills.map(s => [s.skillId, s.state]));

  let verified = 0, developing = 0;
  const missing: string[] = [];
  
  for (const skillId of requiredSkillIds) {
    const state = studentMap.get(skillId);
    if (state && verifiedStates.includes(state)) {
      verified++;
    } else if (state) {
      developing++;
    } else {
      missing.push(skillId);
    }
  }

  const percentage = requiredSkillIds.length > 0 
    ? Math.round((verified / requiredSkillIds.length) * 100)
    : 100;
    
  return { 
    requiredCount: requiredSkillIds.length, 
    verified, 
    developing, 
    missing, 
    percentage 
  };
}
