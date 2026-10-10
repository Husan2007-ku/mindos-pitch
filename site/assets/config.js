/**
 * MindOS Pitch — yagona sozlama fayli.
 * Saytdagi o'zgaruvchan ma'lumotlarning HAMMASI shu yerda: jamoa, video, havolalar.
 * HTML'ga tegmasdan faqat shu faylni tahrirlang.
 */
window.MINDOS_CONFIG = {
  links: {
    app: "https://mindos-frontend.onrender.com",
    api: "https://mindos-api-dkq5.onrender.com",
    apiDocs: "https://mindos-api-dkq5.onrender.com/docs",
    github: "https://github.com/Husan2007-ku",
    // Telegram bot username (@siz). Bo'sh qolsa — saytda ko'rsatilmaydi.
    telegramBot: "",
  },

  // Demo-video. YouTube'ga "Unlisted" qilib yuklang va faqat ID'ni qo'ying:
  // https://www.youtube.com/watch?v=AbC123xyz  →  "AbC123xyz"
  video: {
    youtubeId: "",
    duration: "≈ 4 daqiqa",
  },

  // Jamoa. Yangi a'zo qo'shish uchun shu massivga obyekt qo'shing.
  // links: [{ label: "GitHub", url: "..." }]
  team: [
    {
      name: "Husan",
      role: "Founder · Full-stack & AI Engineer",
      bio: "MindOS'ning arxitekturasi, backend, frontend, AI agentlar va deploy — boshidan oxirigacha.",
      skills: ["Python", "FastAPI", "PostgreSQL + pgvector", "Next.js 14", "OpenAI API", "Telegram Bot API", "Docker", "Render"],
      links: [
        { label: "GitHub", url: "https://github.com/Husan2007-ku" },
        { label: "Telegram kanal", url: "https://t.me/AI_olami_1" },
      ],
    },
  ],

  // Jamoaga qidirilayotgan rollar. A'zo topilgach — bu yerdan olib, team'ga qo'shing.
  openRoles: [
    { role: "Product Designer (UI/UX)", why: "Yagona dizayn tizimi va mobil-first interfeys" },
    { role: "Metodist / pedagog", why: "Curriculum sifatini va baholash mezonlarini tekshirish" },
    { role: "Growth & community", why: "Pilot o'quvchilar, o'quv markazlari bilan hamkorlik" },
  ],
};
