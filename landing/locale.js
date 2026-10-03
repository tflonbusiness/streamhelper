(function () {
  var STORAGE_KEY = 'caz-locale'
  var LOCALES = ['en', 'ru']
  // Keep in sync with app/src/lib/subscription-plan.ts (VITE_TELEGRAM_SUPPORT_USERNAME)
  var TELEGRAM_SUPPORT_USERNAME = 'jirni_otec'
  var TELEGRAM_SUPPORT_URL = 'https://t.me/' + TELEGRAM_SUPPORT_USERNAME

  var copy = {
    en: {
      langToggle: 'RU',
      langToggleAria: 'Switch to Russian',
      documentTitle: 'Stream Helper — Kick stream engagement tools',
      appNameStream: 'Stream',
      appNameHelper: 'Helper',
      brandName: 'Stream Helper',
      heroTitle: 'Engage your Kick chat on every stream',
      heroLead:
        'Stream Helper gives streamers ready-to-run engagement widgets — Bonus Buy, Prize Wheel, Chat Roll, and more — with OBS overlays your viewers see on stream.',
      signInKick: 'Sign in with Kick',
      navModules: 'Widgets',
      navPricing: 'Pricing',
      navHowItWorks: 'How it works',
      navContact: 'Contact',
      modulesTitle: 'Widgets for chat engagement',
      modulesLead:
        'Each widget ships with its own OBS overlay. Configure once in the dashboard, paste the browser-source URL, and go live.',
      moduleBonusBuyTitle: 'Bonus Buy',
      moduleBonusBuyBody:
        'Structured on-stream sessions with a live budget and round tracker. The overlay stays in sync so chat always sees where the run stands.',
      modulePrizeSpinTitle: 'Prize Wheel',
      modulePrizeSpinBody:
        'Pick a chat nick and spin sectors you define — weights, colors, and prizes included. The result appears on your overlay in one reveal.',
      moduleChatRollTitle: 'Chat Roll',
      moduleChatRollBody:
        'Giveaways driven by a chat keyword, with custom weights for roles and perks. One fair roll picks a winner and shows it on stream.',
      platformTitle: 'Built for stream production',
      platformObsTitle: 'OBS-ready widgets',
      platformObsBody:
        'A dedicated browser-source link per widget. Dark overlays designed to sit cleanly on a typical stream layout.',
      platformTeamTitle: 'Team access',
      platformTeamBody:
        'One account for the channel owner and moderators. Choose who can start sessions and run widgets while you are live.',
      platformKickTitle: 'Kick-native',
      platformKickBody:
        'Log in with Kick — the same channel you stream on. No separate sign-up or extra passwords.',
      pricingTitle: 'Plans for every stream size',
      pricingLead:
        'Sign in with Kick for a full-access trial. Pro and Max are activated via Telegram — no checkout on this page.',
      planTrialBadge: 'Trial',
      planTrialTitle: 'Trial',
      planTrialTagline: 'Explore every widget and overlay before upgrading to Pro or Max.',
      planTrialFeature1: 'All platform widgets for the duration of your trial',
      planTrialFeature2: 'One team account for owner and moderators',
      planTrialFeature3: 'OBS widgets ready for live sessions',
      planTrialNote: 'Activates when you sign in with Kick',
      planPopular: 'Popular',
      planProBadge: 'Pro',
      planProTitle: 'Pro',
      planProTagline: 'For streamers who run regular giveaways and live engagement on stream.',
      planProFeature1: 'All streamer widgets without trial time limit',
      planProFeature2: 'Comfortable limits for sessions and team size',
      planProFeature3: 'Standard support in Telegram',
      planProNote: 'Contact us to activate',
      planProCta: 'Get Pro access',
      planMaxBadge: 'Max',
      planMaxTitle: 'Max',
      planMaxTagline: 'For high-volume streams and teams that have outgrown Pro.',
      planMaxFeature1: 'Everything in Pro',
      planMaxFeature2: 'All limits removed',
      planMaxFeature3: 'Priority support in Telegram',
      planMaxFeature4: 'Custom features on request for your channel',
      planMaxNote: 'Contact us to activate',
      planMaxCta: 'Get Max access',
      pricingFootnote:
        'Paid plans are quoted individually. Message us to pick Pro or Max for your channel.',
      stepsTitle: 'Live in three steps',
      step1Title: 'Sign in',
      step1Body: 'Connect with Kick and pick your team.',
      step2Title: 'Configure',
      step2Body: 'Open a widget, set prizes, keywords, or sectors in the dashboard.',
      step3Title: 'Go live',
      step3Body: 'Add the widget URL to OBS and run your session while you stream.',
      ctaTitle: 'Ready to engage your chat?',
      ctaLead:
        'Sign in with Kick to open your dashboard, or message us to activate your subscription.',
      contactTitle: 'Activate your plan',
      contactLead:
        "Sign in with Kick to start your trial. For Pro or Max, message us on Telegram and we'll set up your team.",
      contactTelegram: 'Message on Telegram',
      contactOrSignIn: 'Or sign in with Kick',
      footerCopyright: '© 2026',
    },
    ru: {
      langToggle: 'EN',
      langToggleAria: 'Switch to English',
      documentTitle: 'Stream Helper — инструменты вовлечения для стримов на Kick',
      appNameStream: 'Stream',
      appNameHelper: 'Helper',
      brandName: 'Stream Helper',
      heroTitle: 'Вовлекайте чат Kick в каждом стриме',
      heroLead:
        'Stream Helper — готовые виджеты для стримеров: Bonus Buy, Prize Wheel, Chat Roll и многое другое — с OBS-оверлеями для зрителей.',
      signInKick: 'Войти через Kick',
      navModules: 'Виджеты',
      navPricing: 'Тарифы',
      navHowItWorks: 'Как это работает',
      navContact: 'Контакты',
      modulesTitle: 'Виджеты для вовлечения чата',
      modulesLead:
        'У каждого виджета — свой оверлей для OBS. Настройте в панели, вставьте ссылку browser source и выходите в эфир.',
      moduleBonusBuyTitle: 'Bonus Buy',
      moduleBonusBuyBody:
        'Структурированные сессии в эфире с бюджетом и счётчиком раундов. Оверлей синхронизируется с панелью — чат видит актуальный прогресс.',
      modulePrizeSpinTitle: 'Prize Wheel',
      modulePrizeSpinBody:
        'Выберите ник из чата и крутите сектора с вашими весами, цветами и призами. Итог — одним показом на оверлее для зрителей.',
      moduleChatRollTitle: 'Chat Roll',
      moduleChatRollBody:
        'Розыгрыш по ключевому слову в чате и настраиваемые веса для ролей и привилегий. Один честный ролл — победитель сразу на стриме.',
      platformTitle: 'Создано для продакшена стрима',
      platformObsTitle: 'Виджеты для OBS',
      platformObsBody:
        'Отдельная ссылка browser source на виджет. Тёмные оверлеи, которые не перебивают оформление стрима.',
      platformTeamTitle: 'Доступ команды',
      platformTeamBody:
        'Один аккаунт для владельца канала и модераторов. Решайте, кто запускает сессии и виджеты, пока вы в эфире.',
      platformKickTitle: 'Нативно для Kick',
      platformKickBody:
        'Вход через Kick — тот же канал, с которого вы стримите. Без отдельной регистрации и лишних паролей.',
      pricingTitle: 'Тарифы для любого масштаба',
      pricingLead:
        'Войдите через Kick и получите пробный период с полным доступом. Тарифы Pro и Max подключаются в Telegram — оплаты на этой странице нет.',
      planTrialBadge: 'Пробный',
      planTrialTitle: 'Пробный период',
      planTrialTagline: 'Оцените все виджеты и оверлеи до перехода на Pro или Max.',
      planTrialFeature1: 'Все виджеты платформы на время пробного периода',
      planTrialFeature2: 'Один аккаунт для владельца и модераторов',
      planTrialFeature3: 'Виджеты OBS для сессий в эфире',
      planTrialNote: 'Активируется при входе через Kick',
      planPopular: 'Популярный',
      planProBadge: 'Pro',
      planProTitle: 'Pro',
      planProTagline: 'Для стримеров с регулярными розыгрышами и активным чатом в эфире.',
      planProFeature1: 'Все виджеты без ограничения по времени trial',
      planProFeature2: 'Комфортные лимиты на сессии и размер команды',
      planProFeature3: 'Стандартная поддержка в Telegram',
      planProNote: 'Напишите нам для активации',
      planProCta: 'Получить Pro',
      planMaxBadge: 'Max',
      planMaxTitle: 'Max',
      planMaxTagline: 'Для интенсивного эфира и команд, которым Pro уже тесен.',
      planMaxFeature1: 'Всё из тарифа Pro',
      planMaxFeature2: 'Сняты любые лимиты',
      planMaxFeature3: 'Приоритетная поддержка в Telegram',
      planMaxFeature4: 'Уникальные фичи по запросу под ваш канал',
      planMaxNote: 'Напишите нам для активации',
      planMaxCta: 'Получить Max',
      pricingFootnote:
        'Стоимость платных тарифов обсуждается индивидуально. Напишите нам — поможем выбрать Pro или Max под ваш канал.',
      stepsTitle: 'Три шага до эфира',
      step1Title: 'Войти',
      step1Body: 'Подключите Kick и выберите команду.',
      step2Title: 'Настроить',
      step2Body: 'Откройте виджет, задайте призы, ключевые слова или сектора в панели.',
      step3Title: 'В эфир',
      step3Body: 'Добавьте URL виджета в OBS и ведите сессию во время стрима.',
      ctaTitle: 'Готовы вовлечь чат?',
      ctaLead:
        'Войдите через Kick, чтобы открыть панель, или напишите нам для активации подписки.',
      contactTitle: 'Активируйте тариф',
      contactLead:
        'Войдите через Kick, чтобы начать пробный период. Для Pro или Max напишите в Telegram — настроим команду.',
      contactTelegram: 'Написать в telegram',
      contactOrSignIn: 'Или войти через Kick',
      footerCopyright: '© 2026',
    },
  }

  function readStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY)
      return LOCALES.indexOf(raw) >= 0 ? raw : null
    } catch {
      return null
    }
  }

  function writeStored(locale) {
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* ignore */
    }
  }

  function readQueryLocale() {
    var value = new URLSearchParams(window.location.search).get('lang')
    return LOCALES.indexOf(value) >= 0 ? value : null
  }

  function detectBrowserLocale() {
    var lang = (navigator.language || '').toLowerCase()
    return lang.indexOf('ru') === 0 ? 'ru' : 'en'
  }

  function apply(locale) {
    var strings = copy[locale] || copy.en
    document.documentElement.lang = locale
    if (strings.documentTitle) {
      document.title = strings.documentTitle
    }
    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      var key = node.getAttribute('data-i18n')
      if (key && strings[key]) {
        node.textContent = strings[key]
      }
    })
    var toggle = document.getElementById('lang-toggle')
    if (toggle) {
      toggle.textContent = strings.langToggle
      toggle.setAttribute('aria-label', strings.langToggleAria)
    }
    document.querySelectorAll('[data-telegram-support]').forEach(function (node) {
      node.href = TELEGRAM_SUPPORT_URL
    })
  }

  function init() {
    var locale = readQueryLocale() || readStored() || detectBrowserLocale()
    writeStored(locale)
    apply(locale)

    var toggle = document.getElementById('lang-toggle')
    if (toggle) {
      toggle.addEventListener('click', function () {
        locale = locale === 'en' ? 'ru' : 'en'
        writeStored(locale)
        apply(locale)
      })
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
