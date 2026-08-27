# Thoughts To Pen

[![Website](https://img.shields.io/badge/Website-thoughtstopen.com-blue?style=flat-square)](https://thoughtstopen.com)
[![Jekyll Version](https://img.shields.io/badge/Jekyll-v4.4.1-red?style=flat-square&logo=jekyll)](https://jekyllrb.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[ThoughtsToPen](https://thoughtstopen.com)** is a personal publication and digital garden dedicated to sharing in-depth insights, practical tutorials, and thought-provoking perspectives across software engineering, algorithmic trading, personal finance, psychology, and creative writing.

---

## 🚀 Key Topics & Sections

- **💻 Computer Programming & Architecture**: Deep dives into modern Java (Java 8 to Java 25), Virtual Threads, Spring Boot, system design, and algorithms.
- **📈 Algorithmic Trading**: Strategies, real-time market data integration, and execution engines (e.g., Shoonya API).
- **💰 Personal Finance**: Practical financial literacy, TFSA growth models, and interactive calculators.
- **🧠 Psychology & Mindset**: Exploring human behavior, habits, and decision-making.
- **🛠️ Interactive Web Tools**: Client-side utilities including QR code generators and financial projection calculators.

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have **Ruby** and **Bundler** installed on your system:

```bash
# Verify Ruby and Bundler installation
ruby -v
bundle -v
```

### Installation

Clone the repository and install all required gems and dependencies:

```bash
git clone https://github.com/imAmanRana/thoughtstopen.git
cd thoughtstopen
bundle install
```

---

## 💻 Running & Building Locally

### 1. Development Mode (Recommended)

To run the local development server with development configurations (e.g., local URL `http://127.0.0.1:4000` and live reloading):

```bash
set JEKYLL_ENV="development"
bundle exec jekyll serve --config _config.yml,_config_dev.yml --incremental
```

Open your browser and navigate to `http://127.0.0.1:4000`.

### 2. Production Build

To build the static site for production:

**Windows (PowerShell / CMD):**
```powershell
set JEKYLL_ENV="production"
bundle exec jekyll build
```

**macOS / Linux:**
```bash
JEKYLL_ENV=production bundle exec jekyll build
```

---

## ⚙️ Configuration Files

The site uses split configuration files to separate production settings from local development overrides:

| File | Environment | Description |
| :--- | :--- | :--- |
| `_config.yml` | **Production** | Primary configuration containing canonical site URL, metadata, SEO defaults, Google Analytics (GA4), and Google AdSense settings. |
| `_config_dev.yml` | **Development** | Overrides `url` to `http://127.0.0.1:4000` and sets `environment: development` to disable production-only tracking during local testing. |

> **Note:** Whenever you modify `_config.yml` or `_config_dev.yml`, restart your Jekyll server for the changes to take effect.

---

## 📊 Analytics & Environment Variables

Google Analytics tracking is configured via GA4 (`G-KR4P1CKKT4`) and is conditionally loaded only in production builds.

To ensure analytics scripts and production assets are rendered properly during builds:

- **Windows:**
  ```cmd
  set JEKYLL_ENV=production
  bundle exec jekyll build
  ```
- **macOS / Linux:**
  ```bash
  JEKYLL_ENV=production bundle exec jekyll build
  ```

---

## 🎨 Theme & Customizations

This blog's foundation is inspired by the [Moon](https://taylantatli.github.io/Moon/moon-theme/) theme by Taylan Tatlı, extensively customized with:
- **🌓 Dynamic Dark Mode**: Full theme switching with automatic system preference detection (`prefers-color-scheme`) and persistent state (`localStorage`).
- **📱 Responsive Layout Enhancements**: Optimized readable typography and wide-screen desktop readability.
- **⚡ Syntax Highlighting**: Clean code blocks with line highlighting powered by Rouge.
- **🔍 SEO & Performance**: Automated sitemaps, open-graph metadata tags, minification, and Google Analytics 4 integration.

---

## 📄 License

The content, custom scripts, and articles are published under the [MIT License](LICENSE) (or proprietary for personal blog writing where applicable).
