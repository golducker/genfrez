export const site = {
  name: "GenFreZ",
  tagline: "Be Z, Be Fresh",
  mission:
    "Turn every bus ride, e-bike trip and green purchase in Hanoi into points young people can actually spend. Rewards track avoided emissions, not money spent.",
  demoUrl: "https://hackathon-i-hons-msop.vercel.app/",
  /** Paste a YouTube video ID here to show the demo video on the Solution page. */
  demoVideoId: "",
  event: "FTU-UQ i-HONS Business Hackathon 2026",
  city: "Hanoi",
  contactEmail: "team@genfrez.vn",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
    { label: "Zalo OA", href: "https://zalo.me/" },
    { label: "GitHub", href: "https://github.com/golducker/Hackathon-i-Hons" },
  ],
};

export type Member = {
  name: string;
  role: string;
  bio: string;
  /** Optional path under /public, e.g. "/team/linh.jpg". Falls back to dot-matrix initials. */
  photo?: string;
  linkedin?: string;
};

export const team: Member[] = [
  {
    name: "Nguyễn Bảo Linh",
    role: "Team lead · Business model",
    bio: "Owns the business model canvas: three customer groups, two-sided point economics and Year 1 numbers that survive a judge's spreadsheet.",
  },
  {
    name: "Lê Phạm Bảo Mai",
    role: "Partnerships",
    bio: "Maps the four partner tiers, from Zalo and FPT as foundation partners down to the bubble-tea chains students actually redeem at.",
  },
  {
    name: "Vũ Uyển Nhi",
    role: "Marketing · Community",
    bio: "Designs the campus ambassador programme, Green Challenges and the leaderboard that turns referral growth into a cost decision, not a media buy.",
  },
  {
    name: "Nguyễn Hà Thu",
    role: "Legal · Compliance",
    bio: "Keeps the model inside Decree 13/2023, Decree 52/2024 and the 2025 E-Commerce Law. The 'route, never hold funds' architecture starts here.",
  },
  {
    name: "Nguyễn Huy Minh",
    role: "Emissions model · Data",
    bio: "Built the emission-factor table and the four-tier verification architecture that gives every point a confidence coefficient.",
  },
  {
    name: "Lê Thịnh",
    role: "Product · Engineering",
    bio: "Built the Zalo Mini App demo, the points ledger flow and this site. Cares about the arithmetic being visible to the user.",
  },
];
