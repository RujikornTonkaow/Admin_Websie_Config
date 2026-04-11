import type {
  SiteSettings,
  Hero,
  About,
  Skill,
  Project,
  Experience,
  SocialLink,
  ContactMessage,
} from '~/types/admin'

const now = new Date().toISOString()

export const mockSiteSettings: SiteSettings = {
  id: 'mock-1',
  site_title: 'Portfolio',
  page_title: 'Portfolio | Full-Stack Developer',
  meta_description: 'Full-Stack Developer portfolio showcasing projects, skills, and experience',
  footer_tagline: 'Crafting digital experiences',
  default_theme: 'midnight',
  profile_image: '',
  updated_at: now,
}

export const mockHero: Hero = {
  id: 'mock-1',
  greeting: "Hello, I'm",
  full_name: 'Puvakorn Pannasirichard',
  subtitle: 'Full-Stack Developer crafting performant, scalable web applications with modern technologies',
  cta_primary_text: 'View My Work',
  cta_primary_link: '#projects',
  cta_secondary_text: 'Get in Touch',
  cta_secondary_link: '#contact',
  updated_at: now,
}

export const mockAbout: About = {
  id: 'mock-1',
  title: 'Passionate about building great software',
  bio_paragraphs: [
    "I'm a Full-Stack Developer with a passion for creating elegant, efficient, and user-friendly web applications.",
    "When I'm not coding, you'll find me exploring new technologies and contributing to open-source projects.",
  ],
  personality_tags: ['Problem Solver', 'Team Player', 'Continuous Learner'],
  stats: [
    { value: '5+', label: 'Years Experience' },
    { value: '30+', label: 'Projects Completed' },
    { value: '15+', label: 'Happy Clients' },
    { value: '99%', label: 'Client Satisfaction' },
  ],
  updated_at: now,
}

export const mockSkills: Skill[] = [
  { id: 's1', name: 'Vue.js', icon: 'logos:vue', category: 'frontend', sort_order: 0, created_at: now, updated_at: now },
  { id: 's2', name: 'Nuxt', icon: 'logos:nuxt-icon', category: 'frontend', sort_order: 1, created_at: now, updated_at: now },
  { id: 's3', name: 'TypeScript', icon: 'logos:typescript-icon', category: 'frontend', sort_order: 2, created_at: now, updated_at: now },
  { id: 's4', name: 'TailwindCSS', icon: 'logos:tailwindcss-icon', category: 'frontend', sort_order: 3, created_at: now, updated_at: now },
  { id: 's5', name: 'Go', icon: 'logos:go', category: 'backend', sort_order: 4, created_at: now, updated_at: now },
  { id: 's6', name: 'Node.js', icon: 'logos:nodejs-icon-alt', category: 'backend', sort_order: 5, created_at: now, updated_at: now },
  { id: 's7', name: 'MongoDB', icon: 'logos:mongodb-icon', category: 'backend', sort_order: 6, created_at: now, updated_at: now },
  { id: 's8', name: 'Redis', icon: 'logos:redis', category: 'backend', sort_order: 7, created_at: now, updated_at: now },
  { id: 's9', name: 'Docker', icon: 'logos:docker-icon', category: 'devops', sort_order: 8, created_at: now, updated_at: now },
  { id: 's10', name: 'Kubernetes', icon: 'logos:kubernetes', category: 'devops', sort_order: 9, created_at: now, updated_at: now },
  { id: 's11', name: 'Git', icon: 'logos:git-icon', category: 'tools', sort_order: 10, created_at: now, updated_at: now },
  { id: 's12', name: 'Figma', icon: 'logos:figma', category: 'tools', sort_order: 11, created_at: now, updated_at: now },
]

export const mockProjects: Project[] = [
  {
    id: 'p1', title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform with real-time inventory management and payment processing.',
    tags: ['Nuxt 3', 'Go', 'MongoDB', 'Redis'], image: '', live_url: '', source_url: 'https://github.com',
    sort_order: 0, created_at: now, updated_at: now,
  },
  {
    id: 'p2', title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates and team features.',
    tags: ['Vue 3', 'Node.js', 'MongoDB', 'WebSocket'], image: '', live_url: '', source_url: 'https://github.com',
    sort_order: 1, created_at: now, updated_at: now,
  },
]

export const mockExperiences: Experience[] = [
  {
    id: 'e1', role: 'Senior Full-Stack Developer', company: 'Tech Company', period: '2024 - Present',
    description: 'Leading development of scalable web applications and microservices architecture.',
    highlights: [
      'Architected and built microservices handling 10K+ requests per second',
      'Reduced deployment time by 60% through CI/CD pipeline optimization',
      'Mentored junior developers and conducted code reviews',
    ],
    sort_order: 0, created_at: now, updated_at: now,
  },
  {
    id: 'e2', role: 'Full-Stack Developer', company: 'Digital Agency', period: '2021 - 2024',
    description: 'Developed custom web applications for diverse clients across multiple industries.',
    highlights: [
      'Delivered 20+ client projects on time and within budget',
      'Built reusable component library reducing development time by 40%',
    ],
    sort_order: 1, created_at: now, updated_at: now,
  },
]

export const mockSocialLinks: SocialLink[] = [
  { id: 'sl1', name: 'GitHub', url: 'https://github.com', icon: 'mdi:github', sort_order: 0, created_at: now, updated_at: now },
  { id: 'sl2', name: 'LinkedIn', url: 'https://linkedin.com', icon: 'mdi:linkedin', sort_order: 1, created_at: now, updated_at: now },
  { id: 'sl3', name: 'Twitter', url: 'https://twitter.com', icon: 'mdi:twitter', sort_order: 2, created_at: now, updated_at: now },
  { id: 'sl4', name: 'Email', url: 'mailto:hello@example.com', icon: 'mdi:email-outline', sort_order: 3, created_at: now, updated_at: now },
]

export const mockContacts: ContactMessage[] = [
  { id: 'c1', name: 'John Doe', email: 'john@example.com', subject: 'Project Discussion', message: 'Hi, I would like to discuss a potential project with you. We need a full-stack developer for our new platform.', is_read: false, created_at: now },
  { id: 'c2', name: 'Jane Smith', email: 'jane@company.com', subject: 'Job Opportunity', message: 'We have an exciting opportunity for a senior developer at our company. Would you be interested?', is_read: true, created_at: now },
  { id: 'c3', name: 'Bob Wilson', email: 'bob@startup.io', subject: 'Freelance Work', message: 'Looking for a freelance developer to help with our MVP. Budget is flexible.', is_read: false, created_at: now },
]
