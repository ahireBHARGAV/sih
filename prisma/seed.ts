import { PrismaClient, UserRole, SkillCategory, IndustrySector, OpportunityType, VerificationState, ProblemStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data (in reverse dependency order)
  await prisma.adminFlag.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.pitch.deleteMany()
  await prisma.problem.deleteMany()
  await prisma.application.deleteMany()
  await prisma.opportunitySkill.deleteMany()
  await prisma.opportunity.deleteMany()
  await prisma.industryRequirement.deleteMany()
  await prisma.studentSkill.deleteMany()
  await prisma.facultyEngagement.deleteMany()
  
  await prisma.studentProfile.deleteMany()
  await prisma.industryProfile.deleteMany()
  await prisma.facultyProfile.deleteMany()
  await prisma.institutionProfile.deleteMany()
  await prisma.mentorProfile.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Skills (50+ Skills)
  const techSkills = [
    'React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'C++',
    'Go', 'Rust', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'PostgreSQL', 'MongoDB', 'Redis',
    'GraphQL', 'REST APIs', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision',
    'Data Analysis', 'Pandas', 'SQL', 'Spark', 'Hadoop', 'Tableau', 'PowerBI', 'Figma', 'UI/UX Design', 'Wireframing', 'Git'
  ].map(name => ({ name, category: SkillCategory.TECH }))

  const ayushSkills = [
    'Ayurveda Basics', 'Panchakarma', 'Yoga Therapy', 'Naturopathy', 'Herbal Formulation', 'Dietetics', 'Acupuncture',
    'GMP compliance', 'regulatory documentation', 'Clinical documentation', 'patient counselling', 'Biostatistics', 'literature review methodology'
  ].map(name => ({ name, category: SkillCategory.AYUSH_ALLIED }))

  const softSkills = [
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking', 'Time Management', 'Agile/Scrum'
  ].map(name => ({ name, category: SkillCategory.SOFT_SKILL }))

  await prisma.skill.createMany({
    data: [...techSkills, ...ayushSkills, ...softSkills],
    skipDuplicates: true
  })
  
  const allSkills = await prisma.skill.findMany()
  const getSkill = (name: string) => allSkills.find(s => s.name === name)!

  // 2. Create Users & Profiles
  // Students
  const studentsData = [
    { name: 'Ananya Sharma', email: 'ananya@student.com', role: UserRole.STUDENT, institutionName: 'IIT Bombay', xp: 450, level: 'Apprentice', targetRole: 'Frontend Developer', skills: ['React', 'TypeScript', 'Communication'] },
    { name: 'Rahul Patel', email: 'rahul@student.com', role: UserRole.STUDENT, institutionName: 'BITS Pilani', xp: 820, level: 'Practitioner', skills: ['Python', 'Machine Learning', 'Data Analysis'] },
    { name: 'Vikram Singh', email: 'vikram@student.com', role: UserRole.STUDENT, institutionName: 'AIIA New Delhi', xp: 300, level: 'Explorer', skills: ['Ayurveda Basics', 'Yoga Therapy'] },
    { name: 'Priya Gupta', email: 'priya@student.com', role: UserRole.STUDENT, institutionName: 'NID Ahmedabad', xp: 950, level: 'Expert', skills: ['Figma', 'UI/UX Design', 'React'] },
    { name: 'Rohan Verma', email: 'rohan@student.com', role: UserRole.STUDENT, institutionName: 'IIT Delhi', xp: 120, level: 'Explorer', skills: ['Java', 'Spring Boot'] },
  ]

  // Create Institutions First
  const institutionsData = [
    { name: 'IIT Bombay', email: 'admin@iitb.ac.in' },
    { name: 'BITS Pilani', email: 'admin@bits.ac.in' },
    { name: 'AIIA New Delhi', email: 'admin@aiia.ac.in' },
    { name: 'NID Ahmedabad', email: 'admin@nid.ac.in' },
    { name: 'IIT Delhi', email: 'admin@iitd.ac.in' },
    { name: 'IISc Bangalore', email: 'admin@iisc.ac.in' },
  ];
  
  const instMap: Record<string, string> = {};
  for (const inst of institutionsData) {
    const user = await prisma.user.create({
      data: {
        name: inst.name + ' Admin',
        email: inst.email,
        role: UserRole.INSTITUTION,
        institutionProfile: { create: { name: inst.name } }
      },
      include: { institutionProfile: true }
    });
    instMap[inst.name] = user.institutionProfile!.id;
  }

  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        role: s.role,
        studentProfile: {
          create: {
            institutionId: instMap[s.institutionName],
            interests: s.skills,
            xp: s.xp,
            level: s.level,
            employabilityScore: Math.floor(Math.random() * 100)
          }
        }
      },
      include: { studentProfile: true }
    })
    
    // Add skills to student
    for (const skillName of s.skills) {
      await prisma.studentSkill.create({
        data: {
          studentId: user.studentProfile!.id,
          skillId: getSkill(skillName).id,
          state: VerificationState.MENTOR_ENDORSED, // Mock some as mentor endorsed
          proficiencyScore: Math.floor(Math.random() * 40) + 60 // 60-100
        }
      })
    }
  }

  // Industry
  const industryData = [
    { name: 'TechNova Solutions', email: 'hr@technova.com', companyName: 'TechNova Solutions', sector: IndustrySector.TECH, verified: true },
    { name: 'Vedanta Ayurveda Pharma', email: 'careers@vedanta.com', companyName: 'Vedanta Ayurveda Pharma', sector: IndustrySector.AYUSH_PHARMA, verified: true },
    { name: 'Himalaya Wellness Group', email: 'talent@himalaya.com', companyName: 'Himalaya Wellness Group', sector: IndustrySector.AYUSH_PHARMA, verified: true },
    { name: 'AIIA Research Cell', email: 'hiring@aiia.com', companyName: 'AIIA Research Cell', sector: IndustrySector.RESEARCH, verified: true },
  ]

  const industryProfiles = []
  for (const ind of industryData) {
    const user = await prisma.user.create({
      data: {
        name: ind.name,
        email: ind.email,
        role: UserRole.INDUSTRY,
        industryProfile: {
          create: {
            companyName: ind.companyName,
            sector: ind.sector,
            verified: ind.verified
          }
        }
      },
      include: { industryProfile: true }
    })
    industryProfiles.push(user.industryProfile!)
  }

  // Mentor
  const mentorUser = await prisma.user.create({
    data: {
      name: 'Dr. Rajesh Kumar', email: 'rajesh@mentor.com', role: UserRole.MENTOR,
      mentorProfile: {
        create: {
          tier: 'Expert',
          verified: true,
          expertiseTags: ['React', 'Next.js', 'Machine Learning']
        }
      }
    },
    include: { mentorProfile: true }
  });

  await prisma.user.create({
    data: {
      name: 'Prof. Anjali Desai', email: 'anjali@academic.com', role: UserRole.ACADEMICIAN,
      facultyProfile: { create: { institutionId: instMap['IISc Bangalore'], expertiseTags: ['Research', 'Physics'] } }
    }
  })

  // 3. Create Opportunities & Problems
  const techNova = industryProfiles.find(p => p.companyName === 'TechNova Solutions')!
  const vedanta = industryProfiles.find(p => p.companyName === 'Vedanta Ayurveda Pharma')!
  const himalaya = industryProfiles.find(p => p.companyName === 'Himalaya Wellness Group')!
  const aiia = industryProfiles.find(p => p.companyName === 'AIIA Research Cell')!

  // Opportunities & Requirements
  await prisma.industryRequirement.createMany({
    data: [
      { industryId: techNova.id, roleTitle: 'Frontend Developer', skillId: getSkill('React').id, priority: 1 },
      { industryId: techNova.id, roleTitle: 'Frontend Developer', skillId: getSkill('Next.js').id, priority: 2 },
      { industryId: techNova.id, roleTitle: 'Frontend Developer', skillId: getSkill('TypeScript').id, priority: 1 },
      { industryId: techNova.id, roleTitle: 'Frontend Developer', skillId: getSkill('REST APIs').id, priority: 3 },
    ]
  });

  const opp1 = await prisma.opportunity.create({
    data: {
      industryId: techNova.id, title: 'Frontend Developer Intern', type: OpportunityType.INTERNSHIP,
      description: 'Join our team to build scalable UIs using React and Next.js.', location: 'Remote', workMode: 'Hybrid',
      requiredSkills: { create: [{ skillId: getSkill('React').id }, { skillId: getSkill('REST APIs').id }, { skillId: getSkill('Git').id }] }
    }
  })

  await prisma.opportunity.create({
    data: {
      industryId: techNova.id, title: 'Junior Backend Engineer', type: OpportunityType.JOB,
      description: 'Looking for a backend engineer who knows Node.js and PostgreSQL.', location: 'New York, NY', workMode: 'On-site',
      requiredSkills: { create: [{ skillId: getSkill('Node.js').id }, { skillId: getSkill('SQL').id }, { skillId: getSkill('PostgreSQL').id }] }
    }
  })

  await prisma.opportunity.create({
    data: {
      industryId: vedanta.id, title: 'Regulatory Affairs Intern', type: OpportunityType.INTERNSHIP,
      description: 'Help ensure GMP compliance for our new Ayurvedic product line.', location: 'Mumbai, India', workMode: 'On-site',
      requiredSkills: { create: [{ skillId: getSkill('GMP compliance').id }, { skillId: getSkill('regulatory documentation').id }] }
    }
  })

  // Problems
  const prob1 = await prisma.problem.create({
    data: {
      industryId: techNova.id, title: 'Build a Skill-Matching API Endpoint',
      problemStatement: 'We need a fast matching algorithm in SQL/REST.', deliverable: 'Github repo with a working API.', rubric: 'Accuracy: 50%, Speed: 50%',
      reviewerId: mentorUser.mentorProfile!.id, reviewTurnaroundDays: 3, status: ProblemStatus.LIVE, skillId: getSkill('REST APIs').id,
    }
  })

  const prob2 = await prisma.problem.create({
    data: {
      industryId: himalaya.id, title: 'Patient Intake Documentation Redesign',
      problemStatement: 'Redesign our clinical intake forms for better patient counselling workflows.', deliverable: 'PDF of new forms and protocol doc.', rubric: 'Clarity: 50%, Compliance: 50%',
      reviewerId: mentorUser.mentorProfile!.id, reviewTurnaroundDays: 4, status: ProblemStatus.LIVE, skillId: getSkill('Clinical documentation').id,
    }
  })

  const prob3 = await prisma.problem.create({
    data: {
      industryId: aiia.id, title: 'Literature Review: Panchakarma Outcomes',
      problemStatement: 'Conduct a biostatistical literature review of Panchakarma efficacy.', deliverable: '10-page review paper.', rubric: 'Methodology: 60%, Writing: 40%',
      reviewerId: mentorUser.mentorProfile!.id, reviewTurnaroundDays: 5, status: ProblemStatus.LIVE, skillId: getSkill('Biostatistics').id,
    }
  })

  // Pitches
  const evan = await prisma.studentProfile.findFirst({ where: { user: { name: 'Rohan Verma' } } })
  const diana = await prisma.studentProfile.findFirst({ where: { user: { name: 'Priya Gupta' } } })
  const alice = await prisma.studentProfile.findFirst({ where: { user: { name: 'Ananya Sharma' } } })

  // 1. PITCHED (Ananya active pitch)
  await prisma.pitch.create({
    data: {
      problemId: prob1.id, studentId: alice!.id,
      pitchText: 'I have experience building REST APIs with Spring Boot. I can deliver this.',
      matchPercentage: 85, matchReason: 'Strong match on REST APIs.',
      status: 'PITCHED'
    }
  })

  // 2. CONFIRMED
  const pitch2 = await prisma.pitch.create({
    data: {
      problemId: prob2.id, studentId: diana!.id,
      pitchText: 'I can redesign the intake forms using Figma and ensure compliance.',
      matchPercentage: 90, matchReason: 'Excellent skills in documentation.',
      status: 'CONFIRMED', mentorId: mentorUser.mentorProfile!.id
    }
  })

  // 3. SCORED
  const pitch3 = await prisma.pitch.create({
    data: {
      problemId: prob3.id, studentId: evan!.id,
      pitchText: 'I have a background in literature review. Here is my draft.',
      draftContent: 'Literature Review: Panchakarma Outcomes\n\nAbstract:\nPanchakarma is an Ayurvedic treatment...',
      matchPercentage: 95, matchReason: 'Expert in biostatistics.',
      status: 'SCORED', mentorId: mentorUser.mentorProfile!.id, industryScore: 92, industryRemarks: 'Excellent comprehensive review.'
    }
  })

  // Applications
  await prisma.application.create({
    data: {
      studentId: alice!.id,
      opportunityId: opp1.id,
      stage: 'SHORTLISTED'
    }
  })

  console.log('Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
