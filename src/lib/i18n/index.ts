// lib/i18n/index.ts — Internationalization support

export const supportedLocales = [
  "en", // English
  "hi", // Hindi
  "bn", // Bengali
  "es", // Spanish
  "fr", // French
  "de", // German
  "ja", // Japanese
  "zh", // Chinese
  "ar", // Arabic
  "pt", // Portuguese
  "ko", // Korean
  "ru", // Russian
] as const;

export const translations: Record<Locale, I18nStrings> = {
  en: {
    stats: "GitHub Stats",
    streak: "GitHub Streak",
    topLanguages: "Most Used Languages",
    totalStars: "Total Stars",
    totalForks: "Total Forks",
    totalCommits: "Total Commits",
    totalPRs: "Total PRs",
    totalIssues: "Total Issues",
    activeRepos: "Active Repos (1y)",
    currentStreak: "Current Streak",
    longestStreak: "Longest Streak",
    totalContributions: "Total Contributions",
    mostUsedLanguages: "Most Used Languages",
  },
  hi: {
    stats: "GitHub आँकड़े",
    streak: "GitHub स्ट्रीक",
    topLanguages: "सबसे ज्यादा इस्तेमाल की गई भाषाएँ",
    totalStars: "कुल स्टार",
    totalForks: "कुल फोर्क",
    totalCommits: "कुल कमिट",
    totalPRs: "कुल PR",
    totalIssues: "कुल इश्यू",
    activeRepos: "सक्रिय रेपो (1 वर्ष)",
    currentStreak: "वर्तमान स्ट्रीक",
    longestStreak: "सबसे लंबी स्ट्रीक",
    totalContributions: "कुल योगदान",
    mostUsedLanguages: "सबसे ज्यादा इस्तेमाल की गई भाषाएँ",
  },
  bn: {
    stats: "GitHub পরিসংখ্যান",
    streak: "GitHub স্ট্রিক",
    topLanguages: "সর্বাধিক ব্যবহৃত ভাষাসমূহ",
    totalStars: "মোট স্টার",
    totalForks: "মোট ফোর্ক",
    totalCommits: "মোট কমিট",
    totalPRs: "মোট PR",
    totalIssues: "মোট ইস্যু",
    activeRepos: "সক্রিয় রেপো (১ বছর)",
    currentStreak: "বর্তমান স্ট্রিক",
    longestStreak: "দীর্ঘতম স্ট্রিক",
    totalContributions: "মোট অবদান",
    mostUsedLanguages: "সর্বাধিক ব্যবহৃত ভাষাসমূহ",
  },
  es: {
    stats: "Estadísticas de GitHub",
    streak: "Racha de GitHub",
    topLanguages: "Lenguajes más usados",
    totalStars: "Total de Estrellas",
    totalForks: "Total de Forks",
    totalCommits: "Total de Commits",
    totalPRs: "Total de PRs",
    totalIssues: "Total de Issues",
    activeRepos: "Repos activos (1a)",
    currentStreak: "Racha actual",
    longestStreak: "Racha más larga",
    totalContributions: "Total de contribuciones",
    mostUsedLanguages: "Lenguajes más usados",
  },
  fr: {
    stats: "Statistiques GitHub",
    streak: "Série GitHub",
    topLanguages: "Langages les plus utilisés",
    totalStars: "Total Étoiles",
    totalForks: "Total Forks",
    totalCommits: "Total Commits",
    totalPRs: "Total PRs",
    totalIssues: "Total Issues",
    activeRepos: "Dépôts actifs (1a)",
    currentStreak: "Série actuelle",
    longestStreak: "Plus longue série",
    totalContributions: "Total des contributions",
    mostUsedLanguages: "Langages les plus utilisés",
  },
  de: {
    stats: "GitHub Statistiken",
    streak: "GitHub Streak",
    topLanguages: "Meistgenutzte Sprachen",
    totalStars: "Gesamte Sterne",
    totalForks: "Gesamte Forks",
    totalCommits: "Gesamte Commits",
    totalPRs: "Gesamte PRs",
    totalIssues: "Gesamte Issues",
    activeRepos: "Aktive Repos (1J)",
    currentStreak: "Aktuelle Serie",
    longestStreak: "Längste Serie",
    totalContributions: "Gesamtbeiträge",
    mostUsedLanguages: "Meistgenutzte Sprachen",
  },
  ja: {
    stats: "GitHub 統計",
    streak: "GitHub ストリーク",
    topLanguages: "最もよく使われる言語",
    totalStars: "スター合計",
    totalForks: "フォーク合計",
    totalCommits: "コミット合計",
    totalPRs: "PR 合計",
    totalIssues: "イシュー合計",
    activeRepos: "アクティブなリポジトリ (1年)",
    currentStreak: "現在のストリーク",
    longestStreak: "最長ストリーク",
    totalContributions: "総コントリビューション",
    mostUsedLanguages: "最もよく使われる言語",
  },
  zh: {
    stats: "GitHub 统计",
    streak: "GitHub 连续提交",
    topLanguages: "最常用语言",
    totalStars: "总 Stars",
    totalForks: "总 Forks",
    totalCommits: "总提交数",
    totalPRs: "总 PRs",
    totalIssues: "总 Issues",
    activeRepos: "活跃仓库（1年）",
    currentStreak: "当前连续提交",
    longestStreak: "最长连续提交",
    totalContributions: "总贡献数",
    mostUsedLanguages: "最常用语言",
  },
  ar: {
    stats: "إحصائيات GitHub",
    streak: "سلسلة GitHub",
    topLanguages: "اللغات الأكثر استخدامًا",
    totalStars: "مجموع النجوم",
    totalForks: "مجموع الشعب",
    totalCommits: "مجموع الالتزامات",
    totalPRs: "مجموع طلبات السحب",
    totalIssues: "مجموع المشكلات",
    activeRepos: "المستودعات النشطة (سنة)",
    currentStreak: "السلسلة الحالية",
    longestStreak: "أطول سلسلة",
    totalContributions: "مجموع المساهمات",
    mostUsedLanguages: "اللغات الأكثر استخدامًا",
  },
  pt: {
    stats: "Estatísticas do GitHub",
    streak: "Sequência do GitHub",
    topLanguages: "Linguagens mais usadas",
    totalStars: "Total de Estrelas",
    totalForks: "Total de Forks",
    totalCommits: "Total de Commits",
    totalPRs: "Total de PRs",
    totalIssues: "Total de Issues",
    activeRepos: "Repos ativos (1a)",
    currentStreak: "Sequência atual",
    longestStreak: "Maior sequência",
    totalContributions: "Total de contribuições",
    mostUsedLanguages: "Linguagens mais usadas",
  },
  ko: {
    stats: "GitHub 통계",
    streak: "GitHub 스트릭",
    topLanguages: "가장 많이 사용한 언어",
    totalStars: "총 스타",
    totalForks: "총 포크",
    totalCommits: "총 커밋",
    totalPRs: "총 PR",
    totalIssues: "총 이슈",
    activeRepos: "활성 저장소 (1년)",
    currentStreak: "현재 스트릭",
    longestStreak: "최장 스트릭",
    totalContributions: "총 기여",
    mostUsedLanguages: "가장 많이 사용한 언어",
  },
  ru: {
    stats: "Статистика GitHub",
    streak: "Серия GitHub",
    topLanguages: "Наиболее используемые языки",
    totalStars: "Всего звёзд",
    totalForks: "Всего форков",
    totalCommits: "Всего коммитов",
    totalPRs: "Всего PR",
    totalIssues: "Всего задач",
    activeRepos: "Активные репо (1 год)",
    currentStreak: "Текущая серия",
    longestStreak: "Самая длинная серия",
    totalContributions: "Всего вкладов",
    mostUsedLanguages: "Наиболее используемые языки",
  },
};

export function translate(locale: Locale | undefined, key: keyof I18nStrings): string {
  const lang = locale ?? "en";
  return translations[lang]?.[key] ?? translations.en[key];
}

export type Locale = (typeof supportedLocales)[number];

export type I18nStrings = {
  stats: string;
  streak: string;
  topLanguages: string;
  totalStars: string;
  totalForks: string;
  totalCommits: string;
  totalPRs: string;
  totalIssues: string;
  activeRepos: string;
  currentStreak: string;
  longestStreak: string;
  totalContributions: string;
  mostUsedLanguages: string;
};
