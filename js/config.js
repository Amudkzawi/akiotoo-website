/* ==========================================================================
   AKIOTOO — ВСЕ ДАННЫЕ САЙТА В ОДНОМ МЕСТЕ
   Меняйте значения здесь — сайт подхватит их на всех страницах.
   Всё, что помечено TODO, нужно заполнить реальными данными.
   ========================================================================== */
window.AKIOTOO_CONFIG = {
  /* WhatsApp: номер ТОЛЬКО цифрами, с кодом страны, без + и пробелов.
     Пример для Казахстана: 77011234567 */
  whatsappNumber: '77000000000', // TODO: реальный номер WhatsApp
  whatsappText: 'Здравствуйте, хочу записаться на тату',

  instagram: 'https://instagram.com/', // TODO: ссылка на Instagram студии
  telegram: 'https://t.me/', // TODO: ссылка на Telegram (t.me/username)

  /* Адрес — показывается в блоке «Адрес» и в подвале */
  address: 'г. Костанай, ул. Толстого, 52',
  addressNote: 'Работаем по записи', // TODO: часы работы или уточнение (можно оставить)

  /* 2GIS — карта на картографии 2GIS с меткой студии
     - link: ссылка на карточку студии в 2GIS (кнопка «Открыть в 2GIS» и клик по метке)
     - lat / lon: координаты студии. Как уточнить: в 2GIS кликнуть по зданию →
       координаты видны в адресной строке (…/geo/63.63,53.21 — сначала долгота, потом широта) */
  twoGis: {
    link: 'https://2gis.kz/kostanay/search/%D0%A2%D0%BE%D0%BB%D1%81%D1%82%D0%BE%D0%B3%D0%BE%2052', // TODO: заменить на ссылку на карточку студии в 2GIS (сейчас — поиск «Толстого 52»)
    lat: 53.21144, // дом 52 по подписи на карте 2GIS
    lon: 63.63435,
    zoom: 17
  },

  /* Работы. Чтобы заменить заглушку — положите фото с тем же именем
     в assets/works/ (WebP, ~1000×1250, вертикальное 4:5).
     Чтобы добавить работу — допишите строку. Первые работы идут на главную. */
  works: [
    { src: 'assets/works/work-01.webp', alt: 'Работа AKIOTOO 01' },
    { src: 'assets/works/work-02.webp', alt: 'Работа AKIOTOO 02' },
    { src: 'assets/works/work-03.webp', alt: 'Работа AKIOTOO 03' },
    { src: 'assets/works/work-04.webp', alt: 'Работа AKIOTOO 04' },
    { src: 'assets/works/work-05.webp', alt: 'Работа AKIOTOO 05' },
    { src: 'assets/works/work-06.webp', alt: 'Работа AKIOTOO 06' },
    { src: 'assets/works/work-07.webp', alt: 'Работа AKIOTOO 07' },
    { src: 'assets/works/work-08.webp', alt: 'Работа AKIOTOO 08' },
    { src: 'assets/works/work-09.webp', alt: 'Работа AKIOTOO 09' },
    { src: 'assets/works/work-10.webp', alt: 'Работа AKIOTOO 10' },
    { src: 'assets/works/work-11.webp', alt: 'Работа AKIOTOO 11' },
    { src: 'assets/works/work-12.webp', alt: 'Работа AKIOTOO 12' }
  ],
  homeWorks: 6, // сколько работ на главной (планшет и ПК — сетка 3×2)
  homeWorksMobile: 3 // сколько из них видно на телефоне (по макету — 3)
};
