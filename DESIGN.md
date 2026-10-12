---
name: آروما
description: دستیار آرام انتخاب عطر — روشن، RTL، موبایل‌اول
colors:
  ink: "#023a4b"
  paper: "#e9edee"
  desk: "#dce3e5"
  card: "#fbfcfc"
  muted: "#4a5b62"
  line: "#d2dbde"
  press: "#dfe6e8"
  moss: "#d9e6ea"
  brass: "#c7a769"
  clay: "#efe0dc"
  danger: "#8e3d32"
  stock-ok: "#4F8A62"
  stock-pending: "#B8A27A"
typography:
  display:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.35
  headline:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 700
    lineHeight: 1.35
  title:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  shell: "20px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "#111614"
    textColor: "{colors.paper}"
  button-primary-disabled:
    backgroundColor: "{colors.line}"
    textColor: "{colors.muted}"
  button-edge:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
  chip-selected:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  input-shell:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "4px 4px 4px 14px"
  card-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px"
  shell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    width: "32rem"
---

# Design System: آروما

## Overview

**Creative North Star: "میز آرام عطرساز"**

آروما مثل میز کار تمیز یک عطرساز است: کاغذ خاکستری خنک، جوهر سبزآبی تیرهٔ لوگو، بطری روی سطح روشن. نه ویترین طلایی بوتیک، نه داشبورد شلوغ. رابط باید حس دستیار صمیمی بدهد — سبک، سریع، قابل لمس روی موبایل.

تراکم متوسط–کم: یک کار در هر بخش، تیتر کوتاه، یک جملهٔ پشتیبان، کنترل‌های بزرگ. عمق با لایهٔ تُنال (`paper` / `card` / `moss`) و سایه‌های خیلی نرم ساخته می‌شود، نه با گلو یا گرادیان بنفش.

ضدمرجعهای تأییدشده: بنر ترند، منوی پایین شلوغ، کارت‌های یکسان آیکون+تیتر، کلیشهٔ طلا/مشکی لوکس عطر، و آواتار ربات برای «هوشمند» نشان دادن محصول.

**Key Characteristics:**
- RTL فارسی با Vazirmatn؛ ارقام فارسی در UI
- پالت خنثی خنک + جوهر سبزآبی لوگو (#023a4b)؛ برنجی لوگو فقط به‌عنوان اکسنت کوچک برند
- لوگو: بطری با موج برنجی، در هدر کنار واژهٔ «آروما» و در آیکون اپ (`public/brand/`)
- شل موبایل `max-w` حدود ۳۲rem؛ دسکتاپ فقط قاب و سایهٔ محیطی
- امضای بصری: نوار نسبت آکورد (Accord Mark)
- حرکت کوتاه با `ease-out` و احترام به reduced-motion

## Colors

پالت روشن و کم‌اشباع؛ رنگ فقط وقتی معنا دارد (آکورد، موجودی، خطر، انتخاب moss).

### Primary
- **Bottle Teal** (#023a4b): رنگ اصلی لوگو؛ متن اصلی، دکمهٔ solid، نوار پیشرفت پر، فوکوس.

### Secondary
- **Teal Wash** (#d9e6ea) — توکن `moss`: انتخاب راهنما، نوار اصلاح پیشنهاد، پس‌زمینهٔ «دوست دارم» نرم / پیام دستیار.

### Tertiary
- **Clay Blush** (#efe0dc): پس‌زمینهٔ واکنش «دوست ندارم» همراه Danger Brick.

### Brand Accent
- **Brass Swirl** (#c7a769): موج طلایی لوگو؛ فقط بج شمارندهٔ قفسه و خود لوگو. هرگز متن روی سطح روشن، پس‌زمینهٔ بزرگ، یا گرادیان.

### Neutral
- **Paper Mist** (#e9edee): سطح اصلی شل و themeColor
- **Desk Mist** (#dce3e5): پس‌زمینهٔ بیرون شل روی دسکتاپ
- **Card** (#fbfcfc): کارت، اینپوت، شیت
- **Muted Slate** (#4a5b62): متن ثانویه
- **Hairline** (#d2dbde): حاشیه و تقسیم
- **Press Fog** (#dfe6e8): hover/quiet press

### Status
- **Danger Brick** (#8e3d32): خطا و dislike
- **Stock Ok** (#4F8A62) / **Stock Pending** (#B8A27A): نقطهٔ موجودی

### Named Rules
**The Quiet Accent Rule.** رنگ اشباع فقط روی آکورد، وضعیت موجودی، یا حالت معنایی می‌آید — نه روی پس‌زمینهٔ کل صفحه و نه به‌عنوان تم بنفش/طلا.

**The No Luxury Cliché Rule.** مشکی براق، گرادیان بنفش–ایندیگو، و طلای ویترینی ممنوع‌اند. تنها طلای مجاز برنجی خود لوگوست، در اندازهٔ کوچک و کنار سبزآبی.

## Typography

**Display Font:** Vazirmatn (با Tahoma)
**Body Font:** Vazirmatn (با Tahoma)

**Character:** یک خانوادهٔ فارسی خوانا و مدرن؛ وزن bold برای تیترهای تصمیم، semibold برای نام عطر و دکمه‌ها، regular برای بدن.

### Hierarchy
- **Display** (700, ~1.75rem, 1.35): تیتر هوم
- **Headline** (700, ~1.45–1.6rem, snug): نتایج، راهنما، قفسه
- **Title** (600, ~1.05rem): نام عطر روی کارت
- **Body** (400, 15–16px, ~1.75): توضیح و why؛ اینپوت ۱۶px
- **Label** (500–600, 12–13px): راهنما، بج، متا

### Named Rules
**The No Eyebrow Rule.** برچسب کوچک بالای تیتر نگذار؛ تیتر خودش حرف بزند و جملهٔ پشتیبان زیرش بیاید.

**The Sixteen Rule.** فیلدهای متنی روی موبایل کمتر از ۱۶px نشوند.

## Layout

- شل عمودی تمام‌قد: `h-dvh`، هدر ثابت، `main` اسکرول، آهنگساز/شیت پایین با safe-area
- عرض محتوا حداکثر ~32rem (`max-w-lg` / 512px)؛ روی `sm+` حاشیه و سایهٔ محیطی روی desk
- پدینگ افقی رایج: 16–20px (`px-4` / `px-5`)
- یک کار در هر بخش؛ فاصلهٔ گروه تنگ، بین بخش‌ها بازتر
- موبایل اول؛ دسکتاپ همان ستون باریک است، نه داشبورد چندستونه

## Elevation & Depth

عمدتاً تخت با لایهٔ تُنال. سایه فقط برای بلند کردن کارت پیشنهاد، شیت پاسخ، یا قاب دسکتاپ — همیشه با آفست و بلور نرم، نه هالهٔ صفرآفست.

### Shadow Vocabulary
- **Card lift** (`0 6px 20px -14px` / `-16px rgba(28,33,31,0.35–0.4)`): اینپوت هوم، کارت سلیقه، سؤال leaning
- **Sheet** (`0 8px 24px -12px rgba(28,33,31,0.18)`): پاسخ دستیار
- **Desktop frame** (`0 0 48px rgba(28,33,31,0.06)`): قاب شل روی sm+

### Named Rules
**The Flat-By-Default Rule.** سطح در حالت عادی تخت است؛ سایه پاسخ به اهمیت یا شناور بودن است نه دکور پیش‌فرض همهٔ کارت‌ها.

## Shapes

- کنترل‌های اصلی و کارت: `rounded-2xl` (~16px)
- دکمه‌های solid جمع‌وجور: `rounded-xl` (~12px)
- چیپ و بج: `rounded-full`
- هیرو عکس عطر: `rounded-3xl` (~24px)
- حاشیهٔ ۱px با `--line`؛ انتخاب با `--ink` یا پر شدن moss — نه double-border تزئینی سنگین

## Components

### Buttons
- **Shape:** rounded-xl تا rounded-2xl؛ min-height ~44–48px
- **Primary (solid):** پس‌زمینه ink، متن paper؛ hover فقط روی pointer ریز به `#111614`؛ active scale 0.97 (کلاس `pressable`)
- **Edge:** کارت/حاشیه line؛ hover حاشیه ink
- **Quiet:** بدون حاشیهٔ سنگین؛ hover press
- **Disabled:** پس‌زمینه line، متن muted

### Chips
- نمونهٔ هوم و چیپ دستیار: pill، border line، کارت
- انتخاب راهنما: moss + حاشیه ink
- ریل افقی با `fade-end` برای ادامهٔ لیست

### Cards / Containers
- کارت پیشنهاد/قفسه: card + border line + padding ~14px
- بلوک «چرا این عطر؟»: paper داخل کارت (لایهٔ تودرتو بدون کارت سایهٔ اضافه)
- شیت پایین فروشگاه: card، گوشهٔ بالای گرد بزرگ

### Inputs / Fields
- پوستهٔ ترکیبی با دکمهٔ داخلی (هوم و دستیار)
- focus-within: حاشیه ink
- خطا: حاشیه danger + متن کمکی

### Navigation
- هدر سه ستونه: برگشت | آروما bold | قفسه با آیکون نشانک و بج شمارنده
- قفسه خالی: بدون عدد روی بج

### Accord Mark (signature)
- نوار افقی باریک از رنگ‌های آکورد با نسبت strength
- اختیاری: لجند درصدی؛ روی کارت نتایج سه نام آکورد زیر نوار

### Taste Row
- سه بخش like / try / dislike داخل کاغذ؛ انتخاب ink / moss / clay+danger

## Do's and Don'ts

### Do:
- **Do** مسیرهای شروع را هم‌زمان روشن نگه دار: اسم عطر، توصیف آزاد، راهنما.
- **Do** از توکن‌های `--paper/--ink/--card/--moss` استفاده کن؛ رنگ جدید فقط برای معنای داده.
- **Do** لمس‌پذیری و RTL را قبل از زیباسازی دسکتاپ چک کن.
- **Do** توضیح why و Accord Mark را نزدیک پیشنهاد نگه دار.

### Don't:
- **Don't** بنر ترند، منوی پایین شلوغ، یا لوگوی غول‌پیکر به هوم اضافه کن.
- **Don't** با حدس، ردیف خالی مقایسه یا پیشنهاد نامطمئن را پر کن.
- **Don't** آواتار چت یا حباب‌های تزئینی برای «دستیار» بساز.
- **Don't** Inter/Roboto/سیستم پیش‌فرض را جایگزین Vazirmatn کن.
- **Don't** تم بنفش–ایندیگو یا طلایی–مشکی لوکس پیش‌فرض AI را وارد کن.
