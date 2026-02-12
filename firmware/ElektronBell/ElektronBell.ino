#include <ArduinoJson.h>
#include <LittleFS.h>
#include <Preferences.h>
#include <WebServer.h>
#include <WiFi.h>
#include <time.h>

// ======== USER SETTINGS ========
static const int OUTPUT_PIN = 2; // Change if your LED is on another GPIO
static const char *AP_SSID = "ElektronBell";
static const char *AP_PASS = "12345678"; // 8+ chars or empty for open

// Default timezone offset (UTC+05:00)
static const int TZ_DEFAULT_MINUTES = 300;

// Time save interval (60 seconds)
static const unsigned long TIME_SAVE_INTERVAL_MS = 60000;

// ======== GLOBALS ========
WebServer server(80);
Preferences prefs;

static const size_t CONFIG_DOC_SIZE = 12288;
DynamicJsonDocument configDoc(CONFIG_DOC_SIZE);

bool timeIsSet = false;
String lastBellKey = "";
unsigned long bellActiveUntilMs = 0;
int tzOffsetMinutes = TZ_DEFAULT_MINUTES;
unsigned long lastTimeSaveMs = 0;

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
      --bg1:#f7f1e8;
      --bg2:#f0f6ff;
      --fg:#1e1f22;
      --muted:#5c6470;
      --accent:#0f766e;
      --accent-2:#1e40af;
      --card:#ffffff;
      --shadow:0 10px 24px rgba(15,23,42,.12);
      --radius:14px;
    }
    * { box-sizing: border-box; font-family: "Trebuchet MS", "Gill Sans", "Calibri", sans-serif; }
    body {
      margin: 0;
      color: var(--fg);
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
    .card {
      background: var(--card);
      border-radius: var(--radius);
      padding: 14px;
      box-shadow: var(--shadow);
      border: 1px solid rgba(15,23,42,.06);
    }
    .row { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    label { font-size: 12px; color: var(--muted); display: block; margin-bottom: 6px; }
    input, textarea, button {
      width: 100%;
      padding: 10px;
      border: 1px solid #d0d7de;
      border-radius: 10px;
      font-size: 14px;
      background: #fff;
    }
    textarea { min-height: 110px; resize: vertical; }
    button {
      background: var(--accent);
      color: #fff;
      border: none;
      cursor: pointer;
      font-weight: 600;
      letter-spacing: .2px;
    }
    button.secondary { background: var(--accent-2); }
    .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
    .day { display: flex; align-items: center; gap: 6px; }
    .status { font-size: 12px; color: var(--muted); }
    .time-panel { display: grid; gap: 6px; }
    .time-value {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: .5px;
    }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: #f1f5f9;
      border-radius: 999px;
      font-size: 12px;
      color: #334155;
    }
    .title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: .3px;
      color: #0f172a;
      margin-bottom: 8px;
    }
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

function linesToArray(text) {
  return text.split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => {
      // Normalize H:MM to HH:MM
      if (s.includes(':')) {
        const p = s.split(':');
        if (p.length === 2) {
          return p[0].padStart(2, '0') + ':' + p[1].padStart(2, '0');
        }
      }
      // Normalize YYYY-M-D to YYYY-MM-DD
      if (s.includes('-')) {
        const d = s.split('-');
        if (d.length === 3) {
          return d[0] + '-' + d[1].padStart(2, '0') + '-' + d[2].padStart(2, '0');
        }
      }
      return s;
    });
}

function arrayToLines(arr) {
  return (arr || []).join("\n");
}

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
  const res = await fetch('/api/time');
  const data = await res.json();
  $('timeStatus').textContent = data.ok ? data.local : 'Vaqt sozlanmagan';
  if (typeof data.tzOffsetMinutes === 'number') {
    const min = data.tzOffsetMinutes;
    const sign = min >= 0 ? '+' : '-';
    const abs = Math.abs(min);
    const hh = String(Math.floor(abs / 60)).padStart(2,'0');
    const mm = String(abs % 60).padStart(2,'0');
    $('tzStatus').textContent = `UTC${sign}${hh}:${mm}`;
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
setInterval(loadTime, 5000);
</script>
</body>
</html>
)html";

// ======== HELPERS ========
String getConfigJson() {
  File file = LittleFS.open("/config.json", "r");
  if (!file || file.isDirectory()) {
    return String(DEFAULT_CONFIG_JSON);
  }
  String content = file.readString();
  file.close();
  if (content.length() == 0)
    return String(DEFAULT_CONFIG_JSON);
  return content;
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

  File file = LittleFS.open("/config.json", "w");
  if (!file)
    return false;

  file.print(json);
  file.close();
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

bool getLocalTm(struct tm *outTm, String *outDate, String *outTime) {
  time_t nowUtc = time(nullptr);
  if (nowUtc < 100000)
    return false; // time not set
  time_t local = nowUtc + (tzOffsetMinutes * 60);
  gmtime_r(&local, outTm);

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

void setBellState(bool on) { digitalWrite(OUTPUT_PIN, on ? HIGH : LOW); }

// Use durationSec if > 0, else use config
void triggerBell(int durationSec = 0) {
  int duration = durationSec;
  if (duration <= 0)
    duration = configDoc["bellDurationSec"].as<int>();
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

  int wday = t.tm_wday;                        // 0=Sunday
  int dayIndex = (wday == 0) ? 6 : (wday - 1); // 0=Mon

  JsonArray days = configDoc["activeDays"].as<JsonArray>();
  bool active = true;
  if (days.size() == 7) {
    active = days[dayIndex].as<bool>();
  }

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
  lastBellKey = key;
  triggerBell(0);
}

// ======== WEB HANDLERS ========
void handleRoot() { server.send_P(200, "text/html", INDEX_HTML); }

void handleGetConfig() {
  String json = getConfigJson();
  server.send(200, "application/json", json);
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

// ======== TIME PERSISTENCE (NO RTC) ========
void saveTimeToFlash() {
  time_t nowUtc = time(nullptr);
  if (nowUtc < 100000)
    return; // Time not valid

  File file = LittleFS.open("/time.json", "w");
  if (!file)
    return;

  DynamicJsonDocument doc(128);
  doc["epoch"] = (long)nowUtc;
  doc["tz"] = tzOffsetMinutes;
  serializeJson(doc, file);
  file.close();
}

bool restoreTimeFromFlash() {
  File file = LittleFS.open("/time.json", "r");
  if (!file)
    return false;

  DynamicJsonDocument doc(128);
  DeserializationError err = deserializeJson(doc, file);
  file.close();

  if (err || !doc["epoch"].is<long>())
    return false;

  time_t savedEpoch = (time_t)doc["epoch"].as<long>();
  if (savedEpoch < 100000)
    return false;

  if (doc["tz"].is<int>()) {
    tzOffsetMinutes = doc["tz"].as<int>();
  }

  struct timeval tv;
  tv.tv_sec = savedEpoch;
  tv.tv_usec = 0;
  settimeofday(&tv, nullptr);
  return true;
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

  // Update System Time
  if (doc["tzOffsetMinutes"].is<int>()) {
    tzOffsetMinutes = doc["tzOffsetMinutes"].as<int>();
    prefs.putInt("tz", tzOffsetMinutes);
  }
  struct timeval tv;
  tv.tv_sec = epoch;
  tv.tv_usec = 0;
  settimeofday(&tv, nullptr);
  timeIsSet = true;

  // Immediately save to flash
  saveTimeToFlash();
  Serial.println("Time set and saved to flash: " + String(epoch));

  server.send(200, "text/plain", "OK");
}

void handleGetTime() {
  struct tm t;
  String dateStr, timeStr;
  bool ok = getLocalTm(&t, &dateStr, &timeStr);
  DynamicJsonDocument doc(256);
  doc["ok"] = ok;
  if (ok) {
    char timeBuf[9];
    strftime(timeBuf, sizeof(timeBuf), "%H:%M:%S", &t);
    doc["local"] = dateStr + " " + String(timeBuf);
  } else {
    doc["local"] = String("");
  }
  doc["tzOffsetMinutes"] = tzOffsetMinutes;
  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);
}

void handlePostTest() {
  if (!server.hasArg("plain")) {
    triggerBell(5); // Default fallback
    server.send(200, "text/plain", "OK (Default 5s)");
    return;
  }
  DynamicJsonDocument doc(256);
  DeserializationError err = deserializeJson(doc, server.arg("plain"));
  int duration = 5;
  if (!err && doc["duration"].is<int>()) {
    duration = doc["duration"].as<int>();
  }
  triggerBell(duration);
  server.send(200, "text/plain", "OK");
}

void handleOptions() { server.send(200, "text/plain", "OK"); }

// ======== SETUP/LOOP ========
void setup() {
  Serial.begin(115200);
  pinMode(OUTPUT_PIN, OUTPUT);
  setBellState(false);

  prefs.begin("ebell", false);
  tzOffsetMinutes = prefs.getInt("tz", TZ_DEFAULT_MINUTES);

  if (!LittleFS.begin(true)) {
    Serial.println("LittleFS Mount Failed");
  }

  loadConfigDoc();

  // Restore time from flash (no RTC needed!)
  if (restoreTimeFromFlash()) {
    timeIsSet = true;
    Serial.println("Time restored from flash!");
  } else {
    Serial.println("No saved time found. Waiting for sync...");
  }

  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASS);

  server.on("/", HTTP_GET, handleRoot);
  server.on("/api/config", HTTP_GET, handleGetConfig);
  server.on("/api/config", HTTP_POST, handlePostConfig);
  server.on("/api/time", HTTP_GET, handleGetTime);
  server.on("/api/time", HTTP_POST, handlePostTime);
  server.on("/api/test", HTTP_POST, handlePostTest);

  // Handle preflight requests for CORS
  server.on("/api/config", HTTP_OPTIONS, handleOptions);
  server.on("/api/time", HTTP_OPTIONS, handleOptions);
  server.on("/api/test", HTTP_OPTIONS, handleOptions);

  server.enableCORS(true);
  server.begin();
}

void loop() {
  server.handleClient();

  // Update time flag once it is set
  if (!timeIsSet) {
    time_t nowUtc = time(nullptr);
    if (nowUtc > 100000)
      timeIsSet = true;
  }

  // Save time to flash every 60 seconds
  if (timeIsSet && (millis() - lastTimeSaveMs > TIME_SAVE_INTERVAL_MS)) {
    saveTimeToFlash();
    lastTimeSaveMs = millis();
  }

  scheduleLoop();

  if (bellActiveUntilMs > 0 && millis() > bellActiveUntilMs) {
    bellActiveUntilMs = 0;
    setBellState(false);
  }
}
