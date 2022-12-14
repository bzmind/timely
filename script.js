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
  var observer = new MutationObserver(function (mutations)
  {
    mutations.forEach(function (mutation)
    {
      for (var i = 0; i < mutation.addedNodes.length; i++)
      {
        const item = $(mutation.addedNodes[i]);
        if (item.find(".select2-search__field").length > 0)
        {
          item.find(".select2-search__field").attr("placeholder", "??????????...");
        }
      }
    });
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });

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
      const miladiDate = shamsiToMiladi(shamsiYear, shamsiMonth, shamsiDay)[0];

      const miladiYear = parseInt(miladiDate.split('/')[0]);
      const miladiMonth = parseInt(miladiDate.split('/')[1]);
      const miladiDay = parseInt(miladiDate.split('/')[2]);
      const fullShamsiDate = getFullShamsiDateFromMiladi(miladiYear, miladiMonth, miladiDay);

      const imsaak = removeFirstZero(data.Imsaak);
      const sunrise = removeFirstZero(data.Sunrise);
      const noon = removeFirstZero(data.Noon);
      const sunset = removeFirstZero(data.Sunset);
      const maghreb = removeFirstZero(data.Maghreb);
      const midnight = removeFirstZero(data.Midnight);

      removeLoading(".result");

      $(".result").append(`
        <span class="pray-time ltr ta-end d-flex ai-center jc-center">
          <span class="fs-16px" style="font-family: FiraSans">${time}</span><span class="ml-4px">???</span>
        </span>`);

      $(".result").append(`
        <span class="pray-time rtl d-flex ai-center jc-center">
          <span class="ml-4px">????</span><span>${date} (${fullShamsiDate})</span>
        </span>`);

      $(".result").append(`
        <span class="pray-time rtl d-flex ai-center jc-between">
          <span class="ml-20px"><span class="ml-4px">????</span><span>???????? ??????: ${imsaak}</span></span>
          <span>???????? ??????????: ${sunrise}</span>
        </span>`);

      $(".result").append(`
        <span class="pray-time rtl d-flex ai-center jc-between">
          <span class="ml-20px"><span class="ml-4px">????</span><span>???????? ??????: ${noon}</span></span>
          <span>???????? ????????????: ${sunset}</span>
        </span>`);

      $(".result").append(`
        <span class="pray-time rtl d-flex ai-center jc-between">
          <span class="ml-20px"><span class="ml-4px">????</span><span>???????? ????????: ${maghreb}</span></span>
          <span>???????? ???? ????????: ${midnight}</span>
        </span>`);

      $(".result").slideDown(200);
    })
    .catch((err) =>
    {
      $(".result").addClass("error");
      $(".result").append(`
        <span class="d-flex fd-col ai-center">
          <span class="fs-20px">???</span>
          <span class="fs-18px fw-b" style="color: #ff4229">!???? ?????????? ?????? ????????</span
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
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "C"
  },
  {
    "Code": 230,
    "CountryCode": 1,
    "LName": "Damavand",
    "Name": "????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 233,
    "CountryCode": 1,
    "LName": "Firuz Kuh",
    "Name": "????????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 235,
    "CountryCode": 1,
    "LName": "Haft Juy",
    "Name": "?????? ??????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 236,
    "CountryCode": 1,
    "LName": "Hesar Sati",
    "Name": "???????? ????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 237,
    "CountryCode": 1,
    "LName": "Hesarak",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 240,
    "CountryCode": 1,
    "LName": "Parchin",
    "Name": "????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 242,
    "CountryCode": 1,
    "LName": "Shahr-e-Rey",
    "Name": "?????? ????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 243,
    "CountryCode": 1,
    "LName": "Varamin",
    "Name": "????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 244,
    "CountryCode": 1,
    "LName": "Vardavard",
    "Name": "??????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 245,
    "CountryCode": 1,
    "LName": "Chitgar",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 451,
    "CountryCode": 1,
    "LName": "Marlik",
    "Name": "????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 882,
    "CountryCode": 1,
    "LName": "Jelizjand",
    "Name": "??????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 999,
    "CountryCode": 1,
    "LName": "Shahriyar",
    "Name": "????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1008,
    "CountryCode": 1,
    "LName": "RobatKarim",
    "Name": "???????? ????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1009,
    "CountryCode": 1,
    "LName": "Parand",
    "Name": "????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1024,
    "CountryCode": 1,
    "LName": "Tehran - Azadi Tower",
    "Name": "?????????? - ?????? ??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1051,
    "CountryCode": 1,
    "LName": "Rudehen",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1059,
    "CountryCode": 1,
    "LName": "Eslamshahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1061,
    "CountryCode": 1,
    "LName": "Tehran Pars",
    "Name": "??????????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1073,
    "CountryCode": 1,
    "LName": "Malard",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1086,
    "CountryCode": 1,
    "LName": "Nasim shahr",
    "Name": "???????? ??????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1093,
    "CountryCode": 1,
    "LName": "Hasan Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1164,
    "CountryCode": 1,
    "LName": "Pishva",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1187,
    "CountryCode": 1,
    "LName": "Absard",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1200,
    "CountryCode": 1,
    "LName": "Qarchak",
    "Name": "????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1245,
    "CountryCode": 1,
    "LName": "Andishe New Town",
    "Name": "?????? ???????? ????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1281,
    "CountryCode": 1,
    "LName": "Fardis",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1345,
    "CountryCode": 1,
    "LName": "Safadasht",
    "Name": "????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1353,
    "CountryCode": 1,
    "LName": "Pardis",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1462,
    "CountryCode": 1,
    "LName": "Nasir Shahr",
    "Name": "???????? ??????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1467,
    "CountryCode": 1,
    "LName": "Aroo",
    "Name": "??????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1470,
    "CountryCode": 1,
    "LName": "Pakdst",
    "Name": "????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1493,
    "CountryCode": 1,
    "LName": "Charm Shahr",
    "Name": "????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1512,
    "CountryCode": 1,
    "LName": "Lavasan",
    "Name": "??????????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1793,
    "CountryCode": 1,
    "LName": "Tehran-Tajrish",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1810,
    "CountryCode": 1,
    "LName": "Shams Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1835,
    "CountryCode": 1,
    "LName": "Tehransar",
    "Name": "??????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1925,
    "CountryCode": 1,
    "LName": "Hesar Pa'in",
    "Name": "???????? ??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1985,
    "CountryCode": 1,
    "LName": "Pirdeh",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1987,
    "CountryCode": 1,
    "LName": "Oushan",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 1996,
    "CountryCode": 1,
    "LName": "Shahrak-e-Vali-e-Asr",
    "Name": "???????? ????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2011,
    "CountryCode": 1,
    "LName": "Sulqan",
    "Name": "????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2012,
    "CountryCode": 1,
    "LName": "Narmak",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2019,
    "CountryCode": 1,
    "LName": "Nasir Abad",
    "Name": "????????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2027,
    "CountryCode": 1,
    "LName": "Vavan",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2057,
    "CountryCode": 1,
    "LName": "Abali",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2061,
    "CountryCode": 1,
    "LName": "Khavar Shahr",
    "Name": "??????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2063,
    "CountryCode": 1,
    "LName": "Chahardangeh",
    "Name": "??????????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2074,
    "CountryCode": 1,
    "LName": "Bumehen",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2089,
    "CountryCode": 1,
    "LName": "Qamsar",
    "Name": "???????? - ???????? ??????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2091,
    "CountryCode": 1,
    "LName": "Baghershahr",
    "Name": "??????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2144,
    "CountryCode": 1,
    "LName": "Khadem Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2177,
    "CountryCode": 1,
    "LName": "Kilan",
    "Name": "??????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2465,
    "CountryCode": 1,
    "LName": "Sharifabad",
    "Name": "???????? ????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2469,
    "CountryCode": 1,
    "LName": "Saba Shahr",
    "Name": "????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2516,
    "CountryCode": 1,
    "LName": "Tehran - NirooHavaei",
    "Name": "?????????? - ??????????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2637,
    "CountryCode": 1,
    "LName": "Bagger Abad",
    "Name": "????????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2653,
    "CountryCode": 1,
    "LName": "Tehran-Qolhak",
    "Name": "??????????-????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2850,
    "CountryCode": 1,
    "LName": "Tehran-Nazi Abad",
    "Name": "??????????-???????? ????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 2895,
    "CountryCode": 1,
    "LName": "Tehran-Niavaran",
    "Name": "??????????-??????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 3008,
    "CountryCode": 1,
    "LName": "Qods",
    "Name": "?????? - ????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 3149,
    "CountryCode": 1,
    "LName": "Chelqez",
    "Name": "?????? ????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 3238,
    "CountryCode": 1,
    "LName": "Ferdosiye",
    "Name": "??????????????",
    "ProvinceCode": 0,
    "Type": "N"
  },
  {
    "Code": 26,
    "CountryCode": 1,
    "LName": "Ardabil",
    "Name": "????????????",
    "ProvinceCode": 5,
    "Type": "S"
  },
  {
    "Code": 247,
    "CountryCode": 1,
    "LName": "Chalma Kandi",
    "Name": "??????????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 452,
    "CountryCode": 1,
    "LName": "Meshgin Shahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 455,
    "CountryCode": 1,
    "LName": "Namin",
    "Name": "????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 457,
    "CountryCode": 1,
    "LName": "Nir",
    "Name": "??????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 990,
    "CountryCode": 1,
    "LName": "Khalkhal",
    "Name": "??????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1010,
    "CountryCode": 1,
    "LName": "Germi",
    "Name": "????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1140,
    "CountryCode": 1,
    "LName": "Jafar Abad",
    "Name": "????????????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1155,
    "CountryCode": 1,
    "LName": "Parsabad",
    "Name": "???????? ????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1180,
    "CountryCode": 1,
    "LName": "Lahroud",
    "Name": "????????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1259,
    "CountryCode": 1,
    "LName": "Aslan duz",
    "Name": "????????????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1656,
    "CountryCode": 1,
    "LName": "Abibiglou",
    "Name": "?????? ??????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1752,
    "CountryCode": 1,
    "LName": "Bileh Savar",
    "Name": "???????? ????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1862,
    "CountryCode": 1,
    "LName": "Hoor",
    "Name": "??????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1921,
    "CountryCode": 1,
    "LName": "Kolur",
    "Name": "????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 1992,
    "CountryCode": 1,
    "LName": "Hir",
    "Name": "??????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 2004,
    "CountryCode": 1,
    "LName": "Qasabeh",
    "Name": "??????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 2040,
    "CountryCode": 1,
    "LName": "Anbaran",
    "Name": "????????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 2052,
    "CountryCode": 1,
    "LName": "Sarein",
    "Name": "??????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 2503,
    "CountryCode": 1,
    "LName": "Alni",
    "Name": "????????",
    "ProvinceCode": 5,
    "Type": "N"
  },
  {
    "Code": 3,
    "CountryCode": 1,
    "LName": "Urimiyeh",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "S"
  },
  {
    "Code": 23,
    "CountryCode": 1,
    "LName": "Mahabad",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 248,
    "CountryCode": 1,
    "LName": "Naghdeh",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 249,
    "CountryCode": 1,
    "LName": "Dizaj",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 250,
    "CountryCode": 1,
    "LName": "Mir Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 251,
    "CountryCode": 1,
    "LName": "Ali Mardan",
    "Name": "?????? ??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 252,
    "CountryCode": 1,
    "LName": "Abbas Kandi",
    "Name": "???????? ????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 253,
    "CountryCode": 1,
    "LName": "Bukan",
    "Name": "??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 255,
    "CountryCode": 1,
    "LName": "Abdol Kand",
    "Name": "??????????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 256,
    "CountryCode": 1,
    "LName": "Aghbolagh (Aghbolagh-e Chamanlu)",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 257,
    "CountryCode": 1,
    "LName": "Khoy",
    "Name": "??????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 258,
    "CountryCode": 1,
    "LName": "Likbin",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 260,
    "CountryCode": 1,
    "LName": "Aqaesmairi (Aqa Esma'il)",
    "Name": "?????? ??????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 262,
    "CountryCode": 1,
    "LName": "Ahmad Baro (Ahmad Baru)",
    "Name": "???????? ????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 264,
    "CountryCode": 1,
    "LName": "Oshnoviyeh",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 265,
    "CountryCode": 1,
    "LName": "Piranshahr",
    "Name": "????????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 266,
    "CountryCode": 1,
    "LName": "Chaldoran",
    "Name": "??????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 267,
    "CountryCode": 1,
    "LName": "Gharahzyaeddin",
    "Name": "?????? ??????????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 268,
    "CountryCode": 1,
    "LName": "Sar Dasht",
    "Name": "??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 269,
    "CountryCode": 1,
    "LName": "Aghdash",
    "Name": "??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 270,
    "CountryCode": 1,
    "LName": "Salmas",
    "Name": "??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 271,
    "CountryCode": 1,
    "LName": "Tazeh Shahr",
    "Name": "???????? ??????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 272,
    "CountryCode": 1,
    "LName": "Shahin Dej",
    "Name": "?????????? ????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 273,
    "CountryCode": 1,
    "LName": "Aslanik",
    "Name": "??????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 274,
    "CountryCode": 1,
    "LName": "Rabt",
    "Name": "??????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 275,
    "CountryCode": 1,
    "LName": "Miandoab",
    "Name": "????????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 277,
    "CountryCode": 1,
    "LName": "Azad",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 278,
    "CountryCode": 1,
    "LName": "Azim Khanl?? ('Azimkhanlu)",
    "Name": "???????? ?????? ????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 279,
    "CountryCode": 1,
    "LName": "Baba Ali (Babalu)",
    "Name": "???????? ??????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 280,
    "CountryCode": 1,
    "LName": "Gharre Tappeh",
    "Name": "?????? ??????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 281,
    "CountryCode": 1,
    "LName": "Badalan",
    "Name": "??????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 282,
    "CountryCode": 1,
    "LName": "Kohneh Lajan",
    "Name": "???????? ??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 449,
    "CountryCode": 1,
    "LName": "Dizaj diz",
    "Name": "???????? ??????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 467,
    "CountryCode": 1,
    "LName": "Azab",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 507,
    "CountryCode": 1,
    "LName": "Takab",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1067,
    "CountryCode": 1,
    "LName": "Maku",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1142,
    "CountryCode": 1,
    "LName": "Araz",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1169,
    "CountryCode": 1,
    "LName": "Qushchi",
    "Name": "??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1192,
    "CountryCode": 1,
    "LName": "Mohammadyar",
    "Name": "??????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1202,
    "CountryCode": 1,
    "LName": "Poldasht",
    "Name": "??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1234,
    "CountryCode": 1,
    "LName": "Chaharborj",
    "Name": "??????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1424,
    "CountryCode": 1,
    "LName": "Var",
    "Name": "??????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1431,
    "CountryCode": 1,
    "LName": "Shibeyli",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1448,
    "CountryCode": 1,
    "LName": "Keshavarz",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1457,
    "CountryCode": 1,
    "LName": "Nelas",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1472,
    "CountryCode": 1,
    "LName": "Samanshahr",
    "Name": "????????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1570,
    "CountryCode": 1,
    "LName": "Shot",
    "Name": "??????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1590,
    "CountryCode": 1,
    "LName": "Mamalian",
    "Name": "???? ???? ????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1591,
    "CountryCode": 1,
    "LName": "Marganlar",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1621,
    "CountryCode": 1,
    "LName": "Ziveh",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1630,
    "CountryCode": 1,
    "LName": "Bazargan",
    "Name": "??????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1664,
    "CountryCode": 1,
    "LName": "Firuraq",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1756,
    "CountryCode": 1,
    "LName": "Avajiq",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1776,
    "CountryCode": 1,
    "LName": "Zar Abad",
    "Name": "????????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1783,
    "CountryCode": 1,
    "LName": "Noshinshahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1832,
    "CountryCode": 1,
    "LName": "Serow",
    "Name": "??????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1875,
    "CountryCode": 1,
    "LName": "Zare Shoran",
    "Name": "?????? ??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 1947,
    "CountryCode": 1,
    "LName": "Pasve",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 2083,
    "CountryCode": 1,
    "LName": "Nazik",
    "Name": "????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 2158,
    "CountryCode": 1,
    "LName": "Mir abad- soldoz",
    "Name": "??????????????- ??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 2721,
    "CountryCode": 1,
    "LName": "Baruq",
    "Name": "??????????",
    "ProvinceCode": 6,
    "Type": "N"
  },
  {
    "Code": 4,
    "CountryCode": 1,
    "LName": "Arak",
    "Name": "????????",
    "ProvinceCode": 7,
    "Type": "S"
  },
  {
    "Code": 284,
    "CountryCode": 1,
    "LName": "Delijan",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 285,
    "CountryCode": 1,
    "LName": "Do Dehak",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 286,
    "CountryCode": 1,
    "LName": "Estalaj",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 288,
    "CountryCode": 1,
    "LName": "Gharqabad",
    "Name": "?????? ????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 289,
    "CountryCode": 1,
    "LName": "Hajib",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 290,
    "CountryCode": 1,
    "LName": "Javarsian",
    "Name": "????????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 291,
    "CountryCode": 1,
    "LName": "Khondab",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 292,
    "CountryCode": 1,
    "LName": "Mahallat",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 293,
    "CountryCode": 1,
    "LName": "Milajerd",
    "Name": "??????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 294,
    "CountryCode": 1,
    "LName": "Tafresh",
    "Name": "????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 295,
    "CountryCode": 1,
    "LName": "Robat-e Mil",
    "Name": "???????? ??????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 296,
    "CountryCode": 1,
    "LName": "Nimvar",
    "Name": "?????? ????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 297,
    "CountryCode": 1,
    "LName": "Saruq",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 298,
    "CountryCode": 1,
    "LName": "Senijan",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 299,
    "CountryCode": 1,
    "LName": "Ashtian",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 300,
    "CountryCode": 1,
    "LName": "Tarkhuran",
    "Name": "????????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 301,
    "CountryCode": 1,
    "LName": "Zaviyeh",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 704,
    "CountryCode": 1,
    "LName": "Salehabad",
    "Name": "???????? ????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 705,
    "CountryCode": 1,
    "LName": "Aveh",
    "Name": "??????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 970,
    "CountryCode": 1,
    "LName": "khomein",
    "Name": "????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 991,
    "CountryCode": 1,
    "LName": "Saveh",
    "Name": "????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1007,
    "CountryCode": 1,
    "LName": "Naragh",
    "Name": "????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1159,
    "CountryCode": 1,
    "LName": "Farmahin",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1204,
    "CountryCode": 1,
    "LName": "Shazand",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1225,
    "CountryCode": 1,
    "LName": "Komijan",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1450,
    "CountryCode": 1,
    "LName": "Nowbaran",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1464,
    "CountryCode": 1,
    "LName": "Mohajeran",
    "Name": "??????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1495,
    "CountryCode": 1,
    "LName": "Alvir",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1573,
    "CountryCode": 1,
    "LName": "ENAJ",
    "Name": "????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1652,
    "CountryCode": 1,
    "LName": "Siavashan",
    "Name": "??????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1692,
    "CountryCode": 1,
    "LName": "Hendodar",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1754,
    "CountryCode": 1,
    "LName": "Giv",
    "Name": "??????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1774,
    "CountryCode": 1,
    "LName": "Mamuniyeh",
    "Name": "??????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1811,
    "CountryCode": 1,
    "LName": "Tureh",
    "Name": "????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1866,
    "CountryCode": 1,
    "LName": "Karakan",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1974,
    "CountryCode": 1,
    "LName": "Khoshkrud",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 1983,
    "CountryCode": 1,
    "LName": "Khorheh",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2002,
    "CountryCode": 1,
    "LName": "Talkhab",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2016,
    "CountryCode": 1,
    "LName": "Astaneh",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2054,
    "CountryCode": 1,
    "LName": "Malmir",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2390,
    "CountryCode": 1,
    "LName": "Ebrahim Abad",
    "Name": "?????????????? ????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2551,
    "CountryCode": 1,
    "LName": "Nour Ali Beig",
    "Name": "???????????? ??????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2613,
    "CountryCode": 1,
    "LName": "Kuhin",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2618,
    "CountryCode": 1,
    "LName": "Garakan",
    "Name": "??????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2789,
    "CountryCode": 1,
    "LName": "Amirkabir",
    "Name": "????????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2859,
    "CountryCode": 1,
    "LName": "Sadr Abad",
    "Name": "??????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2944,
    "CountryCode": 1,
    "LName": "Qeytaniyeh",
    "Name": "??????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2994,
    "CountryCode": 1,
    "LName": "Karchan",
    "Name": "????????????",
    "ProvinceCode": 7,
    "Type": "N"
  },
  {
    "Code": 2,
    "CountryCode": 1,
    "LName": "Isfahan",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "S"
  },
  {
    "Code": 302,
    "CountryCode": 1,
    "LName": "Dehaqan",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 303,
    "CountryCode": 1,
    "LName": "Esfaranjan",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 304,
    "CountryCode": 1,
    "LName": "Mobarakeh",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 305,
    "CountryCode": 1,
    "LName": "Golpayegan",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 306,
    "CountryCode": 1,
    "LName": "Hajjiabad-e Zarrin",
    "Name": "???????? ???????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 307,
    "CountryCode": 1,
    "LName": "Hosnijeh",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 308,
    "CountryCode": 1,
    "LName": "Jandaq",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 309,
    "CountryCode": 1,
    "LName": "Anarak",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 310,
    "CountryCode": 1,
    "LName": "Kashan",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 311,
    "CountryCode": 1,
    "LName": "Khomeynishahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 312,
    "CountryCode": 1,
    "LName": "Khvonsar",
    "Name": "??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 313,
    "CountryCode": 1,
    "LName": "Khur",
    "Name": "??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 314,
    "CountryCode": 1,
    "LName": "Konjed Jan",
    "Name": "???????? ??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 315,
    "CountryCode": 1,
    "LName": "Margh-e Kuhestan",
    "Name": "?????? ??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 316,
    "CountryCode": 1,
    "LName": "Mashgan",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 317,
    "CountryCode": 1,
    "LName": "Ma??r",
    "Name": "??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 318,
    "CountryCode": 1,
    "LName": "Meymeh",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 319,
    "CountryCode": 1,
    "LName": "Mehr Gerd",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 320,
    "CountryCode": 1,
    "LName": "Mohammadabad-e Kuzeh Gaz",
    "Name": "???????? ???????? ???????? ????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 321,
    "CountryCode": 1,
    "LName": "Murcheh Khvort",
    "Name": "?????????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 322,
    "CountryCode": 1,
    "LName": "Nain",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 323,
    "CountryCode": 1,
    "LName": "Najafabad",
    "Name": "?????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 324,
    "CountryCode": 1,
    "LName": "Neyestanak",
    "Name": "??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 325,
    "CountryCode": 1,
    "LName": "Ardestan",
    "Name": "??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 326,
    "CountryCode": 1,
    "LName": "Qombavan",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 327,
    "CountryCode": 1,
    "LName": "Qomsheh",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 328,
    "CountryCode": 1,
    "LName": "Aran va BidGol",
    "Name": "???????? ?? ??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 329,
    "CountryCode": 1,
    "LName": "Semirom",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 330,
    "CountryCode": 1,
    "LName": "Asgaran",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 331,
    "CountryCode": 1,
    "LName": "Ashin",
    "Name": "??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 332,
    "CountryCode": 1,
    "LName": "Shahrab",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 334,
    "CountryCode": 1,
    "LName": "Tiran",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 335,
    "CountryCode": 1,
    "LName": "Zavareh",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 336,
    "CountryCode": 1,
    "LName": "Azaran",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 337,
    "CountryCode": 1,
    "LName": "Chadegan",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 338,
    "CountryCode": 1,
    "LName": "Chah-e Malek",
    "Name": "?????? ??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1005,
    "CountryCode": 1,
    "LName": "Baharestan",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1033,
    "CountryCode": 1,
    "LName": "Khorasgan",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1049,
    "CountryCode": 1,
    "LName": "Buin o Miandasht",
    "Name": "?????????? ?? ??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1053,
    "CountryCode": 1,
    "LName": "Zayandeh Rood",
    "Name": "?????? ???????????? ??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1075,
    "CountryCode": 1,
    "LName": "Zarrinshahr",
    "Name": "???????? ??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1083,
    "CountryCode": 1,
    "LName": "Daran",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1088,
    "CountryCode": 1,
    "LName": "Fooladshahr",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1091,
    "CountryCode": 1,
    "LName": "MohsenAbad",
    "Name": "???????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1097,
    "CountryCode": 1,
    "LName": "Nik Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1104,
    "CountryCode": 1,
    "LName": "Dorcheh",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1106,
    "CountryCode": 1,
    "LName": "Sedeh Lenjan",
    "Name": "?????? ??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1108,
    "CountryCode": 1,
    "LName": "Varzaneh",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1112,
    "CountryCode": 1,
    "LName": "Shahreza",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1122,
    "CountryCode": 1,
    "LName": "Dahagh",
    "Name": "??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1123,
    "CountryCode": 1,
    "LName": "Vazvan",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1133,
    "CountryCode": 1,
    "LName": "Chermahin",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1149,
    "CountryCode": 1,
    "LName": "Natanz",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1156,
    "CountryCode": 1,
    "LName": "Qahderijan",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1157,
    "CountryCode": 1,
    "LName": "Felavarjan",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1162,
    "CountryCode": 1,
    "LName": "Fereydun Shahr",
    "Name": "??????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1166,
    "CountryCode": 1,
    "LName": "Noush Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1168,
    "CountryCode": 1,
    "LName": "Hamgin",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1201,
    "CountryCode": 1,
    "LName": "Shahin Shahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1216,
    "CountryCode": 1,
    "LName": "Kuhpayeh",
    "Name": "??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1240,
    "CountryCode": 1,
    "LName": "Farrokhi",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1242,
    "CountryCode": 1,
    "LName": "Afous",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1264,
    "CountryCode": 1,
    "LName": "Joshaqane qali",
    "Name": "???????????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1267,
    "CountryCode": 1,
    "LName": "Pudeh",
    "Name": "???????? ??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1278,
    "CountryCode": 1,
    "LName": "Alavijeh",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1280,
    "CountryCode": 1,
    "LName": "Pir Bakran",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1285,
    "CountryCode": 1,
    "LName": "Toudeshk",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1303,
    "CountryCode": 1,
    "LName": "Talkhooncheh",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1323,
    "CountryCode": 1,
    "LName": "Majlesi",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1329,
    "CountryCode": 1,
    "LName": "Dolatabad",
    "Name": "???????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1368,
    "CountryCode": 1,
    "LName": "Matin Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1378,
    "CountryCode": 1,
    "LName": "Manzariyeh",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1386,
    "CountryCode": 1,
    "LName": "Abrisham",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1427,
    "CountryCode": 1,
    "LName": "Vanak",
    "Name": "??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1429,
    "CountryCode": 1,
    "LName": "Ezhieh",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1439,
    "CountryCode": 1,
    "LName": "Chaghadar",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1509,
    "CountryCode": 1,
    "LName": "Badroud",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1528,
    "CountryCode": 1,
    "LName": "Varnamkhast",
    "Name": "????????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1540,
    "CountryCode": 1,
    "LName": "Nasrabad",
    "Name": "??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1575,
    "CountryCode": 1,
    "LName": "Barf Anbar",
    "Name": "?????? ??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1588,
    "CountryCode": 1,
    "LName": "Harand",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1592,
    "CountryCode": 1,
    "LName": "Rezev",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1631,
    "CountryCode": 1,
    "LName": "Kommeh",
    "Name": "??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1650,
    "CountryCode": 1,
    "LName": "Barzok",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1691,
    "CountryCode": 1,
    "LName": "Chamghordan",
    "Name": "??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1708,
    "CountryCode": 1,
    "LName": "Kelishad",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1735,
    "CountryCode": 1,
    "LName": "Abyaneh",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1761,
    "CountryCode": 1,
    "LName": "Khorzugh",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1804,
    "CountryCode": 1,
    "LName": "Habib Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1820,
    "CountryCode": 1,
    "LName": "Sejzi",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1829,
    "CountryCode": 1,
    "LName": "Dehabad",
    "Name": "???? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1837,
    "CountryCode": 1,
    "LName": "Baghbahadoran",
    "Name": "?????? ??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1838,
    "CountryCode": 1,
    "LName": "Varkan",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1839,
    "CountryCode": 1,
    "LName": "Kofran",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1860,
    "CountryCode": 1,
    "LName": "Afjed",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1871,
    "CountryCode": 1,
    "LName": "Souhrofirozaan",
    "Name": "??????????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1877,
    "CountryCode": 1,
    "LName": "Arisman",
    "Name": "??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1881,
    "CountryCode": 1,
    "LName": "Targhrood",
    "Name": "?????? ??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1918,
    "CountryCode": 1,
    "LName": "Nanadegan",
    "Name": "??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1984,
    "CountryCode": 1,
    "LName": "Sepahan Shahr",
    "Name": "???????????? ??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 1995,
    "CountryCode": 1,
    "LName": "Qamsar",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2018,
    "CountryCode": 1,
    "LName": "Arab abad",
    "Name": "?????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2025,
    "CountryCode": 1,
    "LName": "Golshahr",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2026,
    "CountryCode": 1,
    "LName": "Varzaneh",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2152,
    "CountryCode": 1,
    "LName": "Baghshad",
    "Name": "????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2172,
    "CountryCode": 1,
    "LName": "Mohammad Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2173,
    "CountryCode": 1,
    "LName": "Ganj Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2174,
    "CountryCode": 1,
    "LName": "Sian",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2175,
    "CountryCode": 1,
    "LName": "Javar",
    "Name": "??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2176,
    "CountryCode": 1,
    "LName": "Malvajerd",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2245,
    "CountryCode": 1,
    "LName": "Karizsang",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2294,
    "CountryCode": 1,
    "LName": "Rahmat Abad",
    "Name": "???????? ????????;??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2312,
    "CountryCode": 1,
    "LName": "Peykan",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2474,
    "CountryCode": 1,
    "LName": "Abouzeidabad",
    "Name": "????????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2496,
    "CountryCode": 1,
    "LName": "Kham Pich",
    "Name": "???? ??????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2517,
    "CountryCode": 1,
    "LName": "Qazaan",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2596,
    "CountryCode": 1,
    "LName": "Ravand",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2646,
    "CountryCode": 1,
    "LName": "Zefreh",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2766,
    "CountryCode": 1,
    "LName": "Yazdanshahr",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2822,
    "CountryCode": 1,
    "LName": "Hasur",
    "Name": "????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 2926,
    "CountryCode": 1,
    "LName": "Komshecheh",
    "Name": "??????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 3021,
    "CountryCode": 1,
    "LName": "Natanz Nuclear Facilities",
    "Name": "???????? - ?????????????? ???????? ????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 3041,
    "CountryCode": 1,
    "LName": "Rezvanshahr",
    "Name": "????????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 3156,
    "CountryCode": 1,
    "LName": "Vila Shahr",
    "Name": "??????????????",
    "ProvinceCode": 8,
    "Type": "N"
  },
  {
    "Code": 5,
    "CountryCode": 1,
    "LName": "Ahvaz",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "S"
  },
  {
    "Code": 340,
    "CountryCode": 1,
    "LName": "Dasht-e Azadegan",
    "Name": "?????? ??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 341,
    "CountryCode": 1,
    "LName": "Dasht-e Lali",
    "Name": "?????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 342,
    "CountryCode": 1,
    "LName": "Dezful",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 343,
    "CountryCode": 1,
    "LName": "Sheyban",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 344,
    "CountryCode": 1,
    "LName": "Gatvand",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 345,
    "CountryCode": 1,
    "LName": "Ramshir",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 346,
    "CountryCode": 1,
    "LName": "Guriyeh",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 347,
    "CountryCode": 1,
    "LName": "Haft Gel",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 348,
    "CountryCode": 1,
    "LName": "Bandar Imam Khomeyni",
    "Name": "???????? ???????? ??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 349,
    "CountryCode": 1,
    "LName": "Hamidiyeh",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 350,
    "CountryCode": 1,
    "LName": "Agha Jari",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 351,
    "CountryCode": 1,
    "LName": "Hendijan",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 352,
    "CountryCode": 1,
    "LName": "Bandar Mahshahr",
    "Name": "???????? ????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 353,
    "CountryCode": 1,
    "LName": "Hoveyzeh",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 354,
    "CountryCode": 1,
    "LName": "Izeh",
    "Name": "????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 355,
    "CountryCode": 1,
    "LName": "J??leki",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 356,
    "CountryCode": 1,
    "LName": "Khorramshahr",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 357,
    "CountryCode": 1,
    "LName": "Khosrowabad",
    "Name": "???????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 358,
    "CountryCode": 1,
    "LName": "Mollasani",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 359,
    "CountryCode": 1,
    "LName": "Kut",
    "Name": "??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 360,
    "CountryCode": 1,
    "LName": "Doroud",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 361,
    "CountryCode": 1,
    "LName": "Mansureh",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 362,
    "CountryCode": 1,
    "LName": "Mar Bachcheh",
    "Name": "???? ??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 363,
    "CountryCode": 1,
    "LName": "Behbahan",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 364,
    "CountryCode": 1,
    "LName": "Masjed Soleyman",
    "Name": "???????? ????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 365,
    "CountryCode": 1,
    "LName": "Mazra'eh",
    "Name": "?????????? ????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 366,
    "CountryCode": 1,
    "LName": "Naft-e Sefid",
    "Name": "?????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 367,
    "CountryCode": 1,
    "LName": "Arab Hasan",
    "Name": "?????? ??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 368,
    "CountryCode": 1,
    "LName": "Omidiyeh-ye Sofla",
    "Name": "???????????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 369,
    "CountryCode": 1,
    "LName": "Qafas",
    "Name": "??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 370,
    "CountryCode": 1,
    "LName": "Qajariyeh Yek",
    "Name": "?????????????? ????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 371,
    "CountryCode": 1,
    "LName": "Lali",
    "Name": "????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 372,
    "CountryCode": 1,
    "LName": "Arvand kenar",
    "Name": "?????????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 373,
    "CountryCode": 1,
    "LName": "Ramhormoz",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 374,
    "CountryCode": 1,
    "LName": "Bid Zard",
    "Name": "?????? ??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 375,
    "CountryCode": 1,
    "LName": "Rashnudi",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 376,
    "CountryCode": 1,
    "LName": "Sar Dasht",
    "Name": "???? ??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 377,
    "CountryCode": 1,
    "LName": "Dehdasht",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 378,
    "CountryCode": 1,
    "LName": "Shadegan",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 379,
    "CountryCode": 1,
    "LName": "Lendeh",
    "Name": "????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 381,
    "CountryCode": 1,
    "LName": "Shush",
    "Name": "??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 382,
    "CountryCode": 1,
    "LName": "Shushtar",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 383,
    "CountryCode": 1,
    "LName": "Susangerd",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 384,
    "CountryCode": 1,
    "LName": "Ghale tol",
    "Name": "???????? ????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 385,
    "CountryCode": 1,
    "LName": "Sar Bandar",
    "Name": "???? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 386,
    "CountryCode": 1,
    "LName": "Toveh",
    "Name": "??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 387,
    "CountryCode": 1,
    "LName": "Dehdez",
    "Name": "????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 388,
    "CountryCode": 1,
    "LName": "Lordegan",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 389,
    "CountryCode": 1,
    "LName": "Veys",
    "Name": "??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 390,
    "CountryCode": 1,
    "LName": "Bagh-e Malek",
    "Name": "?????? ??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 391,
    "CountryCode": 1,
    "LName": "Abadan",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 392,
    "CountryCode": 1,
    "LName": "Bandar deylam",
    "Name": "???????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 879,
    "CountryCode": 1,
    "LName": "Band-e Shovar",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 969,
    "CountryCode": 1,
    "LName": "Andimeshk",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1037,
    "CountryCode": 1,
    "LName": "Al-Khorshid",
    "Name": "???? ????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1079,
    "CountryCode": 1,
    "LName": "Dezab",
    "Name": "????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1119,
    "CountryCode": 1,
    "LName": "Hamzeh",
    "Name": "????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1211,
    "CountryCode": 1,
    "LName": "Mian kuh",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1258,
    "CountryCode": 1,
    "LName": "Hoseyniyae",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1260,
    "CountryCode": 1,
    "LName": "Chamgolak",
    "Name": "???? ??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1312,
    "CountryCode": 1,
    "LName": "Mianrood",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1321,
    "CountryCode": 1,
    "LName": "Darkhovin",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1360,
    "CountryCode": 1,
    "LName": "Bidroubeh",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1415,
    "CountryCode": 1,
    "LName": "Bonar-e-Vajel",
    "Name": "???????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1562,
    "CountryCode": 1,
    "LName": "Omidiyeh",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1629,
    "CountryCode": 1,
    "LName": "Eslam Abad",
    "Name": "?????????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1744,
    "CountryCode": 1,
    "LName": "Chamran Town",
    "Name": "???????? ??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1807,
    "CountryCode": 1,
    "LName": "Emam",
    "Name": "?????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1824,
    "CountryCode": 1,
    "LName": "Barangerd",
    "Name": "????????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1851,
    "CountryCode": 1,
    "LName": "Haft Tapeh",
    "Name": "?????? ??????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1858,
    "CountryCode": 1,
    "LName": "Torkalaki",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 1916,
    "CountryCode": 1,
    "LName": "Zebashahr",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2192,
    "CountryCode": 1,
    "LName": "CAMP CNPC-PEDEC",
    "Name": "?????? ?????????????? ??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2307,
    "CountryCode": 1,
    "LName": "Behrooz Alley",
    "Name": "???????????? - ?????? ??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2483,
    "CountryCode": 1,
    "LName": "Darvish Padegan",
    "Name": "???????????? ??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2564,
    "CountryCode": 1,
    "LName": "Jazireh Minoo",
    "Name": "?????????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2800,
    "CountryCode": 1,
    "LName": "Sherafat",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2841,
    "CountryCode": 1,
    "LName": "Shabisheh",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2940,
    "CountryCode": 1,
    "LName": "Horijeh",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 2996,
    "CountryCode": 1,
    "LName": "Rofayye",
    "Name": "????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3030,
    "CountryCode": 1,
    "LName": "Gheyzaniyeh",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3087,
    "CountryCode": 1,
    "LName": "Mohajerin",
    "Name": "??????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3169,
    "CountryCode": 1,
    "LName": "Koushkak",
    "Name": "??????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3170,
    "CountryCode": 1,
    "LName": "Jannat Makan",
    "Name": "?????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3210,
    "CountryCode": 1,
    "LName": "Khovis",
    "Name": "????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3219,
    "CountryCode": 1,
    "LName": "Hossein Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 3266,
    "CountryCode": 1,
    "LName": "Manuohi",
    "Name": "????????????",
    "ProvinceCode": 9,
    "Type": "N"
  },
  {
    "Code": 29,
    "CountryCode": 1,
    "LName": "Ilam",
    "Name": "??????????",
    "ProvinceCode": 10,
    "Type": "S"
  },
  {
    "Code": 393,
    "CountryCode": 1,
    "LName": "Dehloran",
    "Name": "????????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 394,
    "CountryCode": 1,
    "LName": "Ivan",
    "Name": "??????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 395,
    "CountryCode": 1,
    "LName": "Delgosha",
    "Name": "??????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 396,
    "CountryCode": 1,
    "LName": "Mehran",
    "Name": "??????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 397,
    "CountryCode": 1,
    "LName": "Qal'eh Darreh",
    "Name": "???????? ??????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 398,
    "CountryCode": 1,
    "LName": "Darre Shahr",
    "Name": "?????? ??????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 399,
    "CountryCode": 1,
    "LName": "Shirvan",
    "Name": "????????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1002,
    "CountryCode": 1,
    "LName": "Abdanan",
    "Name": "??????????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1174,
    "CountryCode": 1,
    "LName": "Talkhab",
    "Name": "??????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1275,
    "CountryCode": 1,
    "LName": "Sarableh",
    "Name": "????????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1287,
    "CountryCode": 1,
    "LName": "Cheshme Shirin",
    "Name": "???????? ??????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1355,
    "CountryCode": 1,
    "LName": "Badre",
    "Name": "????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1430,
    "CountryCode": 1,
    "LName": "Chovar",
    "Name": "????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1471,
    "CountryCode": 1,
    "LName": "Abdanan",
    "Name": "??????????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1491,
    "CountryCode": 1,
    "LName": "zayd",
    "Name": "??????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1622,
    "CountryCode": 1,
    "LName": "Pahle",
    "Name": "????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1705,
    "CountryCode": 1,
    "LName": "Kahreh",
    "Name": "????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1734,
    "CountryCode": 1,
    "LName": "Mormori",
    "Name": "??????????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1743,
    "CountryCode": 1,
    "LName": "Dasht Abbas",
    "Name": "?????? ????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1797,
    "CountryCode": 1,
    "LName": "Mousiyan",
    "Name": "????????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1888,
    "CountryCode": 1,
    "LName": "Aseman Abad",
    "Name": "?????????? ????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1970,
    "CountryCode": 1,
    "LName": "GachKuban",
    "Name": "???? ??????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 1977,
    "CountryCode": 1,
    "LName": "Zarangush",
    "Name": "??????????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 2039,
    "CountryCode": 1,
    "LName": "Shahrak-e Valiasr",
    "Name": "???????? ????????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 2073,
    "CountryCode": 1,
    "LName": "Cheshmeh Khosh",
    "Name": "???????? ??????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 2366,
    "CountryCode": 1,
    "LName": "Malekshahi",
    "Name": "??????????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 3166,
    "CountryCode": 1,
    "LName": "Saleh Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 10,
    "Type": "N"
  },
  {
    "Code": 20,
    "CountryCode": 1,
    "LName": "Boshehr",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "S"
  },
  {
    "Code": 400,
    "CountryCode": 1,
    "LName": "Deyyer",
    "Name": "??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 401,
    "CountryCode": 1,
    "LName": "Akhtar",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 402,
    "CountryCode": 1,
    "LName": "Delvar",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 403,
    "CountryCode": 1,
    "LName": "Shiff",
    "Name": "??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 404,
    "CountryCode": 1,
    "LName": "Bandar-e Deylam",
    "Name": "???????? ????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 405,
    "CountryCode": 1,
    "LName": "Bandar Rostami",
    "Name": "???????? ??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 406,
    "CountryCode": 1,
    "LName": "Ganaveh",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 407,
    "CountryCode": 1,
    "LName": "Gorbeh'i",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 408,
    "CountryCode": 1,
    "LName": "Nirugah Atomi",
    "Name": "?????????????? ???????? ??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 409,
    "CountryCode": 1,
    "LName": "Bandar-e Rig",
    "Name": "???????? ??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 410,
    "CountryCode": 1,
    "LName": "Jam",
    "Name": "????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 411,
    "CountryCode": 1,
    "LName": "Kaki",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 412,
    "CountryCode": 1,
    "LName": "Kalmeh",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 413,
    "CountryCode": 1,
    "LName": "Kangan",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 414,
    "CountryCode": 1,
    "LName": "Karri",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 415,
    "CountryCode": 1,
    "LName": "Bang",
    "Name": "??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 416,
    "CountryCode": 1,
    "LName": "Khormoj",
    "Name": "????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 417,
    "CountryCode": 1,
    "LName": "Baduleh",
    "Name": "????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 418,
    "CountryCode": 1,
    "LName": "Babakalan",
    "Name": "????????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 419,
    "CountryCode": 1,
    "LName": "Tashan",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 420,
    "CountryCode": 1,
    "LName": "Mokaberi",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 421,
    "CountryCode": 1,
    "LName": "Nay Band",
    "Name": "???? ??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 422,
    "CountryCode": 1,
    "LName": "Talkhu",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 423,
    "CountryCode": 1,
    "LName": "Riz",
    "Name": "??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 424,
    "CountryCode": 1,
    "LName": "Sa'dabad",
    "Name": "?????? ????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 425,
    "CountryCode": 1,
    "LName": "Sar Mashhad",
    "Name": "???? ????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 426,
    "CountryCode": 1,
    "LName": "Shanbeh",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 427,
    "CountryCode": 1,
    "LName": "Abad",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 428,
    "CountryCode": 1,
    "LName": "Borazjan",
    "Name": "??????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 429,
    "CountryCode": 1,
    "LName": "TavilDaraz",
    "Name": "???????? ????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 430,
    "CountryCode": 1,
    "LName": "Taheri",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 431,
    "CountryCode": 1,
    "LName": "Tang-e Eram",
    "Name": "???????? ??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 432,
    "CountryCode": 1,
    "LName": "Tonbak",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 433,
    "CountryCode": 1,
    "LName": "Bushehr (Bushire)",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 434,
    "CountryCode": 1,
    "LName": "Zeydan",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 435,
    "CountryCode": 1,
    "LName": "B??shgan",
    "Name": "????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 437,
    "CountryCode": 1,
    "LName": "Khesht",
    "Name": "??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 438,
    "CountryCode": 1,
    "LName": "Chahar R??sta'i",
    "Name": "???????? ??????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 439,
    "CountryCode": 1,
    "LName": "Ahmadi",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 440,
    "CountryCode": 1,
    "LName": "Ahram",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 441,
    "CountryCode": 1,
    "LName": "Dalaki",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1020,
    "CountryCode": 1,
    "LName": "Ab pakhsh",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1029,
    "CountryCode": 1,
    "LName": "Asaloyeh",
    "Name": "????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1235,
    "CountryCode": 1,
    "LName": "Shabankareh",
    "Name": "????????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1293,
    "CountryCode": 1,
    "LName": "Vahdatiyeh",
    "Name": "????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1322,
    "CountryCode": 1,
    "LName": "Abdan",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1334,
    "CountryCode": 1,
    "LName": "Banood",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1335,
    "CountryCode": 1,
    "LName": "Chah Mobarak",
    "Name": "?????? ??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1346,
    "CountryCode": 1,
    "LName": "Ali Hoseyni",
    "Name": "???????? ????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1354,
    "CountryCode": 1,
    "LName": "Hesar",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1380,
    "CountryCode": 1,
    "LName": "Bandar Emam Hasan",
    "Name": "???????? ???????? ??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1410,
    "CountryCode": 1,
    "LName": "Baghak-e Shomali",
    "Name": "???????? ??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1413,
    "CountryCode": 1,
    "LName": "Baghak-e Jonubi",
    "Name": "???????? ??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1446,
    "CountryCode": 1,
    "LName": "Khourshahab",
    "Name": "??????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1487,
    "CountryCode": 1,
    "LName": "Kharg",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1682,
    "CountryCode": 1,
    "LName": "Charak",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1758,
    "CountryCode": 1,
    "LName": "Shirinoo",
    "Name": "????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1806,
    "CountryCode": 1,
    "LName": "Shahniya",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1870,
    "CountryCode": 1,
    "LName": "Anarestan",
    "Name": "????????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1896,
    "CountryCode": 1,
    "LName": "Banak",
    "Name": "??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1898,
    "CountryCode": 1,
    "LName": "Alishahr",
    "Name": "??????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1907,
    "CountryCode": 1,
    "LName": "Bidkhoon",
    "Name": "????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1920,
    "CountryCode": 1,
    "LName": "Dorahak",
    "Name": "????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1979,
    "CountryCode": 1,
    "LName": "Nazaragha",
    "Name": "????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 1998,
    "CountryCode": 1,
    "LName": "BordKhun",
    "Name": "????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2043,
    "CountryCode": 1,
    "LName": "Shureki",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2353,
    "CountryCode": 1,
    "LName": "Choghadak",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2363,
    "CountryCode": 1,
    "LName": "Sarmal",
    "Name": "????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2461,
    "CountryCode": 1,
    "LName": "Siraf",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2500,
    "CountryCode": 1,
    "LName": "Chavoshi",
    "Name": "??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2617,
    "CountryCode": 1,
    "LName": "Bardestan",
    "Name": "??????????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 2848,
    "CountryCode": 1,
    "LName": "Nakhl Taghi",
    "Name": "?????? ??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 3066,
    "CountryCode": 1,
    "LName": "Gorak Dejhgah",
    "Name": "???????? ??????????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 3125,
    "CountryCode": 1,
    "LName": "Sana",
    "Name": "??????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 3158,
    "CountryCode": 1,
    "LName": "Boneh Gez",
    "Name": "?????? ????",
    "ProvinceCode": 11,
    "Type": "N"
  },
  {
    "Code": 6,
    "CountryCode": 1,
    "LName": "Tabriz",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "S"
  },
  {
    "Code": 283,
    "CountryCode": 1,
    "LName": "Malekan",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 442,
    "CountryCode": 1,
    "LName": "Ajab Shir",
    "Name": "?????? ??????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 443,
    "CountryCode": 1,
    "LName": "hadishahr",
    "Name": "??????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 444,
    "CountryCode": 1,
    "LName": "Duzduzan",
    "Name": "?????? ??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 445,
    "CountryCode": 1,
    "LName": "Ghilmansaray",
    "Name": "????????????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 446,
    "CountryCode": 1,
    "LName": "Tasuj",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 447,
    "CountryCode": 1,
    "LName": "Almas (Almasi)",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 448,
    "CountryCode": 1,
    "LName": "Khvajeh",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 450,
    "CountryCode": 1,
    "LName": "Marand",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 453,
    "CountryCode": 1,
    "LName": "Mianeh",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 454,
    "CountryCode": 1,
    "LName": "Bonab",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 456,
    "CountryCode": 1,
    "LName": "Aralan",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 458,
    "CountryCode": 1,
    "LName": "Arbatan",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 459,
    "CountryCode": 1,
    "LName": "Sarab",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 460,
    "CountryCode": 1,
    "LName": "Bishak",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 462,
    "CountryCode": 1,
    "LName": "Tark",
    "Name": "??????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 463,
    "CountryCode": 1,
    "LName": "Tarzam",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 464,
    "CountryCode": 1,
    "LName": "Tazeh Kand",
    "Name": "???????? ??????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 465,
    "CountryCode": 1,
    "LName": "Yekan Kahriz-e Bala",
    "Name": "???????? ??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 466,
    "CountryCode": 1,
    "LName": "Avergan",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 468,
    "CountryCode": 1,
    "LName": "Arlan",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 469,
    "CountryCode": 1,
    "LName": "Ba??h e Vazir (Bagh-e Vazir)",
    "Name": "?????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 474,
    "CountryCode": 1,
    "LName": "Hurand",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 695,
    "CountryCode": 1,
    "LName": "Kharvana",
    "Name": "??????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 871,
    "CountryCode": 1,
    "LName": "Nordooz",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 993,
    "CountryCode": 1,
    "LName": "Ahar",
    "Name": "??????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1003,
    "CountryCode": 1,
    "LName": "Jolfa",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1014,
    "CountryCode": 1,
    "LName": "Maragheh",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1015,
    "CountryCode": 1,
    "LName": "Azarshahr",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1016,
    "CountryCode": 1,
    "LName": "Mamaghan",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1022,
    "CountryCode": 1,
    "LName": "Bostan Abad",
    "Name": "?????????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1027,
    "CountryCode": 1,
    "LName": "Shabestar",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1032,
    "CountryCode": 1,
    "LName": "Eiri Sofla",
    "Name": "???????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1055,
    "CountryCode": 1,
    "LName": "Kaleybar",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1057,
    "CountryCode": 1,
    "LName": "Bakhshayesh",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1066,
    "CountryCode": 1,
    "LName": "Hashtrood",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1082,
    "CountryCode": 1,
    "LName": "Leilan",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1100,
    "CountryCode": 1,
    "LName": "Sahand",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1124,
    "CountryCode": 1,
    "LName": "Heris",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1126,
    "CountryCode": 1,
    "LName": "Osku",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1139,
    "CountryCode": 1,
    "LName": "varzeqan",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1175,
    "CountryCode": 1,
    "LName": "Daryan",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1212,
    "CountryCode": 1,
    "LName": "Mehraban",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1218,
    "CountryCode": 1,
    "LName": "Zonouz",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1307,
    "CountryCode": 1,
    "LName": "Qareaghaj",
    "Name": "?????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1311,
    "CountryCode": 1,
    "LName": "Koshksaray",
    "Name": "??????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1349,
    "CountryCode": 1,
    "LName": "Nir",
    "Name": "??????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1370,
    "CountryCode": 1,
    "LName": "Homatoyor Marand",
    "Name": "?????????????? ?????????????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1407,
    "CountryCode": 1,
    "LName": "Sis",
    "Name": "??????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1492,
    "CountryCode": 1,
    "LName": "khameneh",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1496,
    "CountryCode": 1,
    "LName": "Sharafkhaneh",
    "Name": "??????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1501,
    "CountryCode": 1,
    "LName": "Kalvanaq",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1520,
    "CountryCode": 1,
    "LName": "Ilkhchi",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1544,
    "CountryCode": 1,
    "LName": "Yamchi",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1554,
    "CountryCode": 1,
    "LName": "Kozeh Kanan",
    "Name": "???????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1556,
    "CountryCode": 1,
    "LName": "Aqkend",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1566,
    "CountryCode": 1,
    "LName": "Khomarloo",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1599,
    "CountryCode": 1,
    "LName": "Soufian",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1624,
    "CountryCode": 1,
    "LName": "Bandr Trkman",
    "Name": "???????? ??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1636,
    "CountryCode": 1,
    "LName": "Sard Rood",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1685,
    "CountryCode": 1,
    "LName": "Roveshte Bozorg",
    "Name": "???????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1695,
    "CountryCode": 1,
    "LName": "Beris",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1704,
    "CountryCode": 1,
    "LName": "Sharabian",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1711,
    "CountryCode": 1,
    "LName": "Mayan sofla",
    "Name": "?????????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1712,
    "CountryCode": 1,
    "LName": "Tabl",
    "Name": "??????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1724,
    "CountryCode": 1,
    "LName": "Shand Abad",
    "Name": "??????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1763,
    "CountryCode": 1,
    "LName": "Achachi",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1788,
    "CountryCode": 1,
    "LName": "Gogan",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1800,
    "CountryCode": 1,
    "LName": "Yekan-e Olya",
    "Name": "???????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1801,
    "CountryCode": 1,
    "LName": "Yekan-e Kahriz",
    "Name": "???????? ??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1803,
    "CountryCode": 1,
    "LName": "Sefidkamar",
    "Name": "??????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1861,
    "CountryCode": 1,
    "LName": "Khelejan",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1869,
    "CountryCode": 1,
    "LName": "Satllo",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1889,
    "CountryCode": 1,
    "LName": "Khosroshah",
    "Name": "??????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1914,
    "CountryCode": 1,
    "LName": "Teymourlou",
    "Name": "??????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 1949,
    "CountryCode": 1,
    "LName": "Zarnagh",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2062,
    "CountryCode": 1,
    "LName": "Basmenj",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2284,
    "CountryCode": 1,
    "LName": "Hormuz Island",
    "Name": "?????????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2540,
    "CountryCode": 1,
    "LName": "Kondroud",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2544,
    "CountryCode": 1,
    "LName": "Turkamanchay",
    "Name": "????????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2545,
    "CountryCode": 1,
    "LName": "Kish - Dehkadeh Saheli",
    "Name": "?????? - ?????????? ??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2605,
    "CountryCode": 1,
    "LName": "Andaryan",
    "Name": "??????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2792,
    "CountryCode": 1,
    "LName": "Miab",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2975,
    "CountryCode": 1,
    "LName": "Qazi Jahan",
    "Name": "???????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 2979,
    "CountryCode": 1,
    "LName": "Mobarakshahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 3100,
    "CountryCode": 1,
    "LName": "Harzand-e Jadid",
    "Name": "?????????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 3124,
    "CountryCode": 1,
    "LName": "Arbatan",
    "Name": "????????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 3163,
    "CountryCode": 1,
    "LName": "Nasir Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 3224,
    "CountryCode": 1,
    "LName": "Korjan",
    "Name": "??????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 3262,
    "CountryCode": 1,
    "LName": "Beyraq",
    "Name": "????????",
    "ProvinceCode": 12,
    "Type": "N"
  },
  {
    "Code": 30,
    "CountryCode": 1,
    "LName": "Khorramabad",
    "Name": "?????? ????????",
    "ProvinceCode": 13,
    "Type": "S"
  },
  {
    "Code": 287,
    "CountryCode": 1,
    "LName": "Ezna",
    "Name": "????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 471,
    "CountryCode": 1,
    "LName": "Do Rud",
    "Name": "??????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 472,
    "CountryCode": 1,
    "LName": "Alashtar",
    "Name": "??????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 473,
    "CountryCode": 1,
    "LName": "Aligudarz",
    "Name": "????????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 475,
    "CountryCode": 1,
    "LName": "Kuhdasht",
    "Name": "????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 476,
    "CountryCode": 1,
    "LName": "Razan",
    "Name": "??????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 477,
    "CountryCode": 1,
    "LName": "Oshtorinan",
    "Name": "????????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 478,
    "CountryCode": 1,
    "LName": "Heshmatabad",
    "Name": "???????? ????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 479,
    "CountryCode": 1,
    "LName": "Borujerd",
    "Name": "????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 480,
    "CountryCode": 1,
    "LName": "Chaman Soltan",
    "Name": "?????? ??????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 828,
    "CountryCode": 1,
    "LName": "Kohnani",
    "Name": "??????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 973,
    "CountryCode": 1,
    "LName": "Nourabad",
    "Name": "??????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 996,
    "CountryCode": 1,
    "LName": "pol-dokhtar",
    "Name": "???? ????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1080,
    "CountryCode": 1,
    "LName": "Aleshtar",
    "Name": "??????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1272,
    "CountryCode": 1,
    "LName": "Cheghabal",
    "Name": "??????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1294,
    "CountryCode": 1,
    "LName": "Delfan",
    "Name": "??????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1343,
    "CountryCode": 1,
    "LName": "Romeshgan",
    "Name": "??????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1561,
    "CountryCode": 1,
    "LName": "Mamulan",
    "Name": "??????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1576,
    "CountryCode": 1,
    "LName": "Murani",
    "Name": "????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1805,
    "CountryCode": 1,
    "LName": "Karm Bak Mahmodvand",
    "Name": "?????? ???? ????????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 1999,
    "CountryCode": 1,
    "LName": "Sepid Dasht",
    "Name": "??????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2022,
    "CountryCode": 1,
    "LName": "Gavbar",
    "Name": "????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2048,
    "CountryCode": 1,
    "LName": "Sarab Dowreh",
    "Name": "???????? ????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2129,
    "CountryCode": 1,
    "LName": "Gale shamsi",
    "Name": "???????? ????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2166,
    "CountryCode": 1,
    "LName": "Kumas",
    "Name": "??????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2426,
    "CountryCode": 1,
    "LName": "Sarab-e Honam",
    "Name": "???????? ????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2756,
    "CountryCode": 1,
    "LName": "Garab",
    "Name": "????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2904,
    "CountryCode": 1,
    "LName": "Gorji",
    "Name": "????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 2992,
    "CountryCode": 1,
    "LName": "Jahan Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 3054,
    "CountryCode": 1,
    "LName": "Darb Gonbad",
    "Name": "?????? ????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 3174,
    "CountryCode": 1,
    "LName": "Veysian",
    "Name": "????????????",
    "ProvinceCode": 13,
    "Type": "N"
  },
  {
    "Code": 16,
    "CountryCode": 1,
    "LName": "Rasht",
    "Name": "??????",
    "ProvinceCode": 14,
    "Type": "S"
  },
  {
    "Code": 481,
    "CountryCode": 1,
    "LName": "Bandar-e Anzali",
    "Name": "???????? ??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 482,
    "CountryCode": 1,
    "LName": "Fuman",
    "Name": "????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 483,
    "CountryCode": 1,
    "LName": "Gatgesar",
    "Name": "????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 484,
    "CountryCode": 1,
    "LName": "Aliabad",
    "Name": "?????? ????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 485,
    "CountryCode": 1,
    "LName": "Talesh",
    "Name": "????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 486,
    "CountryCode": 1,
    "LName": "Khoman",
    "Name": "????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 487,
    "CountryCode": 1,
    "LName": "Kuchesfahan",
    "Name": "????????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 488,
    "CountryCode": 1,
    "LName": "Kopur Chal",
    "Name": "??????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 489,
    "CountryCode": 1,
    "LName": "Langar??d",
    "Name": "????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 490,
    "CountryCode": 1,
    "LName": "Lahijan",
    "Name": "??????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 491,
    "CountryCode": 1,
    "LName": "Astara",
    "Name": "????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 492,
    "CountryCode": 1,
    "LName": "Manjil",
    "Name": "??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 493,
    "CountryCode": 1,
    "LName": "Rahimabad",
    "Name": "???????? ????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 494,
    "CountryCode": 1,
    "LName": "Koshkebijar",
    "Name": "????????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 495,
    "CountryCode": 1,
    "LName": "Rudsar (Rud Sar)",
    "Name": "??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 496,
    "CountryCode": 1,
    "LName": "Shaft",
    "Name": "??????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 497,
    "CountryCode": 1,
    "LName": "Shirabad",
    "Name": "??????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 498,
    "CountryCode": 1,
    "LName": "Sowma'eh Sara",
    "Name": "?????????? ??????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 499,
    "CountryCode": 1,
    "LName": "Astaneh",
    "Name": "????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1102,
    "CountryCode": 1,
    "LName": "Roodbar",
    "Name": "????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1141,
    "CountryCode": 1,
    "LName": "Ramsar",
    "Name": "??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1256,
    "CountryCode": 1,
    "LName": "Masal",
    "Name": "??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1268,
    "CountryCode": 1,
    "LName": "Vajargah",
    "Name": "????????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1282,
    "CountryCode": 1,
    "LName": "Rezvanshahr",
    "Name": "????????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1319,
    "CountryCode": 1,
    "LName": "Amlash",
    "Name": "????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1465,
    "CountryCode": 1,
    "LName": "Lasht e nesha",
    "Name": "?????? ??????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1484,
    "CountryCode": 1,
    "LName": "Shanderman",
    "Name": "??????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1503,
    "CountryCode": 1,
    "LName": "Paresar",
    "Name": "?????? ????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1555,
    "CountryCode": 1,
    "LName": "Taher Gorab",
    "Name": "??????????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1580,
    "CountryCode": 1,
    "LName": "Kelachay",
    "Name": "????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1587,
    "CountryCode": 1,
    "LName": "Lowshan",
    "Name": "??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1673,
    "CountryCode": 1,
    "LName": "Chamkhaleh",
    "Name": "????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1693,
    "CountryCode": 1,
    "LName": "Jirandeh",
    "Name": "????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1722,
    "CountryCode": 1,
    "LName": "Haji Bekande",
    "Name": "???????? ??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1723,
    "CountryCode": 1,
    "LName": "Nooshar",
    "Name": "????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1782,
    "CountryCode": 1,
    "LName": "Asalam",
    "Name": "??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1859,
    "CountryCode": 1,
    "LName": "Zibakenar",
    "Name": "????????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1867,
    "CountryCode": 1,
    "LName": "Havigh",
    "Name": "????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1915,
    "CountryCode": 1,
    "LName": "Shahrak-e Mehr",
    "Name": "???????? ?????? ??????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1932,
    "CountryCode": 1,
    "LName": "Chaboksar",
    "Name": "????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1950,
    "CountryCode": 1,
    "LName": "Rostamabad",
    "Name": "???????? ????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1972,
    "CountryCode": 1,
    "LName": "Gafsheh",
    "Name": "????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 1978,
    "CountryCode": 1,
    "LName": "Sangar",
    "Name": "????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 2125,
    "CountryCode": 1,
    "LName": "Siahkal",
    "Name": "????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 2436,
    "CountryCode": 1,
    "LName": "Ziabar",
    "Name": "??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 2740,
    "CountryCode": 1,
    "LName": "Gurab Zarmikh",
    "Name": "?????????? ??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 2743,
    "CountryCode": 1,
    "LName": "Tutkabon",
    "Name": "??????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 2886,
    "CountryCode": 1,
    "LName": "Hasan Rud",
    "Name": "?????? ??????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 3202,
    "CountryCode": 1,
    "LName": "Fashtakeh",
    "Name": "??????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 3260,
    "CountryCode": 1,
    "LName": "Louleman",
    "Name": "????????????",
    "ProvinceCode": 14,
    "Type": "N"
  },
  {
    "Code": 25,
    "CountryCode": 1,
    "LName": "Zanjan",
    "Name": "??????????",
    "ProvinceCode": 15,
    "Type": "S"
  },
  {
    "Code": 501,
    "CountryCode": 1,
    "LName": "Do Tappeh-ye Pa'in",
    "Name": "???? ?????? ????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 502,
    "CountryCode": 1,
    "LName": "Garmab",
    "Name": "??????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 503,
    "CountryCode": 1,
    "LName": "Gheydar",
    "Name": "??????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 504,
    "CountryCode": 1,
    "LName": "Khorramdareh",
    "Name": "?????? ??????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 505,
    "CountryCode": 1,
    "LName": "Sohrevard",
    "Name": "????????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 508,
    "CountryCode": 1,
    "LName": "Armaghan Khaneh",
    "Name": "????????????????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 510,
    "CountryCode": 1,
    "LName": "Sha'ban",
    "Name": "??????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 511,
    "CountryCode": 1,
    "LName": "Soltaniyeh",
    "Name": "??????????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 512,
    "CountryCode": 1,
    "LName": "Sa'in Qal'eh",
    "Name": "?????????? ????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 517,
    "CountryCode": 1,
    "LName": "Abhar",
    "Name": "????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 518,
    "CountryCode": 1,
    "LName": "Ab Bar",
    "Name": "???? ????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 845,
    "CountryCode": 1,
    "LName": "Kheir Abad",
    "Name": "??????????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1072,
    "CountryCode": 1,
    "LName": "Sojas",
    "Name": "????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1113,
    "CountryCode": 1,
    "LName": "Mahneshan",
    "Name": "??????????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1217,
    "CountryCode": 1,
    "LName": "Karasf",
    "Name": "????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1291,
    "CountryCode": 1,
    "LName": "Chavarzaq",
    "Name": "??????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1292,
    "CountryCode": 1,
    "LName": "Hidaj",
    "Name": "????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1297,
    "CountryCode": 1,
    "LName": "Zrinron",
    "Name": "???????? ??????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1338,
    "CountryCode": 1,
    "LName": "KhorramDarreh",
    "Name": "????????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1357,
    "CountryCode": 1,
    "LName": "Sheet",
    "Name": "??????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1366,
    "CountryCode": 1,
    "LName": "Mollabodagh",
    "Name": "??????????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1367,
    "CountryCode": 1,
    "LName": "Moshampa",
    "Name": "??????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1383,
    "CountryCode": 1,
    "LName": "Dandi",
    "Name": "????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1436,
    "CountryCode": 1,
    "LName": "Halab",
    "Name": "??????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1480,
    "CountryCode": 1,
    "LName": "Zarrin Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1597,
    "CountryCode": 1,
    "LName": "Takht",
    "Name": "??????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1632,
    "CountryCode": 1,
    "LName": "Pari",
    "Name": "??????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1643,
    "CountryCode": 1,
    "LName": "Nourbahar",
    "Name": "??????????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 1822,
    "CountryCode": 1,
    "LName": "Kabud Cheshmeh",
    "Name": "????????????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 2034,
    "CountryCode": 1,
    "LName": "Viyar",
    "Name": "??????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 2132,
    "CountryCode": 1,
    "LName": "Yusefabad",
    "Name": "???????? ????????",
    "ProvinceCode": 15,
    "Type": "N"
  },
  {
    "Code": 12,
    "CountryCode": 1,
    "LName": "Zahedan",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "S"
  },
  {
    "Code": 519,
    "CountryCode": 1,
    "LName": "Pishin",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 520,
    "CountryCode": 1,
    "LName": "Bampur",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 521,
    "CountryCode": 1,
    "LName": "Davar Panah",
    "Name": "???????? ????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 522,
    "CountryCode": 1,
    "LName": "Dehak",
    "Name": "??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 523,
    "CountryCode": 1,
    "LName": "Saravan",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 524,
    "CountryCode": 1,
    "LName": "Zahak",
    "Name": "??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 525,
    "CountryCode": 1,
    "LName": "Bandar Beheshti",
    "Name": "???????? ??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 526,
    "CountryCode": 1,
    "LName": "Dumak",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 527,
    "CountryCode": 1,
    "LName": "Esfandak",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 528,
    "CountryCode": 1,
    "LName": "Eskelabad",
    "Name": "???????? ????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 529,
    "CountryCode": 1,
    "LName": "Firuzabad",
    "Name": "?????????? ????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 530,
    "CountryCode": 1,
    "LName": "Gavater",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 531,
    "CountryCode": 1,
    "LName": "Girdi",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 532,
    "CountryCode": 1,
    "LName": "Gombaki",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 533,
    "CountryCode": 1,
    "LName": "Gorg",
    "Name": "??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 534,
    "CountryCode": 1,
    "LName": "Golchah",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 535,
    "CountryCode": 1,
    "LName": "G??rdim",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 536,
    "CountryCode": 1,
    "LName": "Konarak",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 537,
    "CountryCode": 1,
    "LName": "Iranshahr",
    "Name": "????????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 538,
    "CountryCode": 1,
    "LName": "Kahnuj",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 539,
    "CountryCode": 1,
    "LName": "Jalq",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 540,
    "CountryCode": 1,
    "LName": "Kali",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 541,
    "CountryCode": 1,
    "LName": "Bandar Jask",
    "Name": "???????? ????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 542,
    "CountryCode": 1,
    "LName": "Kalateh-ye Siah",
    "Name": "?????????? ????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 543,
    "CountryCode": 1,
    "LName": "Kandaz",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 544,
    "CountryCode": 1,
    "LName": "Khash",
    "Name": "??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 545,
    "CountryCode": 1,
    "LName": "Kheyrabad",
    "Name": "??????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 546,
    "CountryCode": 1,
    "LName": "Koshtegan",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 547,
    "CountryCode": 1,
    "LName": "Ladiz",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 548,
    "CountryCode": 1,
    "LName": "Kushk",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 549,
    "CountryCode": 1,
    "LName": "Anjireh",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 550,
    "CountryCode": 1,
    "LName": "Mirabad",
    "Name": "??????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 551,
    "CountryCode": 1,
    "LName": "Mirjaveh",
    "Name": "??????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 552,
    "CountryCode": 1,
    "LName": "Mohammadabad",
    "Name": "???????? ????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 553,
    "CountryCode": 1,
    "LName": "Murtan",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 554,
    "CountryCode": 1,
    "LName": "Neg??r",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 555,
    "CountryCode": 1,
    "LName": "Nosratabad",
    "Name": "???????? ????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 556,
    "CountryCode": 1,
    "LName": "Now Bandian",
    "Name": "???? ????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 557,
    "CountryCode": 1,
    "LName": "Bent",
    "Name": "??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 558,
    "CountryCode": 1,
    "LName": "Nikshahr",
    "Name": "?????? ??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 559,
    "CountryCode": 1,
    "LName": "Polan",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 560,
    "CountryCode": 1,
    "LName": "Fanouj",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 561,
    "CountryCode": 1,
    "LName": "Qal'eh-ye Bid",
    "Name": "???????? ??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 562,
    "CountryCode": 1,
    "LName": "Qasr-e-Qand",
    "Name": "?????? ??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 563,
    "CountryCode": 1,
    "LName": "Sirik",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 564,
    "CountryCode": 1,
    "LName": "Remeshk",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 565,
    "CountryCode": 1,
    "LName": "Sarbaz",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 566,
    "CountryCode": 1,
    "LName": "Sarshur",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 567,
    "CountryCode": 1,
    "LName": "Bir",
    "Name": "??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 568,
    "CountryCode": 1,
    "LName": "Anbarabad",
    "Name": "????????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 569,
    "CountryCode": 1,
    "LName": "Borj-e Mir Gol",
    "Name": "?????? ??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 570,
    "CountryCode": 1,
    "LName": "Zabol",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 571,
    "CountryCode": 1,
    "LName": "Gosht",
    "Name": "??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 572,
    "CountryCode": 1,
    "LName": "Zaboli",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 573,
    "CountryCode": 1,
    "LName": "Ziraki",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 574,
    "CountryCode": 1,
    "LName": "Chah Bahar",
    "Name": "?????? ????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1375,
    "CountryCode": 1,
    "LName": "Koosheh",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1655,
    "CountryCode": 1,
    "LName": "Golmorti",
    "Name": "??????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1736,
    "CountryCode": 1,
    "LName": "Chabahar",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1749,
    "CountryCode": 1,
    "LName": "Pasabandar",
    "Name": "??????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1753,
    "CountryCode": 1,
    "LName": "Bazman",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1786,
    "CountryCode": 1,
    "LName": "Kuhak",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1893,
    "CountryCode": 1,
    "LName": "Spakeh",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 1940,
    "CountryCode": 1,
    "LName": "Sirkan",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2202,
    "CountryCode": 1,
    "LName": "Suran",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2448,
    "CountryCode": 1,
    "LName": "Rask",
    "Name": "????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2476,
    "CountryCode": 1,
    "LName": "Bonjar",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2568,
    "CountryCode": 1,
    "LName": "Zarabad",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2590,
    "CountryCode": 1,
    "LName": "Jakigor",
    "Name": "????????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2614,
    "CountryCode": 1,
    "LName": "Dalgan",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 2870,
    "CountryCode": 1,
    "LName": "Paskuh",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 3211,
    "CountryCode": 1,
    "LName": "Apak Chushan",
    "Name": "?????? ??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 3240,
    "CountryCode": 1,
    "LName": "Hamoun",
    "Name": "?????????? ??????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 3242,
    "CountryCode": 1,
    "LName": "Dapkor",
    "Name": "??????????",
    "ProvinceCode": 16,
    "Type": "N"
  },
  {
    "Code": 27,
    "CountryCode": 1,
    "LName": "Semnan",
    "Name": "??????????",
    "ProvinceCode": 17,
    "Type": "S"
  },
  {
    "Code": 231,
    "CountryCode": 1,
    "LName": "Emamzadeh 'Abdollah",
    "Name": "???????????????? ??????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 575,
    "CountryCode": 1,
    "LName": "Damghan",
    "Name": "????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 576,
    "CountryCode": 1,
    "LName": "Dastjerd",
    "Name": "????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 577,
    "CountryCode": 1,
    "LName": "Diz Chah",
    "Name": "?????? ??????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 578,
    "CountryCode": 1,
    "LName": "Shahroud",
    "Name": "????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 579,
    "CountryCode": 1,
    "LName": "Dibaj",
    "Name": "??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 580,
    "CountryCode": 1,
    "LName": "Eyvanekey",
    "Name": "??????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 581,
    "CountryCode": 1,
    "LName": "For??mad",
    "Name": "??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 582,
    "CountryCode": 1,
    "LName": "Garmsar",
    "Name": "????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 583,
    "CountryCode": 1,
    "LName": "Darjazin",
    "Name": "????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 584,
    "CountryCode": 1,
    "LName": "Aliabad-e Pa'in",
    "Name": "?????? ???????? ??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 585,
    "CountryCode": 1,
    "LName": "Mayamey",
    "Name": "??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 586,
    "CountryCode": 1,
    "LName": "Bastam",
    "Name": "??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 587,
    "CountryCode": 1,
    "LName": "Mojen",
    "Name": "??????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 588,
    "CountryCode": 1,
    "LName": "Nardin",
    "Name": "????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 589,
    "CountryCode": 1,
    "LName": "Kalatekhij",
    "Name": "?????????? ??????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 590,
    "CountryCode": 1,
    "LName": "Darjazin",
    "Name": "????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 591,
    "CountryCode": 1,
    "LName": "Shahmirzad",
    "Name": "????????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 592,
    "CountryCode": 1,
    "LName": "Satveh",
    "Name": "????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 593,
    "CountryCode": 1,
    "LName": "Salafchegan",
    "Name": "??????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 594,
    "CountryCode": 1,
    "LName": "Shahmirzad",
    "Name": "????????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 595,
    "CountryCode": 1,
    "LName": "Sorkheh",
    "Name": "????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 596,
    "CountryCode": 1,
    "LName": "Safa'iyeh",
    "Name": "????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 597,
    "CountryCode": 1,
    "LName": "Ahmadabad",
    "Name": "???????? ????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 598,
    "CountryCode": 1,
    "LName": "Talebabad",
    "Name": "???????? ????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 599,
    "CountryCode": 1,
    "LName": "Turan",
    "Name": "??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 600,
    "CountryCode": 1,
    "LName": "Chah-e Jam",
    "Name": "?????? ????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 796,
    "CountryCode": 1,
    "LName": "Miami",
    "Name": "??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 997,
    "CountryCode": 1,
    "LName": "Mahdi Shahr",
    "Name": "???????? ??????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1197,
    "CountryCode": 1,
    "LName": "Aradan",
    "Name": "????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1344,
    "CountryCode": 1,
    "LName": "Sah",
    "Name": "????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1398,
    "CountryCode": 1,
    "LName": "Qaleno-e Kharaqan",
    "Name": "???????? ???? ??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1569,
    "CountryCode": 1,
    "LName": "Bekran",
    "Name": "??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1639,
    "CountryCode": 1,
    "LName": "Baghcheh",
    "Name": "??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1802,
    "CountryCode": 1,
    "LName": "Lasjerd",
    "Name": "????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1819,
    "CountryCode": 1,
    "LName": "Hossein Abad Kalpush",
    "Name": "???????? ???????? ????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 1843,
    "CountryCode": 1,
    "LName": "Meyghan",
    "Name": "??????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 2005,
    "CountryCode": 1,
    "LName": "Torud",
    "Name": "????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 2045,
    "CountryCode": 1,
    "LName": "Biyarjomand",
    "Name": "????????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 2248,
    "CountryCode": 1,
    "LName": "Su Daghelan",
    "Name": "??????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 2854,
    "CountryCode": 1,
    "LName": "Chahartagh",
    "Name": "??????????????",
    "ProvinceCode": 17,
    "Type": "N"
  },
  {
    "Code": 22,
    "CountryCode": 1,
    "LName": "Sanandaj",
    "Name": "??????????",
    "ProvinceCode": 18,
    "Type": "S"
  },
  {
    "Code": 254,
    "CountryCode": 1,
    "LName": "Saqqez",
    "Name": "????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 516,
    "CountryCode": 1,
    "LName": "Jushan",
    "Name": "????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 601,
    "CountryCode": 1,
    "LName": "Divandarreh",
    "Name": "????????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 602,
    "CountryCode": 1,
    "LName": "Hasanabad Yasukand",
    "Name": "?????? ???????? ??????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 603,
    "CountryCode": 1,
    "LName": "Mouchesh",
    "Name": "????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 604,
    "CountryCode": 1,
    "LName": "Baneh",
    "Name": "????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 605,
    "CountryCode": 1,
    "LName": "Shahrak Baharan",
    "Name": "???????? ????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 606,
    "CountryCode": 1,
    "LName": "Sarv abad",
    "Name": "?????? ????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 607,
    "CountryCode": 1,
    "LName": "Marivan",
    "Name": "????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 608,
    "CountryCode": 1,
    "LName": "Bahramabad",
    "Name": "?????????? ????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 609,
    "CountryCode": 1,
    "LName": "Palangan",
    "Name": "????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 610,
    "CountryCode": 1,
    "LName": "Nodsheh",
    "Name": "??????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 611,
    "CountryCode": 1,
    "LName": "Qorveh",
    "Name": "????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 612,
    "CountryCode": 1,
    "LName": "Saqqez",
    "Name": "??????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 613,
    "CountryCode": 1,
    "LName": "Bijar",
    "Name": "??????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 615,
    "CountryCode": 1,
    "LName": "Serishabad",
    "Name": "???????? ????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 616,
    "CountryCode": 1,
    "LName": "Salavatabad",
    "Name": "?????????? ????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 618,
    "CountryCode": 1,
    "LName": "Baba Hoseyh (Baba Hoseyn)",
    "Name": "???????? ????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 619,
    "CountryCode": 1,
    "LName": "Boukan",
    "Name": "??????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1138,
    "CountryCode": 1,
    "LName": "Dehgolan",
    "Name": "????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1419,
    "CountryCode": 1,
    "LName": "Bash Qeshlaw",
    "Name": "????????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1420,
    "CountryCode": 1,
    "LName": "Zarrineh Owbatu",
    "Name": "?????????? ????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1558,
    "CountryCode": 1,
    "LName": "Delbaran",
    "Name": "????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1598,
    "CountryCode": 1,
    "LName": "Toop Aghaj",
    "Name": "?????? ????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1730,
    "CountryCode": 1,
    "LName": "Sis",
    "Name": "??????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1787,
    "CountryCode": 1,
    "LName": "Kamyaran",
    "Name": "????????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 1840,
    "CountryCode": 1,
    "LName": "PirTaj",
    "Name": "????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 2624,
    "CountryCode": 1,
    "LName": "Qamlu",
    "Name": "??????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 3233,
    "CountryCode": 1,
    "LName": "Mozaffar Abad",
    "Name": "????????????????",
    "ProvinceCode": 18,
    "Type": "N"
  },
  {
    "Code": 17,
    "CountryCode": 1,
    "LName": "Sari",
    "Name": "????????",
    "ProvinceCode": 19,
    "Type": "S"
  },
  {
    "Code": 620,
    "CountryCode": 1,
    "LName": "Deraz Kola",
    "Name": "???????? ??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 621,
    "CountryCode": 1,
    "LName": "Alamdeh",
    "Name": "??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 622,
    "CountryCode": 1,
    "LName": "Fereydun Kenar",
    "Name": "????????????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 623,
    "CountryCode": 1,
    "LName": "Galugah",
    "Name": "????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 628,
    "CountryCode": 1,
    "LName": "Juybar",
    "Name": "????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 629,
    "CountryCode": 1,
    "LName": "Amol",
    "Name": "??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 632,
    "CountryCode": 1,
    "LName": "Behshahr",
    "Name": "??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 635,
    "CountryCode": 1,
    "LName": "Neka",
    "Name": "??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 636,
    "CountryCode": 1,
    "LName": "Nowshahr",
    "Name": "??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 637,
    "CountryCode": 1,
    "LName": "Qaemshahr",
    "Name": "???????? ??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 638,
    "CountryCode": 1,
    "LName": "Abbasabad",
    "Name": "???????? ????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 640,
    "CountryCode": 1,
    "LName": "Si Sangan",
    "Name": "??????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 641,
    "CountryCode": 1,
    "LName": "Ask",
    "Name": "??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 642,
    "CountryCode": 1,
    "LName": "Pahdar",
    "Name": "????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 643,
    "CountryCode": 1,
    "LName": "Tonekabon",
    "Name": "????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 645,
    "CountryCode": 1,
    "LName": "Babol",
    "Name": "????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 646,
    "CountryCode": 1,
    "LName": "Babol Sar",
    "Name": "????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 647,
    "CountryCode": 1,
    "LName": "Baladeh",
    "Name": "????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 648,
    "CountryCode": 1,
    "LName": "Chalus",
    "Name": "??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1030,
    "CountryCode": 1,
    "LName": "Kiasar",
    "Name": "??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1054,
    "CountryCode": 1,
    "LName": "Khazar Abad",
    "Name": "??????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1056,
    "CountryCode": 1,
    "LName": "Marzikola",
    "Name": "??????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1077,
    "CountryCode": 1,
    "LName": "Ramsar",
    "Name": "??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1092,
    "CountryCode": 1,
    "LName": "Gonab",
    "Name": "????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1096,
    "CountryCode": 1,
    "LName": "Nur",
    "Name": "??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1101,
    "CountryCode": 1,
    "LName": "MahmudAbad",
    "Name": "??????????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1184,
    "CountryCode": 1,
    "LName": "Sorkh Rood",
    "Name": "?????? ??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1221,
    "CountryCode": 1,
    "LName": "Shirgah",
    "Name": "????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1227,
    "CountryCode": 1,
    "LName": "Zirab",
    "Name": "??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1317,
    "CountryCode": 1,
    "LName": "Ryni",
    "Name": "????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1333,
    "CountryCode": 1,
    "LName": "Zaghmarz",
    "Name": "????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1363,
    "CountryCode": 1,
    "LName": "Malar",
    "Name": "????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1364,
    "CountryCode": 1,
    "LName": "Gaznak",
    "Name": "????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1478,
    "CountryCode": 1,
    "LName": "Chamestan",
    "Name": "????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1502,
    "CountryCode": 1,
    "LName": "Royan",
    "Name": "??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1543,
    "CountryCode": 1,
    "LName": "Surak",
    "Name": "????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1546,
    "CountryCode": 1,
    "LName": "Marzan Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1578,
    "CountryCode": 1,
    "LName": "Eshkevar Mahalleh",
    "Name": "??????????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1640,
    "CountryCode": 1,
    "LName": "Khalilshahr",
    "Name": "???????? ??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1657,
    "CountryCode": 1,
    "LName": "Nava",
    "Name": "??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1696,
    "CountryCode": 1,
    "LName": "Zeynevand",
    "Name": "????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1762,
    "CountryCode": 1,
    "LName": "KelarAbad",
    "Name": "???????? ????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1830,
    "CountryCode": 1,
    "LName": "Nanakabrud",
    "Name": "?????? ??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1846,
    "CountryCode": 1,
    "LName": "Rostamkola",
    "Name": "??????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1864,
    "CountryCode": 1,
    "LName": "Bahnamir",
    "Name": "????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1930,
    "CountryCode": 1,
    "LName": "Kelardasht",
    "Name": "??????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1936,
    "CountryCode": 1,
    "LName": "Katalom",
    "Name": "??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 1967,
    "CountryCode": 1,
    "LName": "Amir Kala",
    "Name": "??????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2031,
    "CountryCode": 1,
    "LName": "Asram",
    "Name": "????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2044,
    "CountryCode": 1,
    "LName": "Salman Shahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2128,
    "CountryCode": 1,
    "LName": "Nashta Rud",
    "Name": "??????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2155,
    "CountryCode": 1,
    "LName": "Kohi Khil",
    "Name": "???????? ??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2298,
    "CountryCode": 1,
    "LName": "Larma",
    "Name": "??????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2531,
    "CountryCode": 1,
    "LName": "Shir Kola",
    "Name": "????????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 2599,
    "CountryCode": 1,
    "LName": "Matan Kola",
    "Name": "???????? ??????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 3046,
    "CountryCode": 1,
    "LName": "Shah Kola",
    "Name": "?????? ????????",
    "ProvinceCode": 19,
    "Type": "N"
  },
  {
    "Code": 8,
    "CountryCode": 1,
    "LName": "Shiraz",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "S"
  },
  {
    "Code": 614,
    "CountryCode": 1,
    "LName": "Fiduyeh",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 649,
    "CountryCode": 1,
    "LName": "Abadeh",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 650,
    "CountryCode": 1,
    "LName": "Darab",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 651,
    "CountryCode": 1,
    "LName": "Dasht-e Arzhan",
    "Name": "?????? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 652,
    "CountryCode": 1,
    "LName": "Abarqu (Abar Kuh)",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 653,
    "CountryCode": 1,
    "LName": "Gerash",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 654,
    "CountryCode": 1,
    "LName": "Deh Now",
    "Name": "???? ????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 655,
    "CountryCode": 1,
    "LName": "Didehban",
    "Name": "???????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 656,
    "CountryCode": 1,
    "LName": "Dozgah",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 657,
    "CountryCode": 1,
    "LName": "Eshkanan",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 658,
    "CountryCode": 1,
    "LName": "Estahban",
    "Name": "??????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 659,
    "CountryCode": 1,
    "LName": "Farrashband",
    "Name": "??????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 660,
    "CountryCode": 1,
    "LName": "Fasa",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 662,
    "CountryCode": 1,
    "LName": "Ghatruyeh",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 663,
    "CountryCode": 1,
    "LName": "Evez",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 664,
    "CountryCode": 1,
    "LName": "Hormoz",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 665,
    "CountryCode": 1,
    "LName": "Hurmeh",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 666,
    "CountryCode": 1,
    "LName": "Fal",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 667,
    "CountryCode": 1,
    "LName": "Jahrom",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 668,
    "CountryCode": 1,
    "LName": "Banaruyeh",
    "Name": "??????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 669,
    "CountryCode": 1,
    "LName": "Kahnuyeh",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 670,
    "CountryCode": 1,
    "LName": "Kushkak",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 671,
    "CountryCode": 1,
    "LName": "Kazerun",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 672,
    "CountryCode": 1,
    "LName": "Khalili",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 673,
    "CountryCode": 1,
    "LName": "Khatiri",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 674,
    "CountryCode": 1,
    "LName": "Khonj",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 675,
    "CountryCode": 1,
    "LName": "Khosrow Shirin",
    "Name": "???????? ??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 676,
    "CountryCode": 1,
    "LName": "Konar Takhteh",
    "Name": "???????? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 677,
    "CountryCode": 1,
    "LName": "Lar",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 678,
    "CountryCode": 1,
    "LName": "Bigherd",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 679,
    "CountryCode": 1,
    "LName": "Marvdasht",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 680,
    "CountryCode": 1,
    "LName": "Mohr",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 681,
    "CountryCode": 1,
    "LName": "Morvarid",
    "Name": "??????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 682,
    "CountryCode": 1,
    "LName": "Dabiran",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 683,
    "CountryCode": 1,
    "LName": "Neyriz",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 685,
    "CountryCode": 1,
    "LName": "Hanna",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 686,
    "CountryCode": 1,
    "LName": "Beyram",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 687,
    "CountryCode": 1,
    "LName": "Dehouye",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 688,
    "CountryCode": 1,
    "LName": "Qotbabad",
    "Name": "?????? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 689,
    "CountryCode": 1,
    "LName": "Fishvar",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 690,
    "CountryCode": 1,
    "LName": "Sarvestan",
    "Name": "??????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 691,
    "CountryCode": 1,
    "LName": "Sedeh",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 692,
    "CountryCode": 1,
    "LName": "Seyfabad",
    "Name": "?????? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 693,
    "CountryCode": 1,
    "LName": "Hajiabad",
    "Name": "???????? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 694,
    "CountryCode": 1,
    "LName": "Shahabi",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 696,
    "CountryCode": 1,
    "LName": "Soghad",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 698,
    "CountryCode": 1,
    "LName": "Sivand",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 699,
    "CountryCode": 1,
    "LName": "shahre pir",
    "Name": "?????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 700,
    "CountryCode": 1,
    "LName": "Baba Kalan",
    "Name": "???????? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 701,
    "CountryCode": 1,
    "LName": "Beshneh",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 721,
    "CountryCode": 1,
    "LName": "Douzeh",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 903,
    "CountryCode": 1,
    "LName": "Dehkuye",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 971,
    "CountryCode": 1,
    "LName": "NURABAD",
    "Name": "?????????????? ??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 974,
    "CountryCode": 1,
    "LName": "lamard",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 994,
    "CountryCode": 1,
    "LName": "Ahel",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 995,
    "CountryCode": 1,
    "LName": "eqlid",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1006,
    "CountryCode": 1,
    "LName": "Varavi",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1017,
    "CountryCode": 1,
    "LName": "Qaemyeh",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1048,
    "CountryCode": 1,
    "LName": "Arsenjan",
    "Name": "??????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1068,
    "CountryCode": 1,
    "LName": "Fadeshkoyeh",
    "Name": "??????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1081,
    "CountryCode": 1,
    "LName": "Khavaran",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1120,
    "CountryCode": 1,
    "LName": "Rostagh",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1121,
    "CountryCode": 1,
    "LName": "Mobarak Abad",
    "Name": "?????????? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1125,
    "CountryCode": 1,
    "LName": "Sadra",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1127,
    "CountryCode": 1,
    "LName": "Shosani va Zameni",
    "Name": "?????????? ?? ??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1128,
    "CountryCode": 1,
    "LName": "Masiri",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1144,
    "CountryCode": 1,
    "LName": "Firuzabad",
    "Name": "??????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1172,
    "CountryCode": 1,
    "LName": "Kavar",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1196,
    "CountryCode": 1,
    "LName": "Izadkhast",
    "Name": "??????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1206,
    "CountryCode": 1,
    "LName": "Vala Shahr",
    "Name": "???????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1208,
    "CountryCode": 1,
    "LName": "Roniz Olya",
    "Name": "?????????? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1214,
    "CountryCode": 1,
    "LName": "Bahman",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1230,
    "CountryCode": 1,
    "LName": "Abadeh Tashk",
    "Name": "?????????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1232,
    "CountryCode": 1,
    "LName": "Paghalat",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1233,
    "CountryCode": 1,
    "LName": "Shahid abad",
    "Name": "????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1254,
    "CountryCode": 1,
    "LName": "Safashahr",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1257,
    "CountryCode": 1,
    "LName": "Bavanat",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1271,
    "CountryCode": 1,
    "LName": "Khesht",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1279,
    "CountryCode": 1,
    "LName": "Zarqan",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1296,
    "CountryCode": 1,
    "LName": "Sepidan",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1315,
    "CountryCode": 1,
    "LName": "Asir",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1320,
    "CountryCode": 1,
    "LName": "Kopen",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1327,
    "CountryCode": 1,
    "LName": "Ghir",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1351,
    "CountryCode": 1,
    "LName": "Alamdan",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1362,
    "CountryCode": 1,
    "LName": "Mahallecheh",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1393,
    "CountryCode": 1,
    "LName": "Latifi",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1396,
    "CountryCode": 1,
    "LName": "Berak",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1409,
    "CountryCode": 1,
    "LName": "Sofla",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1414,
    "CountryCode": 1,
    "LName": "Baba Meydan",
    "Name": "??????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1418,
    "CountryCode": 1,
    "LName": "Soltan Shahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1421,
    "CountryCode": 1,
    "LName": "Sharak Bane-Kalaghi",
    "Name": "???????? ?????? ??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1428,
    "CountryCode": 1,
    "LName": "Jareh",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1455,
    "CountryCode": 1,
    "LName": "Bab-e Anar",
    "Name": "?????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1475,
    "CountryCode": 1,
    "LName": "Fahlyan",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1499,
    "CountryCode": 1,
    "LName": "Khoome Zar",
    "Name": "???????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1506,
    "CountryCode": 1,
    "LName": "Khour",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1508,
    "CountryCode": 1,
    "LName": "Nowjen",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1522,
    "CountryCode": 1,
    "LName": "Jannat shahr",
    "Name": "?????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1523,
    "CountryCode": 1,
    "LName": "Dehram",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1526,
    "CountryCode": 1,
    "LName": "Daralmizan",
    "Name": "????????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1532,
    "CountryCode": 1,
    "LName": "Beyza",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1565,
    "CountryCode": 1,
    "LName": "Karzin",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1600,
    "CountryCode": 1,
    "LName": "Alamarvdasht",
    "Name": "??????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1601,
    "CountryCode": 1,
    "LName": "Maymand",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1608,
    "CountryCode": 1,
    "LName": "Miyanshahr",
    "Name": "??????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1613,
    "CountryCode": 1,
    "LName": "Fedagh",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1649,
    "CountryCode": 1,
    "LName": "Kharameh",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1651,
    "CountryCode": 1,
    "LName": "Tujerdi",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1671,
    "CountryCode": 1,
    "LName": "Defish",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1684,
    "CountryCode": 1,
    "LName": "Eij",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1701,
    "CountryCode": 1,
    "LName": "Korehi",
    "Name": "?????? ????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1775,
    "CountryCode": 1,
    "LName": "Ghadaman",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1780,
    "CountryCode": 1,
    "LName": "Galledar",
    "Name": "?????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1825,
    "CountryCode": 1,
    "LName": "Sharafuyeh",
    "Name": "??????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1826,
    "CountryCode": 1,
    "LName": "Nobandegan",
    "Name": "????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1841,
    "CountryCode": 1,
    "LName": "Gharebalagh",
    "Name": "?????? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1849,
    "CountryCode": 1,
    "LName": "Juyom",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1868,
    "CountryCode": 1,
    "LName": "Baladeh",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1883,
    "CountryCode": 1,
    "LName": "Dordaneh",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1884,
    "CountryCode": 1,
    "LName": "Nowdan",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1886,
    "CountryCode": 1,
    "LName": "Beriz",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1891,
    "CountryCode": 1,
    "LName": "Arad",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1895,
    "CountryCode": 1,
    "LName": "Khoozi",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1899,
    "CountryCode": 1,
    "LName": "Saadat Shahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1913,
    "CountryCode": 1,
    "LName": "Doborji",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1917,
    "CountryCode": 1,
    "LName": "Shah Geyb",
    "Name": "?????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1954,
    "CountryCode": 1,
    "LName": "Aviz",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 1962,
    "CountryCode": 1,
    "LName": "Heraj",
    "Name": "??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2000,
    "CountryCode": 1,
    "LName": "Baba Monir",
    "Name": "????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2006,
    "CountryCode": 1,
    "LName": "Gelkuyeh",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2051,
    "CountryCode": 1,
    "LName": "Ehsham",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2098,
    "CountryCode": 1,
    "LName": "Savare Gheyb",
    "Name": "??????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2163,
    "CountryCode": 1,
    "LName": "Emam Shahr",
    "Name": "???????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2178,
    "CountryCode": 1,
    "LName": "Lapouyee",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2214,
    "CountryCode": 1,
    "LName": "Paskoohak",
    "Name": "???? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2370,
    "CountryCode": 1,
    "LName": "Feshan",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2417,
    "CountryCode": 1,
    "LName": "Chahnahr",
    "Name": "?????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2439,
    "CountryCode": 1,
    "LName": "Darreh Shur",
    "Name": "?????? ??????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2463,
    "CountryCode": 1,
    "LName": "Sigar",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2507,
    "CountryCode": 1,
    "LName": "Hesami",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2702,
    "CountryCode": 1,
    "LName": "Khaldeh",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2828,
    "CountryCode": 1,
    "LName": "AkbarAbad",
    "Name": "????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 2882,
    "CountryCode": 1,
    "LName": "Surmaq",
    "Name": "??????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3078,
    "CountryCode": 1,
    "LName": "Qaderabad",
    "Name": "????????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3114,
    "CountryCode": 1,
    "LName": "Doroudzan",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3115,
    "CountryCode": 1,
    "LName": "Roudbal",
    "Name": "????????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3160,
    "CountryCode": 1,
    "LName": "Deris",
    "Name": "????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3167,
    "CountryCode": 1,
    "LName": "Rokn Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 3222,
    "CountryCode": 1,
    "LName": "Shiraz-Ghozat",
    "Name": "??????????-????????",
    "ProvinceCode": 20,
    "Type": "N"
  },
  {
    "Code": 10,
    "CountryCode": 1,
    "LName": "Qazvin",
    "Name": "??????????",
    "ProvinceCode": 21,
    "Type": "S"
  },
  {
    "Code": 500,
    "CountryCode": 1,
    "LName": "Abyek",
    "Name": "????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 506,
    "CountryCode": 1,
    "LName": "Kallaj",
    "Name": "??????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 509,
    "CountryCode": 1,
    "LName": "ZiaAbad",
    "Name": "????????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 513,
    "CountryCode": 1,
    "LName": "Takestan",
    "Name": "??????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 514,
    "CountryCode": 1,
    "LName": "Ab-e Garm",
    "Name": "??????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 515,
    "CountryCode": 1,
    "LName": "Avaj",
    "Name": "??????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1019,
    "CountryCode": 1,
    "LName": "Buin Zahra",
    "Name": "?????????? ????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1060,
    "CountryCode": 1,
    "LName": "Shotorak",
    "Name": "????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1118,
    "CountryCode": 1,
    "LName": "Khoramdasht",
    "Name": "????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1237,
    "CountryCode": 1,
    "LName": "Alvand",
    "Name": "??????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1261,
    "CountryCode": 1,
    "LName": "Sirdan",
    "Name": "????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1310,
    "CountryCode": 1,
    "LName": "Siahpoush",
    "Name": "??????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1332,
    "CountryCode": 1,
    "LName": "Shal",
    "Name": "??????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1388,
    "CountryCode": 1,
    "LName": "Keneshkin",
    "Name": "????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1474,
    "CountryCode": 1,
    "LName": "Razjerd",
    "Name": "??????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1658,
    "CountryCode": 1,
    "LName": "Ziaran",
    "Name": "????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1662,
    "CountryCode": 1,
    "LName": "danesfehan",
    "Name": "????????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1667,
    "CountryCode": 1,
    "LName": "Esfarvaren",
    "Name": "????????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1706,
    "CountryCode": 1,
    "LName": "Gheshlagh",
    "Name": "??????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1721,
    "CountryCode": 1,
    "LName": "Tarje",
    "Name": "????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1757,
    "CountryCode": 1,
    "LName": "Mohammadieh",
    "Name": "????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1778,
    "CountryCode": 1,
    "LName": "Bidestan",
    "Name": "??????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1911,
    "CountryCode": 1,
    "LName": "Khoznin",
    "Name": "????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 1993,
    "CountryCode": 1,
    "LName": "Sharif Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 2047,
    "CountryCode": 1,
    "LName": "Kouhin",
    "Name": "??????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 2225,
    "CountryCode": 1,
    "LName": "Mehregan",
    "Name": "????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 2411,
    "CountryCode": 1,
    "LName": "Khakali",
    "Name": "????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 2813,
    "CountryCode": 1,
    "LName": "Hesar Kharvan",
    "Name": "???????? ??????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 3251,
    "CountryCode": 1,
    "LName": "Saggez Abad",
    "Name": "??????????????",
    "ProvinceCode": 21,
    "Type": "N"
  },
  {
    "Code": 11,
    "CountryCode": 1,
    "LName": "Qom",
    "Name": "????",
    "ProvinceCode": 22,
    "Type": "S"
  },
  {
    "Code": 702,
    "CountryCode": 1,
    "LName": "kahak",
    "Name": "??????",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 703,
    "CountryCode": 1,
    "LName": "jamkaran",
    "Name": "????????????",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 1273,
    "CountryCode": 1,
    "LName": "Qomrud",
    "Name": "??????????",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 1434,
    "CountryCode": 1,
    "LName": "Pardisan",
    "Name": "??????????????",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 1560,
    "CountryCode": 1,
    "LName": "Tayqan",
    "Name": "????????????",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 1789,
    "CountryCode": 1,
    "LName": "Qanavat",
    "Name": "??????????",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 1799,
    "CountryCode": 1,
    "LName": "Salafchegan",
    "Name": "??????????????",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 2093,
    "CountryCode": 1,
    "LName": "Alvirabad",
    "Name": "??????????????????",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 3162,
    "CountryCode": 1,
    "LName": "Shokuhiyeh",
    "Name": "????????????",
    "ProvinceCode": 22,
    "Type": "N"
  },
  {
    "Code": 19,
    "CountryCode": 1,
    "LName": "Kerman",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "S"
  },
  {
    "Code": 706,
    "CountryCode": 1,
    "LName": "Bam",
    "Name": "????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 707,
    "CountryCode": 1,
    "LName": "Deh-e Tazian",
    "Name": "???? ????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 708,
    "CountryCode": 1,
    "LName": "Dehaj",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 709,
    "CountryCode": 1,
    "LName": "Fahraj",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 710,
    "CountryCode": 1,
    "LName": "Bandar-e Delfard",
    "Name": "???????? ??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 711,
    "CountryCode": 1,
    "LName": "Kashkouye",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 712,
    "CountryCode": 1,
    "LName": "Joupar",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 713,
    "CountryCode": 1,
    "LName": "Aliabad",
    "Name": "?????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 714,
    "CountryCode": 1,
    "LName": "Hoseynabad",
    "Name": "???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 715,
    "CountryCode": 1,
    "LName": "Hoseynabad-e Bala",
    "Name": "???????? ???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 716,
    "CountryCode": 1,
    "LName": "Allahabad",
    "Name": "???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 717,
    "CountryCode": 1,
    "LName": "Jiroft",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 718,
    "CountryCode": 1,
    "LName": "Bardsir",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 719,
    "CountryCode": 1,
    "LName": "Anar",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 720,
    "CountryCode": 1,
    "LName": "Kam Sefid",
    "Name": "???? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 723,
    "CountryCode": 1,
    "LName": "Koruk",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 724,
    "CountryCode": 1,
    "LName": "Kouhbonan",
    "Name": "??????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 725,
    "CountryCode": 1,
    "LName": "Mahan",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 726,
    "CountryCode": 1,
    "LName": "Nodej",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 727,
    "CountryCode": 1,
    "LName": "Malekabad",
    "Name": "?????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 728,
    "CountryCode": 1,
    "LName": "Bayaz",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 729,
    "CountryCode": 1,
    "LName": "Manzelabad",
    "Name": "???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 730,
    "CountryCode": 1,
    "LName": "Mohammadabad-e Pa'in",
    "Name": "???????? ???????? ??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 731,
    "CountryCode": 1,
    "LName": "Anbarabad",
    "Name": "???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 732,
    "CountryCode": 1,
    "LName": "Nagur",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 733,
    "CountryCode": 1,
    "LName": "Abdollahabad",
    "Name": "???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 734,
    "CountryCode": 1,
    "LName": "Haji abad",
    "Name": "???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 735,
    "CountryCode": 1,
    "LName": "Qal'eh-ye 'Askar",
    "Name": "???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 736,
    "CountryCode": 1,
    "LName": "Kohnuj",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 737,
    "CountryCode": 1,
    "LName": "Mardehak",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 738,
    "CountryCode": 1,
    "LName": "Rafsanjan",
    "Name": "??????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 739,
    "CountryCode": 1,
    "LName": "Ravar",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 740,
    "CountryCode": 1,
    "LName": "Shahabad",
    "Name": "?????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 741,
    "CountryCode": 1,
    "LName": "Shahdab",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 742,
    "CountryCode": 1,
    "LName": "Bajgan",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 743,
    "CountryCode": 1,
    "LName": "Shahr-e Babak",
    "Name": "?????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 744,
    "CountryCode": 1,
    "LName": "Shur-e Gaz",
    "Name": "?????? ????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 745,
    "CountryCode": 1,
    "LName": "Sirch",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 746,
    "CountryCode": 1,
    "LName": "Sirjan",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 747,
    "CountryCode": 1,
    "LName": "Dehbarez",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 748,
    "CountryCode": 1,
    "LName": "Borj",
    "Name": "??????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 749,
    "CountryCode": 1,
    "LName": "Salehabad",
    "Name": "???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 750,
    "CountryCode": 1,
    "LName": "Tahrud",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 751,
    "CountryCode": 1,
    "LName": "Toghr ol Jerd",
    "Name": "???????? ??????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 752,
    "CountryCode": 1,
    "LName": "Vahhabi",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 753,
    "CountryCode": 1,
    "LName": "Zarand",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 754,
    "CountryCode": 1,
    "LName": "Zeydabad",
    "Name": "?????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 755,
    "CountryCode": 1,
    "LName": "Zeh Kalat",
    "Name": "???? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 756,
    "CountryCode": 1,
    "LName": "Zeynalabad",
    "Name": "???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 757,
    "CountryCode": 1,
    "LName": "Ziaratgah-e Shah Cheragh",
    "Name": "??????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 758,
    "CountryCode": 1,
    "LName": "Azizabad",
    "Name": "???????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 759,
    "CountryCode": 1,
    "LName": "Baft",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 760,
    "CountryCode": 1,
    "LName": "Baghin",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 761,
    "CountryCode": 1,
    "LName": "Chatrud",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 762,
    "CountryCode": 1,
    "LName": "Mes-e-sarcheshme",
    "Name": "???????? ???? ????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 884,
    "CountryCode": 1,
    "LName": "Basab",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1039,
    "CountryCode": 1,
    "LName": "Narmashir",
    "Name": "??????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1047,
    "CountryCode": 1,
    "LName": "Nezamshahr Narmashir",
    "Name": "???????? ?????? ??????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1136,
    "CountryCode": 1,
    "LName": "Sarchashme",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1137,
    "CountryCode": 1,
    "LName": "Chatroud",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1177,
    "CountryCode": 1,
    "LName": "Manoojan",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1181,
    "CountryCode": 1,
    "LName": "Qanatghestan",
    "Name": "??????????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1198,
    "CountryCode": 1,
    "LName": "Faryab",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1236,
    "CountryCode": 1,
    "LName": "Bahraman",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1328,
    "CountryCode": 1,
    "LName": "Orzueeyeh",
    "Name": "??????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1402,
    "CountryCode": 1,
    "LName": "Kabootarkhan",
    "Name": "????????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1425,
    "CountryCode": 1,
    "LName": "Tejdano",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1473,
    "CountryCode": 1,
    "LName": "Golbaf",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1521,
    "CountryCode": 1,
    "LName": "Rayen",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1527,
    "CountryCode": 1,
    "LName": "Rabour",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1536,
    "CountryCode": 1,
    "LName": "Chah dadkhoda",
    "Name": "?????? ????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1539,
    "CountryCode": 1,
    "LName": "Pariz",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1567,
    "CountryCode": 1,
    "LName": "Golzar",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1571,
    "CountryCode": 1,
    "LName": "Gonbaki",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1589,
    "CountryCode": 1,
    "LName": "Ghalehganj",
    "Name": "???????? ??????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1595,
    "CountryCode": 1,
    "LName": "Naseriye",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1815,
    "CountryCode": 1,
    "LName": "Mohammadabad-e Rigan",
    "Name": "???????????????? ??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1856,
    "CountryCode": 1,
    "LName": "Khatunabad",
    "Name": "?????????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1935,
    "CountryCode": 1,
    "LName": "Abbasabad-e Sardar",
    "Name": "???????? ???????? ??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1953,
    "CountryCode": 1,
    "LName": "Negar",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 1989,
    "CountryCode": 1,
    "LName": "Riseh",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2015,
    "CountryCode": 1,
    "LName": "Roudbar",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2021,
    "CountryCode": 1,
    "LName": "Shahdad",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2075,
    "CountryCode": 1,
    "LName": "Jebalbarez",
    "Name": "????????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2401,
    "CountryCode": 1,
    "LName": "Javadiye - Elahiye",
    "Name": "???????????? - ??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2830,
    "CountryCode": 1,
    "LName": "Hanza",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2905,
    "CountryCode": 1,
    "LName": "Khanook",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2906,
    "CountryCode": 1,
    "LName": "Reyhanshahr",
    "Name": "????????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2907,
    "CountryCode": 1,
    "LName": "Yazdan Shahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2908,
    "CountryCode": 1,
    "LName": "Dasht-e Khak",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2909,
    "CountryCode": 1,
    "LName": "Sarbanan",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2910,
    "CountryCode": 1,
    "LName": "Hotkan",
    "Name": "????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2911,
    "CountryCode": 1,
    "LName": "Jorjafk",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2912,
    "CountryCode": 1,
    "LName": "Siriz",
    "Name": "??????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2913,
    "CountryCode": 1,
    "LName": "MohammadAbad",
    "Name": "????????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2914,
    "CountryCode": 1,
    "LName": "MotaharAbad",
    "Name": "????????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2919,
    "CountryCode": 1,
    "LName": "Shabjereh",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2920,
    "CountryCode": 1,
    "LName": "Dahoiyeh",
    "Name": "??????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2922,
    "CountryCode": 1,
    "LName": "Seyed Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 2959,
    "CountryCode": 1,
    "LName": "Gazok",
    "Name": "??????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 3110,
    "CountryCode": 1,
    "LName": "Dehbakri",
    "Name": "????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 3165,
    "CountryCode": 1,
    "LName": "Akhtiyar Abad",
    "Name": "????????????????????",
    "ProvinceCode": 23,
    "Type": "N"
  },
  {
    "Code": 21,
    "CountryCode": 1,
    "LName": "Kermanshah",
    "Name": "????????????????",
    "ProvinceCode": 24,
    "Type": "S"
  },
  {
    "Code": 246,
    "CountryCode": 1,
    "LName": "Bisotun",
    "Name": "????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 639,
    "CountryCode": 1,
    "LName": "Gravand",
    "Name": "????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 697,
    "CountryCode": 1,
    "LName": "Zelan",
    "Name": "????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 763,
    "CountryCode": 1,
    "LName": "Gilan-e Gharb",
    "Name": "????????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 764,
    "CountryCode": 1,
    "LName": "Harsin",
    "Name": "??????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 765,
    "CountryCode": 1,
    "LName": "Naft Shahr",
    "Name": "?????? ??????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 766,
    "CountryCode": 1,
    "LName": "Nowdesheh",
    "Name": "????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 767,
    "CountryCode": 1,
    "LName": "Paveh",
    "Name": "????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 768,
    "CountryCode": 1,
    "LName": "Bezmir abad",
    "Name": "?????????? ????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 769,
    "CountryCode": 1,
    "LName": "Pol-e Zahab",
    "Name": "???????? ????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 770,
    "CountryCode": 1,
    "LName": "Qasr-e Shirin",
    "Name": "?????? ??????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 771,
    "CountryCode": 1,
    "LName": "Sarab-e Harasm",
    "Name": "???????? ????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 772,
    "CountryCode": 1,
    "LName": "Sonqor",
    "Name": "????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 773,
    "CountryCode": 1,
    "LName": "Sahneh",
    "Name": "????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 850,
    "CountryCode": 1,
    "LName": "Kangavar",
    "Name": "????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1134,
    "CountryCode": 1,
    "LName": "Eslamabad Gharb",
    "Name": "?????????? ???????? ??????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1220,
    "CountryCode": 1,
    "LName": "Javanrud",
    "Name": "??????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1330,
    "CountryCode": 1,
    "LName": "Kerend Gharb",
    "Name": "???????? ??????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1352,
    "CountryCode": 1,
    "LName": "Ravansar",
    "Name": "????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1356,
    "CountryCode": 1,
    "LName": "Biston",
    "Name": "????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1399,
    "CountryCode": 1,
    "LName": "Tazeh Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1519,
    "CountryCode": 1,
    "LName": "Banavri",
    "Name": "???????? ??????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1534,
    "CountryCode": 1,
    "LName": "Payangan",
    "Name": "??????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1634,
    "CountryCode": 1,
    "LName": "Sarmast",
    "Name": "??????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1683,
    "CountryCode": 1,
    "LName": "Homayl",
    "Name": "????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1697,
    "CountryCode": 1,
    "LName": "Vra",
    "Name": "???????????? ??????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1709,
    "CountryCode": 1,
    "LName": "Gahvareh",
    "Name": "????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1795,
    "CountryCode": 1,
    "LName": "Soomar",
    "Name": "??????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 1986,
    "CountryCode": 1,
    "LName": "Baskeleh-ye Boruvim",
    "Name": "???????????? ????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 2007,
    "CountryCode": 1,
    "LName": "Mahidasht",
    "Name": "??????????????",
    "ProvinceCode": 24,
    "Type": "N"
  },
  {
    "Code": 18,
    "CountryCode": 1,
    "LName": "Gorgan",
    "Name": "??????????",
    "ProvinceCode": 25,
    "Type": "S"
  },
  {
    "Code": 624,
    "CountryCode": 1,
    "LName": "Gonbad Kavus",
    "Name": "???????? ??????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 625,
    "CountryCode": 1,
    "LName": "Bandar Gaz",
    "Name": "????????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 626,
    "CountryCode": 1,
    "LName": "Badraghmolla",
    "Name": "?????????? ??????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 627,
    "CountryCode": 1,
    "LName": "Bandar-e Torkeman",
    "Name": "???????? ??????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 630,
    "CountryCode": 1,
    "LName": "Kenar Darya",
    "Name": "???????? ????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 631,
    "CountryCode": 1,
    "LName": "Kord Kuy",
    "Name": "?????? ??????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 633,
    "CountryCode": 1,
    "LName": "Minudasht",
    "Name": "??????????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 634,
    "CountryCode": 1,
    "LName": "Tengli",
    "Name": "??????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 644,
    "CountryCode": 1,
    "LName": "Azadshahr",
    "Name": "??????????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 684,
    "CountryCode": 1,
    "LName": "Siminshahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1023,
    "CountryCode": 1,
    "LName": "Gomishan",
    "Name": "????????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1046,
    "CountryCode": 1,
    "LName": "Kalaleh",
    "Name": "??????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1084,
    "CountryCode": 1,
    "LName": "Ramian",
    "Name": "????????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1095,
    "CountryCode": 1,
    "LName": "Khanbebin",
    "Name": "?????? ????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1110,
    "CountryCode": 1,
    "LName": "Kumus Depe",
    "Name": "???????? ??????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1143,
    "CountryCode": 1,
    "LName": "Aliabad Katul",
    "Name": "?????? ???????? ????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1158,
    "CountryCode": 1,
    "LName": "??azel ??bad",
    "Name": "???????? ????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1161,
    "CountryCode": 1,
    "LName": "Daland",
    "Name": "????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1167,
    "CountryCode": 1,
    "LName": "Tarseh",
    "Name": "????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1190,
    "CountryCode": 1,
    "LName": "Galikesh",
    "Name": "????????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1219,
    "CountryCode": 1,
    "LName": "Kordkoy",
    "Name": "????????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1250,
    "CountryCode": 1,
    "LName": "Aq qale",
    "Name": "???? ??????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1288,
    "CountryCode": 1,
    "LName": "Maraveh tappeh",
    "Name": "?????????? ??????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1423,
    "CountryCode": 1,
    "LName": "Nowdeh Khanduz",
    "Name": "???????? ????????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1547,
    "CountryCode": 1,
    "LName": "Yanqaq",
    "Name": "??????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1633,
    "CountryCode": 1,
    "LName": "Jelin",
    "Name": "????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1698,
    "CountryCode": 1,
    "LName": "Anbaralum",
    "Name": "??????????????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 1981,
    "CountryCode": 1,
    "LName": "Dozein",
    "Name": "??????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 2023,
    "CountryCode": 1,
    "LName": "Hakim Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 2169,
    "CountryCode": 1,
    "LName": "Nowkandeh",
    "Name": "????????????",
    "ProvinceCode": 25,
    "Type": "N"
  },
  {
    "Code": 13,
    "CountryCode": 1,
    "LName": "Mashhad",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "S"
  },
  {
    "Code": 470,
    "CountryCode": 1,
    "LName": "Shandiz",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 774,
    "CountryCode": 1,
    "LName": "Dar Rud",
    "Name": "?????? ??????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 778,
    "CountryCode": 1,
    "LName": "Doruneh",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 780,
    "CountryCode": 1,
    "LName": "Emam Taqi",
    "Name": "???????? ??????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 781,
    "CountryCode": 1,
    "LName": "Fariman",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 783,
    "CountryCode": 1,
    "LName": "Ferdows",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 785,
    "CountryCode": 1,
    "LName": "Feyzabad",
    "Name": "?????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 791,
    "CountryCode": 1,
    "LName": "Gisur",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 792,
    "CountryCode": 1,
    "LName": "Hammam Qal'eh",
    "Name": "???????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 794,
    "CountryCode": 1,
    "LName": "Homa'i",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 795,
    "CountryCode": 1,
    "LName": "Kachalanlu",
    "Name": "??????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 798,
    "CountryCode": 1,
    "LName": "Kariz",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 799,
    "CountryCode": 1,
    "LName": "Khakestar",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 802,
    "CountryCode": 1,
    "LName": "Khvaf",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 805,
    "CountryCode": 1,
    "LName": "Bardeskan",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 807,
    "CountryCode": 1,
    "LName": "Toos",
    "Name": "??????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 809,
    "CountryCode": 1,
    "LName": "Mohammadabad",
    "Name": "???????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 810,
    "CountryCode": 1,
    "LName": "Nashtifan",
    "Name": "??????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 812,
    "CountryCode": 1,
    "LName": "Saleh Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 815,
    "CountryCode": 1,
    "LName": "Neyshabur (Nishapur)",
    "Name": "??????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 819,
    "CountryCode": 1,
    "LName": "Quchan",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 820,
    "CountryCode": 1,
    "LName": "Sa'd od Din",
    "Name": "????????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 821,
    "CountryCode": 1,
    "LName": "Roshkhvar",
    "Name": "??????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 822,
    "CountryCode": 1,
    "LName": "Sabzevar",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 823,
    "CountryCode": 1,
    "LName": "Sangan",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 824,
    "CountryCode": 1,
    "LName": "Sarakhs",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 825,
    "CountryCode": 1,
    "LName": "Sardaq",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 826,
    "CountryCode": 1,
    "LName": "Asadabad",
    "Name": "?????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 829,
    "CountryCode": 1,
    "LName": "Boshruyeh",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 830,
    "CountryCode": 1,
    "LName": "Ghalandar Abad",
    "Name": "?????????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 832,
    "CountryCode": 1,
    "LName": "Sirghan",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 833,
    "CountryCode": 1,
    "LName": "Soltanabad",
    "Name": "?????????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 838,
    "CountryCode": 1,
    "LName": "Taybad",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 839,
    "CountryCode": 1,
    "LName": "Torbat-e Jam",
    "Name": "???????? ??????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 840,
    "CountryCode": 1,
    "LName": "Yazdan",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 842,
    "CountryCode": 1,
    "LName": "Chahchaheh",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1011,
    "CountryCode": 1,
    "LName": "Kashmar",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1021,
    "CountryCode": 1,
    "LName": "Torbat Heydariyeh",
    "Name": "???????? ????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1035,
    "CountryCode": 1,
    "LName": "Kakhak",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1050,
    "CountryCode": 1,
    "LName": "Kondor",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1062,
    "CountryCode": 1,
    "LName": "Bimorgh",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1078,
    "CountryCode": 1,
    "LName": "Dargaz",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1085,
    "CountryCode": 1,
    "LName": "Joghatay",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1163,
    "CountryCode": 1,
    "LName": "Rivash",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1179,
    "CountryCode": 1,
    "LName": "Nasrabad",
    "Name": "??????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1189,
    "CountryCode": 1,
    "LName": "Gonabad",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1193,
    "CountryCode": 1,
    "LName": "Golbahar",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1194,
    "CountryCode": 1,
    "LName": "Shandiz",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1207,
    "CountryCode": 1,
    "LName": "MolkAbad",
    "Name": "?????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1286,
    "CountryCode": 1,
    "LName": "Feyz Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1490,
    "CountryCode": 1,
    "LName": "Babolhakam",
    "Name": "?????? ??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1513,
    "CountryCode": 1,
    "LName": "Khalil Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1541,
    "CountryCode": 1,
    "LName": "Kharv",
    "Name": "??????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1568,
    "CountryCode": 1,
    "LName": "Eresk",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1579,
    "CountryCode": 1,
    "LName": "Bajestan",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1581,
    "CountryCode": 1,
    "LName": "Chenaran",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1615,
    "CountryCode": 1,
    "LName": "Neghab",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1635,
    "CountryCode": 1,
    "LName": "Raqqeh",
    "Name": "??????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1646,
    "CountryCode": 1,
    "LName": "Chakaneh",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1747,
    "CountryCode": 1,
    "LName": "Dowlat Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1755,
    "CountryCode": 1,
    "LName": "Davarzan",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1771,
    "CountryCode": 1,
    "LName": "Bilond",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1847,
    "CountryCode": 1,
    "LName": "Zaveh",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1855,
    "CountryCode": 1,
    "LName": "Ahmadabad",
    "Name": "????????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1863,
    "CountryCode": 1,
    "LName": "Bayg",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1876,
    "CountryCode": 1,
    "LName": "Salami",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1885,
    "CountryCode": 1,
    "LName": "Meshkan",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1887,
    "CountryCode": 1,
    "LName": "Bakharz",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1939,
    "CountryCode": 1,
    "LName": "Koohsangi-Mashhad",
    "Name": "??????????????-????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1960,
    "CountryCode": 1,
    "LName": "Abdollah Giv",
    "Name": "?????????????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1961,
    "CountryCode": 1,
    "LName": "Anabad",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1968,
    "CountryCode": 1,
    "LName": "Kalat Nader",
    "Name": "???????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1971,
    "CountryCode": 1,
    "LName": "Binalood",
    "Name": "??????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1976,
    "CountryCode": 1,
    "LName": "Firouzeh",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 1980,
    "CountryCode": 1,
    "LName": "Torghabeh",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2013,
    "CountryCode": 1,
    "LName": "Nowdeh-e Enghelab",
    "Name": "???????? ????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2050,
    "CountryCode": 1,
    "LName": "Abu Chenari",
    "Name": "????????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2076,
    "CountryCode": 1,
    "LName": "Kheyrabad",
    "Name": "??????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2251,
    "CountryCode": 1,
    "LName": "Eshghabad",
    "Name": "?????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2358,
    "CountryCode": 1,
    "LName": "Mashhad - Doostabad",
    "Name": "???????? - ???????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2364,
    "CountryCode": 1,
    "LName": "Nokhandan",
    "Name": "??????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2415,
    "CountryCode": 1,
    "LName": "Jaghargh",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2444,
    "CountryCode": 1,
    "LName": "Mashhad-Abutaleb",
    "Name": "????????-??????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2504,
    "CountryCode": 1,
    "LName": "Hokmabad",
    "Name": "?????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2546,
    "CountryCode": 1,
    "LName": "Shahrezu",
    "Name": "??????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2639,
    "CountryCode": 1,
    "LName": "Marian",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2661,
    "CountryCode": 1,
    "LName": "Bajgiran",
    "Name": "????????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2839,
    "CountryCode": 1,
    "LName": "Jangal",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 2853,
    "CountryCode": 1,
    "LName": "Robat-e-Sang",
    "Name": "???????? ??????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3000,
    "CountryCode": 1,
    "LName": "Kaaryzak Nagehani",
    "Name": "???????????? ??????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3026,
    "CountryCode": 1,
    "LName": "Ghadamgah",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3122,
    "CountryCode": 1,
    "LName": "Shadmehr",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3164,
    "CountryCode": 1,
    "LName": "Beyg Nazar",
    "Name": "?????? ??????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3185,
    "CountryCode": 1,
    "LName": "Abasabad",
    "Name": "???????? ????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3195,
    "CountryCode": 1,
    "LName": "Cheshmeh Shur",
    "Name": "???????? ??????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3201,
    "CountryCode": 1,
    "LName": "Kadkan",
    "Name": "????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 3256,
    "CountryCode": 1,
    "LName": "Golmakan",
    "Name": "????????????",
    "ProvinceCode": 26,
    "Type": "N"
  },
  {
    "Code": 24,
    "CountryCode": 1,
    "LName": "Hamedan",
    "Name": "??????????",
    "ProvinceCode": 27,
    "Type": "S"
  },
  {
    "Code": 843,
    "CountryCode": 1,
    "LName": "Famanin",
    "Name": "????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 844,
    "CountryCode": 1,
    "LName": "Gav Savar",
    "Name": "?????? ????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 846,
    "CountryCode": 1,
    "LName": "Gol Tappeh",
    "Name": "???? ??????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 847,
    "CountryCode": 1,
    "LName": "Kourijan",
    "Name": "??????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 848,
    "CountryCode": 1,
    "LName": "Jeyhunabad",
    "Name": "?????????? ????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 849,
    "CountryCode": 1,
    "LName": "Kabudarahang",
    "Name": "?????????? ????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 851,
    "CountryCode": 1,
    "LName": "Karafs",
    "Name": "????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 852,
    "CountryCode": 1,
    "LName": "Lalajin",
    "Name": "????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 853,
    "CountryCode": 1,
    "LName": "Malayer",
    "Name": "??????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 854,
    "CountryCode": 1,
    "LName": "Aq Bolagh-e Aqdaq",
    "Name": "????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 855,
    "CountryCode": 1,
    "LName": "Nahavand",
    "Name": "????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 856,
    "CountryCode": 1,
    "LName": "Qorveh-e Darjezin",
    "Name": "???????? ????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 857,
    "CountryCode": 1,
    "LName": "Razan",
    "Name": "??????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 858,
    "CountryCode": 1,
    "LName": "Asadabad",
    "Name": "?????? ????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 859,
    "CountryCode": 1,
    "LName": "Suzan",
    "Name": "??????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 860,
    "CountryCode": 1,
    "LName": "Salehabad",
    "Name": "???????? ????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1094,
    "CountryCode": 1,
    "LName": "Tuyserkan",
    "Name": "????????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1131,
    "CountryCode": 1,
    "LName": "Bahar",
    "Name": "????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1298,
    "CountryCode": 1,
    "LName": "Avarzaman",
    "Name": "??????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1361,
    "CountryCode": 1,
    "LName": "Shahanjarin",
    "Name": "????????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1469,
    "CountryCode": 1,
    "LName": "Samen",
    "Name": "????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1477,
    "CountryCode": 1,
    "LName": "Juraghan",
    "Name": "????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1483,
    "CountryCode": 1,
    "LName": "Songhorabad",
    "Name": "???????? ????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1489,
    "CountryCode": 1,
    "LName": "Serkan",
    "Name": "??????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1494,
    "CountryCode": 1,
    "LName": "Shirin su",
    "Name": "?????????? ????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1612,
    "CountryCode": 1,
    "LName": "Gian",
    "Name": "????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1614,
    "CountryCode": 1,
    "LName": "Ghara Bolagh",
    "Name": "?????? ????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1616,
    "CountryCode": 1,
    "LName": "Firuzan",
    "Name": "??????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1852,
    "CountryCode": 1,
    "LName": "Qaleh Juq",
    "Name": "???????? ??????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1853,
    "CountryCode": 1,
    "LName": "Ahmadabad",
    "Name": "???????? ????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 1854,
    "CountryCode": 1,
    "LName": "Dizaj",
    "Name": "????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 2137,
    "CountryCode": 1,
    "LName": "Emamzadeh Pir Nahan",
    "Name": "???????? ???????? ??????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 2475,
    "CountryCode": 1,
    "LName": "Churmaq",
    "Name": "??????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 2585,
    "CountryCode": 1,
    "LName": "Jamishlu",
    "Name": "??????????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 2777,
    "CountryCode": 1,
    "LName": "Dasht Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 27,
    "Type": "N"
  },
  {
    "Code": 31,
    "CountryCode": 1,
    "LName": "Shahr-e Kord",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "S"
  },
  {
    "Code": 234,
    "CountryCode": 1,
    "LName": "Farrokh Shahr",
    "Name": "?????? ??????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 333,
    "CountryCode": 1,
    "LName": "Borujen",
    "Name": "??????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 861,
    "CountryCode": 1,
    "LName": "Do Makan",
    "Name": "???? ????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 862,
    "CountryCode": 1,
    "LName": "Gandoman",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 863,
    "CountryCode": 1,
    "LName": "Mal-e-Khalifeh",
    "Name": "?????? ??????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 864,
    "CountryCode": 1,
    "LName": "Lordegan",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 865,
    "CountryCode": 1,
    "LName": "Mavarz",
    "Name": "??????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 866,
    "CountryCode": 1,
    "LName": "Nafch",
    "Name": "????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 867,
    "CountryCode": 1,
    "LName": "FarrokhShahr",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 868,
    "CountryCode": 1,
    "LName": "Sar Khun",
    "Name": "??????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 869,
    "CountryCode": 1,
    "LName": "Sefid Dasht",
    "Name": "???????? ??????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 870,
    "CountryCode": 1,
    "LName": "Shalamzar",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 872,
    "CountryCode": 1,
    "LName": "Sud Jan",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 873,
    "CountryCode": 1,
    "LName": "Taqanak",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 875,
    "CountryCode": 1,
    "LName": "Chenar-e Mahmudi",
    "Name": "???????? ????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1026,
    "CountryCode": 1,
    "LName": "Farsan",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1071,
    "CountryCode": 1,
    "LName": "Garmdareh",
    "Name": "?????? ??????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1105,
    "CountryCode": 1,
    "LName": "Babaheidar",
    "Name": "????????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1111,
    "CountryCode": 1,
    "LName": "Ardal",
    "Name": "????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1228,
    "CountryCode": 1,
    "LName": "Faradonbeh",
    "Name": "??????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1262,
    "CountryCode": 1,
    "LName": "Sureshjan",
    "Name": "??????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1305,
    "CountryCode": 1,
    "LName": "Hafshejan",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1347,
    "CountryCode": 1,
    "LName": "Boldaji",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1537,
    "CountryCode": 1,
    "LName": "Ben",
    "Name": "????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1553,
    "CountryCode": 1,
    "LName": "Chelgerd",
    "Name": "??????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1602,
    "CountryCode": 1,
    "LName": "Saman",
    "Name": "??????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1619,
    "CountryCode": 1,
    "LName": "Gahro",
    "Name": "????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1874,
    "CountryCode": 1,
    "LName": "Kian",
    "Name": "????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1880,
    "CountryCode": 1,
    "LName": "Naghan",
    "Name": "??????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1882,
    "CountryCode": 1,
    "LName": "Shamsabad",
    "Name": "?????? ????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1900,
    "CountryCode": 1,
    "LName": "Dashtak",
    "Name": "????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1951,
    "CountryCode": 1,
    "LName": "Kharaji",
    "Name": "??????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 1990,
    "CountryCode": 1,
    "LName": "Vardanjan",
    "Name": "??????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2014,
    "CountryCode": 1,
    "LName": "Eskaftak",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2041,
    "CountryCode": 1,
    "LName": "Monj",
    "Name": "??????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2042,
    "CountryCode": 1,
    "LName": "Dastena",
    "Name": "??????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2359,
    "CountryCode": 1,
    "LName": "Abu Es-hagh",
    "Name": "?????? ??????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2425,
    "CountryCode": 1,
    "LName": "Do Polan",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2470,
    "CountryCode": 1,
    "LName": "Naghneh",
    "Name": "????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2522,
    "CountryCode": 1,
    "LName": "Junqan",
    "Name": "????????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 2814,
    "CountryCode": 1,
    "LName": "Hooreh",
    "Name": "????????",
    "ProvinceCode": 28,
    "Type": "N"
  },
  {
    "Code": 32,
    "CountryCode": 1,
    "LName": "Yasouj",
    "Name": "??????????",
    "ProvinceCode": 29,
    "Type": "S"
  },
  {
    "Code": 661,
    "CountryCode": 1,
    "LName": "GachSaran",
    "Name": "??????????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 874,
    "CountryCode": 1,
    "LName": "Dishmok",
    "Name": "????????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 876,
    "CountryCode": 1,
    "LName": "Sugh",
    "Name": "??????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 877,
    "CountryCode": 1,
    "LName": "Deh Dasht",
    "Name": "??????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 878,
    "CountryCode": 1,
    "LName": "Do Gonbadan",
    "Name": "???? ????????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 880,
    "CountryCode": 1,
    "LName": "Cheram",
    "Name": "????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 881,
    "CountryCode": 1,
    "LName": "Margoon",
    "Name": "????????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 883,
    "CountryCode": 1,
    "LName": "Margoun",
    "Name": "????????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1025,
    "CountryCode": 1,
    "LName": "Basht",
    "Name": "????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1173,
    "CountryCode": 1,
    "LName": "Sisakht",
    "Name": "???? ??????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1389,
    "CountryCode": 1,
    "LName": "Darghak",
    "Name": "????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1438,
    "CountryCode": 1,
    "LName": "Idanak",
    "Name": "??????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1669,
    "CountryCode": 1,
    "LName": "Likak",
    "Name": "????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1850,
    "CountryCode": 1,
    "LName": "Sisakht",
    "Name": "???? ??????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1905,
    "CountryCode": 1,
    "LName": "Ghaleh Raesi",
    "Name": "???????? ??????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 1941,
    "CountryCode": 1,
    "LName": "Gheyam",
    "Name": "????????",
    "ProvinceCode": 29,
    "Type": "N"
  },
  {
    "Code": 14,
    "CountryCode": 1,
    "LName": "Yazd",
    "Name": "??????",
    "ProvinceCode": 30,
    "Type": "S"
  },
  {
    "Code": 436,
    "CountryCode": 1,
    "LName": "Zarch",
    "Name": "????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 885,
    "CountryCode": 1,
    "LName": "Mehriz",
    "Name": "??????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 886,
    "CountryCode": 1,
    "LName": "Aliabad",
    "Name": "?????? ????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 887,
    "CountryCode": 1,
    "LName": "Kahd??'iyeh",
    "Name": "??????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 888,
    "CountryCode": 1,
    "LName": "Kermanshahan",
    "Name": "????????????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 889,
    "CountryCode": 1,
    "LName": "Sourian",
    "Name": "????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 890,
    "CountryCode": 1,
    "LName": "Marvast",
    "Name": "??????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 891,
    "CountryCode": 1,
    "LName": "Mehdiabad",
    "Name": "???????? ????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 892,
    "CountryCode": 1,
    "LName": "Meybod",
    "Name": "????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 893,
    "CountryCode": 1,
    "LName": "Aqda",
    "Name": "????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 894,
    "CountryCode": 1,
    "LName": "Mobarakeh",
    "Name": "????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 895,
    "CountryCode": 1,
    "LName": "Behabad",
    "Name": "????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 896,
    "CountryCode": 1,
    "LName": "Ardakan",
    "Name": "????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 897,
    "CountryCode": 1,
    "LName": "Ashkezar",
    "Name": "??????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 898,
    "CountryCode": 1,
    "LName": "Saghand",
    "Name": "??????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 899,
    "CountryCode": 1,
    "LName": "Shahr-e Now",
    "Name": "?????? ????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 900,
    "CountryCode": 1,
    "LName": "Taj Kuh",
    "Name": "?????? ??????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 901,
    "CountryCode": 1,
    "LName": "Taft",
    "Name": "??????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 902,
    "CountryCode": 1,
    "LName": "Tajabad-e Herat",
    "Name": "????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 904,
    "CountryCode": 1,
    "LName": "Bafq",
    "Name": "????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 905,
    "CountryCode": 1,
    "LName": "Baghdadabad",
    "Name": "?????????? ????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1135,
    "CountryCode": 1,
    "LName": "Nodoushan",
    "Name": "??????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1183,
    "CountryCode": 1,
    "LName": "Abarkoh",
    "Name": "????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1337,
    "CountryCode": 1,
    "LName": "Ahmad Abad",
    "Name": "????????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1411,
    "CountryCode": 1,
    "LName": "Banadkook Dize",
    "Name": "?????????????? ????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1441,
    "CountryCode": 1,
    "LName": "Bondarabad",
    "Name": "????????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1604,
    "CountryCode": 1,
    "LName": "Sfand Abad",
    "Name": "?????????? ????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1645,
    "CountryCode": 1,
    "LName": "Fathabad",
    "Name": "?????? ????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1796,
    "CountryCode": 1,
    "LName": "Chadormalu",
    "Name": "??????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 1909,
    "CountryCode": 1,
    "LName": "Chenar-e Naz",
    "Name": "??????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2270,
    "CountryCode": 1,
    "LName": "Rezvanshahr",
    "Name": "????????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2453,
    "CountryCode": 1,
    "LName": "Bidakhavid",
    "Name": "????????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2454,
    "CountryCode": 1,
    "LName": "Kalbaali",
    "Name": "????????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2455,
    "CountryCode": 1,
    "LName": "Khavidak",
    "Name": "??????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2524,
    "CountryCode": 1,
    "LName": "Dehshir",
    "Name": "??????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 2915,
    "CountryCode": 1,
    "LName": "HojjatAbad",
    "Name": "?????? ????????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 3028,
    "CountryCode": 1,
    "LName": "Chah Gaz Mine",
    "Name": "???????? ?????? ????",
    "ProvinceCode": 30,
    "Type": "N"
  },
  {
    "Code": 7,
    "CountryCode": 1,
    "LName": "Bandar Abbas",
    "Name": "????????????????",
    "ProvinceCode": 31,
    "Type": "S"
  },
  {
    "Code": 722,
    "CountryCode": 1,
    "LName": "Gohran",
    "Name": "????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 906,
    "CountryCode": 1,
    "LName": "Dargahan",
    "Name": "????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 907,
    "CountryCode": 1,
    "LName": "Dehnow Mir",
    "Name": "??????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 908,
    "CountryCode": 1,
    "LName": "Dehriz",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 909,
    "CountryCode": 1,
    "LName": "Gachin paein",
    "Name": "???????? ??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 910,
    "CountryCode": 1,
    "LName": "Tal Siah",
    "Name": "???? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 911,
    "CountryCode": 1,
    "LName": "Bandar-e Lengeh",
    "Name": "???????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 912,
    "CountryCode": 1,
    "LName": "Fin",
    "Name": "??????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 913,
    "CountryCode": 1,
    "LName": "Abu Musa",
    "Name": "??????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 914,
    "CountryCode": 1,
    "LName": "Bandar-e Jazzeh",
    "Name": "???????? ??????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 915,
    "CountryCode": 1,
    "LName": "Gavbandi",
    "Name": "??????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 916,
    "CountryCode": 1,
    "LName": "Salakh",
    "Name": "??????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 917,
    "CountryCode": 1,
    "LName": "Bandar-e Mahtabi",
    "Name": "???????? ????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 918,
    "CountryCode": 1,
    "LName": "Bandar-e Maqam",
    "Name": "???????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 919,
    "CountryCode": 1,
    "LName": "Hajjiabad",
    "Name": "???????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 920,
    "CountryCode": 1,
    "LName": "Bandar charak",
    "Name": "???????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 921,
    "CountryCode": 1,
    "LName": "Hengam-e Qadim",
    "Name": "?????????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 922,
    "CountryCode": 1,
    "LName": "Bandar-e Moghuyeh",
    "Name": "???????? ??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 923,
    "CountryCode": 1,
    "LName": "Jask",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 924,
    "CountryCode": 1,
    "LName": "Jonah",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 925,
    "CountryCode": 1,
    "LName": "Band-e Mo'allem",
    "Name": "???????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 926,
    "CountryCode": 1,
    "LName": "Kashar-e Bala",
    "Name": "???????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 927,
    "CountryCode": 1,
    "LName": "Kemeshk",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 928,
    "CountryCode": 1,
    "LName": "Habd",
    "Name": "??????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 929,
    "CountryCode": 1,
    "LName": "Bandar rajaei",
    "Name": "???????? ???????? ??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 930,
    "CountryCode": 1,
    "LName": "Khamir",
    "Name": "???????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 931,
    "CountryCode": 1,
    "LName": "Bastak",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 932,
    "CountryCode": 1,
    "LName": "Bandar Pol",
    "Name": "???????? ????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 933,
    "CountryCode": 1,
    "LName": "Larak",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 934,
    "CountryCode": 1,
    "LName": "Anveh",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 935,
    "CountryCode": 1,
    "LName": "Masheh",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 936,
    "CountryCode": 1,
    "LName": "Minab",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 937,
    "CountryCode": 1,
    "LName": "Hasht bandi",
    "Name": "?????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 938,
    "CountryCode": 1,
    "LName": "Baverd",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 939,
    "CountryCode": 1,
    "LName": "Qeshm",
    "Name": "??????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 940,
    "CountryCode": 1,
    "LName": "Lavan",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 941,
    "CountryCode": 1,
    "LName": "Ramkan",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 942,
    "CountryCode": 1,
    "LName": "Bandar kong",
    "Name": "???????? ??????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 943,
    "CountryCode": 1,
    "LName": "Honguye",
    "Name": "????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 944,
    "CountryCode": 1,
    "LName": "Dehtal",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 945,
    "CountryCode": 1,
    "LName": "Tunb-e Bozorg",
    "Name": "?????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 946,
    "CountryCode": 1,
    "LName": "Kolahi",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 947,
    "CountryCode": 1,
    "LName": "Sargaz",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 948,
    "CountryCode": 1,
    "LName": "Sarzeh",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 949,
    "CountryCode": 1,
    "LName": "Sirik",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 950,
    "CountryCode": 1,
    "LName": "Seyyed Jabal od Din",
    "Name": "?????? ?????? ??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 951,
    "CountryCode": 1,
    "LName": "Rodan",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 952,
    "CountryCode": 1,
    "LName": "Sirri Island (Jazireh-ye)",
    "Name": "?????????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 953,
    "CountryCode": 1,
    "LName": "Soltanabad",
    "Name": "?????????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 954,
    "CountryCode": 1,
    "LName": "Dustaku",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 955,
    "CountryCode": 1,
    "LName": "Vanak",
    "Name": "??????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 956,
    "CountryCode": 1,
    "LName": "Yekdar",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 957,
    "CountryCode": 1,
    "LName": "Ziarat-e 'Ali",
    "Name": "????????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 958,
    "CountryCode": 1,
    "LName": "shahrak-e-morvarid",
    "Name": "???????? ??????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 959,
    "CountryCode": 1,
    "LName": "bandar shenas",
    "Name": "???????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 960,
    "CountryCode": 1,
    "LName": "Chah-e Bonard",
    "Name": "?????? ??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 961,
    "CountryCode": 1,
    "LName": "bandar doulab",
    "Name": "???????? ??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 968,
    "CountryCode": 1,
    "LName": "kish",
    "Name": "??????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 998,
    "CountryCode": 1,
    "LName": "Lavan",
    "Name": "?????????? (??????????)",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1000,
    "CountryCode": 1,
    "LName": "Chiruyeh",
    "Name": "??????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1004,
    "CountryCode": 1,
    "LName": "Hendorabi",
    "Name": "????????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1117,
    "CountryCode": 1,
    "LName": "Kuvei",
    "Name": "???????? ????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1372,
    "CountryCode": 1,
    "LName": "Siahak",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1401,
    "CountryCode": 1,
    "LName": "Techek",
    "Name": "??????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1482,
    "CountryCode": 1,
    "LName": "Dezhgan",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1627,
    "CountryCode": 1,
    "LName": "Bandar e Bostaneh",
    "Name": "???????? ????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1725,
    "CountryCode": 1,
    "LName": "Dehong",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1733,
    "CountryCode": 1,
    "LName": "Sardasht Bashagard",
    "Name": "?????????? ????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1751,
    "CountryCode": 1,
    "LName": "Darva",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1772,
    "CountryCode": 1,
    "LName": "Farghan",
    "Name": "????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1773,
    "CountryCode": 1,
    "LName": "Bokhan",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1785,
    "CountryCode": 1,
    "LName": "Bandzark",
    "Name": "????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1817,
    "CountryCode": 1,
    "LName": "Shahr-e Shib",
    "Name": "????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 1942,
    "CountryCode": 1,
    "LName": "Parsian",
    "Name": "??????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2017,
    "CountryCode": 1,
    "LName": "Cheragh Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2119,
    "CountryCode": 1,
    "LName": "GEZIR",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2435,
    "CountryCode": 1,
    "LName": "Haji Khademi",
    "Name": "???????? ??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2499,
    "CountryCode": 1,
    "LName": "Kuhij",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2542,
    "CountryCode": 1,
    "LName": "Lemazan",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 2875,
    "CountryCode": 1,
    "LName": "Farur",
    "Name": "??????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 3020,
    "CountryCode": 1,
    "LName": "Herang",
    "Name": "????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 3180,
    "CountryCode": 1,
    "LName": "Sontdraf",
    "Name": "????????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 3259,
    "CountryCode": 1,
    "LName": "Jamal Ahmad",
    "Name": "???????? ????????",
    "ProvinceCode": 31,
    "Type": "N"
  },
  {
    "Code": 15,
    "CountryCode": 1,
    "LName": "Bojnourd",
    "Name": "????????????",
    "ProvinceCode": 33,
    "Type": "S"
  },
  {
    "Code": 782,
    "CountryCode": 1,
    "LName": "Faruj",
    "Name": "??????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 789,
    "CountryCode": 1,
    "LName": "Bazkhaneh",
    "Name": "??????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 790,
    "CountryCode": 1,
    "LName": "Golian",
    "Name": "??????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 793,
    "CountryCode": 1,
    "LName": "Hesarcheh",
    "Name": "????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 800,
    "CountryCode": 1,
    "LName": "Khorashah",
    "Name": "????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 804,
    "CountryCode": 1,
    "LName": "Ashkhaneh",
    "Name": "????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 806,
    "CountryCode": 1,
    "LName": "Marghzar",
    "Name": "????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 808,
    "CountryCode": 1,
    "LName": "Mianzow",
    "Name": "????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 817,
    "CountryCode": 1,
    "LName": "Qalanlu",
    "Name": "????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1001,
    "CountryCode": 1,
    "LName": "Shirvan",
    "Name": "????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1031,
    "CountryCode": 1,
    "LName": "Baghchagh",
    "Name": "??????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1042,
    "CountryCode": 1,
    "LName": "Esfarayen",
    "Name": "??????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1231,
    "CountryCode": 1,
    "LName": "Raz",
    "Name": "??????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1252,
    "CountryCode": 1,
    "LName": "Sankhavast",
    "Name": "??????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1255,
    "CountryCode": 1,
    "LName": "Daragh",
    "Name": "??????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1306,
    "CountryCode": 1,
    "LName": "Jajarm",
    "Name": "??????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1437,
    "CountryCode": 1,
    "LName": "Robat-e Qarebil",
    "Name": "???????? ?????? ??????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1618,
    "CountryCode": 1,
    "LName": "Garmeh",
    "Name": "????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1659,
    "CountryCode": 1,
    "LName": "Monir Abad-e Daragh",
    "Name": "???????? ???????? ??????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1661,
    "CountryCode": 1,
    "LName": "Daraq",
    "Name": "??????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1675,
    "CountryCode": 1,
    "LName": "Ghazi",
    "Name": "????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1728,
    "CountryCode": 1,
    "LName": "Cheshmeh Khaled",
    "Name": "???????? ????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1737,
    "CountryCode": 1,
    "LName": "Khomeyni Abad",
    "Name": "?????????? ????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 1924,
    "CountryCode": 1,
    "LName": "Islam Abad",
    "Name": "?????????? ????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 2030,
    "CountryCode": 1,
    "LName": "Gifan",
    "Name": "??????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 2254,
    "CountryCode": 1,
    "LName": "Barzaneh",
    "Name": "??????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 2295,
    "CountryCode": 1,
    "LName": "Gar Gaz",
    "Name": "????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 2969,
    "CountryCode": 1,
    "LName": "Gerivan",
    "Name": "????????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 3127,
    "CountryCode": 1,
    "LName": "Ivar",
    "Name": "????????",
    "ProvinceCode": 33,
    "Type": "N"
  },
  {
    "Code": 775,
    "CountryCode": 1,
    "LName": "Deh-e Salm",
    "Name": "???? ??????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 776,
    "CountryCode": 1,
    "LName": "Deyhuk",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 777,
    "CountryCode": 1,
    "LName": "Doroh",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 779,
    "CountryCode": 1,
    "LName": "Sarbisheh",
    "Name": "????????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 784,
    "CountryCode": 1,
    "LName": "Mud",
    "Name": "??????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 786,
    "CountryCode": 1,
    "LName": "Garmab",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 787,
    "CountryCode": 1,
    "LName": "Afin",
    "Name": "????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 788,
    "CountryCode": 1,
    "LName": "Asadieh",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 797,
    "CountryCode": 1,
    "LName": "Karba",
    "Name": "????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 801,
    "CountryCode": 1,
    "LName": "Khur",
    "Name": "??????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 803,
    "CountryCode": 1,
    "LName": "Khvoshab",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 811,
    "CountryCode": 1,
    "LName": "Barmenj",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 813,
    "CountryCode": 1,
    "LName": "Nay Band",
    "Name": "???? ??????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 814,
    "CountryCode": 1,
    "LName": "Nehbandan",
    "Name": "??????????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 816,
    "CountryCode": 1,
    "LName": "Paymorgh",
    "Name": "?????? ??????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 818,
    "CountryCode": 1,
    "LName": "Qayen",
    "Name": "????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 827,
    "CountryCode": 1,
    "LName": "Birjand",
    "Name": "????????????",
    "ProvinceCode": 34,
    "Type": "S"
  },
  {
    "Code": 831,
    "CountryCode": 1,
    "LName": "Shusf",
    "Name": "????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 834,
    "CountryCode": 1,
    "LName": "Somba",
    "Name": "????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 835,
    "CountryCode": 1,
    "LName": "Tabas",
    "Name": "????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 836,
    "CountryCode": 1,
    "LName": "Tabas Masina",
    "Name": "?????? ??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 837,
    "CountryCode": 1,
    "LName": "Tabas",
    "Name": "??????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 841,
    "CountryCode": 1,
    "LName": "Chah Mosafer",
    "Name": "?????? ??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1065,
    "CountryCode": 1,
    "LName": "Khosf",
    "Name": "????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1132,
    "CountryCode": 1,
    "LName": "Bidokht",
    "Name": "?????????? ??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1148,
    "CountryCode": 1,
    "LName": "Haji Abad",
    "Name": "???????? ????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1241,
    "CountryCode": 1,
    "LName": "Khezri Dashtebeaz",
    "Name": "???????? ?????? ????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1290,
    "CountryCode": 1,
    "LName": "Zohan",
    "Name": "????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1374,
    "CountryCode": 1,
    "LName": "Noughab",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1460,
    "CountryCode": 1,
    "LName": "Sarayan",
    "Name": "????????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1511,
    "CountryCode": 1,
    "LName": "Korghond",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1535,
    "CountryCode": 1,
    "LName": "Bandan",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1625,
    "CountryCode": 1,
    "LName": "Esfeden",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1641,
    "CountryCode": 1,
    "LName": "Mosabi",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1676,
    "CountryCode": 1,
    "LName": "Ayask",
    "Name": "????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1750,
    "CountryCode": 1,
    "LName": "Ghohestan",
    "Name": "????????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1794,
    "CountryCode": 1,
    "LName": "Ardacul",
    "Name": "????????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1955,
    "CountryCode": 1,
    "LName": "Baveik",
    "Name": "????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1956,
    "CountryCode": 1,
    "LName": "Seh Qaleh",
    "Name": "???? ????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 1966,
    "CountryCode": 1,
    "LName": "Arababad",
    "Name": "?????? ????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2035,
    "CountryCode": 1,
    "LName": "Takhteh Jan",
    "Name": "???????? ??????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2036,
    "CountryCode": 1,
    "LName": "Arian Shahr",
    "Name": "???????? ??????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2055,
    "CountryCode": 1,
    "LName": "Mighan",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2168,
    "CountryCode": 1,
    "LName": "Esfaad",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2616,
    "CountryCode": 1,
    "LName": "Hendevalan",
    "Name": "????????????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 2707,
    "CountryCode": 1,
    "LName": "Nowzad",
    "Name": "??????????",
    "ProvinceCode": 34,
    "Type": "N"
  },
  {
    "Code": 9,
    "CountryCode": 1,
    "LName": "Karaj",
    "Name": "??????",
    "ProvinceCode": 35,
    "Type": "S"
  },
  {
    "Code": 232,
    "CountryCode": 1,
    "LName": "Eshtehard",
    "Name": "??????????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 238,
    "CountryCode": 1,
    "LName": "Mahdasht",
    "Name": "?????? ??????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 239,
    "CountryCode": 1,
    "LName": "Najmabad",
    "Name": "?????? ????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 241,
    "CountryCode": 1,
    "LName": "Raja'ishahr",
    "Name": "?????????? ??????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 380,
    "CountryCode": 1,
    "LName": "Kalak-e Bala",
    "Name": "???????? ????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 617,
    "CountryCode": 1,
    "LName": "Kamal Shahr",
    "Name": "??????????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1153,
    "CountryCode": 1,
    "LName": "Koohsar",
    "Name": "????????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1191,
    "CountryCode": 1,
    "LName": "Nazarabad",
    "Name": "??????????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1199,
    "CountryCode": 1,
    "LName": "Hashtgerd",
    "Name": "????????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1309,
    "CountryCode": 1,
    "LName": "Taleghan",
    "Name": "????????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1440,
    "CountryCode": 1,
    "LName": "Golsar",
    "Name": "??????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1461,
    "CountryCode": 1,
    "LName": "Garmdareh",
    "Name": "????????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1466,
    "CountryCode": 1,
    "LName": "Meshkin Dasht",
    "Name": "?????????? ??????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1642,
    "CountryCode": 1,
    "LName": "Kalak",
    "Name": "????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1678,
    "CountryCode": 1,
    "LName": "Mohamad Shahr",
    "Name": "???????? ??????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 1931,
    "CountryCode": 1,
    "LName": "Mehrshahr",
    "Name": "????????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2020,
    "CountryCode": 1,
    "LName": "Hesarak",
    "Name": "??????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2024,
    "CountryCode": 1,
    "LName": "Kondor",
    "Name": "????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2046,
    "CountryCode": 1,
    "LName": "Hassan Abad",
    "Name": "?????? ????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2541,
    "CountryCode": 1,
    "LName": "Baraghan",
    "Name": "??????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2649,
    "CountryCode": 1,
    "LName": "Varian",
    "Name": "????????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2809,
    "CountryCode": 1,
    "LName": "Karaj - Azimieh",
    "Name": "?????? - ????????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 2887,
    "CountryCode": 1,
    "LName": "Asara",
    "Name": "??????????",
    "ProvinceCode": 35,
    "Type": "N"
  },
  {
    "Code": 3172,
    "CountryCode": 1,
    "LName": "Shahrak-e Sanati Eshtehard",
    "Name": "???????? ?????????? ??????????????",
    "ProvinceCode": 35,
    "Type": "N"
  }
];