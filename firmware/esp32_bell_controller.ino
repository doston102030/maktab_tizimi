#include <ArduinoJson.h>
#include <Preferences.h>
#include <WebServer.h>
#include <WiFi.h>
#include <time.h>


// ===== DS1302 (3-wire) =====
#include <RtcDS1302.h>
#include <ThreeWire.h>


// ======== USER SETTINGS ========
static const int OUTPUT_PIN = 25; // Relay IN (sizda 25)
static const bool RELAY_ACTIVE_LOW =
    true; // <<< MUHIM: ko‘p relay ACTIVE-LOW bo‘ladi. Agar teskari bo‘lsa false
          // qiling.

static const char *AP_SSID = "ElektronBell";
static const char *AP_PASS = "12345678"; // 8+ chars or empty for open

// DS1302 pins
static const uint8_t DS1302_CE = 23;   // RST/CE
static const uint8_t DS1302_IO = 19;   // DAT
static const uint8_t DS1302_SCLK = 18; // CLK

// Default timezone offset (UTC+05:00)
static const int TZ_DEFAULT_MINUTES = 300;

// ======== GLOBALS ========
WebServer server(80);
Preferences prefs;

static const size_t CONFIG_DOC_SIZE = 12288;
DynamicJsonDocument configDoc(CONFIG_DOC_SIZE);

bool timeIsSet = false;
bool initialKeySet = false; // <<< bootda shu minutni “skip” qilish uchun
String lastBellKey = "";

unsigned long bellActiveUntilMs = 0;
int tzOffsetMinutes = TZ_DEFAULT_MINUTES;

bool rtcAvailable = false;
unsigned long lastRtcRetryMs = 0;
unsigned long lastRtcSyncMs = 0;
static const unsigned long RTC_RETRY_INTERVAL_MS = 5000UL;
static const unsigned long RTC_SYNC_INTERVAL_MS = 300000UL;

String rtcLastError = "not-read";

ThreeWire rtcWire(DS1302_IO, DS1302_SCLK, DS1302_CE);
RtcDS1302<ThreeWire> Rtc(rtcWire);

// ======== DEFAULT CONFIG ========
const char *DEFAULT_CONFIG_JSON = R"json(
{
  "bellDurationSec": 5,
  "activeDays": [true,true,true,true,true,true,false],
  "shift1": {
    "start": "08:00",
    "end": "12:00",
    "times": ["08:00","08:45","08:55","09:40","09:50","10:35","10:45","11:30"]
  },
  "shift2": {
    "start": "13:00",
    "end": "17:00",
    "times": ["13:00","13:45","13:55","14:40","14:50","15:35","15:45","16:30"]
  },
  "customTimes": [],
  "holidays": []
}
)json";

// ======== HTML UI ========
const char INDEX_HTML[] PROGMEM = R"html(
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Elektron Bell</title>
  <style>
    :root {
      --bg1:#f7f1e8; --bg2:#f0f6ff; --fg:#1e1f22; --muted:#5c6470;
      --accent:#0f766e; --accent-2:#1e40af; --card:#ffffff;
      --shadow:0 10px 24px rgba(15,23,42,.12); --radius:14px;
    }
    * { box-sizing: border-box; font-family: "Trebuchet MS", "Gill Sans", "Calibri", sans-serif; }
    body {
      margin: 0; color: var(--fg);
      background:
        radial-gradient(900px 450px at -10% -10%, #fff7d6 0, transparent 55%),
        radial-gradient(700px 350px at 110% 10%, #dbeafe 0, transparent 55%),
        linear-gradient(180deg, var(--bg1), var(--bg2));
    }
    header {
      padding: 18px 20px;
      background: linear-gradient(120deg, #0f172a, #1f2937 65%, #0f766e);
      color: #fff;
      border-bottom: 3px solid rgba(255,255,255,.08);
    }
    header h1 { margin: 0; font-size: 20px; letter-spacing: .6px; }
    header p { margin: 4px 0 0; font-size: 12px; opacity: .8; }
    main { padding: 16px; display: grid; gap: 16px; max-width: 1024px; margin: 0 auto; }
    .card { background: var(--card); border-radius: var(--radius); padding: 14px; box-shadow: var(--shadow);
      border: 1px solid rgba(15,23,42,.06);
    }
    .row { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    label { font-size: 12px; color: var(--muted); display: block; margin-bottom: 6px; }
    input, textarea, button {
      width: 100%; padding: 10px; border: 1px solid #d0d7de; border-radius: 10px;
      font-size: 14px; background: #fff;
    }
    textarea { min-height: 110px; resize: vertical; }
    button { background: var(--accent); color: #fff; border: none; cursor: pointer; font-weight: 600; letter-spacing: .2px; }
    button.secondary { background: var(--accent-2); }
    .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
    .day { display: flex; align-items: center; gap: 6px; }

    .time-panel { display: grid; gap: 6px; }
    .time-value { font-size: 22px; font-weight: 700; letter-spacing: .5px; }
    .tag { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; background: #f1f5f9;
      border-radius: 999px; font-size: 12px; color: #334155;
    }
    .title { font-size: 14px; font-weight: 700; letter-spacing: .3px; color: #0f172a; margin-bottom: 8px; }
  </style>
</head>
<body>
  <header>
    <h1>Elektron Bell - Admin Panel</h1>
    <p>Wi-Fi AP: ElektronBell</p>
  </header>
  <main>
    <div class="card">
      <div class="row">
        <div>
          <label>Bell davomiyligi (sekund)</label>
          <input id="bellDuration" type="number" min="1" max="30"/>
        </div>
        <div>
          <label>Hozirgi vaqt</label>
          <div class="time-panel">
            <div class="time-value" id="timeStatus">--</div>
            <div class="tag" id="tzStatus">UTC+00:00</div>
            <div class="tag" id="connStatus">connecting...</div>
          </div>
          <button id="setTimeBtn" class="secondary">Hozirgi vaqtni sinxronlash</button>
        </div>
        <div>
          <label>Sinov (LED)</label>
          <button id="testBtn">Bell test</button>
        </div>
      </div>
    </div>

    <div class="card">
      <label>Faol kunlar</label>
      <div class="days">
        <label class="day"><input type="checkbox" id="d0"/>Du</label>
        <label class="day"><input type="checkbox" id="d1"/>Se</label>
        <label class="day"><input type="checkbox" id="d2"/>Ch</label>
        <label class="day"><input type="checkbox" id="d3"/>Pa</label>
        <label class="day"><input type="checkbox" id="d4"/>Ju</label>
        <label class="day"><input type="checkbox" id="d5"/>Sh</label>
        <label class="day"><input type="checkbox" id="d6"/>Ya</label>
      </div>
    </div>

    <div class="card">
      <div class="title">1-smena</div>
      <div class="row">
        <div>
          <label>1-smena (start)</label>
          <input id="s1Start" type="time"/>
        </div>
        <div>
          <label>1-smena (end)</label>
          <input id="s1End" type="time"/>
        </div>
      </div>
      <label>1-smena qo'ng'iroq vaqtlar (har qatorda HH:MM)</label>
      <textarea id="s1Times"></textarea>
    </div>

    <div class="card">
      <div class="title">2-smena</div>
      <div class="row">
        <div>
          <label>2-smena (start)</label>
          <input id="s2Start" type="time"/>
        </div>
        <div>
          <label>2-smena (end)</label>
          <input id="s2End" type="time"/>
        </div>
      </div>
      <label>2-smena qo'ng'iroq vaqtlar (har qatorda HH:MM)</label>
      <textarea id="s2Times"></textarea>
    </div>

    <div class="card">
      <div class="title">Ixtiyoriy vaqtlar</div>
      <label>Har qanday vaqt qo'shish (har qatorda HH:MM)</label>
      <textarea id="customTimes"></textarea>
    </div>

    <div class="card">
      <label>Bayram / dam olish sanalari (YYYY-MM-DD, har qatorda bitta sana)</label>
      <textarea id="holidays"></textarea>
    </div>

    <div class="card">
      <button id="saveBtn">Saqlash</button>
    </div>
  </main>

<script>
const $ = (id) => document.getElementById(id);

// === Client-side clock (WiFi o‘chsa ham soat yurishi uchun) ===
let baseLocalEpoch = null; // seconds
let baseMs = null;
let tzOffsetMinutes = 0;
let lastFetchOk = false;

function pad2(n){ return String(n).padStart(2,'0'); }

function fmtLocalFromEpoch(sec){
  const d = new Date(sec * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = pad2(d.getUTCMonth()+1);
  const dd = pad2(d.getUTCDate());
  const hh = pad2(d.getUTCHours());
  const mi = pad2(d.getUTCMinutes());
  const ss = pad2(d.getUTCSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function updateTzTag(min) {
  const sign = min >= 0 ? '+' : '-';
  const abs = Math.abs(min);
  const hh = pad2(Math.floor(abs / 60));
  const mm = pad2(abs % 60);
  $('tzStatus').textContent = `UTC${sign}${hh}:${mm}`;
}

function tickClock(){
  if (baseLocalEpoch == null || baseMs == null) return;
  const elapsed = Math.floor((Date.now() - baseMs)/1000);
  const cur = baseLocalEpoch + elapsed;
  $('timeStatus').textContent = fmtLocalFromEpoch(cur);
  $('connStatus').textContent = lastFetchOk ? 'online' : 'offline (clock continues)';
}

function linesToArray(text) {
  return text.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0);
}
function arrayToLines(arr) { return (arr || []).join("\n"); }

async function loadConfig() {
  const res = await fetch('/api/config');
  const cfg = await res.json();

  $('bellDuration').value = cfg.bellDurationSec || 5;
  const days = cfg.activeDays || [true,true,true,true,true,true,false];
  days.forEach((v,i)=>{ $('d'+i).checked = !!v; });

  $('s1Start').value = cfg.shift1?.start || '08:00';
  $('s1End').value = cfg.shift1?.end || '12:00';
  $('s1Times').value = arrayToLines(cfg.shift1?.times);

  $('s2Start').value = cfg.shift2?.start || '13:00';
  $('s2End').value = cfg.shift2?.end || '17:00';
  $('s2Times').value = arrayToLines(cfg.shift2?.times);

  $('customTimes').value = arrayToLines(cfg.customTimes);
  $('holidays').value = arrayToLines(cfg.holidays);
}

async function loadTime() {
  try {
    const res = await fetch('/api/time', { cache: 'no-store' });
    const data = await res.json();

    lastFetchOk = !!data.ok;

    if (typeof data.tzOffsetMinutes === 'number') {
      tzOffsetMinutes = data.tzOffsetMinutes;
      updateTzTag(tzOffsetMinutes);
    }

    // server returns localEpoch (UTC-based) already shifted to local, so we format using UTC getters
    if (data.ok && typeof data.localEpoch === 'number') {
      baseLocalEpoch = data.localEpoch;
      baseMs = Date.now();
      $('timeStatus').textContent = fmtLocalFromEpoch(baseLocalEpoch);
    } else if (!data.ok) {
      $('timeStatus').textContent = 'Vaqt sozlanmagan';
    }
  } catch (e) {
    // WiFi o‘chsa ham UI soatni tickClock bilan yuritadi
    lastFetchOk = false;
  }
}

$('setTimeBtn').addEventListener('click', async () => {
  const epoch = Math.floor(Date.now()/1000);
  const tzOffsetMinutes = -new Date().getTimezoneOffset();
  await fetch('/api/time', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({epoch, tzOffsetMinutes}) });
  await loadTime();
});

$('testBtn').addEventListener('click', async () => {
  await fetch('/api/test', { method: 'POST' });
});

$('saveBtn').addEventListener('click', async () => {
  const cfg = {
    bellDurationSec: parseInt($('bellDuration').value || '5', 10),
    activeDays: [0,1,2,3,4,5,6].map(i => $('d'+i).checked),
    shift1: { start: $('s1Start').value, end: $('s1End').value, times: linesToArray($('s1Times').value) },
    shift2: { start: $('s2Start').value, end: $('s2End').value, times: linesToArray($('s2Times').value) },
    customTimes: linesToArray($('customTimes').value),
    holidays: linesToArray($('holidays').value)
  };
  await fetch('/api/config', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(cfg) });
  alert('Saqlandi');
});

loadConfig();
loadTime();

// Fetch time sometimes, but tick always (WiFi bo‘lmasa ham)
setInterval(loadTime, 5000);
setInterval(tickClock, 1000);
</script>
</body>
</html>
)html";

// ======== HELPERS ========
String getConfigJson() {
  String stored = prefs.getString("config", "");
  if (stored.length() == 0)
    return String(DEFAULT_CONFIG_JSON);
  return stored;
}

bool loadConfigDoc() {
  String json = getConfigJson();
  DeserializationError err = deserializeJson(configDoc, json);
  if (err) {
    deserializeJson(configDoc, DEFAULT_CONFIG_JSON);
    return false;
  }
  return true;
}

bool saveConfigJson(const String &json) {
  DeserializationError err = deserializeJson(configDoc, json);
  if (err)
    return false;
  prefs.putString("config", json);
  return true;
}

bool isHoliday(const String &dateStr) {
  JsonArray arr = configDoc["holidays"].as<JsonArray>();
  for (JsonVariant v : arr) {
    if (v.is<const char *>()) {
      if (dateStr == String(v.as<const char *>()))
        return true;
    }
  }
  return false;
}

bool timeInArray(const String &hhmm, JsonArray arr) {
  if (arr.isNull())
    return false;
  for (JsonVariant v : arr) {
    if (v.is<const char *>()) {
      if (hhmm == String(v.as<const char *>()))
        return true;
    }
  }
  return false;
}

String rtcDateTimeString(const RtcDateTime &dt) {
  char buf[32];
  snprintf(buf, sizeof(buf), "%04u-%02u-%02u %02u:%02u:%02u", dt.Year(),
           dt.Month(), dt.Day(), dt.Hour(), dt.Minute(), dt.Second());
  return String(buf);
}

bool readRtcEpoch(time_t *outEpoch) {
  if (!Rtc.IsDateTimeValid()) {
    rtcLastError = "invalid_datetime";
    return false;
  }

  RtcDateTime now = Rtc.GetDateTime();

  if (now.Year() < 2020 || now.Year() > 2099) {
    rtcLastError = "invalid_year";
    return false;
  }
  if (now.Month() < 1 || now.Month() > 12) {
    rtcLastError = "invalid_month";
    return false;
  }
  if (now.Day() < 1 || now.Day() > 31) {
    rtcLastError = "invalid_day";
    return false;
  }
  if (now.Hour() > 23 || now.Minute() > 59 || now.Second() > 59) {
    rtcLastError = "invalid_hms";
    return false;
  }

  struct tm t = {};
  t.tm_year = (int)now.Year() - 1900;
  t.tm_mon = (int)now.Month() - 1;
  t.tm_mday = (int)now.Day();
  t.tm_hour = (int)now.Hour();
  t.tm_min = (int)now.Minute();
  t.tm_sec = (int)now.Second();

  time_t epoch = mktime(&t); // TZ=UTC0 qilib qo‘yilgan (setupda)
  if (epoch < 100000) {
    rtcLastError = "invalid_epoch";
    return false;
  }

  *outEpoch = epoch;
  rtcLastError = "ok";
  return true;
}

bool writeRtcEpoch(time_t epoch) {
  if (epoch < 100000)
    return false;

  struct tm t;
  gmtime_r(&epoch, &t);

  RtcDateTime dt((uint16_t)(t.tm_year + 1900), (uint8_t)(t.tm_mon + 1),
                 (uint8_t)(t.tm_mday), (uint8_t)(t.tm_hour),
                 (uint8_t)(t.tm_min), (uint8_t)(t.tm_sec));

  Rtc.SetDateTime(dt);
  rtcLastError = "ok";
  return true;
}

bool setSystemTimeFromEpoch(time_t epoch) {
  if (epoch < 100000)
    return false;
  struct timeval tv;
  tv.tv_sec = epoch;
  tv.tv_usec = 0;
  if (settimeofday(&tv, nullptr) != 0)
    return false;
  timeIsSet = true;
  return true;
}

void trySyncSystemTimeFromRtc() {
  if (Rtc.GetIsWriteProtected())
    Rtc.SetIsWriteProtected(false);
  if (!Rtc.GetIsRunning())
    Rtc.SetIsRunning(true);

  time_t rtcEpoch = 0;
  if (!readRtcEpoch(&rtcEpoch)) {
    Serial.print("[RTC] Sync failed: ");
    Serial.println(rtcLastError);
    rtcAvailable = false;
    return;
  }

  if (setSystemTimeFromEpoch(rtcEpoch)) {
    rtcAvailable = true;
    Serial.print("[RTC] Sync OK. epoch=");
    Serial.println((long long)rtcEpoch);
  }
}

bool getLocalTm(struct tm *outTm, String *outDate, String *outTime,
                time_t *outLocalEpoch = nullptr) {
  time_t nowUtc = time(nullptr);
  if (nowUtc < 100000)
    return false;

  time_t localEpoch = nowUtc + (tzOffsetMinutes * 60);
  if (outLocalEpoch)
    *outLocalEpoch = localEpoch;

  gmtime_r(&localEpoch, outTm);

  char dateBuf[11];
  char timeBuf[6];
  strftime(dateBuf, sizeof(dateBuf), "%Y-%m-%d", outTm);
  strftime(timeBuf, sizeof(timeBuf), "%H:%M", outTm);
  if (outDate)
    *outDate = String(dateBuf);
  if (outTime)
    *outTime = String(timeBuf);
  return true;
}

// ===== Relay control (ACTIVE_LOW support) =====
void setBellState(bool on) {
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(OUTPUT_PIN, on ? LOW : HIGH);
  } else {
    digitalWrite(OUTPUT_PIN, on ? HIGH : LOW);
  }
}

void triggerBell() {
  int duration = configDoc["bellDurationSec"].as<int>();
  if (duration <= 0)
    duration = 5;
  setBellState(true);
  bellActiveUntilMs = millis() + (unsigned long)duration * 1000UL;
}

void scheduleLoop() {
  if (!timeIsSet)
    return;

  struct tm t;
  String dateStr, timeStr;
  if (!getLocalTm(&t, &dateStr, &timeStr))
    return;

  // ===== BOOT muammosi fix: birinchi marta shu minutni “skip” qilamiz =====
  if (!initialKeySet) {
    lastBellKey = dateStr + " " + timeStr;
    initialKeySet = true;
    return;
  }

  int wday = t.tm_wday;                        // 0=Sunday
  int dayIndex = (wday == 0) ? 6 : (wday - 1); // 0=Mon

  JsonArray days = configDoc["activeDays"].as<JsonArray>();
  bool active = true;
  if (days.size() == 7)
    active = days[dayIndex].as<bool>();

  if (!active)
    return;
  if (isHoliday(dateStr))
    return;

  JsonArray s1 = configDoc["shift1"]["times"].as<JsonArray>();
  JsonArray s2 = configDoc["shift2"]["times"].as<JsonArray>();
  JsonArray sc = configDoc["customTimes"].as<JsonArray>();

  bool match = timeInArray(timeStr, s1) || timeInArray(timeStr, s2) ||
               timeInArray(timeStr, sc);
  if (!match)
    return;

  String key = dateStr + " " + timeStr;
  if (key == lastBellKey)
    return;

  lastBellKey = key;
  triggerBell();
}

// ======== WEB HANDLERS ========
void handleRoot() { server.send_P(200, "text/html", INDEX_HTML); }

void handleGetConfig() {
  server.send(200, "application/json", getConfigJson());
}

void handlePostConfig() {
  if (!server.hasArg("plain")) {
    server.send(400, "text/plain", "Missing body");
    return;
  }
  String body = server.arg("plain");
  if (!saveConfigJson(body)) {
    server.send(400, "text/plain", "Invalid JSON");
    return;
  }
  server.send(200, "text/plain", "OK");
}

void handlePostTime() {
  if (!server.hasArg("plain")) {
    server.send(400, "text/plain", "Missing body");
    return;
  }

  DynamicJsonDocument doc(256);
  DeserializationError err = deserializeJson(doc, server.arg("plain"));
  if (err || !doc["epoch"].is<long>()) {
    server.send(400, "text/plain", "Invalid body");
    return;
  }

  time_t epoch = (time_t)doc["epoch"].as<long>();

  if (doc["tzOffsetMinutes"].is<int>()) {
    tzOffsetMinutes = doc["tzOffsetMinutes"].as<int>();
    prefs.putInt("tz", tzOffsetMinutes);
  }

  if (!setSystemTimeFromEpoch(epoch)) {
    server.send(400, "text/plain", "Invalid epoch");
    return;
  }

  // RTC ga ham yozamiz
  rtcAvailable = writeRtcEpoch(epoch) || rtcAvailable;

  // boot-skip key ni yangilab qo'yamiz (time o'zgarganda ham birdan chalmasin)
  initialKeySet = false;

  server.send(200, "text/plain", "OK");
}

void handleGetTime() {
  struct tm t;
  String dateStr, timeStr;
  time_t localEpoch = 0;
  bool ok = getLocalTm(&t, &dateStr, &timeStr, &localEpoch);

  DynamicJsonDocument doc(320);
  doc["ok"] = ok;

  if (ok) {
    char timeBuf[9];
    strftime(timeBuf, sizeof(timeBuf), "%H:%M:%S", &t);
    doc["local"] = dateStr + " " + String(timeBuf);
    doc["localEpoch"] =
        (long long)localEpoch; // <<< UI WiFi bo‘lmasa ham shu epochdan yuritadi
  } else {
    doc["local"] = String("");
    doc["localEpoch"] = 0;
  }

  doc["tzOffsetMinutes"] = tzOffsetMinutes;
  doc["rtc"] = rtcAvailable;

  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);
}

void handleGetDiag() {
  DynamicJsonDocument doc(512);

  time_t rtcEpoch = 0;
  bool rtcReadOk = readRtcEpoch(&rtcEpoch);

  time_t nowUtc = time(nullptr);

  doc["timeIsSet"] = timeIsSet;
  doc["rtcAvailable"] = rtcAvailable;
  doc["rtcReadOk"] = rtcReadOk;
  doc["rtcLastError"] = rtcLastError;

  if (Rtc.IsDateTimeValid()) {
    RtcDateTime dt = Rtc.GetDateTime();
    doc["rtcDateTime"] = rtcDateTimeString(dt);
  } else {
    doc["rtcDateTime"] = "invalid";
  }

  doc["rtcEpoch"] = (long long)rtcEpoch;
  doc["nowUtc"] = (long long)nowUtc;
  doc["tzOffsetMinutes"] = tzOffsetMinutes;

  doc["writeProtected"] = Rtc.GetIsWriteProtected();
  doc["isRunning"] = Rtc.GetIsRunning();

  doc["relayActiveLow"] = RELAY_ACTIVE_LOW;

  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);
}

void handlePostTest() {
  triggerBell();
  server.send(200, "text/plain", "OK");
}

// ======== SETUP/LOOP ========
void setup() {
  Serial.begin(115200);
  delay(50);
  Serial.println();
  Serial.println("[BOOT] ElektronBell starting...");

  // TZ = UTC0 (biz localni tzOffsetMinutes bilan o‘zimiz hisoblaymiz)
  setenv("TZ", "UTC0", 1);
  tzset();

  // Relay pinni eng boshida OFF qilamiz (bootda chalib ketmasin)
  pinMode(OUTPUT_PIN, OUTPUT);
  setBellState(false);

  prefs.begin("ebell", false);
  tzOffsetMinutes = prefs.getInt("tz", TZ_DEFAULT_MINUTES);
  loadConfigDoc();

  // RTC init
  Rtc.Begin();
  trySyncSystemTimeFromRtc();

  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASS);

  server.on("/", HTTP_GET, handleRoot);
  server.on("/api/config", HTTP_GET, handleGetConfig);
  server.on("/api/config", HTTP_POST, handlePostConfig);
  server.on("/api/time", HTTP_GET, handleGetTime);
  server.on("/api/time", HTTP_POST, handlePostTime);
  server.on("/api/diag", HTTP_GET, handleGetDiag);
  server.on("/api/test", HTTP_POST, handlePostTest);

  server.begin();
}

void loop() {
  server.handleClient();

  // timeIsSet flag
  if (!timeIsSet) {
    time_t nowUtc = time(nullptr);
    if (nowUtc > 100000) {
      timeIsSet = true;
      initialKeySet = false; // vaqt endi set bo‘ldi -> boot-skip ishlasin
    } else if (millis() - lastRtcRetryMs >= RTC_RETRY_INTERVAL_MS) {
      lastRtcRetryMs = millis();
      trySyncSystemTimeFromRtc();
    }
  }

  // vaqti-vaqti bilan RTC -> system sync
  if (timeIsSet && rtcAvailable &&
      (millis() - lastRtcSyncMs >= RTC_SYNC_INTERVAL_MS)) {
    lastRtcSyncMs = millis();
    trySyncSystemTimeFromRtc();
  }

  scheduleLoop();

  if (bellActiveUntilMs > 0 && millis() > bellActiveUntilMs) {
    bellActiveUntilMs = 0;
    setBellState(false);
  }
}
