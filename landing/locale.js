(function () {
  var STORAGE_KEY = 'caz-locale'
  var LOCALES = ['en', 'ru']
  // Keep in sync with app/src/lib/subscription-plan.ts (VITE_TELEGRAM_SUPPORT_USERNAME)
  var TELEGRAM_SUPPORT_USERNAME = 'jirni_otec'
  var TELEGRAM_SUPPORT_URL = 'https://t.me/' + TELEGRAM_SUPPORT_USERNAME

  var LOCALE_META = {
    en: { flagAsset: 'us', code: 'EN' },
    ru: { flagAsset: 'ru', code: 'RU' },
  }

  function flagSrc(asset) {
    return new URL('flags/' + asset + '.svg', window.location.href).href
  }

  var copy = {
    en: {
      langSelectAria: 'Choose language',
      langNameEn: 'English',
      langNameRu: 'Русский',
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
        'Track purchased slots, analyze multipliers, and pick the best slot by audience vote. Customize an OBS widget to show progress on stream and involve chat in the choice.',
      modulePrizeSpinTitle: 'Prize Wheel',
      modulePrizeSpinBody:
        'Interactive prize wheels with your own prize set — customize sectors and coefficients for your stream. Push the wheel via OBS in real time so viewers see every spin and result on overlay.',
      moduleChatRollTitle: 'Chat Roll',
      moduleChatRollBody:
        'Draw a winner in Kick chat with a keyword viewers type — transparent and live on stream. Flexible settings fit your format without extra work for your team.',
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
      footerSupport: 'Support',
      footerPrivacy: 'Privacy',
      footerTerms: 'Terms of use',
      footerRights: 'All rights reserved.',
      legalBackHome: '← Home',
      privacyDocumentTitle: 'Privacy — Stream Helper',
      privacyHeading: 'Privacy policy',
      privacyUpdated: 'Last updated: 3 October 2026',
      privacyIntro:
        'This policy describes how Stream Helper (“we”, “the service”) handles information when you use our website and dashboard.',
      privacyDataTitle: 'Data we process',
      privacyDataBody:
        'When you sign in with Kick, we receive account identifiers and profile data needed to run your team and stream widgets. Session and widget configuration are stored to provide the service. We do not sell your personal data.',
      privacyCookiesTitle: 'Cookies and local storage',
      privacyCookiesBody:
        'The marketing site may store your language preference in local storage. The app uses cookies for authentication and security. You can clear them in your browser settings.',
      privacyContactTitle: 'Contact',
      privacyContactBody:
        'Questions about privacy: message us on Telegram (link in the site footer).',
      termsDocumentTitle: 'Terms of use — Stream Helper',
      termsHeading: 'Terms of use',
      termsUpdated: 'Last updated: 3 October 2026',
      termsIntro:
        'By using Stream Helper you agree to these terms. If you do not agree, do not use the service.',
      termsServiceTitle: 'The service',
      termsServiceBody:
        'Stream Helper provides dashboards and OBS widgets for stream engagement. Features may change; we aim to give reasonable notice for material changes affecting paid plans.',
      termsAccountsTitle: 'Accounts and Kick',
      termsAccountsBody:
        'Access is tied to Kick OAuth and team roles you configure. You are responsible for activity under your account and for who you invite as moderators.',
      termsPlansTitle: 'Plans and payment',
      termsPlansBody:
        'Trial access starts when you sign in with Kick. Pro and Max are activated manually via Telegram; pricing and limits are agreed individually. Refunds are handled case by case via support.',
      termsAcceptableTitle: 'Acceptable use',
      termsAcceptableBody:
        'Do not abuse the service, attempt unauthorized access, or use widgets in a way that violates Kick’s rules or applicable law.',
      termsContactTitle: 'Contact',
      termsContactBody:
        'For terms or billing questions, contact us on Telegram (link in the site footer).',
    },
    ru: {
      langSelectAria: 'Выберите язык',
      langNameEn: 'English',
      langNameRu: 'Русский',
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
        'Статистика купленных слотов, анализ коэффициентов и выбор лучшего слота по голосованию зрителей. Настраиваемый виджет в OBS выводит прогресс в эфир и вовлекает чат в выбор.',
      modulePrizeSpinTitle: 'Prize Wheel',
      modulePrizeSpinBody:
        'Интерактивное колёсо фортуны с индивидуальным набором призов — настраивайте сектора и коэффициенты под свой стрим. Выводите колесо через OBS в реальном времени: зрители видят спин и результат в одном кадре.',
      moduleChatRollTitle: 'Chat Roll',
      moduleChatRollBody:
        'Розыгрыш победителя в чате Kick по заданному кодовому слову — прозрачно и прямо в эфире. Гибкие настройки подстраивают механику под формат стрима без лишней рутины для команды.',
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
      footerSupport: 'Поддержка',
      footerPrivacy: 'Конфиденциальность',
      footerTerms: 'Условия использования',
      footerRights: 'Все права защищены.',
      legalBackHome: '← На главную',
      privacyDocumentTitle: 'Конфиденциальность — Stream Helper',
      privacyHeading: 'Политика конфиденциальности',
      privacyUpdated: 'Обновлено: 3 октября 2026',
      privacyIntro:
        'Здесь описано, как Stream Helper («мы», «сервис») обрабатывает информацию при использовании сайта и панели.',
      privacyDataTitle: 'Какие данные обрабатываем',
      privacyDataBody:
        'При входе через Kick мы получаем идентификаторы и данные профиля, нужные для команды и виджетов. Настройки сессий и виджетов хранятся для работы сервиса. Мы не продаём персональные данные.',
      privacyCookiesTitle: 'Cookies и local storage',
      privacyCookiesBody:
        'На лендинге может сохраняться выбранный язык в local storage. В приложении используются cookies для входа и безопасности. Их можно удалить в настройках браузера.',
      privacyContactTitle: 'Контакты',
      privacyContactBody:
        'Вопросы по конфиденциальности — напишите нам в Telegram (ссылка в футере сайта).',
      termsDocumentTitle: 'Условия использования — Stream Helper',
      termsHeading: 'Условия использования',
      termsUpdated: 'Обновлено: 3 октября 2026',
      termsIntro:
        'Используя Stream Helper, вы соглашаетесь с этими условиями. Если не согласны — не пользуйтесь сервисом.',
      termsServiceTitle: 'Сервис',
      termsServiceBody:
        'Stream Helper предоставляет панель и OBS-виджеты для вовлечения на стриме. Функции могут меняться; о существенных изменениях для платных тарифов стараемся предупреждать заранее.',
      termsAccountsTitle: 'Аккаунты и Kick',
      termsAccountsBody:
        'Доступ привязан к Kick OAuth и ролям в команде. Вы отвечаете за действия под своим аккаунтом и за приглашённых модераторов.',
      termsPlansTitle: 'Тарифы и оплата',
      termsPlansBody:
        'Пробный доступ начинается после входа через Kick. Pro и Max подключаются вручную в Telegram; цена и лимиты согласуются индивидуально. Возвраты — по согласованию с поддержкой.',
      termsAcceptableTitle: 'Допустимое использование',
      termsAcceptableBody:
        'Не злоупотребляйте сервисом, не пытайтесь получить несанкционированный доступ и не используйте виджеты с нарушением правил Kick или закона.',
      termsContactTitle: 'Контакты',
      termsContactBody:
        'По условиям и оплате — Telegram (ссылка в футере сайта).',
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

  function preserveLangInLinks(locale) {
    document.querySelectorAll('[data-lang-link]').forEach(function (anchor) {
      var raw = anchor.getAttribute('href')
      if (!raw || raw.charAt(0) === '#') {
        return
      }
      if (raw.indexOf('http:') === 0 || raw.indexOf('https:') === 0) {
        return
      }
      try {
        var url = new URL(raw, window.location.href)
        url.searchParams.set('lang', locale)
        anchor.setAttribute('href', url.pathname + url.search + url.hash)
      } catch {
        /* ignore */
      }
    })
  }

  function apply(locale) {
    var strings = copy[locale] || copy.en
    document.documentElement.lang = locale
    var titleKey = document.documentElement.getAttribute('data-i18n-title')
    if (titleKey) {
      if (strings[titleKey]) {
        document.title = strings[titleKey]
      }
    } else if (strings.documentTitle) {
      document.title = strings.documentTitle
    }
    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      var key = node.getAttribute('data-i18n')
      if (key && strings[key]) {
        node.textContent = strings[key]
      }
    })
    updateLangSelect(locale, strings)
    document.querySelectorAll('[data-telegram-support]').forEach(function (node) {
      node.href = TELEGRAM_SUPPORT_URL
    })
    preserveLangInLinks(locale)
  }

  function closeLangSelect() {
    var root = document.getElementById('lang-select')
    if (root) {
      root.removeAttribute('open')
    }
  }

  function updateLangSelect(locale, strings) {
    var meta = LOCALE_META[locale] || LOCALE_META.en
    var trigger = document.getElementById('lang-select-trigger')
    var flagEl = document.getElementById('lang-select-flag')
    var codeEl = document.getElementById('lang-select-code')
    if (trigger && strings.langSelectAria) {
      trigger.setAttribute('aria-label', strings.langSelectAria)
    }
    if (flagEl) {
      var img = flagEl.querySelector('img')
      if (!img) {
        flagEl.textContent = ''
        img = document.createElement('img')
        img.width = 20
        img.height = 15
        img.alt = ''
        flagEl.appendChild(img)
      }
      img.src = flagSrc(meta.flagAsset)
    }
    if (codeEl) {
      codeEl.textContent = meta.code
    }
    document.querySelectorAll('.lang-select__option[data-locale]').forEach(function (option) {
      var active = option.getAttribute('data-locale') === locale
      option.setAttribute('aria-selected', active ? 'true' : 'false')
    })
  }

  function initLangSelect(setLocale) {
    var root = document.getElementById('lang-select')
    if (!root) {
      return
    }

    root.querySelectorAll('.lang-select__option[data-locale]').forEach(function (option) {
      option.addEventListener('click', function () {
        var next = option.getAttribute('data-locale')
        if (!next || LOCALES.indexOf(next) < 0) {
          return
        }
        setLocale(next)
        root.removeAttribute('open')
      })
    })

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeLangSelect()
      }
    })
  }

  function init() {
    var locale = readQueryLocale() || readStored() || detectBrowserLocale()
    writeStored(locale)
    apply(locale)

    initLangSelect(function (next) {
      locale = next
      writeStored(locale)
      apply(locale)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
