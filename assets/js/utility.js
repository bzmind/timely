const convertTime12to24 = (time12h) =>
{
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12')
    hours = '00';

  if (modifier === 'PM')
    hours = parseInt(hours, 10) + 12;

  return `${hours}:${minutes}`;
}

function shamsiToMildai(jy, jm, jd)
{
  var sal_a, gy, gm, gd, days;
  jy += 1595;
  days = -355668 + (365 * jy) + (~~(jy / 33) * 8) + ~~(((jy % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy = 400 * ~~(days / 146097);
  days %= 146097;
  if (days > 36524)
  {
    gy += 100 * ~~(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * ~~(days / 1461);
  days %= 1461;
  if (days > 365)
  {
    gy += ~~((days - 1) / 365);
    days = (days - 1) % 365;
  }
  gd = days + 1;
  sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
  return [gy + '/' + gm + '/' + gd];
}

function getFullShamsiDateFromMildi(miladiYear, miladiMonth, miladiDay)
{
  const date = new Date(`${miladiMonth}/${miladiDay}/${miladiYear}`);

  let faDate = new Intl.DateTimeFormat("fa", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  
  faDate = faDate.replace(',', ' -');
  const weekDay = faDate.split(' - ')[1];
  faDate = faDate.split(' - ')[0];
  
  const day = faDate.split(' ')[2];
  const monthName = faDate.split(' ')[1];
  const year = faDate.split(' ')[0];

  faDate = `${weekDay} - ${day} ${monthName} ${year}`;

  return faDate;
}

function getFullMiladiDate(miladiYear, miladiMonth, miladiDay)
{
  const date = new Date(`${miladiMonth}/${miladiDay}/${miladiYear}`);

  let enDate = new Intl.DateTimeFormat("en", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  
  return enDate;
}