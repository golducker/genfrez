export const site = {
  name: "GenFreZ",
  tagline: "Turn Green into Gains",
  subTagline: "Be Z, Be Fresh",
  mission:
    "Make greener moves. Earn rewards you actually want. Ride, walk, share or switch. GenFreZ turns your everyday green choices into points you can spend.",
  url: "https://genfrez.vercel.app",
  demoUrl: "https://hackathon-i-hons-msop.vercel.app/",
  /** Paste a YouTube video ID here to show the demo video on the Solution page. */
  demoVideoId: "",
  /** Local demo video. Drop the file into frontend/public/ and it shows on the Solution page automatically. */
  demoVideoFile: "demo.mp4",
  demoVideoPoster: "demo-poster.jpg",
  event: "FTU-UQ i-HONS Business Hackathon 2026",
  city: "Hanoi",
  contactEmail: "customerservice@genfrez.vn",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ftu-uq-ihons" },
    { label: "Facebook", href: "https://web.facebook.com/CTTT.iHonsUQ" },
    { label: "Zalo OA", href: "https://youtu.be/dQw4w9WgXcQ" },
    { label: "GitHub", href: "https://github.com/golducker" },
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
    role: "Business model",
    bio: "Owns the business model canvas. Her Year 1 numbers survive a judge's spreadsheet.",
    photo: "/team/linh.jpg",
  },
  {
    name: "Lê Phạm Bảo Mai",
    role: "Partnerships",
    bio: "Maps the four partner tiers, from Zalo and FPT as foundation partners down to the bubble-tea chains students actually redeem at, and sets how each partner group pays.",
    photo: "/team/mai.jpg",
  },
  {
    name: "Vũ Uyển Nhi",
    role: "Marketing · Community",
    bio: "Runs the campus ambassador programme and Green Challenges. Growth comes from friends inviting friends, not ads.",
    photo: "/team/nhi.jpg",
  },
  {
    name: "Nguyễn Hà Thu",
    role: "Legal · Compliance",
    bio: "Keeps the model inside Decree 13/2023, Decree 52/2024 and the 2025 E-Commerce Law. The 'route, never hold funds' architecture starts here.",
    photo: "/team/thu.jpg",
  },
  {
    name: "Nguyễn Huy Minh",
    role: "Emissions model · Data",
    bio: "Built the emission-factor table and the four-tier verification system. Every point's confidence coefficient comes from his model.",
    photo: "/team/minh.jpg",
  },
  {
    name: "Lê Thịnh",
    role: "Product · Engineering",
    bio: "Built the Mini App demo and this site. Wants every user to see the maths behind their points.",
    photo: "/team/thinh.jpg",
  },
];
