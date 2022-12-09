$(document).ready(function ()
{
  setupSelect2();
  if (localStorage.getItem("province") != null && localStorage.getItem("city") != null)
  {
    loadLocationFromCache();
    setupInputs();
    $("#city-input").trigger("change");
  }
  else
  {
    setupInputs();
    $('#province-input').trigger("change");
  }
});

function setupInputs()
{
  $('#province-input').on("change", function ()
  {
    appendCitiesOfProvinceToSelectInput(this.value);
    $("#city-input").trigger("change");
  });

  $("#city-input").on("change", function ()
  {
    getTimeOfCity(this.value);
    saveLocationToCache();
  });
}

function appendCitiesOfProvinceToSelectInput(provinceCode)
{
  const citiesInProvince = getAllCitiesOfProvince(provinceCode);
  $("#city-input").empty();

  for (let i = 0; i < citiesInProvince.length; i++)
  {
    const option = `<option value="${citiesInProvince[i].Code}">${citiesInProvince[i].Name}</option>`;
    $("#city-input").append(option);
  }
}

function saveLocationToCache()
{
  const provinceCode = $("#province-input").val();
  const cityCode = $("#city-input").val();

  localStorage.setItem("province", provinceCode);
  localStorage.setItem("city", cityCode);
}

function loadLocationFromCache()
{
  const provinceCode = localStorage.getItem("province");
  $("#province-input").val(`${provinceCode}`).change();

  appendCitiesOfProvinceToSelectInput(provinceCode);

  const cityCode = localStorage.getItem("city");
  $("#city-input").val(`${cityCode}`).change();
}

function getAllCitiesOfProvince(provinceCode)
{
  let min = 0;
  let max = cities.length - 1;

  let firstIndex;
  let lastIndex;
  let citiesInProvince = [];

  while (min <= max)
  {
    let mid = Math.floor((max - min) / 2) + min;

    if (cities[mid].ProvinceCode > provinceCode)
    {
      max = mid - 1;
    }
    else if (cities[mid].ProvinceCode == provinceCode)
    {
      let initialMid = mid;

      firstIndex = mid;
      while (cities[mid - 1] != null && cities[mid].ProvinceCode == cities[mid - 1].ProvinceCode)
      {
        firstIndex = mid - 1;
        mid--;
      }

      lastIndex = initialMid;
      while (cities[initialMid + 1] != null && cities[initialMid].ProvinceCode == cities[initialMid + 1].ProvinceCode)
      {
        lastIndex = initialMid + 1;
        initialMid++;
      }

      break;
    }
    else
    {
      min = mid + 1;
    }
  }

  for (let i = firstIndex; i <= lastIndex; i++)
  {
    citiesInProvince.push(cities[i]);
  }

  return citiesInProvince;
}

function setupSelect2()
{
  $(".select2").select2({
    dir: "rtl"
  });
}

function getTimeOfCity(cityCode)
{
  $(".result").empty();
  addLoading(".result");

  fetch(`https://prayer.aviny.com/api/prayertimes/${cityCode}`, { method: 'GET', headers: {} })
    .then(res => res.json())
    .then(data =>
    {
      let date = data.Today.split(' ')[0];
      let time = `${data.Today.split(' ')[2]} ${data.Today.split(' ')[3]}`
      const dayTime = time.split(' ')[0];
      const timeNum = time.split(' ')[1];
      time = removeFirstZero(`${dayTime} ${timeNum}`);

      const shamsiYear = parseInt(date.split('/')[0]);
      const shamsiMonth = parseInt(date.split('/')[1]);
      const shamsiDay = parseInt(date.split('/')[2]);
      const miladiDate = shamsiToMildai(shamsiYear, shamsiMonth, shamsiDay)[0];

      const miladiYear = parseInt(miladiDate.split('/')[0]);
      const miladiMonth = parseInt(miladiDate.split('/')[1]);
      const miladiDay = parseInt(miladiDate.split('/')[2]);
      const fullShamsiDate = getFullShamsiDateFromMildi(miladiYear, miladiMonth, miladiDay);

      const imsaak = removeFirstZero(data.Imsaak);
      const sunrise = removeFirstZero(data.Sunrise);
      const noon = removeFirstZero(data.Noon);
      const sunset = removeFirstZero(data.Sunset);
      const maghreb = removeFirstZero(data.Maghreb);
      const midnight = removeFirstZero(data.Midnight);

      removeLoading(".result");

      $(".result").append(`
        <span class="pray-time ltr ta-end d-flex ai-center jc-center">
          <span class="fs-16px" style="font-family: FiraSans">${time}</span><span class="ml-4px">⏰</span>
        </span>`);

      $(".result").append(`
        <span class="pray-time rtl d-flex ai-center jc-center">
          <span class="ml-4px">📅</span><span>${date} (${fullShamsiDate})</span>
        </span>`);

      $(".result").append(`
        <span class="pray-time rtl d-flex ai-center jc-between">
          <span class="ml-20px"><span class="ml-4px">🌄</span><span>اذان صبح: ${imsaak}</span></span>
          <span>طلوع آفتاب: ${sunrise}</span>
        </span>`);

      $(".result").append(`
        <span class="pray-time rtl d-flex ai-center jc-between">
          <span class="ml-20px"><span class="ml-4px">🌞</span><span>اذان ظهر: ${noon}</span></span>
          <span>غروب خورشید: ${sunset}</span>
        </span>`);

      $(".result").append(`
        <span class="pray-time rtl d-flex ai-center jc-between">
          <span class="ml-20px"><span class="ml-4px">🌙</span><span>اذان مغرب: ${maghreb}</span></span>
          <span>نیمه شب شرعی: ${midnight}</span>
        </span>`);

      $(".result").slideDown(200);
    })
    .catch((err) =>
    {
      $(".result").addClass("error");
      $(".result").append(`
        <span class="d-flex fd-col ai-center">
          <span class="fs-20px">❌</span>
          <span class="fs-18px fw-b" style="color: #ff4229">!یه مشکلی پیش اومد</span
        </span>`);
      $(".result").show(250);
    });
}

function removeFirstZero(string)
{
  if (string.charAt(0) != '0')
    return string;
  else
    return string.replace(/^0+/, '');
}

function addLoading(containerSelector)
{
  const container = $(containerSelector);
  const loading = `<span class="loading"></span>`;
  container.append(loading);
}

function removeLoading(containerSelector)
{
  const container = $(containerSelector);
  container.find(".loading").remove();
}

const cities = [
  {
    "Code": 1,
    "CountryCode": 1,
    "LName": "Tehran",
    "Name": "تهران",
    "ProvinceCode": 0,
    "Type": "C"
  },
  {
    "Code": 230,
    "CountryCode": 1,
    "LName": "Damavand",
    "Name": "دماوند",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 233,
    "CountryCode": 1,
    "LName": "Firuz Kuh",
    "Name": "فیروزکوه",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 235,
    "CountryCode": 1,
    "LName": "Haft Juy",
    "Name": "هفت جوی",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 236,
    "CountryCode": 1,
    "LName": "Hesar Sati",
    "Name": "حصار ساتی",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 237,
    "CountryCode": 1,
    "LName": "Hesarak",
    "Name": "حصارک",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 240,
    "CountryCode": 1,
    "LName": "Parchin",
    "Name": "پارچین",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 242,
    "CountryCode": 1,
    "LName": "Shahr-e-Rey",
    "Name": "شهر ری",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 243,
    "CountryCode": 1,
    "LName": "Varamin",
    "Name": "ورامین",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 244,
    "CountryCode": 1,
    "LName": "Vardavard",
    "Name": "وردآورد",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 245,
    "CountryCode": 1,
    "LName": "Chitgar",
    "Name": "چیتگر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 451,
    "CountryCode": 1,
    "LName": "Marlik",
    "Name": "مارلیک",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 882,
    "CountryCode": 1,
    "LName": "Jelizjand",
    "Name": "جلیزجند",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 999,
    "CountryCode": 1,
    "LName": "Shahriyar",
    "Name": "شهریار",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1008,
    "CountryCode": 1,
    "LName": "RobatKarim",
    "Name": "رباط کریم",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1009,
    "CountryCode": 1,
    "LName": "Parand",
    "Name": "پرند",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1024,
    "CountryCode": 1,
    "LName": "Tehran - Azadi Tower",
    "Name": "تهران - برج آزادی",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1051,
    "CountryCode": 1,
    "LName": "Rudehen",
    "Name": "رودهن",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1059,
    "CountryCode": 1,
    "LName": "Eslamshahr",
    "Name": "اسلام شهر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1061,
    "CountryCode": 1,
    "LName": "Tehran Pars",
    "Name": "تهرانپارس",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1073,
    "CountryCode": 1,
    "LName": "Malard",
    "Name": "ملارد",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1086,
    "CountryCode": 1,
    "LName": "Nasim shahr",
    "Name": "نسیم شهر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1093,
    "CountryCode": 1,
    "LName": "Hasan Abad",
    "Name": "حسن آباد",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1164,
    "CountryCode": 1,
    "LName": "Pishva",
    "Name": "پیشوا",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1187,
    "CountryCode": 1,
    "LName": "Absard",
    "Name": "آبسرد",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1200,
    "CountryCode": 1,
    "LName": "Qarchak",
    "Name": "قرچک",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1245,
    "CountryCode": 1,
    "LName": "Andishe New Town",
    "Name": "شهر جدید اندیشه",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1281,
    "CountryCode": 1,
    "LName": "Fardis",
    "Name": "فردیس",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1345,
    "CountryCode": 1,
    "LName": "Safadasht",
    "Name": "صفادشت",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1353,
    "CountryCode": 1,
    "LName": "Pardis",
    "Name": "پردیس",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1462,
    "CountryCode": 1,
    "LName": "Nasir Shahr",
    "Name": "نصیر شهر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1467,
    "CountryCode": 1,
    "LName": "Aroo",
    "Name": "ارو",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1470,
    "CountryCode": 1,
    "LName": "Pakdst",
    "Name": "پاکدشت",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1493,
    "CountryCode": 1,
    "LName": "Charm Shahr",
    "Name": "چرمشهر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1512,
    "CountryCode": 1,
    "LName": "Lavasan",
    "Name": "ﻟﻮﺍﺳﺎﻥ",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1793,
    "CountryCode": 1,
    "LName": "Tehran-Tajrish",
    "Name": "تجریش",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1810,
    "CountryCode": 1,
    "LName": "Shams Abad",
    "Name": "شمس آباد",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1835,
    "CountryCode": 1,
    "LName": "Tehransar",
    "Name": "تهرانسر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1925,
    "CountryCode": 1,
    "LName": "Hesar Pa'in",
    "Name": "حصار پایین",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1985,
    "CountryCode": 1,
    "LName": "Pirdeh",
    "Name": "پیرده",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1987,
    "CountryCode": 1,
    "LName": "Oushan",
    "Name": "اوشان",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1996,
    "CountryCode": 1,
    "LName": "Shahrak-e-Vali-e-Asr",
    "Name": "شهرک ولیعصر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2011,
    "CountryCode": 1,
    "LName": "Sulqan",
    "Name": "سولقان",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2012,
    "CountryCode": 1,
    "LName": "Narmak",
    "Name": "نارمک",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2019,
    "CountryCode": 1,
    "LName": "Nasir Abad",
    "Name": "نصیرآباد",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2027,
    "CountryCode": 1,
    "LName": "Vavan",
    "Name": "واوان",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2057,
    "CountryCode": 1,
    "LName": "Abali",
    "Name": "آبعلی",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2061,
    "CountryCode": 1,
    "LName": "Khavar Shahr",
    "Name": "خاورشهر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2063,
    "CountryCode": 1,
    "LName": "Chahardangeh",
    "Name": "چهاردانگه",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2074,
    "CountryCode": 1,
    "LName": "Bumehen",
    "Name": "بومهن",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2089,
    "CountryCode": 1,
    "LName": "Qamsar",
    "Name": "قمصر - باقر شهر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2091,
    "CountryCode": 1,
    "LName": "Baghershahr",
    "Name": "باقرشهر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2144,
    "CountryCode": 1,
    "LName": "Khadem Abad",
    "Name": "خادم آباد",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2177,
    "CountryCode": 1,
    "LName": "Kilan",
    "Name": "کیلان",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2465,
    "CountryCode": 1,
    "LName": "Sharifabad",
    "Name": "شریف آباد",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2469,
    "CountryCode": 1,
    "LName": "Saba Shahr",
    "Name": "صباشهر",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2516,
    "CountryCode": 1,
    "LName": "Tehran - NirooHavaei",
    "Name": "تهران - نیروهوایی",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2637,
    "CountryCode": 1,
    "LName": "Bagger Abad",
    "Name": "باقرآباد",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2653,
    "CountryCode": 1,
    "LName": "Tehran-Qolhak",
    "Name": "تهران-قلهک",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2850,
    "CountryCode": 1,
    "LName": "Tehran-Nazi Abad",
    "Name": "تهران-نازی آباد",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2895,
    "CountryCode": 1,
    "LName": "Tehran-Niavaran",
    "Name": "تهران-نیاوران",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 3008,
    "CountryCode": 1,
    "LName": "Qods",
    "Name": "قدس - شهرقدس",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 3149,
    "CountryCode": 1,
    "LName": "Chelqez",
    "Name": "چهل قز",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 3238,
    "CountryCode": 1,
    "LName": "Ferdosiye",
    "Name": "فردوسیه",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 26,
    "CountryCode": 1,
    "LName": "Ardabil",
    "Name": "اردبیل",
    "ProvinceCode": 5,
    "Type": "S"
  },
  {
    "Code": 247,
    "CountryCode": 1,
    "LName": "Chalma Kandi",
    "Name": "چلماشهر",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 452,
    "CountryCode": 1,
    "LName": "Meshgin Shahr",
    "Name": "مشگین شهر",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 455,
    "CountryCode": 1,
    "LName": "Namin",
    "Name": "نمین",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 457,
    "CountryCode": 1,
    "LName": "Nir",
    "Name": "نیر",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 990,
    "CountryCode": 1,
    "LName": "Khalkhal",
    "Name": "خلخال",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1010,
    "CountryCode": 1,
    "LName": "Germi",
    "Name": "گرمی",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1140,
    "CountryCode": 1,
    "LName": "Jafar Abad",
    "Name": "جعفرآباد",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1155,
    "CountryCode": 1,
    "LName": "Parsabad",
    "Name": "پارس آباد",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1180,
    "CountryCode": 1,
    "LName": "Lahroud",
    "Name": "لاهرود",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1259,
    "CountryCode": 1,
    "LName": "Aslan duz",
    "Name": "اصلاندوز",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1656,
    "CountryCode": 1,
    "LName": "Abibiglou",
    "Name": "آبی بیگلو",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1752,
    "CountryCode": 1,
    "LName": "Bileh Savar",
    "Name": "بیله سوار",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1862,
    "CountryCode": 1,
    "LName": "Hoor",
    "Name": "حور",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1921,
    "CountryCode": 1,
    "LName": "Kolur",
    "Name": "کلور",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1992,
    "CountryCode": 1,
    "LName": "Hir",
    "Name": "هیر",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 2004,
    "CountryCode": 1,
    "LName": "Qasabeh",
    "Name": "قصابه",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 2040,
    "CountryCode": 1,
    "LName": "Anbaran",
    "Name": "عنبران",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 2052,
    "CountryCode": 1,
    "LName": "Sarein",
    "Name": "سرعین",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 2503,
    "CountryCode": 1,
    "LName": "Alni",
    "Name": "آلنی",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 3,
    "CountryCode": 1,
    "LName": "Urimiyeh",
    "Name": "ارومیه",
    "ProvinceCode": 6,
    "Type": "S"
  },
  {
    "Code": 23,
    "CountryCode": 1,
    "LName": "Mahabad",
    "Name": "مهاباد",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 248,
    "CountryCode": 1,
    "LName": "Naghdeh",
    "Name": "نقده",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 249,
    "CountryCode": 1,
    "LName": "Dizaj",
    "Name": "دیزج",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 250,
    "CountryCode": 1,
    "LName": "Mir Abad",
    "Name": "میر آباد",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 251,
    "CountryCode": 1,
    "LName": "Ali Mardan",
    "Name": "علی مردان",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 252,
    "CountryCode": 1,
    "LName": "Abbas Kandi",
    "Name": "عباس کندی",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 253,
    "CountryCode": 1,
    "LName": "Bukan",
    "Name": "بوکان",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 255,
    "CountryCode": 1,
    "LName": "Abdol Kand",
    "Name": "عبدالکندی",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 256,
    "CountryCode": 1,
    "LName": "Aghbolagh (Aghbolagh-e Chamanlu)",
    "Name": "آغبلاغ",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 257,
    "CountryCode": 1,
    "LName": "Khoy",
    "Name": "خوی",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 258,
    "CountryCode": 1,
    "LName": "Likbin",
    "Name": "لیکبین",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 260,
    "CountryCode": 1,
    "LName": "Aqaesmairi (Aqa Esma'il)",
    "Name": "آقا اسماعیل",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 262,
    "CountryCode": 1,
    "LName": "Ahmad Baro (Ahmad Baru)",
    "Name": "احمد بارو",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 264,
    "CountryCode": 1,
    "LName": "Oshnoviyeh",
    "Name": "اشنویه",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 265,
    "CountryCode": 1,
    "LName": "Piranshahr",
    "Name": "پیرانشهر",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 266,
    "CountryCode": 1,
    "LName": "Chaldoran",
    "Name": "چالدران",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 267,
    "CountryCode": 1,
    "LName": "Gharahzyaeddin",
    "Name": "قره ضیاءالدین",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 268,
    "CountryCode": 1,
    "LName": "Sar Dasht",
    "Name": "سردشت",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 269,
    "CountryCode": 1,
    "LName": "Aghdash",
    "Name": "آغداش",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 270,
    "CountryCode": 1,
    "LName": "Salmas",
    "Name": "سلماس",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 271,
    "CountryCode": 1,
    "LName": "Tazeh Shahr",
    "Name": "تازه شهر",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 272,
    "CountryCode": 1,
    "LName": "Shahin Dej",
    "Name": "شاهین دژ",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 273,
    "CountryCode": 1,
    "LName": "Aslanik",
    "Name": "اصلانیک",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 274,
    "CountryCode": 1,
    "LName": "Rabt",
    "Name": "ربط",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 275,
    "CountryCode": 1,
    "LName": "Miandoab",
    "Name": "میاندوآب",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 277,
    "CountryCode": 1,
    "LName": "Azad",
    "Name": "آزاد",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 278,
    "CountryCode": 1,
    "LName": "Azim Khanlü ('Azimkhanlu)",
    "Name": "عظیم خان لو",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 279,
    "CountryCode": 1,
    "LName": "Baba Ali (Babalu)",
    "Name": "بابا علی",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 280,
    "CountryCode": 1,
    "LName": "Gharre Tappeh",
    "Name": "قره تپه",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 281,
    "CountryCode": 1,
    "LName": "Badalan",
    "Name": "بادالان",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 282,
    "CountryCode": 1,
    "LName": "Kohneh Lajan",
    "Name": "کهنه لاجان",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 449,
    "CountryCode": 1,
    "LName": "Dizaj diz",
    "Name": "دیزج دیز",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 467,
    "CountryCode": 1,
    "LName": "Azab",
    "Name": "عذاب",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 507,
    "CountryCode": 1,
    "LName": "Takab",
    "Name": "تکاب",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1067,
    "CountryCode": 1,
    "LName": "Maku",
    "Name": "ماکو",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1142,
    "CountryCode": 1,
    "LName": "Araz",
    "Name": "آراز",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1169,
    "CountryCode": 1,
    "LName": "Qushchi",
    "Name": "قوشچی",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1192,
    "CountryCode": 1,
    "LName": "Mohammadyar",
    "Name": "محمدیار",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1202,
    "CountryCode": 1,
    "LName": "Poldasht",
    "Name": "پلدشت",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1234,
    "CountryCode": 1,
    "LName": "Chaharborj",
    "Name": "چهاربرج",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1424,
    "CountryCode": 1,
    "LName": "Var",
    "Name": "وار",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1431,
    "CountryCode": 1,
    "LName": "Shibeyli",
    "Name": "شیبیلی",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1448,
    "CountryCode": 1,
    "LName": "Keshavarz",
    "Name": "کشاورز",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1457,
    "CountryCode": 1,
    "LName": "Nelas",
    "Name": "نلاس",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1472,
    "CountryCode": 1,
    "LName": "Samanshahr",
    "Name": "سلمانشهر",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1570,
    "CountryCode": 1,
    "LName": "Shot",
    "Name": "شوط",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1590,
    "CountryCode": 1,
    "LName": "Mamalian",
    "Name": "مه مه لیان",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1591,
    "CountryCode": 1,
    "LName": "Marganlar",
    "Name": "مرگنلر",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1621,
    "CountryCode": 1,
    "LName": "Ziveh",
    "Name": "زیوه",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1630,
    "CountryCode": 1,
    "LName": "Bazargan",
    "Name": "بازرگان",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1664,
    "CountryCode": 1,
    "LName": "Firuraq",
    "Name": "فیرورق",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1756,
    "CountryCode": 1,
    "LName": "Avajiq",
    "Name": "آواجیق",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1776,
    "CountryCode": 1,
    "LName": "Zar Abad",
    "Name": "زرآباد",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1783,
    "CountryCode": 1,
    "LName": "Noshinshahr",
    "Name": "نوشین شهر",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1832,
    "CountryCode": 1,
    "LName": "Serow",
    "Name": "سرو",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1875,
    "CountryCode": 1,
    "LName": "Zare Shoran",
    "Name": "زره شوران",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1947,
    "CountryCode": 1,
    "LName": "Pasve",
    "Name": "پسوه",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 2083,
    "CountryCode": 1,
    "LName": "Nazik",
    "Name": "نازک",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 2158,
    "CountryCode": 1,
    "LName": "Mir abad- soldoz",
    "Name": "میرآباد- سلدوز",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 2721,
    "CountryCode": 1,
    "LName": "Baruq",
    "Name": "باروق",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 4,
    "CountryCode": 1,
    "LName": "Arak",
    "Name": "اراک",
    "ProvinceCode": 7,
    "Type": "S"
  },
  {
    "Code": 284,
    "CountryCode": 1,
    "LName": "Delijan",
    "Name": "دلیجان",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 285,
    "CountryCode": 1,
    "LName": "Do Dehak",
    "Name": "دودهک",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 286,
    "CountryCode": 1,
    "LName": "Estalaj",
    "Name": "استلاج",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 288,
    "CountryCode": 1,
    "LName": "Gharqabad",
    "Name": "غرق آباد",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 289,
    "CountryCode": 1,
    "LName": "Hajib",
    "Name": "حاجیب",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 290,
    "CountryCode": 1,
    "LName": "Javarsian",
    "Name": "جاورسیان",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 291,
    "CountryCode": 1,
    "LName": "Khondab",
    "Name": "خنداب",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 292,
    "CountryCode": 1,
    "LName": "Mahallat",
    "Name": "محلات",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 293,
    "CountryCode": 1,
    "LName": "Milajerd",
    "Name": "میلاجرد",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 294,
    "CountryCode": 1,
    "LName": "Tafresh",
    "Name": "تفرش",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 295,
    "CountryCode": 1,
    "LName": "Robat-e Mil",
    "Name": "رباط میل",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 296,
    "CountryCode": 1,
    "LName": "Nimvar",
    "Name": "نیم ور",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 297,
    "CountryCode": 1,
    "LName": "Saruq",
    "Name": "ساروق",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 298,
    "CountryCode": 1,
    "LName": "Senijan",
    "Name": "سنجان",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 299,
    "CountryCode": 1,
    "LName": "Ashtian",
    "Name": "آشتیان",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 300,
    "CountryCode": 1,
    "LName": "Tarkhuran",
    "Name": "تارخوران",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 301,
    "CountryCode": 1,
    "LName": "Zaviyeh",
    "Name": "زاویه",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 704,
    "CountryCode": 1,
    "LName": "Salehabad",
    "Name": "صالح آباد",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 705,
    "CountryCode": 1,
    "LName": "Aveh",
    "Name": "آوه",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 970,
    "CountryCode": 1,
    "LName": "khomein",
    "Name": "خمین",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 991,
    "CountryCode": 1,
    "LName": "Saveh",
    "Name": "ساوه",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1007,
    "CountryCode": 1,
    "LName": "Naragh",
    "Name": "نراق",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1159,
    "CountryCode": 1,
    "LName": "Farmahin",
    "Name": "فرمیهن",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1204,
    "CountryCode": 1,
    "LName": "Shazand",
    "Name": "شازند",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1225,
    "CountryCode": 1,
    "LName": "Komijan",
    "Name": "کمیجان",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1450,
    "CountryCode": 1,
    "LName": "Nowbaran",
    "Name": "نوبران",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1464,
    "CountryCode": 1,
    "LName": "Mohajeran",
    "Name": "مهاجران",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1495,
    "CountryCode": 1,
    "LName": "Alvir",
    "Name": "الویر",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1573,
    "CountryCode": 1,
    "LName": "ENAJ",
    "Name": "اناج",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1652,
    "CountryCode": 1,
    "LName": "Siavashan",
    "Name": "سیاوشان",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1692,
    "CountryCode": 1,
    "LName": "Hendodar",
    "Name": "هندودر",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1754,
    "CountryCode": 1,
    "LName": "Giv",
    "Name": "گیو",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1774,
    "CountryCode": 1,
    "LName": "Mamuniyeh",
    "Name": "مامونیه",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1811,
    "CountryCode": 1,
    "LName": "Tureh",
    "Name": "توره",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1866,
    "CountryCode": 1,
    "LName": "Karakan",
    "Name": "کرکان",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1974,
    "CountryCode": 1,
    "LName": "Khoshkrud",
    "Name": "خشکرود",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1983,
    "CountryCode": 1,
    "LName": "Khorheh",
    "Name": "خورهه",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2002,
    "CountryCode": 1,
    "LName": "Talkhab",
    "Name": "تلخاب",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2016,
    "CountryCode": 1,
    "LName": "Astaneh",
    "Name": "آستانه",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2054,
    "CountryCode": 1,
    "LName": "Malmir",
    "Name": "مالمیر",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2390,
    "CountryCode": 1,
    "LName": "Ebrahim Abad",
    "Name": "ابراهیم آباد",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2551,
    "CountryCode": 1,
    "LName": "Nour Ali Beig",
    "Name": "نورعلی بیگ",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2613,
    "CountryCode": 1,
    "LName": "Kuhin",
    "Name": "کوهین",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2618,
    "CountryCode": 1,
    "LName": "Garakan",
    "Name": "گرکان",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2789,
    "CountryCode": 1,
    "LName": "Amirkabir",
    "Name": "امیرکبیر",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2859,
    "CountryCode": 1,
    "LName": "Sadr Abad",
    "Name": "صدرآباد",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2944,
    "CountryCode": 1,
    "LName": "Qeytaniyeh",
    "Name": "قیطانیه",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2994,
    "CountryCode": 1,
    "LName": "Karchan",
    "Name": "کارچان",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2,
    "CountryCode": 1,
    "LName": "Isfahan",
    "Name": "اصفهان",
    "ProvinceCode": 8,
    "Type": "S"
  },
  {
    "Code": 302,
    "CountryCode": 1,
    "LName": "Dehaqan",
    "Name": "دهاقان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 303,
    "CountryCode": 1,
    "LName": "Esfaranjan",
    "Name": "اسفرنجان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 304,
    "CountryCode": 1,
    "LName": "Mobarakeh",
    "Name": "مبارکه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 305,
    "CountryCode": 1,
    "LName": "Golpayegan",
    "Name": "گلپایگان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 306,
    "CountryCode": 1,
    "LName": "Hajjiabad-e Zarrin",
    "Name": "حاجی آباد زرین",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 307,
    "CountryCode": 1,
    "LName": "Hosnijeh",
    "Name": "حسنیجه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 308,
    "CountryCode": 1,
    "LName": "Jandaq",
    "Name": "جندق",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 309,
    "CountryCode": 1,
    "LName": "Anarak",
    "Name": "انارک",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 310,
    "CountryCode": 1,
    "LName": "Kashan",
    "Name": "کاشان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 311,
    "CountryCode": 1,
    "LName": "Khomeynishahr",
    "Name": "خمینی شهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 312,
    "CountryCode": 1,
    "LName": "Khvonsar",
    "Name": "خوانسار",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 313,
    "CountryCode": 1,
    "LName": "Khur",
    "Name": "خور",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 314,
    "CountryCode": 1,
    "LName": "Konjed Jan",
    "Name": "کنجد جان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 315,
    "CountryCode": 1,
    "LName": "Margh-e Kuhestan",
    "Name": "مرغ کوهستان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 316,
    "CountryCode": 1,
    "LName": "Mashgan",
    "Name": "مشگان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 317,
    "CountryCode": 1,
    "LName": "Maþr",
    "Name": "مصر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 318,
    "CountryCode": 1,
    "LName": "Meymeh",
    "Name": "میمه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 319,
    "CountryCode": 1,
    "LName": "Mehr Gerd",
    "Name": "مهرگرد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 320,
    "CountryCode": 1,
    "LName": "Mohammadabad-e Kuzeh Gaz",
    "Name": "محمد آباد کوزه گز",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 321,
    "CountryCode": 1,
    "LName": "Murcheh Khvort",
    "Name": "مورچه خورت",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 322,
    "CountryCode": 1,
    "LName": "Nain",
    "Name": "نائین",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 323,
    "CountryCode": 1,
    "LName": "Najafabad",
    "Name": "نجف آباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 324,
    "CountryCode": 1,
    "LName": "Neyestanak",
    "Name": "نیستانک",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 325,
    "CountryCode": 1,
    "LName": "Ardestan",
    "Name": "اردستان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 326,
    "CountryCode": 1,
    "LName": "Qombavan",
    "Name": "قمبوان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 327,
    "CountryCode": 1,
    "LName": "Qomsheh",
    "Name": "قمشه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 328,
    "CountryCode": 1,
    "LName": "Aran va BidGol",
    "Name": "آران و بیدگل",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 329,
    "CountryCode": 1,
    "LName": "Semirom",
    "Name": "سمیرم",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 330,
    "CountryCode": 1,
    "LName": "Asgaran",
    "Name": "عسگران",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 331,
    "CountryCode": 1,
    "LName": "Ashin",
    "Name": "اشن",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 332,
    "CountryCode": 1,
    "LName": "Shahrab",
    "Name": "شهراب",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 334,
    "CountryCode": 1,
    "LName": "Tiran",
    "Name": "تیران",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 335,
    "CountryCode": 1,
    "LName": "Zavareh",
    "Name": "زواره",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 336,
    "CountryCode": 1,
    "LName": "Azaran",
    "Name": "آذران",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 337,
    "CountryCode": 1,
    "LName": "Chadegan",
    "Name": "چادگان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 338,
    "CountryCode": 1,
    "LName": "Chah-e Malek",
    "Name": "چاه ملک",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1005,
    "CountryCode": 1,
    "LName": "Baharestan",
    "Name": "بهارستان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1033,
    "CountryCode": 1,
    "LName": "Khorasgan",
    "Name": "خوراسگان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1049,
    "CountryCode": 1,
    "LName": "Buin o Miandasht",
    "Name": "بویین و میاندشت",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1053,
    "CountryCode": 1,
    "LName": "Zayandeh Rood",
    "Name": "شهر زاینده رود",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1075,
    "CountryCode": 1,
    "LName": "Zarrinshahr",
    "Name": "زرین شهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1083,
    "CountryCode": 1,
    "LName": "Daran",
    "Name": "داران",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1088,
    "CountryCode": 1,
    "LName": "Fooladshahr",
    "Name": "فولادشهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1091,
    "CountryCode": 1,
    "LName": "MohsenAbad",
    "Name": "محسن اباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1097,
    "CountryCode": 1,
    "LName": "Nik Abad",
    "Name": "نیک آباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1104,
    "CountryCode": 1,
    "LName": "Dorcheh",
    "Name": "درچه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1106,
    "CountryCode": 1,
    "LName": "Sedeh Lenjan",
    "Name": "سده لنجان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1108,
    "CountryCode": 1,
    "LName": "Varzaneh",
    "Name": "ورزنه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1112,
    "CountryCode": 1,
    "LName": "Shahreza",
    "Name": "شهرضا",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1122,
    "CountryCode": 1,
    "LName": "Dahagh",
    "Name": "دهق",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1123,
    "CountryCode": 1,
    "LName": "Vazvan",
    "Name": "وزوان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1133,
    "CountryCode": 1,
    "LName": "Chermahin",
    "Name": "چرمهین",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1149,
    "CountryCode": 1,
    "LName": "Natanz",
    "Name": "نطنز",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1156,
    "CountryCode": 1,
    "LName": "Qahderijan",
    "Name": "قهدریجان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1157,
    "CountryCode": 1,
    "LName": "Felavarjan",
    "Name": "فلاورجان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1162,
    "CountryCode": 1,
    "LName": "Fereydun Shahr",
    "Name": "فریدونشهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1166,
    "CountryCode": 1,
    "LName": "Noush Abad",
    "Name": "نوش اباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1168,
    "CountryCode": 1,
    "LName": "Hamgin",
    "Name": "همگین",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1201,
    "CountryCode": 1,
    "LName": "Shahin Shahr",
    "Name": "شاهین شهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1216,
    "CountryCode": 1,
    "LName": "Kuhpayeh",
    "Name": "کوهپایه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1240,
    "CountryCode": 1,
    "LName": "Farrokhi",
    "Name": "فرخی",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1242,
    "CountryCode": 1,
    "LName": "Afous",
    "Name": "افوس",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1264,
    "CountryCode": 1,
    "LName": "Joshaqane qali",
    "Name": "جوشقان قالی",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1267,
    "CountryCode": 1,
    "LName": "Pudeh",
    "Name": "پویا شهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1278,
    "CountryCode": 1,
    "LName": "Alavijeh",
    "Name": "علویجه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1280,
    "CountryCode": 1,
    "LName": "Pir Bakran",
    "Name": "پیربکران",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1285,
    "CountryCode": 1,
    "LName": "Toudeshk",
    "Name": "تودشک",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1303,
    "CountryCode": 1,
    "LName": "Talkhooncheh",
    "Name": "طالخونچه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1323,
    "CountryCode": 1,
    "LName": "Majlesi",
    "Name": "مجلسی",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1329,
    "CountryCode": 1,
    "LName": "Dolatabad",
    "Name": "دولت اباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1368,
    "CountryCode": 1,
    "LName": "Matin Abad",
    "Name": "متین آباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1378,
    "CountryCode": 1,
    "LName": "Manzariyeh",
    "Name": "منظریه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1386,
    "CountryCode": 1,
    "LName": "Abrisham",
    "Name": "ابریشم",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1427,
    "CountryCode": 1,
    "LName": "Vanak",
    "Name": "ونک",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1429,
    "CountryCode": 1,
    "LName": "Ezhieh",
    "Name": "اژیه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1439,
    "CountryCode": 1,
    "LName": "Chaghadar",
    "Name": "چقادر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1509,
    "CountryCode": 1,
    "LName": "Badroud",
    "Name": "بادرود",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1528,
    "CountryCode": 1,
    "LName": "Varnamkhast",
    "Name": "ورنامخواست",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1540,
    "CountryCode": 1,
    "LName": "Nasrabad",
    "Name": "نصراباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1575,
    "CountryCode": 1,
    "LName": "Barf Anbar",
    "Name": "برف انبار",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1588,
    "CountryCode": 1,
    "LName": "Harand",
    "Name": "هرند",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1592,
    "CountryCode": 1,
    "LName": "Rezev",
    "Name": "رزوه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1631,
    "CountryCode": 1,
    "LName": "Kommeh",
    "Name": "کمه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1650,
    "CountryCode": 1,
    "LName": "Barzok",
    "Name": "برزک",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1691,
    "CountryCode": 1,
    "LName": "Chamghordan",
    "Name": "چمگردان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1708,
    "CountryCode": 1,
    "LName": "Kelishad",
    "Name": "کلیشاد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1735,
    "CountryCode": 1,
    "LName": "Abyaneh",
    "Name": "ابیانه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1761,
    "CountryCode": 1,
    "LName": "Khorzugh",
    "Name": "خورزوق",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1804,
    "CountryCode": 1,
    "LName": "Habib Abad",
    "Name": "حبیب آباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1820,
    "CountryCode": 1,
    "LName": "Sejzi",
    "Name": "سجزی",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1829,
    "CountryCode": 1,
    "LName": "Dehabad",
    "Name": "ده آباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1837,
    "CountryCode": 1,
    "LName": "Baghbahadoran",
    "Name": "باغ بهادران",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1838,
    "CountryCode": 1,
    "LName": "Varkan",
    "Name": "ورکان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1839,
    "CountryCode": 1,
    "LName": "Kofran",
    "Name": "کفران",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1860,
    "CountryCode": 1,
    "LName": "Afjed",
    "Name": "افجد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1871,
    "CountryCode": 1,
    "LName": "Souhrofirozaan",
    "Name": "سهروفیروزان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1877,
    "CountryCode": 1,
    "LName": "Arisman",
    "Name": "اریسمان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1881,
    "CountryCode": 1,
    "LName": "Targhrood",
    "Name": "طرق رود",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1918,
    "CountryCode": 1,
    "LName": "Nanadegan",
    "Name": "ننادگان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1984,
    "CountryCode": 1,
    "LName": "Sepahan Shahr",
    "Name": "سپاهان شهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1995,
    "CountryCode": 1,
    "LName": "Qamsar",
    "Name": "قمصر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2018,
    "CountryCode": 1,
    "LName": "Arab abad",
    "Name": "عرب آباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2025,
    "CountryCode": 1,
    "LName": "Golshahr",
    "Name": "گلشهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2026,
    "CountryCode": 1,
    "LName": "Varzaneh",
    "Name": "ورزنه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2152,
    "CountryCode": 1,
    "LName": "Baghshad",
    "Name": "باغشاد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2172,
    "CountryCode": 1,
    "LName": "Mohammad Abad",
    "Name": "محمد آباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2173,
    "CountryCode": 1,
    "LName": "Ganj Abad",
    "Name": "گنج آباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2174,
    "CountryCode": 1,
    "LName": "Sian",
    "Name": "سیان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2175,
    "CountryCode": 1,
    "LName": "Javar",
    "Name": "جور",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2176,
    "CountryCode": 1,
    "LName": "Malvajerd",
    "Name": "مالواجرد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2245,
    "CountryCode": 1,
    "LName": "Karizsang",
    "Name": "کهریزسنگ",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2294,
    "CountryCode": 1,
    "LName": "Rahmat Abad",
    "Name": "رحمت اباد;خوانسار",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2312,
    "CountryCode": 1,
    "LName": "Peykan",
    "Name": "پیکان",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2474,
    "CountryCode": 1,
    "LName": "Abouzeidabad",
    "Name": "ابوزیدآباد",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2496,
    "CountryCode": 1,
    "LName": "Kham Pich",
    "Name": "خم پیچ",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2517,
    "CountryCode": 1,
    "LName": "Qazaan",
    "Name": "قزاآن",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2596,
    "CountryCode": 1,
    "LName": "Ravand",
    "Name": "راوند",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2646,
    "CountryCode": 1,
    "LName": "Zefreh",
    "Name": "زفره",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2766,
    "CountryCode": 1,
    "LName": "Yazdanshahr",
    "Name": "یزدانشهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2822,
    "CountryCode": 1,
    "LName": "Hasur",
    "Name": "حصور",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2926,
    "CountryCode": 1,
    "LName": "Komshecheh",
    "Name": "کمشچه",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 3021,
    "CountryCode": 1,
    "LName": "Natanz Nuclear Facilities",
    "Name": "نطنز - تاسیسات هسته ای",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 3041,
    "CountryCode": 1,
    "LName": "Rezvanshahr",
    "Name": "رضوانشهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 3156,
    "CountryCode": 1,
    "LName": "Vila Shahr",
    "Name": "ویلاشهر",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 5,
    "CountryCode": 1,
    "LName": "Ahvaz",
    "Name": "اهواز",
    "ProvinceCode": 9,
    "Type": "S"
  },
  {
    "Code": 340,
    "CountryCode": 1,
    "LName": "Dasht-e Azadegan",
    "Name": "دشت آزادگان",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 341,
    "CountryCode": 1,
    "LName": "Dasht-e Lali",
    "Name": "دشت لالی",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 342,
    "CountryCode": 1,
    "LName": "Dezful",
    "Name": "دزفول",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 343,
    "CountryCode": 1,
    "LName": "Sheyban",
    "Name": "شیبان",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 344,
    "CountryCode": 1,
    "LName": "Gatvand",
    "Name": "گتوند",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 345,
    "CountryCode": 1,
    "LName": "Ramshir",
    "Name": "رامشیر",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 346,
    "CountryCode": 1,
    "LName": "Guriyeh",
    "Name": "گوریه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 347,
    "CountryCode": 1,
    "LName": "Haft Gel",
    "Name": "هفتکل",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 348,
    "CountryCode": 1,
    "LName": "Bandar Imam Khomeyni",
    "Name": "بندر امام خمینی",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 349,
    "CountryCode": 1,
    "LName": "Hamidiyeh",
    "Name": "حمیدیه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 350,
    "CountryCode": 1,
    "LName": "Agha Jari",
    "Name": "آغاجاری",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 351,
    "CountryCode": 1,
    "LName": "Hendijan",
    "Name": "هندیجان",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 352,
    "CountryCode": 1,
    "LName": "Bandar Mahshahr",
    "Name": "بندر ماهشهر",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 353,
    "CountryCode": 1,
    "LName": "Hoveyzeh",
    "Name": "هویزه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 354,
    "CountryCode": 1,
    "LName": "Izeh",
    "Name": "ایذه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 355,
    "CountryCode": 1,
    "LName": "Jüleki",
    "Name": "جولکی",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 356,
    "CountryCode": 1,
    "LName": "Khorramshahr",
    "Name": "خرمشهر",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 357,
    "CountryCode": 1,
    "LName": "Khosrowabad",
    "Name": "خسرو آباد",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 358,
    "CountryCode": 1,
    "LName": "Mollasani",
    "Name": "ملاثانی",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 359,
    "CountryCode": 1,
    "LName": "Kut",
    "Name": "کوت",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 360,
    "CountryCode": 1,
    "LName": "Doroud",
    "Name": "دورود",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 361,
    "CountryCode": 1,
    "LName": "Mansureh",
    "Name": "منصوره",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 362,
    "CountryCode": 1,
    "LName": "Mar Bachcheh",
    "Name": "مر بچه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 363,
    "CountryCode": 1,
    "LName": "Behbahan",
    "Name": "بهبهان",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 364,
    "CountryCode": 1,
    "LName": "Masjed Soleyman",
    "Name": "مسجد سلیمان",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 365,
    "CountryCode": 1,
    "LName": "Mazra'eh",
    "Name": "مزرعه یک",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 366,
    "CountryCode": 1,
    "LName": "Naft-e Sefid",
    "Name": "نفت سفید",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 367,
    "CountryCode": 1,
    "LName": "Arab Hasan",
    "Name": "عرب حسن",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 368,
    "CountryCode": 1,
    "LName": "Omidiyeh-ye Sofla",
    "Name": "امیدیه سفلی",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 369,
    "CountryCode": 1,
    "LName": "Qafas",
    "Name": "قفس",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 370,
    "CountryCode": 1,
    "LName": "Qajariyeh Yek",
    "Name": "قاجاریه یک",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 371,
    "CountryCode": 1,
    "LName": "Lali",
    "Name": "لالی",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 372,
    "CountryCode": 1,
    "LName": "Arvand kenar",
    "Name": "اروند کنار",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 373,
    "CountryCode": 1,
    "LName": "Ramhormoz",
    "Name": "رامهرمز",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 374,
    "CountryCode": 1,
    "LName": "Bid Zard",
    "Name": "بید زرد",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 375,
    "CountryCode": 1,
    "LName": "Rashnudi",
    "Name": "رشنودی",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 376,
    "CountryCode": 1,
    "LName": "Sar Dasht",
    "Name": "سر دشت",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 377,
    "CountryCode": 1,
    "LName": "Dehdasht",
    "Name": "دهدشت",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 378,
    "CountryCode": 1,
    "LName": "Shadegan",
    "Name": "شادگان",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 379,
    "CountryCode": 1,
    "LName": "Lendeh",
    "Name": "لنده",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 381,
    "CountryCode": 1,
    "LName": "Shush",
    "Name": "شوش",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 382,
    "CountryCode": 1,
    "LName": "Shushtar",
    "Name": "شوشتر",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 383,
    "CountryCode": 1,
    "LName": "Susangerd",
    "Name": "سوسنگرد",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 384,
    "CountryCode": 1,
    "LName": "Ghale tol",
    "Name": "قلعه تل",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 385,
    "CountryCode": 1,
    "LName": "Sar Bandar",
    "Name": "سر بندر",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 386,
    "CountryCode": 1,
    "LName": "Toveh",
    "Name": "توه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 387,
    "CountryCode": 1,
    "LName": "Dehdez",
    "Name": "دهدز",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 388,
    "CountryCode": 1,
    "LName": "Lordegan",
    "Name": "لردگان",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 389,
    "CountryCode": 1,
    "LName": "Veys",
    "Name": "ویس",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 390,
    "CountryCode": 1,
    "LName": "Bagh-e Malek",
    "Name": "باغ ملک",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 391,
    "CountryCode": 1,
    "LName": "Abadan",
    "Name": "آبادان",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 392,
    "CountryCode": 1,
    "LName": "Bandar deylam",
    "Name": "بندر دیلم",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 879,
    "CountryCode": 1,
    "LName": "Band-e Shovar",
    "Name": "بندشوار",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 969,
    "CountryCode": 1,
    "LName": "Andimeshk",
    "Name": "اندیمشک",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1037,
    "CountryCode": 1,
    "LName": "Al-Khorshid",
    "Name": "آل خورشید",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1079,
    "CountryCode": 1,
    "LName": "Dezab",
    "Name": "دزآب",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1119,
    "CountryCode": 1,
    "LName": "Hamzeh",
    "Name": "حمزه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1211,
    "CountryCode": 1,
    "LName": "Mian kuh",
    "Name": "میانکوه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1258,
    "CountryCode": 1,
    "LName": "Hoseyniyae",
    "Name": "حسینیه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1260,
    "CountryCode": 1,
    "LName": "Chamgolak",
    "Name": "چم گلک",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1312,
    "CountryCode": 1,
    "LName": "Mianrood",
    "Name": "میانرود",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1321,
    "CountryCode": 1,
    "LName": "Darkhovin",
    "Name": "دارخوین",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1360,
    "CountryCode": 1,
    "LName": "Bidroubeh",
    "Name": "بیدروبه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1415,
    "CountryCode": 1,
    "LName": "Bonar-e-Vajel",
    "Name": "بنار واجل",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1562,
    "CountryCode": 1,
    "LName": "Omidiyeh",
    "Name": "امیدیه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1629,
    "CountryCode": 1,
    "LName": "Eslam Abad",
    "Name": "اسلام آباد",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1744,
    "CountryCode": 1,
    "LName": "Chamran Town",
    "Name": "شهید چمران",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1807,
    "CountryCode": 1,
    "LName": "Emam",
    "Name": "شهر امام",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1824,
    "CountryCode": 1,
    "LName": "Barangerd",
    "Name": "بارانگرد",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1851,
    "CountryCode": 1,
    "LName": "Haft Tapeh",
    "Name": "هفت تپه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1858,
    "CountryCode": 1,
    "LName": "Torkalaki",
    "Name": "ترکالکی",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1916,
    "CountryCode": 1,
    "LName": "Zebashahr",
    "Name": "زیباشهر",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2192,
    "CountryCode": 1,
    "LName": "CAMP CNPC-PEDEC",
    "Name": "کمپ آزادگان جنوبی",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2307,
    "CountryCode": 1,
    "LName": "Behrooz Alley",
    "Name": "خرمشهر - کوی بهروز",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2483,
    "CountryCode": 1,
    "LName": "Darvish Padegan",
    "Name": "پادگان درویش",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2564,
    "CountryCode": 1,
    "LName": "Jazireh Minoo",
    "Name": "جزیره مینو",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2800,
    "CountryCode": 1,
    "LName": "Sherafat",
    "Name": "شرافت",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2841,
    "CountryCode": 1,
    "LName": "Shabisheh",
    "Name": "شبیشه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2940,
    "CountryCode": 1,
    "LName": "Horijeh",
    "Name": "حریجه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2996,
    "CountryCode": 1,
    "LName": "Rofayye",
    "Name": "رفیع",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3030,
    "CountryCode": 1,
    "LName": "Gheyzaniyeh",
    "Name": "غیزانیه",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3087,
    "CountryCode": 1,
    "LName": "Mohajerin",
    "Name": "مهاجرین",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3169,
    "CountryCode": 1,
    "LName": "Koushkak",
    "Name": "کوشکک",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3170,
    "CountryCode": 1,
    "LName": "Jannat Makan",
    "Name": "جنت مکان",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3210,
    "CountryCode": 1,
    "LName": "Khovis",
    "Name": "خویس",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3219,
    "CountryCode": 1,
    "LName": "Hossein Abad",
    "Name": "حسین آباد",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3266,
    "CountryCode": 1,
    "LName": "Manuohi",
    "Name": "منیوحی",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 29,
    "CountryCode": 1,
    "LName": "Ilam",
    "Name": "ایلام",
    "ProvinceCode": 10,
    "Type": "S"
  },
  {
    "Code": 393,
    "CountryCode": 1,
    "LName": "Dehloran",
    "Name": "دهلران",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 394,
    "CountryCode": 1,
    "LName": "Ivan",
    "Name": "ایوان",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 395,
    "CountryCode": 1,
    "LName": "Delgosha",
    "Name": "دلگشا",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 396,
    "CountryCode": 1,
    "LName": "Mehran",
    "Name": "مهران",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 397,
    "CountryCode": 1,
    "LName": "Qal'eh Darreh",
    "Name": "قلعه دره",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 398,
    "CountryCode": 1,
    "LName": "Darre Shahr",
    "Name": "دره شهر",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 399,
    "CountryCode": 1,
    "LName": "Shirvan",
    "Name": "شیروان",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1002,
    "CountryCode": 1,
    "LName": "Abdanan",
    "Name": "آبدانان",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1174,
    "CountryCode": 1,
    "LName": "Talkhab",
    "Name": "تلخاب",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1275,
    "CountryCode": 1,
    "LName": "Sarableh",
    "Name": "سرابله",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1287,
    "CountryCode": 1,
    "LName": "Cheshme Shirin",
    "Name": "چشمه شیرین",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1355,
    "CountryCode": 1,
    "LName": "Badre",
    "Name": "بدره",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1430,
    "CountryCode": 1,
    "LName": "Chovar",
    "Name": "چوار",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1471,
    "CountryCode": 1,
    "LName": "Abdanan",
    "Name": "آبدانان",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1491,
    "CountryCode": 1,
    "LName": "zayd",
    "Name": "زید",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1622,
    "CountryCode": 1,
    "LName": "Pahle",
    "Name": "پهله",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1705,
    "CountryCode": 1,
    "LName": "Kahreh",
    "Name": "کهره",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1734,
    "CountryCode": 1,
    "LName": "Mormori",
    "Name": "مورموری",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1743,
    "CountryCode": 1,
    "LName": "Dasht Abbas",
    "Name": "دشت عباس",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1797,
    "CountryCode": 1,
    "LName": "Mousiyan",
    "Name": "موسیان",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1888,
    "CountryCode": 1,
    "LName": "Aseman Abad",
    "Name": "آسمان آباد",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1970,
    "CountryCode": 1,
    "LName": "GachKuban",
    "Name": "گچ کوبان",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1977,
    "CountryCode": 1,
    "LName": "Zarangush",
    "Name": "زرانگوش",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 2039,
    "CountryCode": 1,
    "LName": "Shahrak-e Valiasr",
    "Name": "شهرک ولیعصر",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 2073,
    "CountryCode": 1,
    "LName": "Cheshmeh Khosh",
    "Name": "چشمه خوش",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 2366,
    "CountryCode": 1,
    "LName": "Malekshahi",
    "Name": "ملکشاهی",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 3166,
    "CountryCode": 1,
    "LName": "Saleh Abad",
    "Name": "صالح آباد",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 20,
    "CountryCode": 1,
    "LName": "Boshehr",
    "Name": "بوشهر",
    "ProvinceCode": 11,
    "Type": "S"
  },
  {
    "Code": 400,
    "CountryCode": 1,
    "LName": "Deyyer",
    "Name": "دیر",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 401,
    "CountryCode": 1,
    "LName": "Akhtar",
    "Name": "اختر",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 402,
    "CountryCode": 1,
    "LName": "Delvar",
    "Name": "دلوار",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 403,
    "CountryCode": 1,
    "LName": "Shiff",
    "Name": "شیف",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 404,
    "CountryCode": 1,
    "LName": "Bandar-e Deylam",
    "Name": "بندر دیلم",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 405,
    "CountryCode": 1,
    "LName": "Bandar Rostami",
    "Name": "بندر رستمی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 406,
    "CountryCode": 1,
    "LName": "Ganaveh",
    "Name": "گناوه",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 407,
    "CountryCode": 1,
    "LName": "Gorbeh'i",
    "Name": "گربهی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 408,
    "CountryCode": 1,
    "LName": "Nirugah Atomi",
    "Name": "نیروگاه اتمی بوشهر",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 409,
    "CountryCode": 1,
    "LName": "Bandar-e Rig",
    "Name": "بندر ریگ",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 410,
    "CountryCode": 1,
    "LName": "Jam",
    "Name": "جم",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 411,
    "CountryCode": 1,
    "LName": "Kaki",
    "Name": "کاکی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 412,
    "CountryCode": 1,
    "LName": "Kalmeh",
    "Name": "کلمه",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 413,
    "CountryCode": 1,
    "LName": "Kangan",
    "Name": "کنگان",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 414,
    "CountryCode": 1,
    "LName": "Karri",
    "Name": "کاری",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 415,
    "CountryCode": 1,
    "LName": "Bang",
    "Name": "بنگ",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 416,
    "CountryCode": 1,
    "LName": "Khormoj",
    "Name": "خورموج",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 417,
    "CountryCode": 1,
    "LName": "Baduleh",
    "Name": "بادوله",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 418,
    "CountryCode": 1,
    "LName": "Babakalan",
    "Name": "باباکلان",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 419,
    "CountryCode": 1,
    "LName": "Tashan",
    "Name": "تشان",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 420,
    "CountryCode": 1,
    "LName": "Mokaberi",
    "Name": "مکبری",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 421,
    "CountryCode": 1,
    "LName": "Nay Band",
    "Name": "نی بند",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 422,
    "CountryCode": 1,
    "LName": "Talkhu",
    "Name": "تلخو",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 423,
    "CountryCode": 1,
    "LName": "Riz",
    "Name": "ریز",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 424,
    "CountryCode": 1,
    "LName": "Sa'dabad",
    "Name": "سعد آباد",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 425,
    "CountryCode": 1,
    "LName": "Sar Mashhad",
    "Name": "سر مشهد",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 426,
    "CountryCode": 1,
    "LName": "Shanbeh",
    "Name": "شنبه",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 427,
    "CountryCode": 1,
    "LName": "Abad",
    "Name": "آباد",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 428,
    "CountryCode": 1,
    "LName": "Borazjan",
    "Name": "برازجان",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 429,
    "CountryCode": 1,
    "LName": "TavilDaraz",
    "Name": "طویل دراز",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 430,
    "CountryCode": 1,
    "LName": "Taheri",
    "Name": "طاهری",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 431,
    "CountryCode": 1,
    "LName": "Tang-e Eram",
    "Name": "تنگه ارم",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 432,
    "CountryCode": 1,
    "LName": "Tonbak",
    "Name": "تنبک",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 433,
    "CountryCode": 1,
    "LName": "Bushehr (Bushire)",
    "Name": "بوشهر",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 434,
    "CountryCode": 1,
    "LName": "Zeydan",
    "Name": "زیدان",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 435,
    "CountryCode": 1,
    "LName": "Büshgan",
    "Name": "بوشگان",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 437,
    "CountryCode": 1,
    "LName": "Khesht",
    "Name": "خشت",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 438,
    "CountryCode": 1,
    "LName": "Chahar Rüsta'i",
    "Name": "چهار روستایی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 439,
    "CountryCode": 1,
    "LName": "Ahmadi",
    "Name": "احمدی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 440,
    "CountryCode": 1,
    "LName": "Ahram",
    "Name": "اهرم",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 441,
    "CountryCode": 1,
    "LName": "Dalaki",
    "Name": "دالکی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1020,
    "CountryCode": 1,
    "LName": "Ab pakhsh",
    "Name": "آبپخش",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1029,
    "CountryCode": 1,
    "LName": "Asaloyeh",
    "Name": "عسلویه",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1235,
    "CountryCode": 1,
    "LName": "Shabankareh",
    "Name": "شبانکاره",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1293,
    "CountryCode": 1,
    "LName": "Vahdatiyeh",
    "Name": "وحدتیه",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1322,
    "CountryCode": 1,
    "LName": "Abdan",
    "Name": "آبدان",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1334,
    "CountryCode": 1,
    "LName": "Banood",
    "Name": "بنود",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1335,
    "CountryCode": 1,
    "LName": "Chah Mobarak",
    "Name": "چاه مبارک",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1346,
    "CountryCode": 1,
    "LName": "Ali Hoseyni",
    "Name": "عالی حسنی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1354,
    "CountryCode": 1,
    "LName": "Hesar",
    "Name": "حصار",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1380,
    "CountryCode": 1,
    "LName": "Bandar Emam Hasan",
    "Name": "بندر امام حسن",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1410,
    "CountryCode": 1,
    "LName": "Baghak-e Shomali",
    "Name": "باغک شمالی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1413,
    "CountryCode": 1,
    "LName": "Baghak-e Jonubi",
    "Name": "باغک جنوبی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1446,
    "CountryCode": 1,
    "LName": "Khourshahab",
    "Name": "خورشهاب",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1487,
    "CountryCode": 1,
    "LName": "Kharg",
    "Name": "خارگ",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1682,
    "CountryCode": 1,
    "LName": "Charak",
    "Name": "چارک",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1758,
    "CountryCode": 1,
    "LName": "Shirinoo",
    "Name": "شیرینو",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1806,
    "CountryCode": 1,
    "LName": "Shahniya",
    "Name": "شهنیا",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1870,
    "CountryCode": 1,
    "LName": "Anarestan",
    "Name": "انارستان",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1896,
    "CountryCode": 1,
    "LName": "Banak",
    "Name": "بنک",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1898,
    "CountryCode": 1,
    "LName": "Alishahr",
    "Name": "عالیشهر",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1907,
    "CountryCode": 1,
    "LName": "Bidkhoon",
    "Name": "بیدخون",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1920,
    "CountryCode": 1,
    "LName": "Dorahak",
    "Name": "دوراهک",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1979,
    "CountryCode": 1,
    "LName": "Nazaragha",
    "Name": "نظرآقا",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1998,
    "CountryCode": 1,
    "LName": "BordKhun",
    "Name": "بردخون",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2043,
    "CountryCode": 1,
    "LName": "Shureki",
    "Name": "شورکی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2353,
    "CountryCode": 1,
    "LName": "Choghadak",
    "Name": "چغادک",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2363,
    "CountryCode": 1,
    "LName": "Sarmal",
    "Name": "سرمل",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2461,
    "CountryCode": 1,
    "LName": "Siraf",
    "Name": "سیراف",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2500,
    "CountryCode": 1,
    "LName": "Chavoshi",
    "Name": "چاوشی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2617,
    "CountryCode": 1,
    "LName": "Bardestan",
    "Name": "بردستان",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2848,
    "CountryCode": 1,
    "LName": "Nakhl Taghi",
    "Name": "نخل تقی",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 3066,
    "CountryCode": 1,
    "LName": "Gorak Dejhgah",
    "Name": "گورک دژگاه",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 3125,
    "CountryCode": 1,
    "LName": "Sana",
    "Name": "سنا",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 3158,
    "CountryCode": 1,
    "LName": "Boneh Gez",
    "Name": "بنه گز",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 6,
    "CountryCode": 1,
    "LName": "Tabriz",
    "Name": "تبریز",
    "ProvinceCode": 12,
    "Type": "S"
  },
  {
    "Code": 283,
    "CountryCode": 1,
    "LName": "Malekan",
    "Name": "ملکان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 442,
    "CountryCode": 1,
    "LName": "Ajab Shir",
    "Name": "عجب شیر",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 443,
    "CountryCode": 1,
    "LName": "hadishahr",
    "Name": "هادیشهر",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 444,
    "CountryCode": 1,
    "LName": "Duzduzan",
    "Name": "دوز دوزان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 445,
    "CountryCode": 1,
    "LName": "Ghilmansaray",
    "Name": "غیلمانسرای",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 446,
    "CountryCode": 1,
    "LName": "Tasuj",
    "Name": "تسوج",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 447,
    "CountryCode": 1,
    "LName": "Almas (Almasi)",
    "Name": "الماس",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 448,
    "CountryCode": 1,
    "LName": "Khvajeh",
    "Name": "خواجه",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 450,
    "CountryCode": 1,
    "LName": "Marand",
    "Name": "مرند",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 453,
    "CountryCode": 1,
    "LName": "Mianeh",
    "Name": "میانه",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 454,
    "CountryCode": 1,
    "LName": "Bonab",
    "Name": "بناب",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 456,
    "CountryCode": 1,
    "LName": "Aralan",
    "Name": "آرالان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 458,
    "CountryCode": 1,
    "LName": "Arbatan",
    "Name": "اربطان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 459,
    "CountryCode": 1,
    "LName": "Sarab",
    "Name": "سراب",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 460,
    "CountryCode": 1,
    "LName": "Bishak",
    "Name": "بیشک",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 462,
    "CountryCode": 1,
    "LName": "Tark",
    "Name": "ترک",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 463,
    "CountryCode": 1,
    "LName": "Tarzam",
    "Name": "طرزم",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 464,
    "CountryCode": 1,
    "LName": "Tazeh Kand",
    "Name": "تازه کند",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 465,
    "CountryCode": 1,
    "LName": "Yekan Kahriz-e Bala",
    "Name": "یکان کهریز",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 466,
    "CountryCode": 1,
    "LName": "Avergan",
    "Name": "آورگان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 468,
    "CountryCode": 1,
    "LName": "Arlan",
    "Name": "ارلان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 469,
    "CountryCode": 1,
    "LName": "Baðh e Vazir (Bagh-e Vazir)",
    "Name": "باغ وزیر",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 474,
    "CountryCode": 1,
    "LName": "Hurand",
    "Name": "هوراند",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 695,
    "CountryCode": 1,
    "LName": "Kharvana",
    "Name": "خاروانا",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 871,
    "CountryCode": 1,
    "LName": "Nordooz",
    "Name": "نوردوز",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 993,
    "CountryCode": 1,
    "LName": "Ahar",
    "Name": "اهر",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1003,
    "CountryCode": 1,
    "LName": "Jolfa",
    "Name": "جلفا",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1014,
    "CountryCode": 1,
    "LName": "Maragheh",
    "Name": "مراغه",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1015,
    "CountryCode": 1,
    "LName": "Azarshahr",
    "Name": "آذرشهر",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1016,
    "CountryCode": 1,
    "LName": "Mamaghan",
    "Name": "ممقان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1022,
    "CountryCode": 1,
    "LName": "Bostan Abad",
    "Name": "بستان آباد",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1027,
    "CountryCode": 1,
    "LName": "Shabestar",
    "Name": "شبستر",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1032,
    "CountryCode": 1,
    "LName": "Eiri Sofla",
    "Name": "ایری سفلی",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1055,
    "CountryCode": 1,
    "LName": "Kaleybar",
    "Name": "کلیبر",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1057,
    "CountryCode": 1,
    "LName": "Bakhshayesh",
    "Name": "بخشایش",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1066,
    "CountryCode": 1,
    "LName": "Hashtrood",
    "Name": "هشترود",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1082,
    "CountryCode": 1,
    "LName": "Leilan",
    "Name": "لیلان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1100,
    "CountryCode": 1,
    "LName": "Sahand",
    "Name": "سهند",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1124,
    "CountryCode": 1,
    "LName": "Heris",
    "Name": "هریس",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1126,
    "CountryCode": 1,
    "LName": "Osku",
    "Name": "اسکو",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1139,
    "CountryCode": 1,
    "LName": "varzeqan",
    "Name": "ورزقان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1175,
    "CountryCode": 1,
    "LName": "Daryan",
    "Name": "دریان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1212,
    "CountryCode": 1,
    "LName": "Mehraban",
    "Name": "مهربان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1218,
    "CountryCode": 1,
    "LName": "Zonouz",
    "Name": "زنوز",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1307,
    "CountryCode": 1,
    "LName": "Qareaghaj",
    "Name": "قره آعاج",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1311,
    "CountryCode": 1,
    "LName": "Koshksaray",
    "Name": "کشکسرای",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1349,
    "CountryCode": 1,
    "LName": "Nir",
    "Name": "نیر",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1370,
    "CountryCode": 1,
    "LName": "Homatoyor Marand",
    "Name": "مرغداری هماطیور مرند",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1407,
    "CountryCode": 1,
    "LName": "Sis",
    "Name": "سیس",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1492,
    "CountryCode": 1,
    "LName": "khameneh",
    "Name": "خامنه",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1496,
    "CountryCode": 1,
    "LName": "Sharafkhaneh",
    "Name": "شرفخانه",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1501,
    "CountryCode": 1,
    "LName": "Kalvanaq",
    "Name": "کلوانق",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1520,
    "CountryCode": 1,
    "LName": "Ilkhchi",
    "Name": "ایلخچی",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1544,
    "CountryCode": 1,
    "LName": "Yamchi",
    "Name": "یامچی",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1554,
    "CountryCode": 1,
    "LName": "Kozeh Kanan",
    "Name": "کوزه کنان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1556,
    "CountryCode": 1,
    "LName": "Aqkend",
    "Name": "آقکند",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1566,
    "CountryCode": 1,
    "LName": "Khomarloo",
    "Name": "خمارلو",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1599,
    "CountryCode": 1,
    "LName": "Soufian",
    "Name": "صوفیان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1624,
    "CountryCode": 1,
    "LName": "Bandr Trkman",
    "Name": "بندر ترکمن",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1636,
    "CountryCode": 1,
    "LName": "Sard Rood",
    "Name": "سردرود",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1685,
    "CountryCode": 1,
    "LName": "Roveshte Bozorg",
    "Name": "روشت بزرگ",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1695,
    "CountryCode": 1,
    "LName": "Beris",
    "Name": "بریس",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1704,
    "CountryCode": 1,
    "LName": "Sharabian",
    "Name": "شربیان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1711,
    "CountryCode": 1,
    "LName": "Mayan sofla",
    "Name": "مایان سفلی",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1712,
    "CountryCode": 1,
    "LName": "Tabl",
    "Name": "طبل",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1724,
    "CountryCode": 1,
    "LName": "Shand Abad",
    "Name": "شنداباد",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1763,
    "CountryCode": 1,
    "LName": "Achachi",
    "Name": "آچاچی",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1788,
    "CountryCode": 1,
    "LName": "Gogan",
    "Name": "گوگان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1800,
    "CountryCode": 1,
    "LName": "Yekan-e Olya",
    "Name": "یکان علیا",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1801,
    "CountryCode": 1,
    "LName": "Yekan-e Kahriz",
    "Name": "یکان کهریز",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1803,
    "CountryCode": 1,
    "LName": "Sefidkamar",
    "Name": "سفیدکمر",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1861,
    "CountryCode": 1,
    "LName": "Khelejan",
    "Name": "خلجان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1869,
    "CountryCode": 1,
    "LName": "Satllo",
    "Name": "ساتلو",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1889,
    "CountryCode": 1,
    "LName": "Khosroshah",
    "Name": "خسروشاه",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1914,
    "CountryCode": 1,
    "LName": "Teymourlou",
    "Name": "تیمورلو",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1949,
    "CountryCode": 1,
    "LName": "Zarnagh",
    "Name": "زرنق",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2062,
    "CountryCode": 1,
    "LName": "Basmenj",
    "Name": "باسمنج",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2284,
    "CountryCode": 1,
    "LName": "Hormuz Island",
    "Name": "جزیره هرمز",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2540,
    "CountryCode": 1,
    "LName": "Kondroud",
    "Name": "کندرود",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2544,
    "CountryCode": 1,
    "LName": "Turkamanchay",
    "Name": "ترکمنچای",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2545,
    "CountryCode": 1,
    "LName": "Kish - Dehkadeh Saheli",
    "Name": "کیش - دهکده ساحلی",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2605,
    "CountryCode": 1,
    "LName": "Andaryan",
    "Name": "اندریان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2792,
    "CountryCode": 1,
    "LName": "Miab",
    "Name": "میاب",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2975,
    "CountryCode": 1,
    "LName": "Qazi Jahan",
    "Name": "قاضی جهان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2979,
    "CountryCode": 1,
    "LName": "Mobarakshahr",
    "Name": "مبارک شهر",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 3100,
    "CountryCode": 1,
    "LName": "Harzand-e Jadid",
    "Name": "هرزند جدید",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 3124,
    "CountryCode": 1,
    "LName": "Arbatan",
    "Name": "آربطان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 3163,
    "CountryCode": 1,
    "LName": "Nasir Abad",
    "Name": "نصیر آباد",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 3224,
    "CountryCode": 1,
    "LName": "Korjan",
    "Name": "کرجان",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 3262,
    "CountryCode": 1,
    "LName": "Beyraq",
    "Name": "بیرق",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 30,
    "CountryCode": 1,
    "LName": "Khorramabad",
    "Name": "خرم آباد",
    "ProvinceCode": 13,
    "Type": "S"
  },
  {
    "Code": 287,
    "CountryCode": 1,
    "LName": "Ezna",
    "Name": "ازنا",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 471,
    "CountryCode": 1,
    "LName": "Do Rud",
    "Name": "دورود",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 472,
    "CountryCode": 1,
    "LName": "Alashtar",
    "Name": "الشتر",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 473,
    "CountryCode": 1,
    "LName": "Aligudarz",
    "Name": "الیگودرز",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 475,
    "CountryCode": 1,
    "LName": "Kuhdasht",
    "Name": "کوهدشت",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 476,
    "CountryCode": 1,
    "LName": "Razan",
    "Name": "رازان",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 477,
    "CountryCode": 1,
    "LName": "Oshtorinan",
    "Name": "اشترینان",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 478,
    "CountryCode": 1,
    "LName": "Heshmatabad",
    "Name": "حشمت آباد",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 479,
    "CountryCode": 1,
    "LName": "Borujerd",
    "Name": "بروجرد",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 480,
    "CountryCode": 1,
    "LName": "Chaman Soltan",
    "Name": "چمن سلطان",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 828,
    "CountryCode": 1,
    "LName": "Kohnani",
    "Name": "کوهنانی",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 973,
    "CountryCode": 1,
    "LName": "Nourabad",
    "Name": "نورآباد",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 996,
    "CountryCode": 1,
    "LName": "pol-dokhtar",
    "Name": "پل دختر",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1080,
    "CountryCode": 1,
    "LName": "Aleshtar",
    "Name": "الشتر",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1272,
    "CountryCode": 1,
    "LName": "Cheghabal",
    "Name": "چغابل",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1294,
    "CountryCode": 1,
    "LName": "Delfan",
    "Name": "دلفان",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1343,
    "CountryCode": 1,
    "LName": "Romeshgan",
    "Name": "رومشگان",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1561,
    "CountryCode": 1,
    "LName": "Mamulan",
    "Name": "معمولان",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1576,
    "CountryCode": 1,
    "LName": "Murani",
    "Name": "مورانی",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1805,
    "CountryCode": 1,
    "LName": "Karm Bak Mahmodvand",
    "Name": "کرم بک محمودوند",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1999,
    "CountryCode": 1,
    "LName": "Sepid Dasht",
    "Name": "سپیددشت",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2022,
    "CountryCode": 1,
    "LName": "Gavbar",
    "Name": "گاوبار",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2048,
    "CountryCode": 1,
    "LName": "Sarab Dowreh",
    "Name": "سراب دوره",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2129,
    "CountryCode": 1,
    "LName": "Gale shamsi",
    "Name": "قلعه شمسی",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2166,
    "CountryCode": 1,
    "LName": "Kumas",
    "Name": "کوماس",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2426,
    "CountryCode": 1,
    "LName": "Sarab-e Honam",
    "Name": "سراب هنام",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2756,
    "CountryCode": 1,
    "LName": "Garab",
    "Name": "گراب",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2904,
    "CountryCode": 1,
    "LName": "Gorji",
    "Name": "گرجی",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2992,
    "CountryCode": 1,
    "LName": "Jahan Abad",
    "Name": "جهان آباد",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 3054,
    "CountryCode": 1,
    "LName": "Darb Gonbad",
    "Name": "درب گنبد",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 3174,
    "CountryCode": 1,
    "LName": "Veysian",
    "Name": "ویسیان",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 16,
    "CountryCode": 1,
    "LName": "Rasht",
    "Name": "رشت",
    "ProvinceCode": 14,
    "Type": "S"
  },
  {
    "Code": 481,
    "CountryCode": 1,
    "LName": "Bandar-e Anzali",
    "Name": "بندر انزلی",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 482,
    "CountryCode": 1,
    "LName": "Fuman",
    "Name": "فومن",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 483,
    "CountryCode": 1,
    "LName": "Gatgesar",
    "Name": "گچسر",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 484,
    "CountryCode": 1,
    "LName": "Aliabad",
    "Name": "علی آباد",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 485,
    "CountryCode": 1,
    "LName": "Talesh",
    "Name": "تالش",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 486,
    "CountryCode": 1,
    "LName": "Khoman",
    "Name": "خمام",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 487,
    "CountryCode": 1,
    "LName": "Kuchesfahan",
    "Name": "کوچصفهان",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 488,
    "CountryCode": 1,
    "LName": "Kopur Chal",
    "Name": "کپورچال",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 489,
    "CountryCode": 1,
    "LName": "Langarüd",
    "Name": "لنگرود",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 490,
    "CountryCode": 1,
    "LName": "Lahijan",
    "Name": "لاهیجان",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 491,
    "CountryCode": 1,
    "LName": "Astara",
    "Name": "آستارا",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 492,
    "CountryCode": 1,
    "LName": "Manjil",
    "Name": "منجیل",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 493,
    "CountryCode": 1,
    "LName": "Rahimabad",
    "Name": "رحیم آباد",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 494,
    "CountryCode": 1,
    "LName": "Koshkebijar",
    "Name": "خشکبیجار",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 495,
    "CountryCode": 1,
    "LName": "Rudsar (Rud Sar)",
    "Name": "رودسر",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 496,
    "CountryCode": 1,
    "LName": "Shaft",
    "Name": "شفت",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 497,
    "CountryCode": 1,
    "LName": "Shirabad",
    "Name": "شیرآباد",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 498,
    "CountryCode": 1,
    "LName": "Sowma'eh Sara",
    "Name": "صومعه سرا",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 499,
    "CountryCode": 1,
    "LName": "Astaneh",
    "Name": "آستانه",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1102,
    "CountryCode": 1,
    "LName": "Roodbar",
    "Name": "رودبار",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1141,
    "CountryCode": 1,
    "LName": "Ramsar",
    "Name": "رامسر",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1256,
    "CountryCode": 1,
    "LName": "Masal",
    "Name": "ماسال",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1268,
    "CountryCode": 1,
    "LName": "Vajargah",
    "Name": "واجارگاه",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1282,
    "CountryCode": 1,
    "LName": "Rezvanshahr",
    "Name": "رضوانشهر",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1319,
    "CountryCode": 1,
    "LName": "Amlash",
    "Name": "املش",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1465,
    "CountryCode": 1,
    "LName": "Lasht e nesha",
    "Name": "لشت نشا",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1484,
    "CountryCode": 1,
    "LName": "Shanderman",
    "Name": "شاندرمن",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1503,
    "CountryCode": 1,
    "LName": "Paresar",
    "Name": "پره سر",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1555,
    "CountryCode": 1,
    "LName": "Taher Gorab",
    "Name": "طاهرگوراب",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1580,
    "CountryCode": 1,
    "LName": "Kelachay",
    "Name": "کلاچای",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1587,
    "CountryCode": 1,
    "LName": "Lowshan",
    "Name": "لوشان",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1673,
    "CountryCode": 1,
    "LName": "Chamkhaleh",
    "Name": "چمخاله",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1693,
    "CountryCode": 1,
    "LName": "Jirandeh",
    "Name": "جیرنده",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1722,
    "CountryCode": 1,
    "LName": "Haji Bekande",
    "Name": "حاجی بکنده",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1723,
    "CountryCode": 1,
    "LName": "Nooshar",
    "Name": "نوشر",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1782,
    "CountryCode": 1,
    "LName": "Asalam",
    "Name": "اسالم",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1859,
    "CountryCode": 1,
    "LName": "Zibakenar",
    "Name": "زیباکنار",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1867,
    "CountryCode": 1,
    "LName": "Havigh",
    "Name": "حویق",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1915,
    "CountryCode": 1,
    "LName": "Shahrak-e Mehr",
    "Name": "شهرک مهر رشت",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1932,
    "CountryCode": 1,
    "LName": "Chaboksar",
    "Name": "چابکسر",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1950,
    "CountryCode": 1,
    "LName": "Rostamabad",
    "Name": "رستم آباد",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1972,
    "CountryCode": 1,
    "LName": "Gafsheh",
    "Name": "گفشه",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1978,
    "CountryCode": 1,
    "LName": "Sangar",
    "Name": "سنگر",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 2125,
    "CountryCode": 1,
    "LName": "Siahkal",
    "Name": "سیاهکل",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 2436,
    "CountryCode": 1,
    "LName": "Ziabar",
    "Name": "ضیابر",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 2740,
    "CountryCode": 1,
    "LName": "Gurab Zarmikh",
    "Name": "گوراب زرمیخ",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 2743,
    "CountryCode": 1,
    "LName": "Tutkabon",
    "Name": "توتکابن",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 2886,
    "CountryCode": 1,
    "LName": "Hasan Rud",
    "Name": "حسن رود",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 3202,
    "CountryCode": 1,
    "LName": "Fashtakeh",
    "Name": "فشتکه",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 3260,
    "CountryCode": 1,
    "LName": "Louleman",
    "Name": "لولمان",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 25,
    "CountryCode": 1,
    "LName": "Zanjan",
    "Name": "زنجان",
    "ProvinceCode": 15,
    "Type": "S"
  },
  {
    "Code": 501,
    "CountryCode": 1,
    "LName": "Do Tappeh-ye Pa'in",
    "Name": "دو تپه سفلی",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 502,
    "CountryCode": 1,
    "LName": "Garmab",
    "Name": "گرماب",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 503,
    "CountryCode": 1,
    "LName": "Gheydar",
    "Name": "قیدار",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 504,
    "CountryCode": 1,
    "LName": "Khorramdareh",
    "Name": "خرم دره",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 505,
    "CountryCode": 1,
    "LName": "Sohrevard",
    "Name": "سهرورد",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 508,
    "CountryCode": 1,
    "LName": "Armaghan Khaneh",
    "Name": "ارمغانخانه",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 510,
    "CountryCode": 1,
    "LName": "Sha'ban",
    "Name": "شعبان",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 511,
    "CountryCode": 1,
    "LName": "Soltaniyeh",
    "Name": "سلطانیه",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 512,
    "CountryCode": 1,
    "LName": "Sa'in Qal'eh",
    "Name": "صایین قلعه",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 517,
    "CountryCode": 1,
    "LName": "Abhar",
    "Name": "ابهر",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 518,
    "CountryCode": 1,
    "LName": "Ab Bar",
    "Name": "آب بر",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 845,
    "CountryCode": 1,
    "LName": "Kheir Abad",
    "Name": "خیرآباد",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1072,
    "CountryCode": 1,
    "LName": "Sojas",
    "Name": "سجاس",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1113,
    "CountryCode": 1,
    "LName": "Mahneshan",
    "Name": "ماهنشان",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1217,
    "CountryCode": 1,
    "LName": "Karasf",
    "Name": "کرسف",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1291,
    "CountryCode": 1,
    "LName": "Chavarzaq",
    "Name": "چورزق",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1292,
    "CountryCode": 1,
    "LName": "Hidaj",
    "Name": "هیدج",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1297,
    "CountryCode": 1,
    "LName": "Zrinron",
    "Name": "زرین رود",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1338,
    "CountryCode": 1,
    "LName": "KhorramDarreh",
    "Name": "خرمدره",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1357,
    "CountryCode": 1,
    "LName": "Sheet",
    "Name": "شیت",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1366,
    "CountryCode": 1,
    "LName": "Mollabodagh",
    "Name": "ملابداغ",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1367,
    "CountryCode": 1,
    "LName": "Moshampa",
    "Name": "مشمپا",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1383,
    "CountryCode": 1,
    "LName": "Dandi",
    "Name": "دندی",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1436,
    "CountryCode": 1,
    "LName": "Halab",
    "Name": "حلب",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1480,
    "CountryCode": 1,
    "LName": "Zarrin Abad",
    "Name": "زرین آباد",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1597,
    "CountryCode": 1,
    "LName": "Takht",
    "Name": "تخت",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1632,
    "CountryCode": 1,
    "LName": "Pari",
    "Name": "پری",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1643,
    "CountryCode": 1,
    "LName": "Nourbahar",
    "Name": "نورآباد",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1822,
    "CountryCode": 1,
    "LName": "Kabud Cheshmeh",
    "Name": "کبودچشمه",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 2034,
    "CountryCode": 1,
    "LName": "Viyar",
    "Name": "ویر",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 2132,
    "CountryCode": 1,
    "LName": "Yusefabad",
    "Name": "یوسف آباد",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 12,
    "CountryCode": 1,
    "LName": "Zahedan",
    "Name": "زاهدان",
    "ProvinceCode": 16,
    "Type": "S"
  },
  {
    "Code": 519,
    "CountryCode": 1,
    "LName": "Pishin",
    "Name": "پیشین",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 520,
    "CountryCode": 1,
    "LName": "Bampur",
    "Name": "بمپور",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 521,
    "CountryCode": 1,
    "LName": "Davar Panah",
    "Name": "داور پناه",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 522,
    "CountryCode": 1,
    "LName": "Dehak",
    "Name": "دهک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 523,
    "CountryCode": 1,
    "LName": "Saravan",
    "Name": "سراوان",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 524,
    "CountryCode": 1,
    "LName": "Zahak",
    "Name": "زهک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 525,
    "CountryCode": 1,
    "LName": "Bandar Beheshti",
    "Name": "بندر بهشتی",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 526,
    "CountryCode": 1,
    "LName": "Dumak",
    "Name": "دومک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 527,
    "CountryCode": 1,
    "LName": "Esfandak",
    "Name": "اسفندک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 528,
    "CountryCode": 1,
    "LName": "Eskelabad",
    "Name": "اسکل آباد",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 529,
    "CountryCode": 1,
    "LName": "Firuzabad",
    "Name": "فیروز آباد",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 530,
    "CountryCode": 1,
    "LName": "Gavater",
    "Name": "گواتر",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 531,
    "CountryCode": 1,
    "LName": "Girdi",
    "Name": "گیردی",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 532,
    "CountryCode": 1,
    "LName": "Gombaki",
    "Name": "گمباکی",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 533,
    "CountryCode": 1,
    "LName": "Gorg",
    "Name": "گرگ",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 534,
    "CountryCode": 1,
    "LName": "Golchah",
    "Name": "گلچه",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 535,
    "CountryCode": 1,
    "LName": "Gürdim",
    "Name": "گوردین",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 536,
    "CountryCode": 1,
    "LName": "Konarak",
    "Name": "کنارک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 537,
    "CountryCode": 1,
    "LName": "Iranshahr",
    "Name": "ایرانشهر",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 538,
    "CountryCode": 1,
    "LName": "Kahnuj",
    "Name": "کهنوج",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 539,
    "CountryCode": 1,
    "LName": "Jalq",
    "Name": "جالق",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 540,
    "CountryCode": 1,
    "LName": "Kali",
    "Name": "کالی",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 541,
    "CountryCode": 1,
    "LName": "Bandar Jask",
    "Name": "بندر جاسک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 542,
    "CountryCode": 1,
    "LName": "Kalateh-ye Siah",
    "Name": "کلاته سیاه",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 543,
    "CountryCode": 1,
    "LName": "Kandaz",
    "Name": "کندز",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 544,
    "CountryCode": 1,
    "LName": "Khash",
    "Name": "خاش",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 545,
    "CountryCode": 1,
    "LName": "Kheyrabad",
    "Name": "خیرآباد",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 546,
    "CountryCode": 1,
    "LName": "Koshtegan",
    "Name": "کشتگان",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 547,
    "CountryCode": 1,
    "LName": "Ladiz",
    "Name": "لادیز",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 548,
    "CountryCode": 1,
    "LName": "Kushk",
    "Name": "کوشک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 549,
    "CountryCode": 1,
    "LName": "Anjireh",
    "Name": "انجیره",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 550,
    "CountryCode": 1,
    "LName": "Mirabad",
    "Name": "میرآباد",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 551,
    "CountryCode": 1,
    "LName": "Mirjaveh",
    "Name": "میرجاوه",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 552,
    "CountryCode": 1,
    "LName": "Mohammadabad",
    "Name": "محمد آباد",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 553,
    "CountryCode": 1,
    "LName": "Murtan",
    "Name": "مورتان",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 554,
    "CountryCode": 1,
    "LName": "Negür",
    "Name": "نگور",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 555,
    "CountryCode": 1,
    "LName": "Nosratabad",
    "Name": "نصرت آباد",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 556,
    "CountryCode": 1,
    "LName": "Now Bandian",
    "Name": "نو بندیان",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 557,
    "CountryCode": 1,
    "LName": "Bent",
    "Name": "بنت",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 558,
    "CountryCode": 1,
    "LName": "Nikshahr",
    "Name": "نیک شهر",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 559,
    "CountryCode": 1,
    "LName": "Polan",
    "Name": "پلان",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 560,
    "CountryCode": 1,
    "LName": "Fanouj",
    "Name": "فنوج",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 561,
    "CountryCode": 1,
    "LName": "Qal'eh-ye Bid",
    "Name": "قلعه بید",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 562,
    "CountryCode": 1,
    "LName": "Qasr-e-Qand",
    "Name": "قصر قند",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 563,
    "CountryCode": 1,
    "LName": "Sirik",
    "Name": "سیریک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 564,
    "CountryCode": 1,
    "LName": "Remeshk",
    "Name": "رمشک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 565,
    "CountryCode": 1,
    "LName": "Sarbaz",
    "Name": "سرباز",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 566,
    "CountryCode": 1,
    "LName": "Sarshur",
    "Name": "سرشور",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 567,
    "CountryCode": 1,
    "LName": "Bir",
    "Name": "بیر",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 568,
    "CountryCode": 1,
    "LName": "Anbarabad",
    "Name": "عنبرآباد",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 569,
    "CountryCode": 1,
    "LName": "Borj-e Mir Gol",
    "Name": "برج میرگل",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 570,
    "CountryCode": 1,
    "LName": "Zabol",
    "Name": "زابل",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 571,
    "CountryCode": 1,
    "LName": "Gosht",
    "Name": "گشت",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 572,
    "CountryCode": 1,
    "LName": "Zaboli",
    "Name": "زابلی",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 573,
    "CountryCode": 1,
    "LName": "Ziraki",
    "Name": "زیرک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 574,
    "CountryCode": 1,
    "LName": "Chah Bahar",
    "Name": "چاه بهار",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1375,
    "CountryCode": 1,
    "LName": "Koosheh",
    "Name": "کوشه",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1655,
    "CountryCode": 1,
    "LName": "Golmorti",
    "Name": "گلمورتی",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1736,
    "CountryCode": 1,
    "LName": "Chabahar",
    "Name": "چابهار",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1749,
    "CountryCode": 1,
    "LName": "Pasabandar",
    "Name": "پسابندر",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1753,
    "CountryCode": 1,
    "LName": "Bazman",
    "Name": "بزمان",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1786,
    "CountryCode": 1,
    "LName": "Kuhak",
    "Name": "کوهک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1893,
    "CountryCode": 1,
    "LName": "Spakeh",
    "Name": "اسپکه",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1940,
    "CountryCode": 1,
    "LName": "Sirkan",
    "Name": "سیرکان",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2202,
    "CountryCode": 1,
    "LName": "Suran",
    "Name": "سوران",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2448,
    "CountryCode": 1,
    "LName": "Rask",
    "Name": "راسک",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2476,
    "CountryCode": 1,
    "LName": "Bonjar",
    "Name": "بنجار",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2568,
    "CountryCode": 1,
    "LName": "Zarabad",
    "Name": "زرآباد",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2590,
    "CountryCode": 1,
    "LName": "Jakigor",
    "Name": "جکیگور",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2614,
    "CountryCode": 1,
    "LName": "Dalgan",
    "Name": "دلگان",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2870,
    "CountryCode": 1,
    "LName": "Paskuh",
    "Name": "پسکوه",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 3211,
    "CountryCode": 1,
    "LName": "Apak Chushan",
    "Name": "آپک چوشان",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 3240,
    "CountryCode": 1,
    "LName": "Hamoun",
    "Name": "هامون شهر",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 3242,
    "CountryCode": 1,
    "LName": "Dapkor",
    "Name": "دپکور",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 27,
    "CountryCode": 1,
    "LName": "Semnan",
    "Name": "سمنان",
    "ProvinceCode": 17,
    "Type": "S"
  },
  {
    "Code": 231,
    "CountryCode": 1,
    "LName": "Emamzadeh 'Abdollah",
    "Name": "امامزاده عبدالله",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 575,
    "CountryCode": 1,
    "LName": "Damghan",
    "Name": "دامغان",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 576,
    "CountryCode": 1,
    "LName": "Dastjerd",
    "Name": "دستجرد",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 577,
    "CountryCode": 1,
    "LName": "Diz Chah",
    "Name": "دیز چاه",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 578,
    "CountryCode": 1,
    "LName": "Shahroud",
    "Name": "شاهرود",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 579,
    "CountryCode": 1,
    "LName": "Dibaj",
    "Name": "دیباج",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 580,
    "CountryCode": 1,
    "LName": "Eyvanekey",
    "Name": "ایوانکی",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 581,
    "CountryCode": 1,
    "LName": "Forümad",
    "Name": "فرومد",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 582,
    "CountryCode": 1,
    "LName": "Garmsar",
    "Name": "گرمسار",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 583,
    "CountryCode": 1,
    "LName": "Darjazin",
    "Name": "درجزین",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 584,
    "CountryCode": 1,
    "LName": "Aliabad-e Pa'in",
    "Name": "علی آباد پایین",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 585,
    "CountryCode": 1,
    "LName": "Mayamey",
    "Name": "میامی",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 586,
    "CountryCode": 1,
    "LName": "Bastam",
    "Name": "بسطام",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 587,
    "CountryCode": 1,
    "LName": "Mojen",
    "Name": "مجن",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 588,
    "CountryCode": 1,
    "LName": "Nardin",
    "Name": "ناردین",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 589,
    "CountryCode": 1,
    "LName": "Kalatekhij",
    "Name": "کلاته خیج",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 590,
    "CountryCode": 1,
    "LName": "Darjazin",
    "Name": "درجزین",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 591,
    "CountryCode": 1,
    "LName": "Shahmirzad",
    "Name": "شهمیرزاد",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 592,
    "CountryCode": 1,
    "LName": "Satveh",
    "Name": "سطوه",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 593,
    "CountryCode": 1,
    "LName": "Salafchegan",
    "Name": "سلفچگان",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 594,
    "CountryCode": 1,
    "LName": "Shahmirzad",
    "Name": "شهمیرزاد",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 595,
    "CountryCode": 1,
    "LName": "Sorkheh",
    "Name": "سرخه",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 596,
    "CountryCode": 1,
    "LName": "Safa'iyeh",
    "Name": "صفائیه",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 597,
    "CountryCode": 1,
    "LName": "Ahmadabad",
    "Name": "احمد آباد",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 598,
    "CountryCode": 1,
    "LName": "Talebabad",
    "Name": "طالب آباد",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 599,
    "CountryCode": 1,
    "LName": "Turan",
    "Name": "توران",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 600,
    "CountryCode": 1,
    "LName": "Chah-e Jam",
    "Name": "چاه جم",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 796,
    "CountryCode": 1,
    "LName": "Miami",
    "Name": "میامی",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 997,
    "CountryCode": 1,
    "LName": "Mahdi Shahr",
    "Name": "مهدی شهر",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1197,
    "CountryCode": 1,
    "LName": "Aradan",
    "Name": "آرادان",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1344,
    "CountryCode": 1,
    "LName": "Sah",
    "Name": "صح",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1398,
    "CountryCode": 1,
    "LName": "Qaleno-e Kharaqan",
    "Name": "قلعه نو خرقان",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1569,
    "CountryCode": 1,
    "LName": "Bekran",
    "Name": "بکران",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1639,
    "CountryCode": 1,
    "LName": "Baghcheh",
    "Name": "باغچه",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1802,
    "CountryCode": 1,
    "LName": "Lasjerd",
    "Name": "لاسجرد",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1819,
    "CountryCode": 1,
    "LName": "Hossein Abad Kalpush",
    "Name": "حسین آباد کالپوش",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1843,
    "CountryCode": 1,
    "LName": "Meyghan",
    "Name": "میغان",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 2005,
    "CountryCode": 1,
    "LName": "Torud",
    "Name": "طرود",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 2045,
    "CountryCode": 1,
    "LName": "Biyarjomand",
    "Name": "بیارجمند",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 2248,
    "CountryCode": 1,
    "LName": "Su Daghelan",
    "Name": "سوداغلن",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 2854,
    "CountryCode": 1,
    "LName": "Chahartagh",
    "Name": "چهارطاق",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 22,
    "CountryCode": 1,
    "LName": "Sanandaj",
    "Name": "سنندج",
    "ProvinceCode": 18,
    "Type": "S"
  },
  {
    "Code": 254,
    "CountryCode": 1,
    "LName": "Saqqez",
    "Name": "سقّز",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 516,
    "CountryCode": 1,
    "LName": "Jushan",
    "Name": "جوشن",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 601,
    "CountryCode": 1,
    "LName": "Divandarreh",
    "Name": "دیواندره",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 602,
    "CountryCode": 1,
    "LName": "Hasanabad Yasukand",
    "Name": "حسن آباد یاسوگند",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 603,
    "CountryCode": 1,
    "LName": "Mouchesh",
    "Name": "موچش",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 604,
    "CountryCode": 1,
    "LName": "Baneh",
    "Name": "بانه",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 605,
    "CountryCode": 1,
    "LName": "Shahrak Baharan",
    "Name": "شهرک بهاران",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 606,
    "CountryCode": 1,
    "LName": "Sarv abad",
    "Name": "سرو آباد",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 607,
    "CountryCode": 1,
    "LName": "Marivan",
    "Name": "مریوان",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 608,
    "CountryCode": 1,
    "LName": "Bahramabad",
    "Name": "بهرام آباد",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 609,
    "CountryCode": 1,
    "LName": "Palangan",
    "Name": "پلنگان",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 610,
    "CountryCode": 1,
    "LName": "Nodsheh",
    "Name": "نودشه",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 611,
    "CountryCode": 1,
    "LName": "Qorveh",
    "Name": "قروه",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 612,
    "CountryCode": 1,
    "LName": "Saqqez",
    "Name": "سقز",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 613,
    "CountryCode": 1,
    "LName": "Bijar",
    "Name": "بیجار",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 615,
    "CountryCode": 1,
    "LName": "Serishabad",
    "Name": "سریش آباد",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 616,
    "CountryCode": 1,
    "LName": "Salavatabad",
    "Name": "صلوات آباد",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 618,
    "CountryCode": 1,
    "LName": "Baba Hoseyh (Baba Hoseyn)",
    "Name": "بابا حسین",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 619,
    "CountryCode": 1,
    "LName": "Boukan",
    "Name": "بوکان",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1138,
    "CountryCode": 1,
    "LName": "Dehgolan",
    "Name": "دهگلان",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1419,
    "CountryCode": 1,
    "LName": "Bash Qeshlaw",
    "Name": "باشقشلاق",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1420,
    "CountryCode": 1,
    "LName": "Zarrineh Owbatu",
    "Name": "زرینه اوباتو",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1558,
    "CountryCode": 1,
    "LName": "Delbaran",
    "Name": "دلبران",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1598,
    "CountryCode": 1,
    "LName": "Toop Aghaj",
    "Name": "توپ آغاج",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1730,
    "CountryCode": 1,
    "LName": "Sis",
    "Name": "سیس",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1787,
    "CountryCode": 1,
    "LName": "Kamyaran",
    "Name": "کامیاران",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1840,
    "CountryCode": 1,
    "LName": "PirTaj",
    "Name": "پیرتاج",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 2624,
    "CountryCode": 1,
    "LName": "Qamlu",
    "Name": "قاملو",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 3233,
    "CountryCode": 1,
    "LName": "Mozaffar Abad",
    "Name": "مظفرآباد",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 17,
    "CountryCode": 1,
    "LName": "Sari",
    "Name": "ساری",
    "ProvinceCode": 19,
    "Type": "S"
  },
  {
    "Code": 620,
    "CountryCode": 1,
    "LName": "Deraz Kola",
    "Name": "دراز کلا",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 621,
    "CountryCode": 1,
    "LName": "Alamdeh",
    "Name": "علمده",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 622,
    "CountryCode": 1,
    "LName": "Fereydun Kenar",
    "Name": "فریدونکنار",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 623,
    "CountryCode": 1,
    "LName": "Galugah",
    "Name": "گلوگاه",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 628,
    "CountryCode": 1,
    "LName": "Juybar",
    "Name": "جویبار",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 629,
    "CountryCode": 1,
    "LName": "Amol",
    "Name": "آمل",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 632,
    "CountryCode": 1,
    "LName": "Behshahr",
    "Name": "بهشهر",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 635,
    "CountryCode": 1,
    "LName": "Neka",
    "Name": "نکا",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 636,
    "CountryCode": 1,
    "LName": "Nowshahr",
    "Name": "نوشهر",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 637,
    "CountryCode": 1,
    "LName": "Qaemshahr",
    "Name": "قائم شهر",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 638,
    "CountryCode": 1,
    "LName": "Abbasabad",
    "Name": "عباس آباد",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 640,
    "CountryCode": 1,
    "LName": "Si Sangan",
    "Name": "سیسنگان",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 641,
    "CountryCode": 1,
    "LName": "Ask",
    "Name": "اسک",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 642,
    "CountryCode": 1,
    "LName": "Pahdar",
    "Name": "پهدر",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 643,
    "CountryCode": 1,
    "LName": "Tonekabon",
    "Name": "تنکابن",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 645,
    "CountryCode": 1,
    "LName": "Babol",
    "Name": "بابل",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 646,
    "CountryCode": 1,
    "LName": "Babol Sar",
    "Name": "بابلسر",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 647,
    "CountryCode": 1,
    "LName": "Baladeh",
    "Name": "بلده",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 648,
    "CountryCode": 1,
    "LName": "Chalus",
    "Name": "چالوس",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1030,
    "CountryCode": 1,
    "LName": "Kiasar",
    "Name": "کیاسر",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1054,
    "CountryCode": 1,
    "LName": "Khazar Abad",
    "Name": "خزرآباد",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1056,
    "CountryCode": 1,
    "LName": "Marzikola",
    "Name": "مرزیکلا",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1077,
    "CountryCode": 1,
    "LName": "Ramsar",
    "Name": "رامسر",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1092,
    "CountryCode": 1,
    "LName": "Gonab",
    "Name": "گتاب",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1096,
    "CountryCode": 1,
    "LName": "Nur",
    "Name": "نور",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1101,
    "CountryCode": 1,
    "LName": "MahmudAbad",
    "Name": "محمودآباد",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1184,
    "CountryCode": 1,
    "LName": "Sorkh Rood",
    "Name": "سرخ رود",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1221,
    "CountryCode": 1,
    "LName": "Shirgah",
    "Name": "شیرگاه",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1227,
    "CountryCode": 1,
    "LName": "Zirab",
    "Name": "زیراب",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1317,
    "CountryCode": 1,
    "LName": "Ryni",
    "Name": "رینه",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1333,
    "CountryCode": 1,
    "LName": "Zaghmarz",
    "Name": "زاغمرز",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1363,
    "CountryCode": 1,
    "LName": "Malar",
    "Name": "ملار",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1364,
    "CountryCode": 1,
    "LName": "Gaznak",
    "Name": "گزنگ",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1478,
    "CountryCode": 1,
    "LName": "Chamestan",
    "Name": "چمستان",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1502,
    "CountryCode": 1,
    "LName": "Royan",
    "Name": "رویان",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1543,
    "CountryCode": 1,
    "LName": "Surak",
    "Name": "سورک",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1546,
    "CountryCode": 1,
    "LName": "Marzan Abad",
    "Name": "مرزن آباد",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1578,
    "CountryCode": 1,
    "LName": "Eshkevar Mahalleh",
    "Name": "اشکورمحله",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1640,
    "CountryCode": 1,
    "LName": "Khalilshahr",
    "Name": "خلیل شهر",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1657,
    "CountryCode": 1,
    "LName": "Nava",
    "Name": "نوا",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1696,
    "CountryCode": 1,
    "LName": "Zeynevand",
    "Name": "زینوند",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1762,
    "CountryCode": 1,
    "LName": "KelarAbad",
    "Name": "کلار آباد",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1830,
    "CountryCode": 1,
    "LName": "Nanakabrud",
    "Name": "نمک آبرود",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1846,
    "CountryCode": 1,
    "LName": "Rostamkola",
    "Name": "رستمکلا",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1864,
    "CountryCode": 1,
    "LName": "Bahnamir",
    "Name": "بهنمیر",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1930,
    "CountryCode": 1,
    "LName": "Kelardasht",
    "Name": "کلاردشت",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1936,
    "CountryCode": 1,
    "LName": "Katalom",
    "Name": "کتالم",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1967,
    "CountryCode": 1,
    "LName": "Amir Kala",
    "Name": "امیرکلا",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2031,
    "CountryCode": 1,
    "LName": "Asram",
    "Name": "اسرم",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2044,
    "CountryCode": 1,
    "LName": "Salman Shahr",
    "Name": "سلمان شهر",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2128,
    "CountryCode": 1,
    "LName": "Nashta Rud",
    "Name": "نشتارود",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2155,
    "CountryCode": 1,
    "LName": "Kohi Khil",
    "Name": "کوهی خیل",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2298,
    "CountryCode": 1,
    "LName": "Larma",
    "Name": "لارما",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2531,
    "CountryCode": 1,
    "LName": "Shir Kola",
    "Name": "شیرکلا",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2599,
    "CountryCode": 1,
    "LName": "Matan Kola",
    "Name": "متان کلا",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 3046,
    "CountryCode": 1,
    "LName": "Shah Kola",
    "Name": "شاه کلاه",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 8,
    "CountryCode": 1,
    "LName": "Shiraz",
    "Name": "شیراز",
    "ProvinceCode": 20,
    "Type": "S"
  },
  {
    "Code": 614,
    "CountryCode": 1,
    "LName": "Fiduyeh",
    "Name": "فیدویه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 649,
    "CountryCode": 1,
    "LName": "Abadeh",
    "Name": "آباده",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 650,
    "CountryCode": 1,
    "LName": "Darab",
    "Name": "داراب",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 651,
    "CountryCode": 1,
    "LName": "Dasht-e Arzhan",
    "Name": "دشت ارژن",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 652,
    "CountryCode": 1,
    "LName": "Abarqu (Abar Kuh)",
    "Name": "ابرقو",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 653,
    "CountryCode": 1,
    "LName": "Gerash",
    "Name": "گراش",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 654,
    "CountryCode": 1,
    "LName": "Deh Now",
    "Name": "ده نو",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 655,
    "CountryCode": 1,
    "LName": "Didehban",
    "Name": "دیده بان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 656,
    "CountryCode": 1,
    "LName": "Dozgah",
    "Name": "دزگاه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 657,
    "CountryCode": 1,
    "LName": "Eshkanan",
    "Name": "اشکنان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 658,
    "CountryCode": 1,
    "LName": "Estahban",
    "Name": "استهبان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 659,
    "CountryCode": 1,
    "LName": "Farrashband",
    "Name": "فراشبند",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 660,
    "CountryCode": 1,
    "LName": "Fasa",
    "Name": "فسا",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 662,
    "CountryCode": 1,
    "LName": "Ghatruyeh",
    "Name": "قطرویه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 663,
    "CountryCode": 1,
    "LName": "Evez",
    "Name": "اوز",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 664,
    "CountryCode": 1,
    "LName": "Hormoz",
    "Name": "هرمز",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 665,
    "CountryCode": 1,
    "LName": "Hurmeh",
    "Name": "هورمه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 666,
    "CountryCode": 1,
    "LName": "Fal",
    "Name": "فال",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 667,
    "CountryCode": 1,
    "LName": "Jahrom",
    "Name": "جهرم",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 668,
    "CountryCode": 1,
    "LName": "Banaruyeh",
    "Name": "بنارویه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 669,
    "CountryCode": 1,
    "LName": "Kahnuyeh",
    "Name": "کهنویه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 670,
    "CountryCode": 1,
    "LName": "Kushkak",
    "Name": "کوشکک",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 671,
    "CountryCode": 1,
    "LName": "Kazerun",
    "Name": "کازرون",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 672,
    "CountryCode": 1,
    "LName": "Khalili",
    "Name": "خلیلی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 673,
    "CountryCode": 1,
    "LName": "Khatiri",
    "Name": "خطیری",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 674,
    "CountryCode": 1,
    "LName": "Khonj",
    "Name": "خنج",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 675,
    "CountryCode": 1,
    "LName": "Khosrow Shirin",
    "Name": "خسرو شیرین",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 676,
    "CountryCode": 1,
    "LName": "Konar Takhteh",
    "Name": "کنار تخته",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 677,
    "CountryCode": 1,
    "LName": "Lar",
    "Name": "لار",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 678,
    "CountryCode": 1,
    "LName": "Bigherd",
    "Name": "بیغرد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 679,
    "CountryCode": 1,
    "LName": "Marvdasht",
    "Name": "مرودشت",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 680,
    "CountryCode": 1,
    "LName": "Mohr",
    "Name": "مهر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 681,
    "CountryCode": 1,
    "LName": "Morvarid",
    "Name": "مروارید",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 682,
    "CountryCode": 1,
    "LName": "Dabiran",
    "Name": "دبیران",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 683,
    "CountryCode": 1,
    "LName": "Neyriz",
    "Name": "نیریز",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 685,
    "CountryCode": 1,
    "LName": "Hanna",
    "Name": "حنا",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 686,
    "CountryCode": 1,
    "LName": "Beyram",
    "Name": "بیرم",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 687,
    "CountryCode": 1,
    "LName": "Dehouye",
    "Name": "دهویه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 688,
    "CountryCode": 1,
    "LName": "Qotbabad",
    "Name": "قطب آباد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 689,
    "CountryCode": 1,
    "LName": "Fishvar",
    "Name": "فیشور",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 690,
    "CountryCode": 1,
    "LName": "Sarvestan",
    "Name": "سروستان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 691,
    "CountryCode": 1,
    "LName": "Sedeh",
    "Name": "سده",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 692,
    "CountryCode": 1,
    "LName": "Seyfabad",
    "Name": "سیف آباد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 693,
    "CountryCode": 1,
    "LName": "Hajiabad",
    "Name": "حاجی آباد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 694,
    "CountryCode": 1,
    "LName": "Shahabi",
    "Name": "شهابی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 696,
    "CountryCode": 1,
    "LName": "Soghad",
    "Name": "صغاد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 698,
    "CountryCode": 1,
    "LName": "Sivand",
    "Name": "سیاوند",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 699,
    "CountryCode": 1,
    "LName": "shahre pir",
    "Name": "شهر پیر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 700,
    "CountryCode": 1,
    "LName": "Baba Kalan",
    "Name": "بابا کلان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 701,
    "CountryCode": 1,
    "LName": "Beshneh",
    "Name": "بشنه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 721,
    "CountryCode": 1,
    "LName": "Douzeh",
    "Name": "دوزه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 903,
    "CountryCode": 1,
    "LName": "Dehkuye",
    "Name": "دهکویه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 971,
    "CountryCode": 1,
    "LName": "NURABAD",
    "Name": "نورآباد ممسنی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 974,
    "CountryCode": 1,
    "LName": "lamard",
    "Name": "لامرد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 994,
    "CountryCode": 1,
    "LName": "Ahel",
    "Name": "اهل",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 995,
    "CountryCode": 1,
    "LName": "eqlid",
    "Name": "اقلید",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1006,
    "CountryCode": 1,
    "LName": "Varavi",
    "Name": "وراوی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1017,
    "CountryCode": 1,
    "LName": "Qaemyeh",
    "Name": "قائمیه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1048,
    "CountryCode": 1,
    "LName": "Arsenjan",
    "Name": "ارسنجان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1068,
    "CountryCode": 1,
    "LName": "Fadeshkoyeh",
    "Name": "فدشکویه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1081,
    "CountryCode": 1,
    "LName": "Khavaran",
    "Name": "خاوران",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1120,
    "CountryCode": 1,
    "LName": "Rostagh",
    "Name": "رستاق",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1121,
    "CountryCode": 1,
    "LName": "Mobarak Abad",
    "Name": "مبارک آباد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1125,
    "CountryCode": 1,
    "LName": "Sadra",
    "Name": "صدرا",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1127,
    "CountryCode": 1,
    "LName": "Shosani va Zameni",
    "Name": "شوسنی و ضامنی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1128,
    "CountryCode": 1,
    "LName": "Masiri",
    "Name": "مصیری",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1144,
    "CountryCode": 1,
    "LName": "Firuzabad",
    "Name": "فیروزآباد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1172,
    "CountryCode": 1,
    "LName": "Kavar",
    "Name": "کوار",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1196,
    "CountryCode": 1,
    "LName": "Izadkhast",
    "Name": "ایزدخواست",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1206,
    "CountryCode": 1,
    "LName": "Vala Shahr",
    "Name": "والا شهر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1208,
    "CountryCode": 1,
    "LName": "Roniz Olya",
    "Name": "رونیز علیا",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1214,
    "CountryCode": 1,
    "LName": "Bahman",
    "Name": "بهمن",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1230,
    "CountryCode": 1,
    "LName": "Abadeh Tashk",
    "Name": "آباده طشک",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1232,
    "CountryCode": 1,
    "LName": "Paghalat",
    "Name": "پاقلات",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1233,
    "CountryCode": 1,
    "LName": "Shahid abad",
    "Name": "شهیدآباد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1254,
    "CountryCode": 1,
    "LName": "Safashahr",
    "Name": "صفاشهر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1257,
    "CountryCode": 1,
    "LName": "Bavanat",
    "Name": "بوانات",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1271,
    "CountryCode": 1,
    "LName": "Khesht",
    "Name": "خشت",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1279,
    "CountryCode": 1,
    "LName": "Zarqan",
    "Name": "زرقان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1296,
    "CountryCode": 1,
    "LName": "Sepidan",
    "Name": "سپیدان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1315,
    "CountryCode": 1,
    "LName": "Asir",
    "Name": "اسیر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1320,
    "CountryCode": 1,
    "LName": "Kopen",
    "Name": "کوپن",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1327,
    "CountryCode": 1,
    "LName": "Ghir",
    "Name": "قیر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1351,
    "CountryCode": 1,
    "LName": "Alamdan",
    "Name": "علمدان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1362,
    "CountryCode": 1,
    "LName": "Mahallecheh",
    "Name": "محلچه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1393,
    "CountryCode": 1,
    "LName": "Latifi",
    "Name": "لطیفی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1396,
    "CountryCode": 1,
    "LName": "Berak",
    "Name": "براک",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1409,
    "CountryCode": 1,
    "LName": "Sofla",
    "Name": "سفلی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1414,
    "CountryCode": 1,
    "LName": "Baba Meydan",
    "Name": "بابامیدان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1418,
    "CountryCode": 1,
    "LName": "Soltan Shahr",
    "Name": "سلطان شهر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1421,
    "CountryCode": 1,
    "LName": "Sharak Bane-Kalaghi",
    "Name": "شهرک بنه کلاغی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1428,
    "CountryCode": 1,
    "LName": "Jareh",
    "Name": "جره",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1455,
    "CountryCode": 1,
    "LName": "Bab-e Anar",
    "Name": "باب‌انار",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1475,
    "CountryCode": 1,
    "LName": "Fahlyan",
    "Name": "فهلیان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1499,
    "CountryCode": 1,
    "LName": "Khoome Zar",
    "Name": "خومه زار",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1506,
    "CountryCode": 1,
    "LName": "Khour",
    "Name": "خور",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1508,
    "CountryCode": 1,
    "LName": "Nowjen",
    "Name": "نوجین",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1522,
    "CountryCode": 1,
    "LName": "Jannat shahr",
    "Name": "جنت شهر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1523,
    "CountryCode": 1,
    "LName": "Dehram",
    "Name": "دهرم",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1526,
    "CountryCode": 1,
    "LName": "Daralmizan",
    "Name": "دارالمیزان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1532,
    "CountryCode": 1,
    "LName": "Beyza",
    "Name": "بیضا",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1565,
    "CountryCode": 1,
    "LName": "Karzin",
    "Name": "کارزین",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1600,
    "CountryCode": 1,
    "LName": "Alamarvdasht",
    "Name": "علامرودشت",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1601,
    "CountryCode": 1,
    "LName": "Maymand",
    "Name": "میمند",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1608,
    "CountryCode": 1,
    "LName": "Miyanshahr",
    "Name": "میانشهر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1613,
    "CountryCode": 1,
    "LName": "Fedagh",
    "Name": "فداغ",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1649,
    "CountryCode": 1,
    "LName": "Kharameh",
    "Name": "خرامه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1651,
    "CountryCode": 1,
    "LName": "Tujerdi",
    "Name": "توجردی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1671,
    "CountryCode": 1,
    "LName": "Defish",
    "Name": "دهفیش",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1684,
    "CountryCode": 1,
    "LName": "Eij",
    "Name": "ایج",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1701,
    "CountryCode": 1,
    "LName": "Korehi",
    "Name": "کره ای",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1775,
    "CountryCode": 1,
    "LName": "Ghadaman",
    "Name": "قدمان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1780,
    "CountryCode": 1,
    "LName": "Galledar",
    "Name": "گله دار",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1825,
    "CountryCode": 1,
    "LName": "Sharafuyeh",
    "Name": "شهرفویه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1826,
    "CountryCode": 1,
    "LName": "Nobandegan",
    "Name": "نوبندگان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1841,
    "CountryCode": 1,
    "LName": "Gharebalagh",
    "Name": "قره بلاغ",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1849,
    "CountryCode": 1,
    "LName": "Juyom",
    "Name": "جویم",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1868,
    "CountryCode": 1,
    "LName": "Baladeh",
    "Name": "بالاده",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1883,
    "CountryCode": 1,
    "LName": "Dordaneh",
    "Name": "دردانه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1884,
    "CountryCode": 1,
    "LName": "Nowdan",
    "Name": "نودان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1886,
    "CountryCode": 1,
    "LName": "Beriz",
    "Name": "بریز",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1891,
    "CountryCode": 1,
    "LName": "Arad",
    "Name": "ارد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1895,
    "CountryCode": 1,
    "LName": "Khoozi",
    "Name": "خوزی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1899,
    "CountryCode": 1,
    "LName": "Saadat Shahr",
    "Name": "سعادت شهر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1913,
    "CountryCode": 1,
    "LName": "Doborji",
    "Name": "دوبرجی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1917,
    "CountryCode": 1,
    "LName": "Shah Geyb",
    "Name": "شاه غیب",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1954,
    "CountryCode": 1,
    "LName": "Aviz",
    "Name": "آویز",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1962,
    "CountryCode": 1,
    "LName": "Heraj",
    "Name": "هرج",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2000,
    "CountryCode": 1,
    "LName": "Baba Monir",
    "Name": "بابامنیر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2006,
    "CountryCode": 1,
    "LName": "Gelkuyeh",
    "Name": "گلکویه",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2051,
    "CountryCode": 1,
    "LName": "Ehsham",
    "Name": "احشام",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2098,
    "CountryCode": 1,
    "LName": "Savare Gheyb",
    "Name": "سوارغیب",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2163,
    "CountryCode": 1,
    "LName": "Emam Shahr",
    "Name": "امام شهر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2178,
    "CountryCode": 1,
    "LName": "Lapouyee",
    "Name": "لپویی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2214,
    "CountryCode": 1,
    "LName": "Paskoohak",
    "Name": "پس کوهک",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2370,
    "CountryCode": 1,
    "LName": "Feshan",
    "Name": "فشان",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2417,
    "CountryCode": 1,
    "LName": "Chahnahr",
    "Name": "چاه نهر",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2439,
    "CountryCode": 1,
    "LName": "Darreh Shur",
    "Name": "دره شور",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2463,
    "CountryCode": 1,
    "LName": "Sigar",
    "Name": "سیگار",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2507,
    "CountryCode": 1,
    "LName": "Hesami",
    "Name": "حسامی",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2702,
    "CountryCode": 1,
    "LName": "Khaldeh",
    "Name": "خالده",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2828,
    "CountryCode": 1,
    "LName": "AkbarAbad",
    "Name": "اکبرآباد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2882,
    "CountryCode": 1,
    "LName": "Surmaq",
    "Name": "سورمق",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3078,
    "CountryCode": 1,
    "LName": "Qaderabad",
    "Name": "قادرآباد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3114,
    "CountryCode": 1,
    "LName": "Doroudzan",
    "Name": "درودزن",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3115,
    "CountryCode": 1,
    "LName": "Roudbal",
    "Name": "رودبال",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3160,
    "CountryCode": 1,
    "LName": "Deris",
    "Name": "دریس",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3167,
    "CountryCode": 1,
    "LName": "Rokn Abad",
    "Name": "رکن آباد",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3222,
    "CountryCode": 1,
    "LName": "Shiraz-Ghozat",
    "Name": "شیراز-قضات",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 10,
    "CountryCode": 1,
    "LName": "Qazvin",
    "Name": "قزوین",
    "ProvinceCode": 21,
    "Type": "S"
  },
  {
    "Code": 500,
    "CountryCode": 1,
    "LName": "Abyek",
    "Name": "آبیک",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 506,
    "CountryCode": 1,
    "LName": "Kallaj",
    "Name": "کلج",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 509,
    "CountryCode": 1,
    "LName": "ZiaAbad",
    "Name": "ضیاءآباد",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 513,
    "CountryCode": 1,
    "LName": "Takestan",
    "Name": "تاکستان",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 514,
    "CountryCode": 1,
    "LName": "Ab-e Garm",
    "Name": "آبگرم",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 515,
    "CountryCode": 1,
    "LName": "Avaj",
    "Name": "آوج",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1019,
    "CountryCode": 1,
    "LName": "Buin Zahra",
    "Name": "بوئین زهرا",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1060,
    "CountryCode": 1,
    "LName": "Shotorak",
    "Name": "شترک",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1118,
    "CountryCode": 1,
    "LName": "Khoramdasht",
    "Name": "خرمدشت",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1237,
    "CountryCode": 1,
    "LName": "Alvand",
    "Name": "الوند",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1261,
    "CountryCode": 1,
    "LName": "Sirdan",
    "Name": "سیردان",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1310,
    "CountryCode": 1,
    "LName": "Siahpoush",
    "Name": "سیاهپوش",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1332,
    "CountryCode": 1,
    "LName": "Shal",
    "Name": "شال",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1388,
    "CountryCode": 1,
    "LName": "Keneshkin",
    "Name": "کنشکین",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1474,
    "CountryCode": 1,
    "LName": "Razjerd",
    "Name": "رزجرد",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1658,
    "CountryCode": 1,
    "LName": "Ziaran",
    "Name": "زیاران",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1662,
    "CountryCode": 1,
    "LName": "danesfehan",
    "Name": "دانسفهان",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1667,
    "CountryCode": 1,
    "LName": "Esfarvaren",
    "Name": "اسفرورین",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1706,
    "CountryCode": 1,
    "LName": "Gheshlagh",
    "Name": "قشلاق",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1721,
    "CountryCode": 1,
    "LName": "Tarje",
    "Name": "نرجه",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1757,
    "CountryCode": 1,
    "LName": "Mohammadieh",
    "Name": "محمدیه",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1778,
    "CountryCode": 1,
    "LName": "Bidestan",
    "Name": "بیدستان",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1911,
    "CountryCode": 1,
    "LName": "Khoznin",
    "Name": "خوزنین",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1993,
    "CountryCode": 1,
    "LName": "Sharif Abad",
    "Name": "شریف آباد",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 2047,
    "CountryCode": 1,
    "LName": "Kouhin",
    "Name": "کوهین",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 2225,
    "CountryCode": 1,
    "LName": "Mehregan",
    "Name": "مهرگان",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 2411,
    "CountryCode": 1,
    "LName": "Khakali",
    "Name": "خاکعلی",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 2813,
    "CountryCode": 1,
    "LName": "Hesar Kharvan",
    "Name": "حصار خروان",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 3251,
    "CountryCode": 1,
    "LName": "Saggez Abad",
    "Name": "سگزآباد",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 11,
    "CountryCode": 1,
    "LName": "Qom",
    "Name": "قم",
    "ProvinceCode": 22,
    "Type": "S"
  },
  {
    "Code": 702,
    "CountryCode": 1,
    "LName": "kahak",
    "Name": "کهک",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 703,
    "CountryCode": 1,
    "LName": "jamkaran",
    "Name": "جمکران",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 1273,
    "CountryCode": 1,
    "LName": "Qomrud",
    "Name": "قمرود",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 1434,
    "CountryCode": 1,
    "LName": "Pardisan",
    "Name": "پردیسان",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 1560,
    "CountryCode": 1,
    "LName": "Tayqan",
    "Name": "طایقان",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 1789,
    "CountryCode": 1,
    "LName": "Qanavat",
    "Name": "قنوات",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 1799,
    "CountryCode": 1,
    "LName": "Salafchegan",
    "Name": "سلفچگان",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 2093,
    "CountryCode": 1,
    "LName": "Alvirabad",
    "Name": "الویرآباد",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 3162,
    "CountryCode": 1,
    "LName": "Shokuhiyeh",
    "Name": "شکوهیه",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 19,
    "CountryCode": 1,
    "LName": "Kerman",
    "Name": "کرمان",
    "ProvinceCode": 23,
    "Type": "S"
  },
  {
    "Code": 706,
    "CountryCode": 1,
    "LName": "Bam",
    "Name": "بم",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 707,
    "CountryCode": 1,
    "LName": "Deh-e Tazian",
    "Name": "ده تازیان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 708,
    "CountryCode": 1,
    "LName": "Dehaj",
    "Name": "دهاج",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 709,
    "CountryCode": 1,
    "LName": "Fahraj",
    "Name": "فهرج",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 710,
    "CountryCode": 1,
    "LName": "Bandar-e Delfard",
    "Name": "بندر دلفرد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 711,
    "CountryCode": 1,
    "LName": "Kashkouye",
    "Name": "کشکویه",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 712,
    "CountryCode": 1,
    "LName": "Joupar",
    "Name": "جوپار",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 713,
    "CountryCode": 1,
    "LName": "Aliabad",
    "Name": "علی آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 714,
    "CountryCode": 1,
    "LName": "Hoseynabad",
    "Name": "حسین آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 715,
    "CountryCode": 1,
    "LName": "Hoseynabad-e Bala",
    "Name": "حسین آباد بالا",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 716,
    "CountryCode": 1,
    "LName": "Allahabad",
    "Name": "الله آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 717,
    "CountryCode": 1,
    "LName": "Jiroft",
    "Name": "جیرفت",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 718,
    "CountryCode": 1,
    "LName": "Bardsir",
    "Name": "بردسیر",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 719,
    "CountryCode": 1,
    "LName": "Anar",
    "Name": "انار",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 720,
    "CountryCode": 1,
    "LName": "Kam Sefid",
    "Name": "کم سفید",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 723,
    "CountryCode": 1,
    "LName": "Koruk",
    "Name": "کروک",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 724,
    "CountryCode": 1,
    "LName": "Kouhbonan",
    "Name": "کوهبنان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 725,
    "CountryCode": 1,
    "LName": "Mahan",
    "Name": "ماهان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 726,
    "CountryCode": 1,
    "LName": "Nodej",
    "Name": "نودژ",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 727,
    "CountryCode": 1,
    "LName": "Malekabad",
    "Name": "ملک آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 728,
    "CountryCode": 1,
    "LName": "Bayaz",
    "Name": "بیاض",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 729,
    "CountryCode": 1,
    "LName": "Manzelabad",
    "Name": "منزل آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 730,
    "CountryCode": 1,
    "LName": "Mohammadabad-e Pa'in",
    "Name": "محمد آباد پایین",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 731,
    "CountryCode": 1,
    "LName": "Anbarabad",
    "Name": "عنبر آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 732,
    "CountryCode": 1,
    "LName": "Nagur",
    "Name": "نگور",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 733,
    "CountryCode": 1,
    "LName": "Abdollahabad",
    "Name": "عبدل آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 734,
    "CountryCode": 1,
    "LName": "Haji abad",
    "Name": "حاجی آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 735,
    "CountryCode": 1,
    "LName": "Qal'eh-ye 'Askar",
    "Name": "قلعه عسکر",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 736,
    "CountryCode": 1,
    "LName": "Kohnuj",
    "Name": "کهنوج",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 737,
    "CountryCode": 1,
    "LName": "Mardehak",
    "Name": "مردهک",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 738,
    "CountryCode": 1,
    "LName": "Rafsanjan",
    "Name": "رفسنجان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 739,
    "CountryCode": 1,
    "LName": "Ravar",
    "Name": "راور",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 740,
    "CountryCode": 1,
    "LName": "Shahabad",
    "Name": "شاه آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 741,
    "CountryCode": 1,
    "LName": "Shahdab",
    "Name": "شهداب",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 742,
    "CountryCode": 1,
    "LName": "Bajgan",
    "Name": "باجگان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 743,
    "CountryCode": 1,
    "LName": "Shahr-e Babak",
    "Name": "شهر بابک",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 744,
    "CountryCode": 1,
    "LName": "Shur-e Gaz",
    "Name": "شور گز",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 745,
    "CountryCode": 1,
    "LName": "Sirch",
    "Name": "سیرچ",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 746,
    "CountryCode": 1,
    "LName": "Sirjan",
    "Name": "سیرجان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 747,
    "CountryCode": 1,
    "LName": "Dehbarez",
    "Name": "دهبارز",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 748,
    "CountryCode": 1,
    "LName": "Borj",
    "Name": "برج",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 749,
    "CountryCode": 1,
    "LName": "Salehabad",
    "Name": "صالح آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 750,
    "CountryCode": 1,
    "LName": "Tahrud",
    "Name": "تهرود",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 751,
    "CountryCode": 1,
    "LName": "Toghr ol Jerd",
    "Name": "طغرل جرد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 752,
    "CountryCode": 1,
    "LName": "Vahhabi",
    "Name": "وهابی",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 753,
    "CountryCode": 1,
    "LName": "Zarand",
    "Name": "زرند",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 754,
    "CountryCode": 1,
    "LName": "Zeydabad",
    "Name": "زید آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 755,
    "CountryCode": 1,
    "LName": "Zeh Kalat",
    "Name": "زه کلات",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 756,
    "CountryCode": 1,
    "LName": "Zeynalabad",
    "Name": "زینل آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 757,
    "CountryCode": 1,
    "LName": "Ziaratgah-e Shah Cheragh",
    "Name": "شاهچراغ",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 758,
    "CountryCode": 1,
    "LName": "Azizabad",
    "Name": "عزیز آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 759,
    "CountryCode": 1,
    "LName": "Baft",
    "Name": "بافت",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 760,
    "CountryCode": 1,
    "LName": "Baghin",
    "Name": "باغین",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 761,
    "CountryCode": 1,
    "LName": "Chatrud",
    "Name": "چترود",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 762,
    "CountryCode": 1,
    "LName": "Mes-e-sarcheshme",
    "Name": "شهرک مس سرچشمه",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 884,
    "CountryCode": 1,
    "LName": "Basab",
    "Name": "بساب",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1039,
    "CountryCode": 1,
    "LName": "Narmashir",
    "Name": "نرماشیر",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1047,
    "CountryCode": 1,
    "LName": "Nezamshahr Narmashir",
    "Name": "نظام شهر نرماشیر",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1136,
    "CountryCode": 1,
    "LName": "Sarchashme",
    "Name": "سرچشمه",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1137,
    "CountryCode": 1,
    "LName": "Chatroud",
    "Name": "چترود",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1177,
    "CountryCode": 1,
    "LName": "Manoojan",
    "Name": "منوجان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1181,
    "CountryCode": 1,
    "LName": "Qanatghestan",
    "Name": "قناتغستان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1198,
    "CountryCode": 1,
    "LName": "Faryab",
    "Name": "فاریاب",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1236,
    "CountryCode": 1,
    "LName": "Bahraman",
    "Name": "بهرمان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1328,
    "CountryCode": 1,
    "LName": "Orzueeyeh",
    "Name": "ارزوئیه",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1402,
    "CountryCode": 1,
    "LName": "Kabootarkhan",
    "Name": "کبوترخان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1425,
    "CountryCode": 1,
    "LName": "Tejdano",
    "Name": "تجدانو",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1473,
    "CountryCode": 1,
    "LName": "Golbaf",
    "Name": "گلباف",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1521,
    "CountryCode": 1,
    "LName": "Rayen",
    "Name": "راین",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1527,
    "CountryCode": 1,
    "LName": "Rabour",
    "Name": "رابر",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1536,
    "CountryCode": 1,
    "LName": "Chah dadkhoda",
    "Name": "چاه دادخدا",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1539,
    "CountryCode": 1,
    "LName": "Pariz",
    "Name": "پاریز",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1567,
    "CountryCode": 1,
    "LName": "Golzar",
    "Name": "گلزار",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1571,
    "CountryCode": 1,
    "LName": "Gonbaki",
    "Name": "گنبکی",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1589,
    "CountryCode": 1,
    "LName": "Ghalehganj",
    "Name": "قلعه گنج",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1595,
    "CountryCode": 1,
    "LName": "Naseriye",
    "Name": "ناصریه",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1815,
    "CountryCode": 1,
    "LName": "Mohammadabad-e Rigan",
    "Name": "محمدآباد ریگان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1856,
    "CountryCode": 1,
    "LName": "Khatunabad",
    "Name": "خاتون آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1935,
    "CountryCode": 1,
    "LName": "Abbasabad-e Sardar",
    "Name": "عباس آباد سردار",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1953,
    "CountryCode": 1,
    "LName": "Negar",
    "Name": "نگار",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1989,
    "CountryCode": 1,
    "LName": "Riseh",
    "Name": "ریسه",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2015,
    "CountryCode": 1,
    "LName": "Roudbar",
    "Name": "رودبار",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2021,
    "CountryCode": 1,
    "LName": "Shahdad",
    "Name": "شهداد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2075,
    "CountryCode": 1,
    "LName": "Jebalbarez",
    "Name": "جبالبارز",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2401,
    "CountryCode": 1,
    "LName": "Javadiye - Elahiye",
    "Name": "جوادیه - الهیه",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2830,
    "CountryCode": 1,
    "LName": "Hanza",
    "Name": "هنزا",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2905,
    "CountryCode": 1,
    "LName": "Khanook",
    "Name": "خانوک",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2906,
    "CountryCode": 1,
    "LName": "Reyhanshahr",
    "Name": "ریحانشهر",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2907,
    "CountryCode": 1,
    "LName": "Yazdan Shahr",
    "Name": "یزدان شهر",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2908,
    "CountryCode": 1,
    "LName": "Dasht-e Khak",
    "Name": "دشتخاک",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2909,
    "CountryCode": 1,
    "LName": "Sarbanan",
    "Name": "سربنان",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2910,
    "CountryCode": 1,
    "LName": "Hotkan",
    "Name": "حتکن",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2911,
    "CountryCode": 1,
    "LName": "Jorjafk",
    "Name": "جرجافک",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2912,
    "CountryCode": 1,
    "LName": "Siriz",
    "Name": "سیریز",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2913,
    "CountryCode": 1,
    "LName": "MohammadAbad",
    "Name": "محمدآباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2914,
    "CountryCode": 1,
    "LName": "MotaharAbad",
    "Name": "مطهرآباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2919,
    "CountryCode": 1,
    "LName": "Shabjereh",
    "Name": "شعبجره",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2920,
    "CountryCode": 1,
    "LName": "Dahoiyeh",
    "Name": "داهوئیه",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2922,
    "CountryCode": 1,
    "LName": "Seyed Abad",
    "Name": "سید آباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2959,
    "CountryCode": 1,
    "LName": "Gazok",
    "Name": "گزک",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 3110,
    "CountryCode": 1,
    "LName": "Dehbakri",
    "Name": "دهبکری",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 3165,
    "CountryCode": 1,
    "LName": "Akhtiyar Abad",
    "Name": "اختیارآباد",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 21,
    "CountryCode": 1,
    "LName": "Kermanshah",
    "Name": "کرمانشاه",
    "ProvinceCode": 24,
    "Type": "S"
  },
  {
    "Code": 246,
    "CountryCode": 1,
    "LName": "Bisotun",
    "Name": "بیستون",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 639,
    "CountryCode": 1,
    "LName": "Gravand",
    "Name": "گراوند",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 697,
    "CountryCode": 1,
    "LName": "Zelan",
    "Name": "زلان",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 763,
    "CountryCode": 1,
    "LName": "Gilan-e Gharb",
    "Name": "گیلانغرب",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 764,
    "CountryCode": 1,
    "LName": "Harsin",
    "Name": "هرسین",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 765,
    "CountryCode": 1,
    "LName": "Naft Shahr",
    "Name": "نفت شهر",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 766,
    "CountryCode": 1,
    "LName": "Nowdesheh",
    "Name": "نودشیه",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 767,
    "CountryCode": 1,
    "LName": "Paveh",
    "Name": "پاوه",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 768,
    "CountryCode": 1,
    "LName": "Bezmir abad",
    "Name": "بزمیر آباد",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 769,
    "CountryCode": 1,
    "LName": "Pol-e Zahab",
    "Name": "سرپل ذهاب",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 770,
    "CountryCode": 1,
    "LName": "Qasr-e Shirin",
    "Name": "قصر شیرین",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 771,
    "CountryCode": 1,
    "LName": "Sarab-e Harasm",
    "Name": "سراب هرسم",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 772,
    "CountryCode": 1,
    "LName": "Sonqor",
    "Name": "سنقر",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 773,
    "CountryCode": 1,
    "LName": "Sahneh",
    "Name": "صحنه",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 850,
    "CountryCode": 1,
    "LName": "Kangavar",
    "Name": "کنگاور",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1134,
    "CountryCode": 1,
    "LName": "Eslamabad Gharb",
    "Name": "اسلام آباد غرب",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1220,
    "CountryCode": 1,
    "LName": "Javanrud",
    "Name": "جوانرود",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1330,
    "CountryCode": 1,
    "LName": "Kerend Gharb",
    "Name": "کرند غرب",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1352,
    "CountryCode": 1,
    "LName": "Ravansar",
    "Name": "روانسر",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1356,
    "CountryCode": 1,
    "LName": "Biston",
    "Name": "بیستون",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1399,
    "CountryCode": 1,
    "LName": "Tazeh Abad",
    "Name": "تازه آباد",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1519,
    "CountryCode": 1,
    "LName": "Banavri",
    "Name": "بانه وره",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1534,
    "CountryCode": 1,
    "LName": "Payangan",
    "Name": "باینگان",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1634,
    "CountryCode": 1,
    "LName": "Sarmast",
    "Name": "سرمست",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1683,
    "CountryCode": 1,
    "LName": "Homayl",
    "Name": "حمیل",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1697,
    "CountryCode": 1,
    "LName": "Vra",
    "Name": "روستای ورا",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1709,
    "CountryCode": 1,
    "LName": "Gahvareh",
    "Name": "گهواره",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1795,
    "CountryCode": 1,
    "LName": "Soomar",
    "Name": "سومار",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1986,
    "CountryCode": 1,
    "LName": "Baskeleh-ye Boruvim",
    "Name": "باسکله بورویم",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 2007,
    "CountryCode": 1,
    "LName": "Mahidasht",
    "Name": "ماهیدشت",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 18,
    "CountryCode": 1,
    "LName": "Gorgan",
    "Name": "گرگان",
    "ProvinceCode": 25,
    "Type": "S"
  },
  {
    "Code": 624,
    "CountryCode": 1,
    "LName": "Gonbad Kavus",
    "Name": "گنبد کاووس",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 625,
    "CountryCode": 1,
    "LName": "Bandar Gaz",
    "Name": "بندرگز",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 626,
    "CountryCode": 1,
    "LName": "Badraghmolla",
    "Name": "بدراق ملا",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 627,
    "CountryCode": 1,
    "LName": "Bandar-e Torkeman",
    "Name": "بندر ترکمن",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 630,
    "CountryCode": 1,
    "LName": "Kenar Darya",
    "Name": "کنار دریا",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 631,
    "CountryCode": 1,
    "LName": "Kord Kuy",
    "Name": "کرد کوی",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 633,
    "CountryCode": 1,
    "LName": "Minudasht",
    "Name": "مینودشت",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 634,
    "CountryCode": 1,
    "LName": "Tengli",
    "Name": "تنگلی",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 644,
    "CountryCode": 1,
    "LName": "Azadshahr",
    "Name": "آزادشهر",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 684,
    "CountryCode": 1,
    "LName": "Siminshahr",
    "Name": "سیمین شهر",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1023,
    "CountryCode": 1,
    "LName": "Gomishan",
    "Name": "گمیشان",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1046,
    "CountryCode": 1,
    "LName": "Kalaleh",
    "Name": "کلاله",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1084,
    "CountryCode": 1,
    "LName": "Ramian",
    "Name": "رامیان",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1095,
    "CountryCode": 1,
    "LName": "Khanbebin",
    "Name": "خان ببین",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1110,
    "CountryCode": 1,
    "LName": "Kumus Depe",
    "Name": "کمیش دپه",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1143,
    "CountryCode": 1,
    "LName": "Aliabad Katul",
    "Name": "علی آباد کتول",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1158,
    "CountryCode": 1,
    "LName": "ّazel َbad",
    "Name": "فاضل آباد",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1161,
    "CountryCode": 1,
    "LName": "Daland",
    "Name": "دلند",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1167,
    "CountryCode": 1,
    "LName": "Tarseh",
    "Name": "نرسه",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1190,
    "CountryCode": 1,
    "LName": "Galikesh",
    "Name": "گالیکش",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1219,
    "CountryCode": 1,
    "LName": "Kordkoy",
    "Name": "کردکوی",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1250,
    "CountryCode": 1,
    "LName": "Aq qale",
    "Name": "آق قلا",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1288,
    "CountryCode": 1,
    "LName": "Maraveh tappeh",
    "Name": "مراوه تپه",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1423,
    "CountryCode": 1,
    "LName": "Nowdeh Khanduz",
    "Name": "نوده خاندوز",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1547,
    "CountryCode": 1,
    "LName": "Yanqaq",
    "Name": "ینقاق",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1633,
    "CountryCode": 1,
    "LName": "Jelin",
    "Name": "جلین",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1698,
    "CountryCode": 1,
    "LName": "Anbaralum",
    "Name": "انبارالوم",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1981,
    "CountryCode": 1,
    "LName": "Dozein",
    "Name": "دوزین",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 2023,
    "CountryCode": 1,
    "LName": "Hakim Abad",
    "Name": "حکیم آباد",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 2169,
    "CountryCode": 1,
    "LName": "Nowkandeh",
    "Name": "نوکنده",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 13,
    "CountryCode": 1,
    "LName": "Mashhad",
    "Name": "مشهد",
    "ProvinceCode": 26,
    "Type": "S"
  },
  {
    "Code": 470,
    "CountryCode": 1,
    "LName": "Shandiz",
    "Name": "شاندیز",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 774,
    "CountryCode": 1,
    "LName": "Dar Rud",
    "Name": "دار رود",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 778,
    "CountryCode": 1,
    "LName": "Doruneh",
    "Name": "درونه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 780,
    "CountryCode": 1,
    "LName": "Emam Taqi",
    "Name": "امام تقی",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 781,
    "CountryCode": 1,
    "LName": "Fariman",
    "Name": "فریمان",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 783,
    "CountryCode": 1,
    "LName": "Ferdows",
    "Name": "فردوس",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 785,
    "CountryCode": 1,
    "LName": "Feyzabad",
    "Name": "فیض آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 791,
    "CountryCode": 1,
    "LName": "Gisur",
    "Name": "گیسور",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 792,
    "CountryCode": 1,
    "LName": "Hammam Qal'eh",
    "Name": "حمام قلعه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 794,
    "CountryCode": 1,
    "LName": "Homa'i",
    "Name": "همایی",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 795,
    "CountryCode": 1,
    "LName": "Kachalanlu",
    "Name": "کچلانلو",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 798,
    "CountryCode": 1,
    "LName": "Kariz",
    "Name": "کاریز",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 799,
    "CountryCode": 1,
    "LName": "Khakestar",
    "Name": "خاکستر",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 802,
    "CountryCode": 1,
    "LName": "Khvaf",
    "Name": "خواف",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 805,
    "CountryCode": 1,
    "LName": "Bardeskan",
    "Name": "بردسکن",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 807,
    "CountryCode": 1,
    "LName": "Toos",
    "Name": "توس",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 809,
    "CountryCode": 1,
    "LName": "Mohammadabad",
    "Name": "محمد آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 810,
    "CountryCode": 1,
    "LName": "Nashtifan",
    "Name": "نشتیفان",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 812,
    "CountryCode": 1,
    "LName": "Saleh Abad",
    "Name": "صالح آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 815,
    "CountryCode": 1,
    "LName": "Neyshabur (Nishapur)",
    "Name": "نیشابور",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 819,
    "CountryCode": 1,
    "LName": "Quchan",
    "Name": "قوچان",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 820,
    "CountryCode": 1,
    "LName": "Sa'd od Din",
    "Name": "سعدالدین",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 821,
    "CountryCode": 1,
    "LName": "Roshkhvar",
    "Name": "رشتخوار",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 822,
    "CountryCode": 1,
    "LName": "Sabzevar",
    "Name": "سبزوار",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 823,
    "CountryCode": 1,
    "LName": "Sangan",
    "Name": "سنگان",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 824,
    "CountryCode": 1,
    "LName": "Sarakhs",
    "Name": "سرخس",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 825,
    "CountryCode": 1,
    "LName": "Sardaq",
    "Name": "سرداغ",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 826,
    "CountryCode": 1,
    "LName": "Asadabad",
    "Name": "اسد آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 829,
    "CountryCode": 1,
    "LName": "Boshruyeh",
    "Name": "بشرویه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 830,
    "CountryCode": 1,
    "LName": "Ghalandar Abad",
    "Name": "قلندر آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 832,
    "CountryCode": 1,
    "LName": "Sirghan",
    "Name": "سیرداغ",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 833,
    "CountryCode": 1,
    "LName": "Soltanabad",
    "Name": "سلطان آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 838,
    "CountryCode": 1,
    "LName": "Taybad",
    "Name": "تایباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 839,
    "CountryCode": 1,
    "LName": "Torbat-e Jam",
    "Name": "تربت جام",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 840,
    "CountryCode": 1,
    "LName": "Yazdan",
    "Name": "یزدان",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 842,
    "CountryCode": 1,
    "LName": "Chahchaheh",
    "Name": "چهچهه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1011,
    "CountryCode": 1,
    "LName": "Kashmar",
    "Name": "کاشمر",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1021,
    "CountryCode": 1,
    "LName": "Torbat Heydariyeh",
    "Name": "تربت حیدریه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1035,
    "CountryCode": 1,
    "LName": "Kakhak",
    "Name": "کاخک",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1050,
    "CountryCode": 1,
    "LName": "Kondor",
    "Name": "کندر",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1062,
    "CountryCode": 1,
    "LName": "Bimorgh",
    "Name": "بیمرغ",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1078,
    "CountryCode": 1,
    "LName": "Dargaz",
    "Name": "درگز",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1085,
    "CountryCode": 1,
    "LName": "Joghatay",
    "Name": "جغتای",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1163,
    "CountryCode": 1,
    "LName": "Rivash",
    "Name": "ریوش",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1179,
    "CountryCode": 1,
    "LName": "Nasrabad",
    "Name": "نصرآباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1189,
    "CountryCode": 1,
    "LName": "Gonabad",
    "Name": "گناباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1193,
    "CountryCode": 1,
    "LName": "Golbahar",
    "Name": "گلبهار",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1194,
    "CountryCode": 1,
    "LName": "Shandiz",
    "Name": "شاندیز",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1207,
    "CountryCode": 1,
    "LName": "MolkAbad",
    "Name": "ملک آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1286,
    "CountryCode": 1,
    "LName": "Feyz Abad",
    "Name": "فیض اباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1490,
    "CountryCode": 1,
    "LName": "Babolhakam",
    "Name": "باب الحکم",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1513,
    "CountryCode": 1,
    "LName": "Khalil Abad",
    "Name": "خلیل آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1541,
    "CountryCode": 1,
    "LName": "Kharv",
    "Name": "خرو",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1568,
    "CountryCode": 1,
    "LName": "Eresk",
    "Name": "ارسک",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1579,
    "CountryCode": 1,
    "LName": "Bajestan",
    "Name": "بجستان",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1581,
    "CountryCode": 1,
    "LName": "Chenaran",
    "Name": "چناران",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1615,
    "CountryCode": 1,
    "LName": "Neghab",
    "Name": "نقاب",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1635,
    "CountryCode": 1,
    "LName": "Raqqeh",
    "Name": "رقه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1646,
    "CountryCode": 1,
    "LName": "Chakaneh",
    "Name": "چکنه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1747,
    "CountryCode": 1,
    "LName": "Dowlat Abad",
    "Name": "دولت اباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1755,
    "CountryCode": 1,
    "LName": "Davarzan",
    "Name": "داورزن",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1771,
    "CountryCode": 1,
    "LName": "Bilond",
    "Name": "بیلند",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1847,
    "CountryCode": 1,
    "LName": "Zaveh",
    "Name": "زاوه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1855,
    "CountryCode": 1,
    "LName": "Ahmadabad",
    "Name": "احمداباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1863,
    "CountryCode": 1,
    "LName": "Bayg",
    "Name": "بایگ",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1876,
    "CountryCode": 1,
    "LName": "Salami",
    "Name": "سلامی",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1885,
    "CountryCode": 1,
    "LName": "Meshkan",
    "Name": "مشکان",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1887,
    "CountryCode": 1,
    "LName": "Bakharz",
    "Name": "باخرز",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1939,
    "CountryCode": 1,
    "LName": "Koohsangi-Mashhad",
    "Name": "کوهسنگی-مشهد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1960,
    "CountryCode": 1,
    "LName": "Abdollah Giv",
    "Name": "عبدالله گیوی",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1961,
    "CountryCode": 1,
    "LName": "Anabad",
    "Name": "انابد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1968,
    "CountryCode": 1,
    "LName": "Kalat Nader",
    "Name": "کلات نادر",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1971,
    "CountryCode": 1,
    "LName": "Binalood",
    "Name": "بینالود",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1976,
    "CountryCode": 1,
    "LName": "Firouzeh",
    "Name": "فیروزه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1980,
    "CountryCode": 1,
    "LName": "Torghabeh",
    "Name": "طرقبه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2013,
    "CountryCode": 1,
    "LName": "Nowdeh-e Enghelab",
    "Name": "نوده انقلاب",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2050,
    "CountryCode": 1,
    "LName": "Abu Chenari",
    "Name": "ابوچناری",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2076,
    "CountryCode": 1,
    "LName": "Kheyrabad",
    "Name": "خیرآباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2251,
    "CountryCode": 1,
    "LName": "Eshghabad",
    "Name": "عشق آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2358,
    "CountryCode": 1,
    "LName": "Mashhad - Doostabad",
    "Name": "مشهد - دوست آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2364,
    "CountryCode": 1,
    "LName": "Nokhandan",
    "Name": "نوخندان",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2415,
    "CountryCode": 1,
    "LName": "Jaghargh",
    "Name": "جاغرق",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2444,
    "CountryCode": 1,
    "LName": "Mashhad-Abutaleb",
    "Name": "مشهد-ابوطالب",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2504,
    "CountryCode": 1,
    "LName": "Hokmabad",
    "Name": "حکم آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2546,
    "CountryCode": 1,
    "LName": "Shahrezu",
    "Name": "شهرزو",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2639,
    "CountryCode": 1,
    "LName": "Marian",
    "Name": "ماریان",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2661,
    "CountryCode": 1,
    "LName": "Bajgiran",
    "Name": "باجگیران",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2839,
    "CountryCode": 1,
    "LName": "Jangal",
    "Name": "جنگل",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2853,
    "CountryCode": 1,
    "LName": "Robat-e-Sang",
    "Name": "رباط سنگ",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3000,
    "CountryCode": 1,
    "LName": "Kaaryzak Nagehani",
    "Name": "کاریزک ناگهانی",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3026,
    "CountryCode": 1,
    "LName": "Ghadamgah",
    "Name": "قدمگاه",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3122,
    "CountryCode": 1,
    "LName": "Shadmehr",
    "Name": "شادمهر",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3164,
    "CountryCode": 1,
    "LName": "Beyg Nazar",
    "Name": "بیگ نظر",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3185,
    "CountryCode": 1,
    "LName": "Abasabad",
    "Name": "عباس آباد",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3195,
    "CountryCode": 1,
    "LName": "Cheshmeh Shur",
    "Name": "چشمه شور",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3201,
    "CountryCode": 1,
    "LName": "Kadkan",
    "Name": "کدکن",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3256,
    "CountryCode": 1,
    "LName": "Golmakan",
    "Name": "گلمکان",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 24,
    "CountryCode": 1,
    "LName": "Hamedan",
    "Name": "همدان",
    "ProvinceCode": 27,
    "Type": "S"
  },
  {
    "Code": 843,
    "CountryCode": 1,
    "LName": "Famanin",
    "Name": "فامنین",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 844,
    "CountryCode": 1,
    "LName": "Gav Savar",
    "Name": "گاو سوار",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 846,
    "CountryCode": 1,
    "LName": "Gol Tappeh",
    "Name": "گل تپه",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 847,
    "CountryCode": 1,
    "LName": "Kourijan",
    "Name": "کوریجان",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 848,
    "CountryCode": 1,
    "LName": "Jeyhunabad",
    "Name": "جیحون آباد",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 849,
    "CountryCode": 1,
    "LName": "Kabudarahang",
    "Name": "کبودر آهنگ",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 851,
    "CountryCode": 1,
    "LName": "Karafs",
    "Name": "کرفس",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 852,
    "CountryCode": 1,
    "LName": "Lalajin",
    "Name": "لالجین",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 853,
    "CountryCode": 1,
    "LName": "Malayer",
    "Name": "ملایر",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 854,
    "CountryCode": 1,
    "LName": "Aq Bolagh-e Aqdaq",
    "Name": "آقبلاغ",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 855,
    "CountryCode": 1,
    "LName": "Nahavand",
    "Name": "نهاوند",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 856,
    "CountryCode": 1,
    "LName": "Qorveh-e Darjezin",
    "Name": "قروه درجزین",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 857,
    "CountryCode": 1,
    "LName": "Razan",
    "Name": "رازان",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 858,
    "CountryCode": 1,
    "LName": "Asadabad",
    "Name": "اسد آباد",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 859,
    "CountryCode": 1,
    "LName": "Suzan",
    "Name": "سوزان",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 860,
    "CountryCode": 1,
    "LName": "Salehabad",
    "Name": "صالح آباد",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1094,
    "CountryCode": 1,
    "LName": "Tuyserkan",
    "Name": "تویسرکان",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1131,
    "CountryCode": 1,
    "LName": "Bahar",
    "Name": "بهار",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1298,
    "CountryCode": 1,
    "LName": "Avarzaman",
    "Name": "آورزمان",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1361,
    "CountryCode": 1,
    "LName": "Shahanjarin",
    "Name": "شاهنجرین",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1469,
    "CountryCode": 1,
    "LName": "Samen",
    "Name": "سامن",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1477,
    "CountryCode": 1,
    "LName": "Juraghan",
    "Name": "جورقان",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1483,
    "CountryCode": 1,
    "LName": "Songhorabad",
    "Name": "سنقر آباد",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1489,
    "CountryCode": 1,
    "LName": "Serkan",
    "Name": "سرکان",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1494,
    "CountryCode": 1,
    "LName": "Shirin su",
    "Name": "شیرین سو",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1612,
    "CountryCode": 1,
    "LName": "Gian",
    "Name": "گیان",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1614,
    "CountryCode": 1,
    "LName": "Ghara Bolagh",
    "Name": "قره بلاغ",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1616,
    "CountryCode": 1,
    "LName": "Firuzan",
    "Name": "فیروزان",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1852,
    "CountryCode": 1,
    "LName": "Qaleh Juq",
    "Name": "قلعه جوق",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1853,
    "CountryCode": 1,
    "LName": "Ahmadabad",
    "Name": "احمد آباد",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1854,
    "CountryCode": 1,
    "LName": "Dizaj",
    "Name": "دیزج",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 2137,
    "CountryCode": 1,
    "LName": "Emamzadeh Pir Nahan",
    "Name": "امام زاده پیرنهان",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 2475,
    "CountryCode": 1,
    "LName": "Churmaq",
    "Name": "چورمق",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 2585,
    "CountryCode": 1,
    "LName": "Jamishlu",
    "Name": "جامیشلو",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 2777,
    "CountryCode": 1,
    "LName": "Dasht Abad",
    "Name": "دشت آباد",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 31,
    "CountryCode": 1,
    "LName": "Shahr-e Kord",
    "Name": "شهرکرد",
    "ProvinceCode": 28,
    "Type": "S"
  },
  {
    "Code": 234,
    "CountryCode": 1,
    "LName": "Farrokh Shahr",
    "Name": "فرخ شهر",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 333,
    "CountryCode": 1,
    "LName": "Borujen",
    "Name": "بروجن",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 861,
    "CountryCode": 1,
    "LName": "Do Makan",
    "Name": "دو مکان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 862,
    "CountryCode": 1,
    "LName": "Gandoman",
    "Name": "گندمان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 863,
    "CountryCode": 1,
    "LName": "Mal-e-Khalifeh",
    "Name": "مال خلیفه",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 864,
    "CountryCode": 1,
    "LName": "Lordegan",
    "Name": "لردگان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 865,
    "CountryCode": 1,
    "LName": "Mavarz",
    "Name": "ماورز",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 866,
    "CountryCode": 1,
    "LName": "Nafch",
    "Name": "نافچ",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 867,
    "CountryCode": 1,
    "LName": "FarrokhShahr",
    "Name": "فرخشهر",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 868,
    "CountryCode": 1,
    "LName": "Sar Khun",
    "Name": "سرخون",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 869,
    "CountryCode": 1,
    "LName": "Sefid Dasht",
    "Name": "سفید دشت",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 870,
    "CountryCode": 1,
    "LName": "Shalamzar",
    "Name": "شلمزار",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 872,
    "CountryCode": 1,
    "LName": "Sud Jan",
    "Name": "سودجان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 873,
    "CountryCode": 1,
    "LName": "Taqanak",
    "Name": "طاقانک",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 875,
    "CountryCode": 1,
    "LName": "Chenar-e Mahmudi",
    "Name": "چنار محمودی",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1026,
    "CountryCode": 1,
    "LName": "Farsan",
    "Name": "فارسان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1071,
    "CountryCode": 1,
    "LName": "Garmdareh",
    "Name": "گرم دره",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1105,
    "CountryCode": 1,
    "LName": "Babaheidar",
    "Name": "باباحیدر",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1111,
    "CountryCode": 1,
    "LName": "Ardal",
    "Name": "اردل",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1228,
    "CountryCode": 1,
    "LName": "Faradonbeh",
    "Name": "فرادنبه",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1262,
    "CountryCode": 1,
    "LName": "Sureshjan",
    "Name": "سورشجان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1305,
    "CountryCode": 1,
    "LName": "Hafshejan",
    "Name": "هفشجان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1347,
    "CountryCode": 1,
    "LName": "Boldaji",
    "Name": "بلداجی",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1537,
    "CountryCode": 1,
    "LName": "Ben",
    "Name": "بن",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1553,
    "CountryCode": 1,
    "LName": "Chelgerd",
    "Name": "چلگرد",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1602,
    "CountryCode": 1,
    "LName": "Saman",
    "Name": "سامان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1619,
    "CountryCode": 1,
    "LName": "Gahro",
    "Name": "گهرو",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1874,
    "CountryCode": 1,
    "LName": "Kian",
    "Name": "کیان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1880,
    "CountryCode": 1,
    "LName": "Naghan",
    "Name": "ناغان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1882,
    "CountryCode": 1,
    "LName": "Shamsabad",
    "Name": "شمس آباد",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1900,
    "CountryCode": 1,
    "LName": "Dashtak",
    "Name": "دشتک",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1951,
    "CountryCode": 1,
    "LName": "Kharaji",
    "Name": "خراجی",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1990,
    "CountryCode": 1,
    "LName": "Vardanjan",
    "Name": "وردنجان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2014,
    "CountryCode": 1,
    "LName": "Eskaftak",
    "Name": "اشکفتک",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2041,
    "CountryCode": 1,
    "LName": "Monj",
    "Name": "منج",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2042,
    "CountryCode": 1,
    "LName": "Dastena",
    "Name": "دستنا",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2359,
    "CountryCode": 1,
    "LName": "Abu Es-hagh",
    "Name": "ابو اسحاق",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2425,
    "CountryCode": 1,
    "LName": "Do Polan",
    "Name": "دوپلان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2470,
    "CountryCode": 1,
    "LName": "Naghneh",
    "Name": "نقنه",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2522,
    "CountryCode": 1,
    "LName": "Junqan",
    "Name": "جونقان",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2814,
    "CountryCode": 1,
    "LName": "Hooreh",
    "Name": "هوره",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 32,
    "CountryCode": 1,
    "LName": "Yasouj",
    "Name": "یاسوج",
    "ProvinceCode": 29,
    "Type": "S"
  },
  {
    "Code": 661,
    "CountryCode": 1,
    "LName": "GachSaran",
    "Name": "گچساران",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 874,
    "CountryCode": 1,
    "LName": "Dishmok",
    "Name": "دیشموک",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 876,
    "CountryCode": 1,
    "LName": "Sugh",
    "Name": "سوق",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 877,
    "CountryCode": 1,
    "LName": "Deh Dasht",
    "Name": "دهدشت",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 878,
    "CountryCode": 1,
    "LName": "Do Gonbadan",
    "Name": "دو گنبدان",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 880,
    "CountryCode": 1,
    "LName": "Cheram",
    "Name": "چرام",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 881,
    "CountryCode": 1,
    "LName": "Margoon",
    "Name": "مارگون",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 883,
    "CountryCode": 1,
    "LName": "Margoun",
    "Name": "مارگون",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1025,
    "CountryCode": 1,
    "LName": "Basht",
    "Name": "باشت",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1173,
    "CountryCode": 1,
    "LName": "Sisakht",
    "Name": "سی سخت",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1389,
    "CountryCode": 1,
    "LName": "Darghak",
    "Name": "درغک",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1438,
    "CountryCode": 1,
    "LName": "Idanak",
    "Name": "ایدنک",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1669,
    "CountryCode": 1,
    "LName": "Likak",
    "Name": "لیکک",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1850,
    "CountryCode": 1,
    "LName": "Sisakht",
    "Name": "سی سخت",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1905,
    "CountryCode": 1,
    "LName": "Ghaleh Raesi",
    "Name": "قلعه رئیسی",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1941,
    "CountryCode": 1,
    "LName": "Gheyam",
    "Name": "قیام",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 14,
    "CountryCode": 1,
    "LName": "Yazd",
    "Name": "یزد",
    "ProvinceCode": 30,
    "Type": "S"
  },
  {
    "Code": 436,
    "CountryCode": 1,
    "LName": "Zarch",
    "Name": "زارچ",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 885,
    "CountryCode": 1,
    "LName": "Mehriz",
    "Name": "مهریز",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 886,
    "CountryCode": 1,
    "LName": "Aliabad",
    "Name": "علی آباد",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 887,
    "CountryCode": 1,
    "LName": "Kahdü'iyeh",
    "Name": "کهدوئیه",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 888,
    "CountryCode": 1,
    "LName": "Kermanshahan",
    "Name": "کرمانشاهان",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 889,
    "CountryCode": 1,
    "LName": "Sourian",
    "Name": "سوریان",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 890,
    "CountryCode": 1,
    "LName": "Marvast",
    "Name": "مروست",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 891,
    "CountryCode": 1,
    "LName": "Mehdiabad",
    "Name": "مهدی آباد",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 892,
    "CountryCode": 1,
    "LName": "Meybod",
    "Name": "میبد",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 893,
    "CountryCode": 1,
    "LName": "Aqda",
    "Name": "عقدا",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 894,
    "CountryCode": 1,
    "LName": "Mobarakeh",
    "Name": "مبارکه",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 895,
    "CountryCode": 1,
    "LName": "Behabad",
    "Name": "بهاباد",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 896,
    "CountryCode": 1,
    "LName": "Ardakan",
    "Name": "اردکان",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 897,
    "CountryCode": 1,
    "LName": "Ashkezar",
    "Name": "اشکذر",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 898,
    "CountryCode": 1,
    "LName": "Saghand",
    "Name": "ساغند",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 899,
    "CountryCode": 1,
    "LName": "Shahr-e Now",
    "Name": "شهر نو",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 900,
    "CountryCode": 1,
    "LName": "Taj Kuh",
    "Name": "تاج کوه",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 901,
    "CountryCode": 1,
    "LName": "Taft",
    "Name": "تفت",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 902,
    "CountryCode": 1,
    "LName": "Tajabad-e Herat",
    "Name": "هرات",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 904,
    "CountryCode": 1,
    "LName": "Bafq",
    "Name": "بافق",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 905,
    "CountryCode": 1,
    "LName": "Baghdadabad",
    "Name": "بغداد آباد",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1135,
    "CountryCode": 1,
    "LName": "Nodoushan",
    "Name": "ندوشن",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1183,
    "CountryCode": 1,
    "LName": "Abarkoh",
    "Name": "ابرکوه",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1337,
    "CountryCode": 1,
    "LName": "Ahmad Abad",
    "Name": "احمدآباد",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1411,
    "CountryCode": 1,
    "LName": "Banadkook Dize",
    "Name": "بنادکوک دیزه",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1441,
    "CountryCode": 1,
    "LName": "Bondarabad",
    "Name": "بندرآباد",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1604,
    "CountryCode": 1,
    "LName": "Sfand Abad",
    "Name": "اسفند آباد",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1645,
    "CountryCode": 1,
    "LName": "Fathabad",
    "Name": "فتح آباد",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1796,
    "CountryCode": 1,
    "LName": "Chadormalu",
    "Name": "چادرملو",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1909,
    "CountryCode": 1,
    "LName": "Chenar-e Naz",
    "Name": "چنارناز",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2270,
    "CountryCode": 1,
    "LName": "Rezvanshahr",
    "Name": "رضوانشهر",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2453,
    "CountryCode": 1,
    "LName": "Bidakhavid",
    "Name": "بیداخوید",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2454,
    "CountryCode": 1,
    "LName": "Kalbaali",
    "Name": "کلبعلی",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2455,
    "CountryCode": 1,
    "LName": "Khavidak",
    "Name": "خویدک",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2524,
    "CountryCode": 1,
    "LName": "Dehshir",
    "Name": "دهشیر",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2915,
    "CountryCode": 1,
    "LName": "HojjatAbad",
    "Name": "حجت آباد",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 3028,
    "CountryCode": 1,
    "LName": "Chah Gaz Mine",
    "Name": "معدن چاه گز",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 7,
    "CountryCode": 1,
    "LName": "Bandar Abbas",
    "Name": "بندرعباس",
    "ProvinceCode": 31,
    "Type": "S"
  },
  {
    "Code": 722,
    "CountryCode": 1,
    "LName": "Gohran",
    "Name": "گوهران",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 906,
    "CountryCode": 1,
    "LName": "Dargahan",
    "Name": "درگهان",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 907,
    "CountryCode": 1,
    "LName": "Dehnow Mir",
    "Name": "دهنومیر",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 908,
    "CountryCode": 1,
    "LName": "Dehriz",
    "Name": "دهریز",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 909,
    "CountryCode": 1,
    "LName": "Gachin paein",
    "Name": "گچین پایین",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 910,
    "CountryCode": 1,
    "LName": "Tal Siah",
    "Name": "تل سیاه",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 911,
    "CountryCode": 1,
    "LName": "Bandar-e Lengeh",
    "Name": "بندر لنگه",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 912,
    "CountryCode": 1,
    "LName": "Fin",
    "Name": "فین",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 913,
    "CountryCode": 1,
    "LName": "Abu Musa",
    "Name": "ابوموسی",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 914,
    "CountryCode": 1,
    "LName": "Bandar-e Jazzeh",
    "Name": "بندر جزه",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 915,
    "CountryCode": 1,
    "LName": "Gavbandi",
    "Name": "گاوبندی",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 916,
    "CountryCode": 1,
    "LName": "Salakh",
    "Name": "سلخ",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 917,
    "CountryCode": 1,
    "LName": "Bandar-e Mahtabi",
    "Name": "بندر مهتابی",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 918,
    "CountryCode": 1,
    "LName": "Bandar-e Maqam",
    "Name": "بندر مقام",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 919,
    "CountryCode": 1,
    "LName": "Hajjiabad",
    "Name": "حاجی آباد",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 920,
    "CountryCode": 1,
    "LName": "Bandar charak",
    "Name": "بندر چارک",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 921,
    "CountryCode": 1,
    "LName": "Hengam-e Qadim",
    "Name": "هنگام قدیم",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 922,
    "CountryCode": 1,
    "LName": "Bandar-e Moghuyeh",
    "Name": "بندر مغویه",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 923,
    "CountryCode": 1,
    "LName": "Jask",
    "Name": "جاسک",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 924,
    "CountryCode": 1,
    "LName": "Jonah",
    "Name": "جناح",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 925,
    "CountryCode": 1,
    "LName": "Band-e Mo'allem",
    "Name": "بندر معلم",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 926,
    "CountryCode": 1,
    "LName": "Kashar-e Bala",
    "Name": "کشار بالا",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 927,
    "CountryCode": 1,
    "LName": "Kemeshk",
    "Name": "کمشک",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 928,
    "CountryCode": 1,
    "LName": "Habd",
    "Name": "هبد",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 929,
    "CountryCode": 1,
    "LName": "Bandar rajaei",
    "Name": "بندر شهید رجایی",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 930,
    "CountryCode": 1,
    "LName": "Khamir",
    "Name": "بندر خمیر",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 931,
    "CountryCode": 1,
    "LName": "Bastak",
    "Name": "بستک",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 932,
    "CountryCode": 1,
    "LName": "Bandar Pol",
    "Name": "بندر پل",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 933,
    "CountryCode": 1,
    "LName": "Larak",
    "Name": "لارک",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 934,
    "CountryCode": 1,
    "LName": "Anveh",
    "Name": "انوه",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 935,
    "CountryCode": 1,
    "LName": "Masheh",
    "Name": "ماشه",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 936,
    "CountryCode": 1,
    "LName": "Minab",
    "Name": "میناب",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 937,
    "CountryCode": 1,
    "LName": "Hasht bandi",
    "Name": "هشت بندی",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 938,
    "CountryCode": 1,
    "LName": "Baverd",
    "Name": "باورد",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 939,
    "CountryCode": 1,
    "LName": "Qeshm",
    "Name": "قشم",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 940,
    "CountryCode": 1,
    "LName": "Lavan",
    "Name": "لاوان",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 941,
    "CountryCode": 1,
    "LName": "Ramkan",
    "Name": "رمکان",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 942,
    "CountryCode": 1,
    "LName": "Bandar kong",
    "Name": "بندر کنگ",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 943,
    "CountryCode": 1,
    "LName": "Honguye",
    "Name": "هنگویه",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 944,
    "CountryCode": 1,
    "LName": "Dehtal",
    "Name": "دهتل",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 945,
    "CountryCode": 1,
    "LName": "Tunb-e Bozorg",
    "Name": "تنب بزرگ",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 946,
    "CountryCode": 1,
    "LName": "Kolahi",
    "Name": "کلاهی",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 947,
    "CountryCode": 1,
    "LName": "Sargaz",
    "Name": "سرگز",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 948,
    "CountryCode": 1,
    "LName": "Sarzeh",
    "Name": "سرزه",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 949,
    "CountryCode": 1,
    "LName": "Sirik",
    "Name": "سیریک",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 950,
    "CountryCode": 1,
    "LName": "Seyyed Jabal od Din",
    "Name": "سید جبل الدین",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 951,
    "CountryCode": 1,
    "LName": "Rodan",
    "Name": "رودان",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 952,
    "CountryCode": 1,
    "LName": "Sirri Island (Jazireh-ye)",
    "Name": "جزیره سیری",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 953,
    "CountryCode": 1,
    "LName": "Soltanabad",
    "Name": "سلطان آباد",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 954,
    "CountryCode": 1,
    "LName": "Dustaku",
    "Name": "دستکو",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 955,
    "CountryCode": 1,
    "LName": "Vanak",
    "Name": "ونک",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 956,
    "CountryCode": 1,
    "LName": "Yekdar",
    "Name": "یکدار",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 957,
    "CountryCode": 1,
    "LName": "Ziarat-e 'Ali",
    "Name": "زیارتعلی",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 958,
    "CountryCode": 1,
    "LName": "shahrak-e-morvarid",
    "Name": "شهرک مروارید",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 959,
    "CountryCode": 1,
    "LName": "bandar shenas",
    "Name": "بندر شناس",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 960,
    "CountryCode": 1,
    "LName": "Chah-e Bonard",
    "Name": "چاه بنارد",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 961,
    "CountryCode": 1,
    "LName": "bandar doulab",
    "Name": "بندر دولاب",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 968,
    "CountryCode": 1,
    "LName": "kish",
    "Name": "کیش",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 998,
    "CountryCode": 1,
    "LName": "Lavan",
    "Name": "لاوان (جزیره)",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1000,
    "CountryCode": 1,
    "LName": "Chiruyeh",
    "Name": "چیروئیه",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1004,
    "CountryCode": 1,
    "LName": "Hendorabi",
    "Name": "هندورابی",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1117,
    "CountryCode": 1,
    "LName": "Kuvei",
    "Name": "کووه یی",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1372,
    "CountryCode": 1,
    "LName": "Siahak",
    "Name": "سیاهک",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1401,
    "CountryCode": 1,
    "LName": "Techek",
    "Name": "تچک",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1482,
    "CountryCode": 1,
    "LName": "Dezhgan",
    "Name": "دژگان",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1627,
    "CountryCode": 1,
    "LName": "Bandar e Bostaneh",
    "Name": "بندر بستانه",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1725,
    "CountryCode": 1,
    "LName": "Dehong",
    "Name": "دهنگ",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1733,
    "CountryCode": 1,
    "LName": "Sardasht Bashagard",
    "Name": "سردشت بشاگرد",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1751,
    "CountryCode": 1,
    "LName": "Darva",
    "Name": "دروا",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1772,
    "CountryCode": 1,
    "LName": "Farghan",
    "Name": "فارغان",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1773,
    "CountryCode": 1,
    "LName": "Bokhan",
    "Name": "بخوان",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1785,
    "CountryCode": 1,
    "LName": "Bandzark",
    "Name": "بندزرک",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1817,
    "CountryCode": 1,
    "LName": "Shahr-e Shib",
    "Name": "شهرشیب",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1942,
    "CountryCode": 1,
    "LName": "Parsian",
    "Name": "پارسیان",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2017,
    "CountryCode": 1,
    "LName": "Cheragh Abad",
    "Name": "چراغ آباد",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2119,
    "CountryCode": 1,
    "LName": "GEZIR",
    "Name": "گزیر",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2435,
    "CountryCode": 1,
    "LName": "Haji Khademi",
    "Name": "حاجی خادمی",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2499,
    "CountryCode": 1,
    "LName": "Kuhij",
    "Name": "کوهیج",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2542,
    "CountryCode": 1,
    "LName": "Lemazan",
    "Name": "لمزان",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2875,
    "CountryCode": 1,
    "LName": "Farur",
    "Name": "فارور",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 3020,
    "CountryCode": 1,
    "LName": "Herang",
    "Name": "هرنگ",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 3180,
    "CountryCode": 1,
    "LName": "Sontdraf",
    "Name": "سنتدرف",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 3259,
    "CountryCode": 1,
    "LName": "Jamal Ahmad",
    "Name": "جمال احمد",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 15,
    "CountryCode": 1,
    "LName": "Bojnourd",
    "Name": "بجنورد",
    "ProvinceCode": 33,
    "Type": "S"
  },
  {
    "Code": 782,
    "CountryCode": 1,
    "LName": "Faruj",
    "Name": "فاروج",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 789,
    "CountryCode": 1,
    "LName": "Bazkhaneh",
    "Name": "بازخانه",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 790,
    "CountryCode": 1,
    "LName": "Golian",
    "Name": "گلیان",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 793,
    "CountryCode": 1,
    "LName": "Hesarcheh",
    "Name": "حصارچه",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 800,
    "CountryCode": 1,
    "LName": "Khorashah",
    "Name": "خراشاه",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 804,
    "CountryCode": 1,
    "LName": "Ashkhaneh",
    "Name": "آشخانه",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 806,
    "CountryCode": 1,
    "LName": "Marghzar",
    "Name": "مرغزار",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 808,
    "CountryCode": 1,
    "LName": "Mianzow",
    "Name": "میانزو",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 817,
    "CountryCode": 1,
    "LName": "Qalanlu",
    "Name": "کلانلو",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1001,
    "CountryCode": 1,
    "LName": "Shirvan",
    "Name": "شیروان",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1031,
    "CountryCode": 1,
    "LName": "Baghchagh",
    "Name": "باغچق",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1042,
    "CountryCode": 1,
    "LName": "Esfarayen",
    "Name": "اسفراین",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1231,
    "CountryCode": 1,
    "LName": "Raz",
    "Name": "راز",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1252,
    "CountryCode": 1,
    "LName": "Sankhavast",
    "Name": "سنخواست",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1255,
    "CountryCode": 1,
    "LName": "Daragh",
    "Name": "درق",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1306,
    "CountryCode": 1,
    "LName": "Jajarm",
    "Name": "جاجرم",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1437,
    "CountryCode": 1,
    "LName": "Robat-e Qarebil",
    "Name": "رباط قره بیل",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1618,
    "CountryCode": 1,
    "LName": "Garmeh",
    "Name": "گرمه",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1659,
    "CountryCode": 1,
    "LName": "Monir Abad-e Daragh",
    "Name": "منیر آباد درق",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1661,
    "CountryCode": 1,
    "LName": "Daraq",
    "Name": "درق",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1675,
    "CountryCode": 1,
    "LName": "Ghazi",
    "Name": "قاضی",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1728,
    "CountryCode": 1,
    "LName": "Cheshmeh Khaled",
    "Name": "چشمه خالد",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1737,
    "CountryCode": 1,
    "LName": "Khomeyni Abad",
    "Name": "خمینی آباد",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1924,
    "CountryCode": 1,
    "LName": "Islam Abad",
    "Name": "اسلام آباد",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 2030,
    "CountryCode": 1,
    "LName": "Gifan",
    "Name": "گیفان",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 2254,
    "CountryCode": 1,
    "LName": "Barzaneh",
    "Name": "برزنه",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 2295,
    "CountryCode": 1,
    "LName": "Gar Gaz",
    "Name": "گرگز",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 2969,
    "CountryCode": 1,
    "LName": "Gerivan",
    "Name": "گریوان",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 3127,
    "CountryCode": 1,
    "LName": "Ivar",
    "Name": "ایور",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 775,
    "CountryCode": 1,
    "LName": "Deh-e Salm",
    "Name": "ده سلم",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 776,
    "CountryCode": 1,
    "LName": "Deyhuk",
    "Name": "دیهوک",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 777,
    "CountryCode": 1,
    "LName": "Doroh",
    "Name": "دوروح",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 779,
    "CountryCode": 1,
    "LName": "Sarbisheh",
    "Name": "سربیشه",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 784,
    "CountryCode": 1,
    "LName": "Mud",
    "Name": "مود",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 786,
    "CountryCode": 1,
    "LName": "Garmab",
    "Name": "گرماب",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 787,
    "CountryCode": 1,
    "LName": "Afin",
    "Name": "آفین",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 788,
    "CountryCode": 1,
    "LName": "Asadieh",
    "Name": "اسدیه",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 797,
    "CountryCode": 1,
    "LName": "Karba",
    "Name": "کربا",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 801,
    "CountryCode": 1,
    "LName": "Khur",
    "Name": "خور",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 803,
    "CountryCode": 1,
    "LName": "Khvoshab",
    "Name": "خوشاب",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 811,
    "CountryCode": 1,
    "LName": "Barmenj",
    "Name": "برمنج",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 813,
    "CountryCode": 1,
    "LName": "Nay Band",
    "Name": "نی بند",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 814,
    "CountryCode": 1,
    "LName": "Nehbandan",
    "Name": "نهبندان",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 816,
    "CountryCode": 1,
    "LName": "Paymorgh",
    "Name": "پای مرغ",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 818,
    "CountryCode": 1,
    "LName": "Qayen",
    "Name": "قائن",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 827,
    "CountryCode": 1,
    "LName": "Birjand",
    "Name": "بیرجند",
    "ProvinceCode": 34,
    "Type": "S"
  },
  {
    "Code": 831,
    "CountryCode": 1,
    "LName": "Shusf",
    "Name": "شوسف",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 834,
    "CountryCode": 1,
    "LName": "Somba",
    "Name": "سمبا",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 835,
    "CountryCode": 1,
    "LName": "Tabas",
    "Name": "تباس",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 836,
    "CountryCode": 1,
    "LName": "Tabas Masina",
    "Name": "طبس مسینا",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 837,
    "CountryCode": 1,
    "LName": "Tabas",
    "Name": "طبس",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 841,
    "CountryCode": 1,
    "LName": "Chah Mosafer",
    "Name": "چاه مسافر",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1065,
    "CountryCode": 1,
    "LName": "Khosf",
    "Name": "خوسف",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1132,
    "CountryCode": 1,
    "LName": "Bidokht",
    "Name": "بیدخت گازار",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1148,
    "CountryCode": 1,
    "LName": "Haji Abad",
    "Name": "حاجی آباد",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1241,
    "CountryCode": 1,
    "LName": "Khezri Dashtebeaz",
    "Name": "خضری دشت بیاض",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1290,
    "CountryCode": 1,
    "LName": "Zohan",
    "Name": "زهان",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1374,
    "CountryCode": 1,
    "LName": "Noughab",
    "Name": "نوغاب",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1460,
    "CountryCode": 1,
    "LName": "Sarayan",
    "Name": "سرایان",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1511,
    "CountryCode": 1,
    "LName": "Korghond",
    "Name": "کرغند",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1535,
    "CountryCode": 1,
    "LName": "Bandan",
    "Name": "بندان",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1625,
    "CountryCode": 1,
    "LName": "Esfeden",
    "Name": "اسفدن",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1641,
    "CountryCode": 1,
    "LName": "Mosabi",
    "Name": "مصعبی",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1676,
    "CountryCode": 1,
    "LName": "Ayask",
    "Name": "آیسک",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1750,
    "CountryCode": 1,
    "LName": "Ghohestan",
    "Name": "قهستان",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1794,
    "CountryCode": 1,
    "LName": "Ardacul",
    "Name": "اردکول",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1955,
    "CountryCode": 1,
    "LName": "Baveik",
    "Name": "بویک",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1956,
    "CountryCode": 1,
    "LName": "Seh Qaleh",
    "Name": "سه قلعه",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1966,
    "CountryCode": 1,
    "LName": "Arababad",
    "Name": "عرب آباد",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2035,
    "CountryCode": 1,
    "LName": "Takhteh Jan",
    "Name": "تخته جان",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2036,
    "CountryCode": 1,
    "LName": "Arian Shahr",
    "Name": "آرین شهر",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2055,
    "CountryCode": 1,
    "LName": "Mighan",
    "Name": "میغان",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2168,
    "CountryCode": 1,
    "LName": "Esfaad",
    "Name": "اسفاد",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2616,
    "CountryCode": 1,
    "LName": "Hendevalan",
    "Name": "هندوالان",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2707,
    "CountryCode": 1,
    "LName": "Nowzad",
    "Name": "نوزاد",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 9,
    "CountryCode": 1,
    "LName": "Karaj",
    "Name": "کرج",
    "ProvinceCode": 35,
    "Type": "S"
  },
  {
    "Code": 232,
    "CountryCode": 1,
    "LName": "Eshtehard",
    "Name": "اشتهارد",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 238,
    "CountryCode": 1,
    "LName": "Mahdasht",
    "Name": "ماه دشت",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 239,
    "CountryCode": 1,
    "LName": "Najmabad",
    "Name": "نجم آباد",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 241,
    "CountryCode": 1,
    "LName": "Raja'ishahr",
    "Name": "رجایی شهر",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 380,
    "CountryCode": 1,
    "LName": "Kalak-e Bala",
    "Name": "کلاک بالا",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 617,
    "CountryCode": 1,
    "LName": "Kamal Shahr",
    "Name": "کمالشهر",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1153,
    "CountryCode": 1,
    "LName": "Koohsar",
    "Name": "کوهسار",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1191,
    "CountryCode": 1,
    "LName": "Nazarabad",
    "Name": "نظرآباد",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1199,
    "CountryCode": 1,
    "LName": "Hashtgerd",
    "Name": "هشتگرد",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1309,
    "CountryCode": 1,
    "LName": "Taleghan",
    "Name": "طالقان",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1440,
    "CountryCode": 1,
    "LName": "Golsar",
    "Name": "گلسار",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1461,
    "CountryCode": 1,
    "LName": "Garmdareh",
    "Name": "گرمدره",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1466,
    "CountryCode": 1,
    "LName": "Meshkin Dasht",
    "Name": "مشکین دشت",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1642,
    "CountryCode": 1,
    "LName": "Kalak",
    "Name": "کلاک",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1678,
    "CountryCode": 1,
    "LName": "Mohamad Shahr",
    "Name": "محمد شهر",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1931,
    "CountryCode": 1,
    "LName": "Mehrshahr",
    "Name": "مهرشهر",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2020,
    "CountryCode": 1,
    "LName": "Hesarak",
    "Name": "حصارک",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2024,
    "CountryCode": 1,
    "LName": "Kondor",
    "Name": "کندر",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2046,
    "CountryCode": 1,
    "LName": "Hassan Abad",
    "Name": "حسن آباد",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2541,
    "CountryCode": 1,
    "LName": "Baraghan",
    "Name": "برغان",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2649,
    "CountryCode": 1,
    "LName": "Varian",
    "Name": "واریان",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2809,
    "CountryCode": 1,
    "LName": "Karaj - Azimieh",
    "Name": "کرج - عظیمیه",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2887,
    "CountryCode": 1,
    "LName": "Asara",
    "Name": "آسارا",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 3172,
    "CountryCode": 1,
    "LName": "Shahrak-e Sanati Eshtehard",
    "Name": "شهرک صنعتی اشتهارد",
    "ProvinceCode": 35,
    "Type": "N"
  }
];