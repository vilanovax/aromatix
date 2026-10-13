---
name: آروما
description: دستیار آرام انتخاب عطر — روشن، RTL، موبایل‌اول
colors:
  ink: "#023a4b"
  ink-hover: "#012b38"
  paper: "#e9edee"
  desk: "#dce3e5"
  card: "#fbfcfc"
  muted: "#4a5b62"
  faint: "#62737a"
  line: "#d2dbde"
  press: "#dfe6e8"
  moss: "#d9e6ea"
  brass: "#c7a769"
  clay: "#efe0dc"
  well: "#e2e8ea"
  taste-try: "#7fa58a"
  danger: "#8e3d32"
  stock-ok: "#4F8A62"
  stock-pending: "#B8A27A"
  stock-ok-on-ink: "#7dba92"
  stock-pending-on-ink: "#d4c19a"
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
  input:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "12px"
  panel: "16px"
  sheet: "24px"
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
    rounded: "{rounded.panel}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
    textColor: "{colors.paper}"
  button-primary-disabled:
    backgroundColor: "{colors.line}"
    textColor: "{colors.muted}"
  button-edge:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
  soft-chip:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  input-shell:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "4px 4px 4px 14px"
  card-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "14px"
  assistant-reply:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
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
- شل موبایل `max-w-lg` (~32rem)؛ دسکتاپ فقط قاب و سایهٔ محیطی
- امضای بصری: نوار نسبت آکورد (Accord Mark)
- حرکت کوتاه با `ease-out` و احترام به `prefers-reduced-motion`
- شیت‌های پایین (فروشگاه، واژه، تجربه، پاسخ دستیار) با handle، بستن، و safe-area یکدست

## Colors

پالت روشن و کم‌اشباع؛ رنگ فقط وقتی معنا دارد (آکورد، موجودی، خطر، انتخاب).

### Primary
- **Bottle Teal** (#023a4b) — توکن `ink`: متن اصلی، دکمهٔ solid، چیپ انتخاب‌شده، نوار پیشرفت پر، فوکوس، پر شدن اسلایدر تجربه.
- **Ink Hover** (#012b38) — توکن `ink-hover`: hover دکمهٔ solid فقط روی pointer ریز.

### Secondary
- **Teal Wash** (#d9e6ea) — توکن `moss`: انتخاب نرم (SoftChip، گزینهٔ راهنما)، پیام دستیار، Note، پس‌زمینهٔ «می‌خوام».

### Tertiary
- **Clay Blush** (#efe0dc): پس‌زمینهٔ واکنش «دوست ندارم» همراه Danger Brick.
- **Taste Try** (#7fa58a): نقطهٔ وضعیت «می‌خوام» روی قفسه.

### Brand Accent
- **Brass Swirl** (#c7a769): موج طلایی لوگو؛ فقط بج شمارندهٔ قفسه و خود لوگو. هرگز متن روی سطح روشن، پس‌زمینهٔ بزرگ، یا گرادیان.

### Neutral
- **Paper Mist** (#e9edee): سطح اصلی شل و themeColor
- **Desk Mist** (#dce3e5): پس‌زمینهٔ بیرون شل روی دسکتاپ
- **Card** (#fbfcfc): کارت، اینپوت، شیت
- **Well** (#e2e8ea): شیار پیشرفت DNA / سطح فرعی داخل کاغذ
- **Muted Slate** (#4a5b62): متن ثانویه
- **Faint Slate** (#62737a): placeholder و جداکننده‌های خیلی کم‌رنگ
- **Hairline** (#d2dbde): حاشیه و تقسیم
- **Press Fog** (#dfe6e8): hover/quiet press

### Status
- **Danger Brick** (#8e3d32): خطا و dislike
- **Stock Ok** (#4F8A62) / **Stock Pending** (#B8A27A): نقطهٔ موجودی روی سطح روشن
- **Stock Ok On Ink** (#7dba92) / **Stock Pending On Ink** (#d4c19a): نقطهٔ موجودی روی دکمهٔ solid تیره

### Named Rules
**The Quiet Accent Rule.** رنگ اشباع فقط روی آکورد، وضعیت موجودی، یا حالت معنایی می‌آید — نه روی پس‌زمینهٔ کل صفحه و نه به‌عنوان تم بنفش/طلا.

**The No Luxury Cliché Rule.** مشکی براق، گرادیان بنفش–ایندیگو، و طلای ویترینی ممنوع‌اند. تنها طلای مجاز برنجی خود لوگوست، در اندازهٔ کوچک و کنار سبزآبی.

## Typography

**Display Font:** Vazirmatn (با Tahoma)
**Body Font:** Vazirmatn (با Tahoma)

**Character:** یک خانوادهٔ فارسی خوانا و مدرن؛ وزن bold برای تیترهای تصمیم، semibold برای نام عطر و دکمه‌ها، regular برای بدن.

### Hierarchy
- **Display** (700, 1.75rem, 1.35): تیتر هوم و تیترهای هیرو
- **Headline** (700, 1.45rem, 1.35): نتایج، راهنما، قفسه، دانستنی‌ها، مقاله
- **Title** (600, 1.05rem, 1.4): نام عطر، تیتر بخش، عنوان شیت
- **Body** (400, 15px, 1.75): توضیح، why، پاسخ دستیار
- **Input** (400, 16px, 1.5): فیلدهای متنی موبایل (جلوگیری از زوم iOS)
- **Label** (500, 13px, 1.5): راهنما، بج، متا
- **Badge** (600, 10px, 1): عدد روی بج برنجی قفسه

### Named Rules
**The No Eyebrow Rule.** برچسب کوچک بالای تیتر نگذار؛ تیتر خودش حرف بزند و جملهٔ پشتیبان زیرش بیاید.

**The Sixteen Rule.** فیلدهای متنی روی موبایل کمتر از ۱۶px نشوند.

## Layout

- شل عمودی تمام‌قد: `h-dvh`، هدر ثابت، `main` اسکرول، آهنگساز/شیت پایین با safe-area
- عرض محتوا حداکثر ~32rem (`max-w-lg`)؛ روی `sm+` حاشیهٔ عمودی و `shadow-frame` روی desk
- پدینگ افقی رایج: 20px (`px-5`) برای محتوا؛ هدر `px-3`
- یک کار در هر بخش؛ فاصلهٔ گروه تنگ، بین بخش‌ها بازتر (`mt-8` / `mt-9`)
- موبایل اول؛ دسکتاپ همان ستون باریک است، نه داشبورد چندستونه
- هدف لمس حدود ۴۴px (`min-h-11` / `min-h-12`)

## Elevation & Depth

عمدتاً تخت با لایهٔ تُنال. سایه فقط برای بلند کردن اینپوت ترکیبی، شیت پاسخ/مودال، یا قاب دسکتاپ — همیشه با آفست و بلور نرم، نه هالهٔ صفرآفست. رنگ سایه از جوهر بطری گرفته می‌شود (`rgb(2 58 75 / …)`).

### Shadow Vocabulary
- **Card lift** (`0 6px 20px -16px rgb(2 58 75 / 0.4)`): اینپوت هوم و دستیار (`shadow-card`)
- **Sheet** (`0 8px 24px -12px rgb(2 58 75 / 0.18)`): پاسخ دستیار، شیت فروشگاه/واژه/تجربه
- **Desktop frame** (`0 0 48px rgb(2 58 75 / 0.06)`): قاب شل روی sm+
- **Range thumb** (`0 2px 8px -2px rgb(2 58 75 / 0.35)`): دستگیرهٔ اسلایدر تجربه

### Named Rules
**The Flat-By-Default Rule.** سطح در حالت عادی تخت است؛ سایه پاسخ به اهمیت یا شناور بودن است نه دکور پیش‌فرض همهٔ کارت‌ها.

## Shapes

- کنترل جمع‌وجور (`rounded-control`): ~12px — دکمهٔ icon، ScentMark، Note
- پنل و کارت (`rounded-panel`): ~16px — کارت، FieldShell، دکمهٔ panel، لیست‌ها
- شیت (`rounded-t-sheet`): ~24px فقط گوشهٔ بالای مودال پایین
- چیپ و بج: `rounded-full`
- هیرو عکس عطر: ~24px (`rounded-3xl`)
- حاشیهٔ ۱px با `--line`؛ انتخاب فیلتر با پر شدن ink؛ انتخاب نرم با moss — نه double-border تزئینی سنگین

## Components

### Buttons
- **Shape:** control 12px / panel 16px / pill؛ min-height ۹ تا ۱۴ (sm→xl)
- **Primary (solid):** پس‌زمینه ink، متن paper؛ hover pointer → ink-hover؛ active scale 0.97 (`pressable`)
- **Edge:** کارت + حاشیه line؛ hover حاشیه ink
- **Quiet:** بدون حاشیهٔ سنگین؛ hover press
- **Disabled:** پس‌زمینه line، متن muted

### Chips
- **Filter / prompt Chip:** pill، border line، کارت؛ انتخاب‌شده: ink پر + متن paper؛ ارتفاع لمس `min-h-11`
- **SoftChip:** moss بدون حاشیه — وضعیت حمل‌شده (انتخاب‌های راهنما)
- **MetaChip:** border line + متن muted برای متا
- ریل افقی با `fade-end` برای ادامهٔ لیست

### Cards / Containers
- کارت پیش‌فرض: card + border line + `rounded-panel` + padding ~14px
- بدون حاشیه فقط وقتی لایهٔ تُنال کافی است (مثلاً پاسخ دستیار روی moss)
- بلوک «چرا این عطر؟» / Note: paper یا moss داخل صفحه
- شیت پایین: card، گوشهٔ بالای گرد بزرگ، handle خطی، سایهٔ sheet

### Inputs / Fields
- `FieldShell`: پوستهٔ ترکیبی با دکمهٔ داخلی (هوم و دستیار)
- focus-within: حاشیه ink
- خطا: حاشیه danger + متن کمکی
- اسلایدر تجربه (`.aroma-range`): track line/ink، thumb گرد ink روی card

### Navigation
- هدر سه ستونه: برگشت | علامت بطری + «آروما» bold | برندها · دانستنی‌ها · قفسه
- بج شمارندهٔ قفسه روی brass؛ قفسه خالی بدون عدد
- نوار مقایسهٔ چسبان وقتی دو عطر انتخاب شده (نتایج / قفسه / جزئیات)

### Accord Mark (signature)
- نوار افقی باریک از رنگ‌های آکورد با نسبت strength
- اختیاری: لجند درصدی؛ روی کارت نتایج سه نام آکورد زیر نوار

### Taste Row
- سه بخش می‌خوام / تجربه کردم / دوست ندارم؛ انتخاب moss / ink / clay+danger
- شیت تجربه: امتیاز بزرگ روی paper، اسلایدر، «این عطر رو دارم» با moss وقتی فشرده

### Bottom sheets
- فروشگاه، واژه (TermSheet)، تجربه (TasteRow): backdrop ink/40، Escape، فوکوس اولیه، CTA تمام‌عرض
- پاسخ دستیار: کارت moss با سایهٔ sheet بالای FieldShell

## Do's and Don'ts

### Do:
- **Do** مسیرهای شروع را هم‌زمان روشن نگه دار: اسم عطر، توصیف آزاد، راهنما.
- **Do** از توکن‌های `--paper/--ink/--card/--moss` استفاده کن؛ رنگ جدید فقط برای معنای داده.
- **Do** لمس‌پذیری، فوکوس ink، و RTL را قبل از زیباسازی دسکتاپ چک کن.
- **Do** توضیح why و Accord Mark را نزدیک پیشنهاد نگه دار.
- **Do** موجودی تأییدنشده را با نقطهٔ pending و بدون لینک خرید نشان بده.

### Don't:
- **Don't** بنر ترند، منوی پایین شلوغ، یا لوگوی غول‌پیکر به هوم اضافه کن.
- **Don't** با حدس، ردیف خالی مقایسه یا پیشنهاد نامطمئن را پر کن.
- **Don't** آواتار چت یا حباب‌های تزئینی برای «دستیار» بساز.
- **Don't** Inter/Roboto/سیستم پیش‌فرض را جایگزین Vazirmatn کن.
- **Don't** تم بنفش–ایندیگو یا طلایی–مشکی لوکس پیش‌فرض AI را وارد کن.
- **Don't** لینک برند را داخل لینک عطر تو‌در‌تو بگذار.
