(function () {
  var STORAGE_KEY = 'caz-locale'
  var LOCALES = ['en', 'ru']

  var copy = {
    en: {
      langToggle: 'RU',
      langToggleAria: 'Switch to Russian',
      documentTitle: 'Stream Helper — Kick stream engagement tools',
      brandName: 'Stream Helper',
      heroTitle: 'Turn your Kick chat into a live game show',
      heroLead:
        'Stream Helper gives casino streamers ready-to-run engagement modules — bonus buys, prize wheels, and weighted giveaways — with OBS overlays your viewers see on stream.',
      signInKick: 'Sign in with Kick',
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
        'Start free, then upgrade when you need more modules, overlays, or team seats. All paid plans are activated via Telegram — no checkout on this page.',
      planFreeBadge: 'Free',
      planFreeTitle: 'Free',
      planFreeTagline: 'Get started at no cost',
      planFreeFeature1: 'Team dashboard',
      planFreeFeature2: 'Module catalog',
      planFreeFeature3: 'Kick channel stats',
      planFreeNote: 'Included when you sign in',
      planPopular: 'Popular',
      planProBadge: 'Pro',
      planProTitle: 'Pro',
      planProTagline: 'Full engagement toolkit for solo streamers',
      planProFeature1: 'All modules (Bonus Buy, Prize Spin, Chat Roll)',
      planProFeature2: 'OBS browser-source widgets',
      planProFeature3: 'Extended session limits',
      planProNote: 'Contact us to activate',
      planProCta: 'Get Pro access',
      planStudioBadge: 'Studio',
      planStudioTitle: 'Studio',
      planStudioTagline: 'For teams running daily streams',
      planStudioFeature1: 'Everything in Pro',
      planStudioFeature2: 'Multiple moderator seats',
      planStudioFeature3: 'Priority Telegram support',
      planStudioFeature4: 'Highest session limits',
      planStudioNote: 'Contact us to activate',
      planStudioCta: 'Get Studio access',
      pricingFootnote:
        'Prices are quoted individually. Message us to pick the right plan for your channel.',
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
        "Sign in with Kick to start on Free. For Pro or Studio, message us on Telegram and we'll set up your team.",
      contactTelegram: 'Message @parsyuk on Telegram',
      contactOrSignIn: 'Or sign in with Kick',
      footer: '© 2026 Stream Helper',
    },
    ru: {
      langToggle: 'EN',
      langToggleAria: 'Switch to English',
      documentTitle: 'Stream Helper — инструменты вовлечения для стримов на Kick',
      brandName: 'Stream Helper',
      heroTitle: 'Превратите чат Kick в живое шоу',
      heroLead:
        'Stream Helper — готовые модули для казино-стримеров: bonus buy, колесо призов и розыгрыши в чате с OBS-оверлеями для зрителей.',
      signInKick: 'Войти через Kick',
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
        'Начните бесплатно и переходите на платный тариф, когда нужны модули, оверлеи или места в команде. Платные планы активируются в Telegram — оплаты на этой странице нет.',
      planFreeBadge: 'Бесплатно',
      planFreeTitle: 'Free',
      planFreeTagline: 'Старт без оплаты',
      planFreeFeature1: 'Панель команды',
      planFreeFeature2: 'Каталог модулей',
      planFreeFeature3: 'Статистика канала Kick',
      planFreeNote: 'Доступно после входа',
      planPopular: 'Популярный',
      planProBadge: 'Pro',
      planProTitle: 'Pro',
      planProTagline: 'Полный набор для соло-стримера',
      planProFeature1: 'Все модули (Bonus Buy, Prize Spin, Chat Roll)',
      planProFeature2: 'OBS browser source',
      planProFeature3: 'Расширенные лимиты сессий',
      planProNote: 'Напишите нам для активации',
      planProCta: 'Получить Pro',
      planStudioBadge: 'Studio',
      planStudioTitle: 'Studio',
      planStudioTagline: 'Для команд с ежедневными стримами',
      planStudioFeature1: 'Всё из Pro',
      planStudioFeature2: 'Несколько мест модераторов',
      planStudioFeature3: 'Приоритетная поддержка в Telegram',
      planStudioFeature4: 'Максимальные лимиты сессий',
      planStudioNote: 'Напишите нам для активации',
      planStudioCta: 'Получить Studio',
      pricingFootnote:
        'Стоимость обсуждается индивидуально. Напишите нам — подберём тариф под ваш канал.',
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
        'Войдите через Kick для бесплатного старта. Для Pro или Studio напишите в Telegram — настроим команду.',
      contactTelegram: 'Написать @parsyuk в Telegram',
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
