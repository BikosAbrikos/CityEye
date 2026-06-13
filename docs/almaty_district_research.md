# Индекс качества городской среды по 6 районам Алматы (2024–2026)

## TL;DR
- Самый проблемный из шести районов — **Алатауский** (Индекс **41**, «mid» на грани «poor»): треть дорог (>200 км) не асфальтирована, а инженерные сети (вода, канализация, освещение) строятся буквально «с нуля». Самый благополучный — **Алмалинский** (Индекс **71**, «good»): компактный центр с лучшей в городе инфраструктурой.
- Главные «болевые» категории по городу — **дороги** (по словам и.о. руководителя Управления городской мобильности, доля дорог в хорошем и удовлетворительном состоянии на конец 2024 г. составила 92%, цель — довести до 95% в 2025 г.; всего ~3000 км) и **мусор** (нелегальные свалки концентрируются в северных промышленных и частных секторах — Турксибский, Алатауский).
- Данные по дорогам, освещению и мусору имеют среднюю достоверность (есть районная разбивка/привязка), а по знакам/разметке и вандализму — низкую (статистика только общегородская), поэтому оценки этих двух категорий выставлены экспертно и помечены «оценка».

## Методика и веса

Источники нормировки — численность и площадь районов по бюджету Алматы на 2026 год (bes.media, 17.02.2026), с перекрёстной проверкой по геопорталу alag.kz и статистике stat.gov.kz (город — 2 341,9 тыс. на 1 ноября 2025 г.):

| Район | Население (2026, окр.) | Площадь | Плотность (чел/км²) |
|---|---|---|---|
| Алмалинский | >269 тыс | 1840 га (18,4 км²) | ~14 600 |
| Бостандыкский | >338 тыс | 9943 га (99,4 км²) | ~3 400 |
| Медеуский | >251 тыс | 25 340 га (253,4 км²) | ~990 |
| Ауэзовский | >358 тыс | 2350 га (23,5 км²) | ~15 200 |
| Турксибский | >266 тыс | 7575 га (75,8 км²) | ~3 510 |
| Алатауский | >384 тыс | 10 495 га (105 км²) | ~3 660 |

Для каждой категории выставлена «нагрузка проблем» (load) от 0 (проблем почти нет) до 100 (очень много), с учётом плотности населения и площади. Суммарная нагрузка = взвешенное среднее с весами: roads 0.30, waste 0.25, lighting 0.15, signage 0.10, vandalism 0.10, other 0.10. **Индекс качества = 100 − суммарная нагрузка.** bucket: good ≥70, mid 40–69, poor <40.

### Расчёт индекса по районам

- **Алмалинский:** 0.30·30 + 0.25·30 + 0.15·20 + 0.10·30 + 0.10·40 + 0.10·25 = 9 + 7,5 + 3 + 3 + 4 + 2,5 = 29 → **Индекс 71**
- **Бостандыкский:** 0.30·40 + 0.25·35 + 0.15·42 + 0.10·35 + 0.10·35 + 0.10·30 = 12 + 8,75 + 6,3 + 3,5 + 3,5 + 3 = 37 → **Индекс 63**
- **Медеуский:** 0.30·38 + 0.25·35 + 0.15·35 + 0.10·30 + 0.10·35 + 0.10·50 = 11,4 + 8,75 + 5,25 + 3 + 3,5 + 5 = 37 → **Индекс 63**
- **Ауэзовский:** 0.30·42 + 0.25·45 + 0.15·38 + 0.10·35 + 0.10·38 + 0.10·40 = 12,6 + 11,25 + 5,7 + 3,5 + 3,8 + 4 = 41 → **Индекс 59**
- **Турксибский:** 0.30·48 + 0.25·58 + 0.15·42 + 0.10·42 + 0.10·38 + 0.10·52 = 14,4 + 14,5 + 6,3 + 4,2 + 3,8 + 5,2 = 48 → **Индекс 52**
- **Алатауский:** 0.30·72 + 0.25·58 + 0.15·55 + 0.10·50 + 0.10·30 + 0.10·66 = 21,6 + 14,5 + 8,25 + 5 + 3 + 6,6 = 59 → **Индекс 41**

## Key Findings

1. **Чёткий градиент «центр → окраина».** Старые центральные районы (Алмалинский, частично Медеуский) имеют лучшую инфраструктуру; присоединённые/новые периферийные районы (Алатауский, Турксибский) несут основную нагрузку проблем.
2. **Дороги — главный драйвер недовольства.** Премьер-министр Олжас Бектенов на заседании правительства (март 2026) отмечал, что число обращений по местным дорогам выросло в 1,5 раза и достигло около 60 тысяч по стране, а в 2026 г. уже поступило примерно 7,5 тысячи жалоб (рост зафиксирован за 2025 год). С 2024 г. ямочный ремонт передан районным акиматам.
3. **Мусор концентрируется на севере.** Стихийные свалки фиксируются в Турксибском (мкр Кайрат, ул. Челюскин — по данным ecokarta.kz) и Алатауском районах. По данным Almaty Air Initiative (Жулдыз Саулебекова), «северо-восточные районы Алматы — Жетысуский, Турксибский, восточная часть Алатауского и северная часть Ауэзовского — остаются самыми загрязнёнными»; по итогам 2025 г. Турксибский показал ~46,8 мкг/м³ PM2.5 против ~22,1 у Бостандыкского.
4. **Освещение почти решено к 2025 г.** По словам руководителя ГКП «Алматы Қала Жарық» Игоря Мысика, «уже в 2024 году довели уровень освещённости Алматы до 85%», задача на 2025 год — 100% (поручение президента Токаева, август 2023 г.). Больше всего жалоб на негорящие фонари исторически шло из Бостандыкского района, на отсутствие фонарей — из Алатауского.

## Details (по категориям)

**Дороги.** В 2024 г. ямочным ремонтом планировалось охватить: Алмалинский — 39,8 тыс. кв. м, Бостандыкский — >30 тыс. кв. м (≈100 улиц), Медеуский и Ауэзовский — по 50 тыс. кв. м, Турксибский — 30 тыс. кв. м (zakon.kz, 2024). В Алатауском районе треть дорог (>200 км) исторически не асфальтирована; асфальтирование откладывается до прокладки инженерных сетей (informburo.kz; almaty.tv, 2026).

**Мусор.** По данным и.о. руководителя управления экологии Алматы Мираса Гайсина (15.04.2024), «сбором и вывозом ТБО в Алматы занимается 21 мусоровывозящая организация, задействовано 237 единиц техники. Объём отходов составляет 450 тысяч тонн». Решением маслихата №111 от 15.04.2024 тариф для населения повышен на 30% — с 553,04 до 718,5 тг/чел в месяц (с 01.05.2024). Стихийные свалки фиксируются в основном в частном секторе и промзонах севера.

**Освещение.** На начало 2019 г. наибольшая доля светоточек — в Медеуском (15,8%) и Алатауском (15,6%) районах (liter.kz). В 2024 г. заменено >30 тыс. светильников, работают 40+ ремонтных бригад (akj.kz; tengrinews.kz).

**Знаки и разметка.** Общегородская проблема: по данным sotreport.kz, разметка краской служит 4–5 месяцев (холодным пластиком — >12). Районной статистики нет; центральные улицы обслуживаются заметно лучше периферийных — оценка экспертная.

**Вандализм.** В 2024 г. в Алматы уничтожено более 6 тыс. запрещённых граффити, выявлено >900 административных нарушений (time.kz, прокуратура города). В 2025 г. в рамках кампании «Алматы — наш общий дом» планировалось установить 12 тыс. антивандальных урн. Районной разбивки нет — оценка экспертная.

**Прочее (коммунальное).** Алатауский — дефицит воды/канализации (полное обеспечение обещано к концу 2026 г.); Медеуский — нехватка воды в горных мкр (Каменское плато), оползень Тау-Самал (февраль 2024), полное подключение к воде/канализации только к 2028 г.; Турксибский — 600 ветхих домов и худшее качество воздуха.

## JSON

```json
[
  {
    "name": "Алмалинский",
    "index_score": 71,
    "bucket": "good",
    "categories": {
      "roads":     { "load": 30, "note": "Центральный район; ямочный ремонт 39,8 тыс. кв. м в 2024 г., 33 двора обновлены в 2025 г.", "source": "https://www.zakon.kz/amp/stati/6429464-lovushki-na-dorogakh-zhiteli-almaty-i-oblasti-zhaluyutsya-na-yamy-i-otkrytye-lyuki.html" },
      "waste":     { "load": 30, "note": "Плотный центр, но хорошо обслуживается; стихийных свалок мало (оценка на базе общегородских данных)", "source": "https://kz.kursiv.media/2024-04-15/tksh-tarif-musor-almaty/" },
      "lighting":  { "load": 20, "note": "Первым подписал договор с АҚЖ, центральные улицы освещены", "source": "https://informburo.kz/stati/almaty-vo-tme-pocemu-v-gorode-takoe-ploxoe-osveshhenie-i-budet-li-cto-to-menyatsya" },
      "signage":   { "load": 30, "note": "Центральные улицы обслуживаются лучше; районной статистики нет (оценка)", "source": "https://sotreport.kz/report/kachestvo-dorozhnoj-razmetki-pravila-dengi-i-kachestvo/" },
      "vandalism": { "load": 40, "note": "Центр — больше целей для граффити, но быстро закрашивают (оценка)", "source": "https://time.kz/news/society/2024/12/09/bolee-6-tys-zapreshhennyh-graffiti-unichtozhili-v-almaty" },
      "other":     { "load": 25, "note": "Минимальный коммунальный дефицит, реализовано 45 проектов БНУ в 2025 г.", "source": "https://almalife.kz/officially/7095-almalinskij-rajon-almaty-obnovlyaetsya-novye-skvery-zelenye-ulitsy-i-proekty-dlya-aktivnykh-gorozhan" }
    },
    "summary": "Компактный центральный район с лучшей инфраструктурой города; основные проблемы — точечная застройка и граффити в исторической застройке.",
    "confidence": "medium",
    "sources": ["https://bes.media/news/byudzhet-almati-na-2026-god-kak-podelyat-milliardi-mezhdu-rayonnimi-akimatami/", "https://almalife.kz/officially/7095-almalinskij-rajon-almaty-obnovlyaetsya-novye-skvery-zelenye-ulitsy-i-proekty-dlya-aktivnykh-gorozhan"]
  },
  {
    "name": "Бостандыкский",
    "index_score": 63,
    "bucket": "mid",
    "categories": {
      "roads":     { "load": 40, "note": "Ямочный ремонт >30 тыс. кв. м на ~100 улицах в 2024 г.", "source": "https://www.zakon.kz/amp/stati/6429464-lovushki-na-dorogakh-zhiteli-almaty-i-oblasti-zhaluyutsya-na-yamy-i-otkrytye-lyuki.html" },
      "waste":     { "load": 35, "note": "Урбанизированный район, обслуживается удовлетворительно; чистый воздух (~22,1 мкг/м³ PM2.5 в 2025 г.)", "source": "https://inbusiness.kz/ru/news/zhizn-so-smogom-v-kakih-rajonah-almaty-samyj-gryaznyj-vozduh" },
      "lighting":  { "load": 42, "note": "Исторически больше всего жалоб на негорящие фонари", "source": "https://liter.kz/almatinczy-massovo-zhaluyutsya-na-nerabotayushhie-fonari/" },
      "signage":   { "load": 35, "note": "Смешанная застройка; районной статистики нет (оценка)", "source": "https://sotreport.kz/report/kachestvo-dorozhnoj-razmetki-pravila-dengi-i-kachestvo/" },
      "vandalism": { "load": 35, "note": "Умеренный уровень (оценка)", "source": "https://time.kz/news/society/2024/12/09/bolee-6-tys-zapreshhennyh-graffiti-unichtozhili-v-almaty" },
      "other":     { "load": 30, "note": "Относительно благополучен, >50 проектов БНУ", "source": "https://open-almaty.kz/novosti/almalinskij-rajon-preobrazhenie-ulits-i-obshchestvennykh-obektov-po-zaprosam-zhitelej-almaty" }
    },
    "summary": "Молодёжный, относительно благополучный район; основная проблема — жалобы на неработающее уличное освещение.",
    "confidence": "medium",
    "sources": ["https://bes.media/news/byudzhet-almati-na-2026-god-kak-podelyat-milliardi-mezhdu-rayonnimi-akimatami/", "https://liter.kz/almatinczy-massovo-zhaluyutsya-na-nerabotayushhie-fonari/"]
  },
  {
    "name": "Медеуский",
    "index_score": 63,
    "bucket": "mid",
    "categories": {
      "roads":     { "load": 38, "note": "Центр в хорошем состоянии; в горных мкр (Каменское плато, Музтау) дороги восстанавливают после прокладки сетей", "source": "https://www.inalmaty.kz/news/3959187/akim-almaty-porucil-uskorit-i-ulucsit-kacestvo-rabot-v-medeuskom-rajone" },
      "waste":     { "load": 35, "note": "Центр чистый, но огромная площадь с горными зонами (оценка)", "source": "https://kz.kursiv.media/2024-04-15/tksh-tarif-musor-almaty/" },
      "lighting":  { "load": 35, "note": "Наибольшая доля светоточек (15,8%), но в горных мкр есть пробелы", "source": "https://liter.kz/almatinczy-massovo-zhaluyutsya-na-nerabotayushhie-fonari/" },
      "signage":   { "load": 30, "note": "Центральные улицы обслуживаются хорошо (оценка)", "source": "https://sotreport.kz/report/kachestvo-dorozhnoj-razmetki-pravila-dengi-i-kachestvo/" },
      "vandalism": { "load": 35, "note": "Туристический центр, умеренный уровень (оценка)", "source": "https://time.kz/news/society/2024/12/09/bolee-6-tys-zapreshhennyh-graffiti-unichtozhili-v-almaty" },
      "other":     { "load": 50, "note": "Дефицит воды в горных мкр, оползень Тау-Самал (02.2024), полное подключение к воде/канализации лишь к 2028 г.", "source": "https://informburo.kz/novosti/polnostiu-podkliucit-k-vode-i-kanalizacii-obeshhaiut-medeuskii-raion-k-2028-godu" }
    },
    "summary": "Контрастный район: благоустроенный элитный центр и проблемные горные микрорайоны с дефицитом воды и оползневыми рисками.",
    "confidence": "medium",
    "sources": ["https://bes.media/news/byudzhet-almati-na-2026-god-kak-podelyat-milliardi-mezhdu-rayonnimi-akimatami/", "https://informburo.kz/novosti/polnostiu-podkliucit-k-vode-i-kanalizacii-obeshhaiut-medeuskii-raion-k-2028-godu"]
  },
  {
    "name": "Ауэзовский",
    "index_score": 59,
    "bucket": "mid",
    "categories": {
      "roads":     { "load": 42, "note": "Самый плотнонаселённый, старый жилфонд; текущий ремонт 20 тыс. кв. м в 2025 г.", "source": "https://www.inform.kz/ru/dorogi-ariki-avtobusi-kak-menyaetsya-auezovskiy-rayon-almati-239d7b" },
      "waste":     { "load": 45, "note": "Высокая плотность; санитарные проблемы у автовокзала Сайран", "source": "https://tengrinews.kz/kazakhstan_news/akim-almatyi-potreboval-navesti-poryadok-rayone-avtovokzala-577670/" },
      "lighting":  { "load": 38, "note": "Освещены 7 школ в 2024 г.; умеренный уровень", "source": "https://akj.kz/ru/%D1%80%D0%B5%D1%88%D0%B5%D0%BD%D0%B8%D0%B5-%D0%BF%D1%80%D0%BE%D0%B1%D0%BB%D0%B5%D0%BC-%D1%81-%D0%BE%D1%81%D0%B2%D0%B5%D1%89%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC-%D0%B2-%D0%B0%D0%BB%D0%BC%D0%B0%D1%82%D1%8B/" },
      "signage":   { "load": 35, "note": "Смешанная застройка; районной статистики нет (оценка)", "source": "https://sotreport.kz/report/kachestvo-dorozhnoj-razmetki-pravila-dengi-i-kachestvo/" },
      "vandalism": { "load": 38, "note": "Плотный городской район, умеренный уровень (оценка)", "source": "https://time.kz/news/society/2024/12/09/bolee-6-tys-zapreshhennyh-graffiti-unichtozhili-v-almaty" },
      "other":     { "load": 40, "note": "Старый жилфонд: капремонт фасадов 37 домов в 2025 г.", "source": "https://tengrinews.kz/kazakhstan_news/akim-almatyi-potreboval-navesti-poryadok-rayone-avtovokzala-577670/" }
    },
    "summary": "Самый густонаселённый район со старым жилфондом; ключевые проблемы — нагрузка на дороги/уборку и санитарное состояние у автовокзала Сайран.",
    "confidence": "low",
    "sources": ["https://bes.media/news/byudzhet-almati-na-2026-god-kak-podelyat-milliardi-mezhdu-rayonnimi-akimatami/", "https://tengrinews.kz/kazakhstan_news/akim-almatyi-potreboval-navesti-poryadok-rayone-avtovokzala-577670/"]
  },
  {
    "name": "Турксибский",
    "index_score": 52,
    "bucket": "mid",
    "categories": {
      "roads":     { "load": 48, "note": "Промышленный север, ветхое жильё; ямочный ремонт 30 тыс. кв. м в 2024 г.", "source": "https://www.zakon.kz/amp/stati/6429464-lovushki-na-dorogakh-zhiteli-almaty-i-oblasti-zhaluyutsya-na-yamy-i-otkrytye-lyuki.html" },
      "waste":     { "load": 58, "note": "Стихийные свалки строительного и бытового мусора (мкр Кайрат, ул. Челюскин)", "source": "https://ecokarta.kz/appeal" },
      "lighting":  { "load": 42, "note": "Освещение улучшается через БНУ (>30 дворов)", "source": "https://inbusiness.kz/ru/news/kak-izmenitsya-turksibskij-rajon-almaty-v-2024-godu" },
      "signage":   { "load": 42, "note": "Периферийный район; районной статистики нет (оценка)", "source": "https://sotreport.kz/report/kachestvo-dorozhnoj-razmetki-pravila-dengi-i-kachestvo/" },
      "vandalism": { "load": 38, "note": "Промышленный район, умеренный уровень (оценка)", "source": "https://time.kz/news/society/2024/12/09/bolee-6-tys-zapreshhennyh-graffiti-unichtozhili-v-almaty" },
      "other":     { "load": 52, "note": "600 ветхих домов; самый загрязнённый по воздуху северо-восток (~46,8 мкг/м³ PM2.5 в 2025 г.)", "source": "https://inbusiness.kz/ru/news/zhizn-so-smogom-v-kakih-rajonah-almaty-samyj-gryaznyj-vozduh" }
    },
    "summary": "Промышленный северный район с ветхим жильём, стихийными свалками и худшим качеством воздуха в городе.",
    "confidence": "medium",
    "sources": ["https://bes.media/news/byudzhet-almati-na-2026-god-kak-podelyat-milliardi-mezhdu-rayonnimi-akimatami/", "https://inbusiness.kz/ru/news/zhizn-so-smogom-v-kakih-rajonah-almaty-samyj-gryaznyj-vozduh"]
  },
  {
    "name": "Алатауский",
    "index_score": 41,
    "bucket": "mid",
    "categories": {
      "roads":     { "load": 72, "note": "Треть дорог (>200 км) не асфальтирована; жалобы на ямы и грязь (мкр Рахат-Мадениет)", "source": "https://tengrinews.kz/kazakhstan_news/nadeyus-zametite-menya-almatinskiy-shkolnik-pojalovalsya-594120/" },
      "waste":     { "load": 58, "note": "Частный сектор, инфраструктурный дефицит, стихийные свалки", "source": "https://informburo.kz/special/alatauskii-raion-almaty-put-ot-pustosi-k-civilizacii" },
      "lighting":  { "load": 55, "note": "Больше всего жалоб на отсутствие фонарей; освещение строится с нуля", "source": "https://liter.kz/almatinczy-massovo-zhaluyutsya-na-nerabotayushhie-fonari/" },
      "signage":   { "load": 50, "note": "Периферийный, слабая инфраструктура (оценка)", "source": "https://sotreport.kz/report/kachestvo-dorozhnoj-razmetki-pravila-dengi-i-kachestvo/" },
      "vandalism": { "load": 30, "note": "Менее плотный, ниже уровень (оценка)", "source": "https://time.kz/news/society/2024/12/09/bolee-6-tys-zapreshhennyh-graffiti-unichtozhili-v-almaty" },
      "other":     { "load": 66, "note": "Вода/канализация строятся с нуля, обеспечение обещано к концу 2026 г.", "source": "https://almaty.tv/ru/news/dgizn-megapolisa/dorogi-osvesenie-i-snos-domov-cto-izmenitsa-v-alatauskom-rajone-almaty" }
    },
    "summary": "Самый молодой и быстрорастущий район с системным дефицитом базовой инфраструктуры — дорог, воды, канализации и освещения; худший индекс из шести.",
    "confidence": "medium",
    "sources": ["https://bes.media/news/byudzhet-almati-na-2026-god-kak-podelyat-milliardi-mezhdu-rayonnimi-akimatami/", "https://informburo.kz/special/alatauskii-raion-almaty-put-ot-pustosi-k-civilizacii"]
  }
]
```

## Recommendations

1. **Приоритет №1 — Алатауский район:** направить капитальные вложения на асфальтирование (>200 км грунтовых дорог) и завершение инженерных сетей. Порог пересмотра: если доля асфальтированных дорог в районе превысит 85%, roads-load снизится с 72 до ~45, а индекс вырастет с 41 до ~50.
2. **Турксибский — борьба со свалками и качеством воздуха:** усилить контроль за частным сектором и промзонами; ускорить перевод ТЭЦ-2 на газ. Порог: ликвидация фиксируемых на ecokarta.kz точек снизит waste-load с 58 до ~40 (индекс → ~57).
3. **Медеуский — горные микрорайоны:** ускорить подключение к воде/канализации (план до 2028 г.) и противооползневую защиту; это снизит other-load с 50 до ~30.
4. **Бостандыкский — освещение:** завершить замену фонарей; при выходе на 100% покрытие lighting-load упадёт с 42 до ~25, индекс вырастет с 63 до ~66.
5. **Сбор районной статистики (системная мера):** акимату следует публиковать обращения через Open Almaty / iKomek 109 в разбивке по районам И категориям (дороги/мусор/свет/знаки/вандализм). Это позволит заменить экспертные оценки (signage, vandalism) на фактические данные и повысить confidence с low/medium до high.

## Caveats
- **Население и площадь** — округлённые цифры из бюджета-2026 (bes.media, 17.02.2026), сверенные с геопорталом alag.kz; это не точный перепись-учёт (расхождения по Медеускому: 25 340 га по бюджету vs 27 310,9 га по alag.kz).
- **Категории «знаки/разметка» и «вандализм»** не имеют районной статистики — нагрузки выставлены экспертно на базе общегородских данных и помечены «оценка»; confidence по ним низкая.
- **Многие «дорожные» и «коммунальные» данные** относятся к планам ремонта (2024–2025) и заявлениям акиматов, а не к независимо подтверждённому фактическому исполнению; ряд формулировок источников использует будущее время («планируется», «обещано»), что отражено в оценках.
- **Индекс отражает относительное сравнение шести районов между собой**, а не абсолютную оценку качества среды; он не охватывает Жетысуский и Наурызбайский районы.
- Достоверность по Ауэзовскому помечена «low» из-за наибольшего разрыва между плотностью населения (самая высокая в выборке) и отсутствием прямой статистики обращений по району.