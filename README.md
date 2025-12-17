# GitHub README Cards

Beautiful, dynamic, and self-hostable **GitHub profile cards** built with **Next.js**, designed for GitHub profile owners, open-source contributors, and developers who want full control over their README visuals.
Generate clean image cards like **Stats**, **Streak**, **Top Languages**, and more — fully controlled by **your own GitHub token**.

> Fork it. Configure it. Deploy it. Own your cards.

---

## ✨ Features

* 📊 GitHub Stats Card
* 🔥 GitHub Streak Card
* 🌐 Top Languages Card
* 🚀 More cards coming soon
* 🖼️ Optimized image responses (perfect for README usage)
* 🔐 Uses **your own GitHub token** (no shared limits)
* 🌍 Deploy anywhere (Vercel recommended)

---

## 🧱 Card Endpoints

All cards support **Light** and **Dark** mode.

Append `/dark` to any endpoint to enable dark mode.

| Card          | Light Mode  | Dark Mode        | Size        |
| ------------- | ----------- | ---------------- | ----------- |
| GitHub Stats  | `/stats`    | `/stats/dark`    | `440 × 210` |
| GitHub Streak | `/streak`   | `/streak/dark`   | `440 × 210` |
| Top Languages | `/top-lang` | `/top-lang/dark` | `300 × 160` |

Example usage in README (basic):

```md
![GitHub Stats](https://your-domain.vercel.app/stats)
![GitHub Stats Dark](https://your-domain.vercel.app/stats/dark)

![GitHub Streak](https://your-domain.vercel.app/streak/dark)
![Top Languages](https://your-domain.vercel.app/top-lang/dark)
```

### Auto Dark Mode (Recommended)

Use the `<picture>` tag to automatically switch cards based on the viewer’s theme:

```html
<p align="center">
  <picture>
    <source
      srcset="https://your-domain.vercel.app/streak/dark"
      media="(prefers-color-scheme: dark)"
    />
    <img
      src="https://your-domain.vercel.app/streak"
      alt="GitHub Streak"
      style="width:100%; max-width:600px;"
    />
  </picture>
</p>
```

---

## 📁 Project Structure

```txt
github-readme-cards/
├── app/
│   ├── stats/          # GitHub stats image route
│   ├── streak/         # Contribution streak card
│   └── top-lang/       # Top languages card
│
├── lib/
│   └── colors.ts       # Theme & color configuration
│
├── public/             # Static assets
│
├── .env.example        # Environment variable template
├── next.config.js
├── package.json
├── README.md
└── LICENSE
```

---

## 🎨 Theme & Color Customization

You can fully customize the **look and feel** of all cards by editing a single file:

```ts
lib/colors.ts
```

### Supported Theme Modes

The project supports two built-in theme modes:

* `light`
* `dark`

These are automatically selected based on the endpoint (`/dark`) or user preference.

### Color Schema

Each theme follows a strict and type-safe color contract:

```ts
export type ThemeMode = "light" | "dark";

export type CardColors = {
  bg: string;
  border: string;
  divider: string;

  primary: string;
  secondary: string;
  accent: string;
  textMuted: string;
  text: string;
};
```

### Default Color Palettes

```ts
export const colors: Record<ThemeMode, CardColors> = {
  dark: {
    bg: "#15141B",
    border: "#000000",
    divider: "#E4E2E2",

    primary: "#A277FF",     // purple
    secondary: "#61FFCA",   // green
    accent: "#FFCA85",      // yellow
    textMuted: "#9CA3AF",
    text: "#FFFFFF",
  },

  light: {
    bg: "#fcfff1",
    border: "#E5E7EB",
    divider: "#E5E7EB",

    primary: "#5A2DFF",
    secondary: "#0F766E",
    accent: "#D97706",
    textMuted: "#6B7280",
    text: "#111827",
  },
};
```

### How to Change Colors

1. Open `lib/colors.ts`
2. Modify any color value (hex, rgb, etc.)
3. Save and redeploy

All cards will automatically reflect your new theme — no other code changes required.

> 💡 Tip: You can create your own brand theme or match your GitHub profile colors easily.

---

## 🔑 Environment Variables

Create a `.env.local` file (or configure on Vercel):

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
GITHUB_JOINING_YEAR=2023
NEXT_PUBLIC_GITHUB_USERNAME=CodesWithSubham
```

### Variable Explanation

| Variable                      | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `GITHUB_TOKEN`                | Personal Access Token for GitHub API           |
| `GITHUB_JOINING_YEAR`         | Year you joined GitHub (used for streak logic) |
| `NEXT_PUBLIC_GITHUB_USERNAME` | GitHub username to render cards for            |

---

## 🧠 How to Get a GitHub Token (Step-by-Step)

1. Go to **GitHub → Settings**
2. Navigate to **Developer settings**
3. Open **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token (classic)**

### Recommended Settings

* **Note:** `GitHub Readme Cards`
* **Expiration:** `No expiration` (or your choice)
* **Scopes:**

  * ✅ `read:user`
  * ✅ `repo` *(only if private repos needed)*

5. Click **Generate token**
6. Copy the token **once** and store it safely

⚠️ **Never commit your token to GitHub**

---

## 🚀 Deployment (Vercel – Recommended)

### 1️⃣ Fork the Repository

Click **Fork** on the top-right of this repo.

### 2️⃣ Import to Vercel

* Go to [https://vercel.com](https://vercel.com)
* Click **New Project**
* Select your forked repository

### 3️⃣ Add Environment Variables

In **Project Settings → Environment Variables** add:

* `GITHUB_TOKEN`
* `GITHUB_JOINING_YEAR`
* `NEXT_PUBLIC_GITHUB_USERNAME`

### 4️⃣ Deploy 🎉

Once deployed, your cards will be available at:

```txt
https://your-project.vercel.app/stats
https://your-project.vercel.app/streak
https://your-project.vercel.app/top-lang
```

---

## 🧩 Self Hosting (Optional)

```bash
git clone https://github.com/your-username/github-readme-cards
cd github-readme-cards
pnpm install
pnpm dev
```

---

## 🛡️ Security Notes

* Tokens are **server-side only**
* Rate limits depend on **your own token**
* Never expose `GITHUB_TOKEN` publicly

---

## 🧪 Roadmap

Planned features are ordered from most-requested to long-term ideas. Community contributions are welcome!

* ⏳ Contribution graph card
* ⏳ Repo showcase card
* ⏳ Theme & color customization
* ⏳ Custom dimensions support

---

## 📄 License

MIT License © Subham Duary

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🍴 Fork it
* 🐛 Open issues
* 🧠 Suggest features

Happy hacking! 🚀
