(function () {
  var STORAGE_KEY = 'caz-locale'
  var LOCALES = ['en', 'ru']
  // Keep in sync with app/src/lib/subscription-plan.ts (VITE_TELEGRAM_SUPPORT_USERNAME)
  var TELEGRAM_SUPPORT_USERNAME = 'jirni_otec'
  var TELEGRAM_SUPPORT_URL = 'https://t.me/' + TELEGRAM_SUPPORT_USERNAME

  function telegramMessageCta(locale) {
    return locale === 'ru'
      ? 'Написать @' + TELEGRAM_SUPPORT_USERNAME
      : 'Message @' + TELEGRAM_SUPPORT_USERNAME
  }

  var copy = {
    en: {
      langToggle: 'RU',
      langToggleAria: 'Switch to Russian',
      documentTitle: 'Stream Helper — Kick stream engagement tools',
      appNameStream: 'Stream',
      appNameHelper: 'Helper',
      brandName: 'Stream Helper',
      heroTitle: 'Turn your Kick chat into a live game show',
      heroLead:
        'Stream Helper gives casino streamers ready-to-run engagement modules — bonus buys, prize wheels, and weighted giveaways — with OBS overlays your viewers see on stream.',
      signInKick: 'Sign in with Kick',
      heroSecondary: 'Get access via Telegram',
      navModules: 'Modules',
      navPricing: 'Pricing',
      navHowItWorks: 'How it works',
      navContact: 'Contact',
      modulesTitle: 'Everything you need to engage chat',
      modulesLead:
        'Pick a module, configure it in the dashboard, and drop the browser-source widget into OBS.',
      moduleBonusBuyTitle: 'Bonus Buy',
      moduleBonusBuyBody:
        'Run slot bonus-buy sessions on stream. Track balance, open rounds, and show live stats on your overlay while viewers follow the action.',
      modulePrizeSpinTitle: 'Prize Spin',
      modulePrizeSpinBody:
        'Spin a weighted prize wheel for any viewer nick. Set sectors, odds, and colors — then reveal the winner on stream in seconds.',
      moduleChatRollTitle: 'Chat Roll',
      moduleChatRollBody:
        'Weighted chat giveaways with a keyword. Boost odds for VIPs, mods, and subscribers — fair rolls, instant winner on overlay.',
      platformTitle: 'Built for stream production',
      platformObsTitle: 'OBS-ready widgets',
      platformObsBody:
        'Browser-source URLs for each module. Styled to match your dark stream layout.',
      platformTeamTitle: 'Team access',
      platformTeamBody:
        'Owners and moderators share one account. Control who runs games during your stream.',
      platformKickTitle: 'Kick-native',
      platformKickBody:
        'Sign in with Kick OAuth. No extra passwords — start from the channel you already stream on.',
      pricingTitle: 'Plans for every stream size',
      pricingLead:
        'Sign in with Kick for a full-access trial. Pro and Max are activated via Telegram — no checkout on this page.',
      planTrialBadge: 'Trial',
      planTrialTitle: 'Trial',
      planTrialTagline: 'Explore every module and overlay before upgrading to Pro or Max.',
      planTrialFeature1: 'All platform modules for the duration of your trial',
      planTrialFeature2: 'One team account for owner and moderators',
      planTrialFeature3: 'OBS widgets ready for live sessions',
      planTrialNote: 'Activates when you sign in with Kick',
      planPopular: 'Popular',
      planProBadge: 'Pro',
      planProTitle: 'Pro',
      planProTagline: 'For streamers who run regular giveaways and live engagement on stream.',
      planProFeature1: 'All streamer modules without trial time limit',
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
      step2Body: 'Open a module, set prizes, keywords, or sectors in the dashboard.',
      step3Title: 'Go live',
      step3Body: 'Add the widget URL to OBS and run your session while you stream.',
      ctaTitle: 'Ready to engage your chat?',
      ctaLead:
        'Sign in with Kick to open your dashboard, or message us to activate your subscription.',
      contactTitle: 'Activate your plan',
      contactLead:
        "Sign in with Kick to start your trial. For Pro or Max, message us on Telegram and we'll set up your team.",
      contactTelegram: telegramMessageCta('en'),
      contactOrSignIn: 'Or sign in with Kick',
      footer: '© 2026 Stream Helper',
    },
    ru: {
      langToggle: 'EN',
      langToggleAria: 'Switch to English',
      documentTitle: 'Stream Helper — инструменты вовлечения для стримов на Kick',
      appNameStream: 'Stream',
      appNameHelper: 'Helper',
      brandName: 'Stream Helper',
      heroTitle: 'Превратите чат Kick в живое шоу',
      heroLead:
        'Stream Helper — готовые модули для казино-стримеров: bonus buy, колесо призов и розыгрыши в чате с OBS-оверлеями для зрителей.',
      signInKick: 'Войти через Kick',
      heroSecondary: 'Получить доступ в Telegram',
      navModules: 'Модули',
      navPricing: 'Тарифы',
      navHowItWorks: 'Как это работает',
      navContact: 'Контакты',
      modulesTitle: 'Всё для вовлечения чата',
      modulesLead:
        'Выберите модуль, настройте его в панели и добавьте browser source в OBS.',
      moduleBonusBuyTitle: 'Bonus Buy',
      moduleBonusBuyBody:
        'Ведите сессии bonus buy в эфире. Следите за балансом, открывайте раунды и показывайте статистику на оверлее.',
      modulePrizeSpinTitle: 'Prize Spin',
      modulePrizeSpinBody:
        'Крутите взвешенное колесо призов для любого ника. Задайте сектора, шансы и цвета — покажите победителя за секунды.',
      moduleChatRollTitle: 'Chat Roll',
      moduleChatRollBody:
        'Взвешенные розыгрыши в чате по ключевому слову. Бонусы для VIP, модов и подписчиков — честный ролл и мгновенный результат на стриме.',
      platformTitle: 'Создано для продакшена стрима',
      platformObsTitle: 'Виджеты для OBS',
      platformObsBody:
        'Browser source для каждого модуля. Оформление под тёмный стрим.',
      platformTeamTitle: 'Доступ команды',
      platformTeamBody:
        'Владелец и модераторы в одном аккаунте. Контролируйте, кто ведёт игры в эфире.',
      platformKickTitle: 'Нативно для Kick',
      platformKickBody:
        'Вход через Kick OAuth. Без лишних паролей — с канала, на котором вы уже стримите.',
      pricingTitle: 'Тарифы для любого масштаба',
      pricingLead:
        'Войдите через Kick и получите пробный период с полным доступом. Тарифы Pro и Max подключаются в Telegram — оплаты на этой странице нет.',
      planTrialBadge: 'Пробный',
      planTrialTitle: 'Пробный период',
      planTrialTagline: 'Оцените все модули и оверлеи до перехода на Pro или Max.',
      planTrialFeature1: 'Все модули платформы на время пробного периода',
      planTrialFeature2: 'Один аккаунт для владельца и модераторов',
      planTrialFeature3: 'Виджеты OBS для сессий в эфире',
      planTrialNote: 'Активируется при входе через Kick',
      planPopular: 'Популярный',
      planProBadge: 'Pro',
      planProTitle: 'Pro',
      planProTagline: 'Для стримеров с регулярными розыгрышами и активным чатом в эфире.',
      planProFeature1: 'Все модули без ограничения по времени trial',
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
      step2Body: 'Откройте модуль, задайте призы, ключевые слова или сектора в панели.',
      step3Title: 'В эфир',
      step3Body: 'Добавьте URL виджета в OBS и ведите сессию во время стрима.',
      ctaTitle: 'Готовы вовлечь чат?',
      ctaLead:
        'Войдите через Kick, чтобы открыть панель, или напишите нам для активации подписки.',
      contactTitle: 'Активируйте тариф',
      contactLead:
        'Войдите через Kick, чтобы начать пробный период. Для Pro или Max напишите в Telegram — настроим команду.',
      contactTelegram: telegramMessageCta('ru'),
      contactOrSignIn: 'Или войти через Kick',
      footer: '© 2026 Stream Helper',
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
