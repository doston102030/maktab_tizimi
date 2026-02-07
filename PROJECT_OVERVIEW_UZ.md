# Elektron Bell Tizimi - Loyiha Haqida

## Loyiha Maqsadi
Bu loyiha **Elektron Qo'ng'iroq Tizimi** bo'lib, maktablarda dars va tanaffus vaqtlarini avtomatlashtirish uchun mo'ljallangan. Tizim o'qituvchi yoki ma'muriyatga qulay interfeys orqali jadvalni boshqarish imkonini beradi va **ESP32** mikrokontrolleri yordamida haqiqiy qo'ng'iroqni chaladi.

## Asosiy Qismlar

### 1. **Veb Ilova (Frontend)**
- **Texnologiya**: React (Vite), TypeScript, TailwindCSS.
- **Vazifasi**: Foydalanuvchi interfeysi. Jadvalni o'zgartirish, vaqtni ko'rish, qo'ng'iroqni test qilish.
- **Xususiyatlari**:
    - **Jadval**: 2 smena, har bir kun uchun alohida sozlash.
    - **Smart Logika**: Darslar orasida 5 daqiqalik tanaffus avtomatik hisoblanadi.
    - **Qurilma Boshqaruvi**: Wi-Fi orqali ESP32 ga ulanish.

### 2. **Mikrokontroller (Backend/Firmware)**
- **Qurilma**: ESP32 module.
- **Dastur**: Arduino (C++).
- **Vazifasi**: 
    - Wi-Fi Access Point (`ElektronBell`) yaratadi.
    - HTTP server orqali buyruqlarni qabul qiladi.
    - O'z ichki soatiga ega va jadval bo'yicha rele/qo'ng'iroqni boshqaradi.
    - Elektr o'chganda ham sozlamalarni saqlaydi (`Preferences` xotira).

## Hozirgi Holat va O'zgarishlar

Biz oxirgi bosqichda quyidagi ishlarni amalga oshirdik:
1.  **Fixed Break Logic**: Darslar orasidagi tanaffus qat'iy 5 daqiqa qilib belgilandi. Birinchi dars tugash vaqti o'zgarsa, keyingi darslar avtomatik suriladi.
2.  **Sozlamalar Sahifasi**: Yangi dizayn va logika bilan `SettingsPage.tsx` yaratildi. Endi jadvallar "zanjir" usulida bog'langan.
3.  **Integratsiya**: React ilovadan turib ESP32 ga ulanish (`DeviceSettings.tsx`) va ma'lumotlarni yuborish imkoniyati qo'shildi.

## 💾 Ma'lumotlar Qayerda Saqlanadi?

Bu juda muhim tushuncha:
*   **Telefoningizda (Brauzerda)**: Siz jadvalni o'zgartirganingizda, u faqat sizning telefoningizda (`localStorage`) saqlanib turadi. Bu "qoralama" (chernovik) hisoblanadi.
*   **ESP32 da (Qurilmada)**: Qachonki siz "Sozlamalar" -> "Qurilma Sozlamalari" bo'limidan **"Jadvalni Yuklash"** tugmasini bossangizgina, jadval ESP32 ga yuboriladi va uning doimiy xotirasiga yoziladi.

**Demak:**
1.  Jadvalni telefonda o'zgartirasiz.
2.  ESP32 ga "Yuklash" qilasiz.
3.  Shundan so'ng ESP32 o'zi mustaqil ishlayveradi (telefonni o'chirib qo'yish mumkin).

## Foydalanish
1.  Kompyuter yoki telefonni `ElektronBell` Wi-Fi tarmog'iga ulang.
2.  Ilovani oching va "Sozlamalar" bo'limiga o'ting.
3.  Jadvalni o'zgartiring va "Saqlash" tugmasini bosing.
4.  "Qurilma Sozlamalari" bo'limida "Jadvalni Yuklash" tugmasini bosib, yangi vaqtlarni qo'ng'iroqqa yuboring.

Tizim to'liq avtonom ishlaydi va faqat sozlash paytida Wi-Fi ulanish talab etiladi.
