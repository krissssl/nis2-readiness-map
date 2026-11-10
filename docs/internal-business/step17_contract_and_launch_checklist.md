# Шаг 17. Договорная база и чек-лист перед первым платным клиентом

> Шаблон ниже НЕ является юридическим документом. Перед использованием его должен просмотреть юрист в Латвии.

---

# ЧАСТЬ A. Чек-лист рисков (прочитать ДО шаблона)

## A1. Твоя связь с QUANT — проверить первой
Ты «наполовину сотрудник» QUANT. Прежде чем продавать похожие услуги другим охранным компаниям, нужно выяснить:
- [ ] Есть ли в твоём договоре с QUANT **запрет конкуренции** или оговорка о **конфликте интересов**.
- [ ] Кому принадлежат **права на созданное**: методология, инструмент, шаблоны. Если они создавались в рамках твоих обязанностей или с использованием ресурсов/информации QUANT, права могут принадлежать компании.
- [ ] Нет ли **обязательства о конфиденциальности**, которое охватывает информацию о QUANT (в инструменте и документах она есть: порты, число сотрудников, структура ИТ).
- [ ] Знает ли руководство QUANT, что ты собираешься предлагать это другим. Рекомендация та же, что в step12: спросить явно, лучше письменно.

Это самый важный пункт чек-листа. Если ответ плохой, остальное не имеет смысла.

## A2. Конфиденциальность данных клиентов в инструменте
Нужно исправить моё прежнее утверждение. Я писал, что проекты «полностью изолированы». Это верно **только на уровне структуры данных** (разные пути в базе). Контроля доступа между проектами нет:
- Любой человек, у которого есть ссылка на инструмент, видит **общий список всех проектов** на экране выбора и может открыть любой из них.
- Если дать ссылку клиенту А, он увидит, что существует клиент Б, и может открыть его данные.

**Для реальных клиентов это неприемлемо.** Безопасный вариант на старте: **отдельная копия инструмента на каждого клиента**, ссылка передаётся только этому клиенту. Мультипроектный режим годится для демо и для твоей собственной работы, но не для одновременного доступа нескольких клиентов к одной копии.
- [ ] Решить, как будешь разворачивать инструмент для каждого клиента (отдельная публикация на клиента).
- [ ] Не вносить в инструмент данные, которые клиент не готов доверить внешней платформе. Учесть, что данные хранятся на платформе Claude, а не на серверах клиента или твоих.

## A3. Персональные данные (GDPR)
В инструмент попадают имена ответственных лиц и описания систем. Это немного, но не ноль.
- [ ] Определить роли: как правило, клиент — оператор данных, ты — обработчик (если получаешь доступ к ПД). Если ПД не обрабатываешь, прямо зафиксировать в договоре, что **вводить ПД в инструмент не нужно**.
- [ ] Убедиться, что у клиента нет требований хранить данные только в ЕС.

## A4. Правовой статус для выставления счетов
- [ ] Как ты будешь оказывать услуги: как самозанятый, ИП или через SIA. От этого зависят счета, налоги, страхование. Это вопрос к бухгалтеру, а не к инструменту.
- [ ] Страхование профессиональной ответственности: при консалтинге по комплаенсу стоит рассмотреть.

## A5. Границы услуги (чтобы не обещать лишнего)
- [ ] Не обещать «соответствие NIS2» или «статус от NKDC»: ты не можешь это гарантировать.
- [ ] Не называть услугу юридической консультацией.
- [ ] Не обещать пентест и аудит как свои услуги: это партнёры (вкладка Partneri).

---

# ЧАСТЬ B. ШАБЛОН ДОГОVORA (латышский язык)

**Pakalpojumu sniegšanas līgums Nr. [___]**

[Vieta], [datums]

**Pasūtītājs:** [uzņēmuma nosaukums], reģ. Nr. [___], juridiskā adrese [___], ko pārstāv [amats, vārds, uzvārds]
**Izpildītājs:** [vārds, uzvārds / uzņēmums], [personas kods / reģ. Nr.], [adrese]

## 1. Līguma priekšmets
1.1. Izpildītājs sniedz Pasūtītājam kiberdrošības sagatavotības konsultāciju pakalpojumus (turpmāk — Pakalpojumi) izvēlētās pakotnes apjomā:
- ☐ Novērtējuma pakete
- ☐ Apmācības programma
- ☐ Pilnā programma
1.2. Pakalpojumu saturu, posmus un rezultātus nosaka Pielikums Nr. 1 (Pakalpojuma apraksts).

## 2. Pakalpojumu raksturs un ierobežojumi
2.1. Pakalpojumi ir **konsultatīvi un metodiski**. Tie **nav juridiskā konsultācija**, **nav neatkarīgs audits** un **nav ielaušanās tests**.
2.2. Izpildītājs **negarantē**, ka Pasūtītājs pēc Pakalpojumu saņemšanas atbildīs NIS2 prasībām, Nacionālās kiberdrošības likumam vai MK noteikumiem Nr. 397, kā arī negarantē kompetento iestāžu (NKDC, SAB, CERT.LV) lēmumus.
2.3. Piemērojamības statusa noteikšana ir Pasūtītāja pašnovērtējums. Gala atbildība par Pasūtītāja statusa noteikšanu un pienākumu izpildi paliek Pasūtītājam.
2.4. Ja nepieciešami speciālisti (jurists, sertificēts pentesta sniedzējs, auditors), Izpildītājs var ieteikt trešās personas. Līgumu ar tām slēdz Pasūtītājs, un Izpildītājs nav atbildīgs par to pakalpojumu kvalitāti.

## 3. Pasūtītāja pienākumi
3.1. Nodrošināt savlaicīgu piekļuvi nepieciešamajai informācijai un atbildīgajām personām.
3.2. Sniegt patiesu un pilnīgu informāciju. Rezultātu kvalitāte ir atkarīga no sniegto datu precizitātes.
3.3. Neievadīt darba instrumentā personas datus un citu informāciju, kuras nodošana ārējai platformai nav saskaņota ar Pasūtītāja iekšējiem noteikumiem. [Jāprecizē ar juristu.]

## 4. Cena un norēķini
4.1. Pakalpojumu fiksētā cena: EUR [___] [bez/ar] PVN.
4.2. Norēķini: [piem., 50 % avanss, 50 % pēc rezultātu nodošanas] 10 dienu laikā no rēķina saņemšanas.
4.3. Izmaiņas apjomā, kas pārsniedz Pielikumu Nr. 1, tiek saskaņotas rakstiski un apmaksātas atsevišķi.

## 5. Termiņi
5.1. Pakalpojumu sniegšanas laiks: no [datums] līdz [datums], ja vien Puses nesaskaņo citādi.
5.2. Termiņi var tikt pagarināti, ja Pasūtītājs nav savlaicīgi nodrošinājis nepieciešamo informāciju.

## 6. Konfidencialitāte
6.1. Puses uzņemas neizpaust trešajām personām otras Puses konfidenciālo informāciju, ieskaitot informāciju par Pasūtītāja IT sistēmām, drošības kontroli un atklātajām nepilnībām.
6.2. Izpildītājs drīkst izmantot **anonimizētu** pieredzi un metodiku turpmākajā darbā, **neminot Pasūtītāju** un neatklājot tā datus. Pasūtītāja nosaukuma izmantošana kā atsauce — tikai ar rakstisku piekrišanu.
6.3. Konfidencialitātes pienākums ir spēkā [__] gadus pēc līguma beigām.

## 7. Personas dati
7.1. Puses neparedz, ka Izpildītājs apstrādās personas datus Pasūtītāja uzdevumā, izņemot minimālu kontaktinformāciju darba organizēšanai.
7.2. Ja personas datu apstrāde izrādās nepieciešama, Puses slēdz atsevišķu datu apstrādes līgumu atbilstoši Regulai (ES) 2016/679.

## 8. Intelektuālais īpašums
8.1. Izpildītāja metodika, darba instruments, veidnes un cits iepriekš radītais saturs paliek Izpildītāja īpašums.
8.2. Pasūtītājam tiek piešķirtas nebeidzamas, neekskluzīvas tiesības izmantot **tieši Pasūtītājam sagatavotos** dokumentus un rezultātus savām iekšējām vajadzībām.
8.3. [Jāprecizē ar juristu: tiesības uz darba instrumenta piekļuvi pēc līguma beigām — cik ilgi un uz kādiem nosacījumiem.]

## 9. Atbildība
9.1. Izpildītāja atbildība ir ierobežota ar Pasūtītāja faktiski samaksāto summu par attiecīgo Pakalpojumu, ciktāl to pieļauj piemērojamie tiesību akti.
9.2. Izpildītājs neatbild par netiešiem zaudējumiem, negūtu peļņu, kā arī par sankcijām vai lēmumiem, ko piemēro kompetentās iestādes.
9.3. Ierobežojums neattiecas uz gadījumiem, kad likums to neļauj ierobežot (piem., tīšu darbību vai rupju neuzmanību). [Jāpārbauda ar juristu.]

## 10. Līguma izbeigšana
10.1. Katra Puse var izbeigt līgumu, rakstiski brīdinot otru Pusi [__] dienas iepriekš.
10.2. Izbeidzot līgumu, Pasūtītājs apmaksā līdz izbeigšanas brīdim faktiski sniegtos Pakalpojumus.

## 11. Strīdi un piemērojamais likums
11.1. Līgumam piemērojami Latvijas Republikas tiesību akti. Strīdus Puses risina sarunu ceļā, bet, ja vienošanās nav panākta, — Latvijas Republikas tiesā.

## 12. Noslēguma noteikumi
12.1. Līgums stājas spēkā ar abu Pušu parakstīšanas brīdi. Grozījumi — rakstiski.

**Pielikums Nr. 1 — Pakalpojuma apraksts** *(aizpildīt katram klientam atsevišķi: ko iekļauj pakete, kādi rezultāti, cik tikšanos, kādi Pasūtītāja pienākumi)*

Pasūtītājs: __________  Izpildītājs: __________

---

# Что юрист должен проверить в первую очередь
1. Пункты 8.3, 9.1-9.3: интеллектуальная собственность и ограничение ответственности.
2. Пункты 3.3 и 7: роли по GDPR и допустимость хранения данных на внешней платформе.
3. Формулировки 2.1-2.3: чтобы услуга не квалифицировалась как юридическая консультация или аудит.
4. Соответствие налоговому статусу (пункт 4).
