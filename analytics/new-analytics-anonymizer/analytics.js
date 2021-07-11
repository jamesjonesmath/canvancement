/**
 * Intercepts calls to Canvas New Analytics and anonymize user data
 */
'use strict';

const emailFormat = 'first_last';
const defaultDomain = 'example.com';
const removeAvatar = true;

/**
 * emailFormat determines the format of the username portion of the login.
 *   flast is first initial followed by last name (jjones)
 *   lastf is last name followed by the first initial (jonesj)
 *   first_last is first name, hyphen, last_name (james_jones)
 *   last_first is last name, hyphen, first_name (jones_james)
 * defaultDomain is appended to the login unless it is empty (null or ''),
 *   in which case the existing email domain is used.
 *   If this is a comma-separated list of strings, then one of them will
 *   be chosen at random.
 *   Examples:
 *   '' uses the existing domain
 *   'example.com' sets all domains to example.com
 *   'gmail.com,yahoo.com,hotmail.com,outlook.com,icloud.com' randomly picks one
 * removeAvatar will remove links to avatars so the initials of the
 *   anonymous user will show up
 */

const users = {};
const aliases = shuffle(anonymousUserList());

/** Edit this list to create your own names */
function anonymousUserList() {
  const anonList = `
      Abnormal Code, Absolute Eye, Abstract Filth, Absurd Fad, Abundant Values,
      Acidic Mob, Addon Button, Alpha Dollar, American Spouse, Aquatic Offer,
      Automatic Difficulty, Bent Geek, Better Emotion, Bizarre Ability, Bleeding
      Rocket, Broken Law, Celebrity Budget, Circular Wrap, Clean Window, Clicking
      Sentence, Common Martyr, Creative Check, Cubic Dream, Distant Language,
      Doctor Stream, Dynamic Creek, Early Feet, Eastern Card, Energetic Dinner,
      Exploding Function, Fickle Goal, Firm Plant, First Bottle, Fresh Male,
      Friendly Vulture, Frugal Widow, Gifted Condition, Glowing Envelope, Groovy
      Viper, Harmonic Fan, Harmonious Pose, Hot Spirit, Imperial Profit, Incurable
      Food, Indigo Difference, Innocent Paper, Invisible Vamp, Jolly Rule, Light
      Eyeball, Live Cat, Long Elf, Lost Levis, Mad Fish, Mini Tyrant, Minute
      Economy, Mister Flower, Moist Tooth, Natural Blouse, Neanderthal Mix, Normal
      Rockstar, Nuclear Hotel, Nutty Punk, Odd Thingy, Pacific State, Padded Head,
      Plastic Nut, Powered Silence, Precious Chaos, Public Sword, Puny Ego,
      Radical Cartel, Radioactive Baggage, Rancid Tea, Random Village, Recycled
      Computer, Red Investigation, Regular Beast, Rental Fashion, Reptilian Bath,
      Romantic Eyes, Ruby Accolade, Salty Air, Second Medicine, Selfish Hog, Sharp
      Bed, Shrinking Friendship, Silicone Flag, Skeptical Memory, Skilled Brain,
      Skinny Record, Slick Space, Sneaky Blame, Social Tower, Soggy Breakfast,
      Solid Cash, Spicy Mouse, Spiritual Query, Split Sanctuary, Stellar Corn,
      Stuck Reputation, Suave Ship, Suburban Kangaroo, Super Wreck, Tapered Jazz,
      Tasty Term, Tender Centipede, This Rhyme, Thoughtful Friction, Tight Beer,
      Ultimate Fleet, Unspoken Slacker, Unusual Alternative, Urban Money, Valid
      Spiral, Velvet Attention, Violent Pal, Visiting Smell, Weak Hacker,
      Weathered College, Western Chart, Wet Crib, Wild Feather, Zillion Stick`;
  return anonList
    .replace(/\n/gms, ' ')
    .replace(/\s+/gms, ' ')
    .split(',')
    .map(e => e.trim());
}

/** Randomize the order of the aliases */
function shuffle(A) {
  let m = A.length;
  while (m > 0) {
    const i = Math.floor(Math.random() * m--);
    const t = A[m];
    A[m] = A[i];
    A[i] = t;
  }
  return A;
}

/** We have used all of the aliases, split the names, shuffle, and create new ones */
function reshuffleAliases() {
  const first = [];
  const last = [];
  anonymousUserList().forEach(e => {
    const names = e.split(' ');
    first.push(names[0]);
    last.push(names[1]);
  });
  const firstNames = shuffle(first);
  const lastNames = shuffle(last);
  firstNames.forEach((f, j) => {
    const name = `${f} ${lastNames[j]}`;
    if (aliases.indexOf(name) === -1) {
      aliases.push(name);
    }
  });
}

/** Create email address for alias */
function assignEmail(parts, originalEmail) {
  let emailDomain = null;
  if (!defaultDomain) {
    const emailParts = originalEmail.split('@');
    if (emailParts.length === 2) {
      emailDomain = emailParts[1];
    }
  } else if (/,/.test(defaultDomain)) {
    const domains = shuffle(
      defaultDomain
        .split(',')
        .map(e => e.trim())
        .filter(e => e)
    );
    emailDomain = domains[0];
  } else {
    emailDomain = defaultDomain;
  }
  let login = null;
  const firstName = parts[0];
  const lastName = parts[1];
  const firstInitial = firstName.substr(0, 1);
  switch (emailFormat) {
    case 'flast':
      login = `${firstInitial}${lastName}`;
      break;
      case 'lastf':
        login = `${lastName}${firstInitial}`;
        break;
      case 'first_last':
      login = `${firstName}_${lastName}`;
      break;
    case 'last_first':
      login = `${lastName}_${firstName}`;
      break;
  }
  return `${login}@${emailDomain}`.toLowerCase();
}

/** assign aliases for multiple students */
function assignMultipleNames(students) {
  for (const user of students) {
    assignName(user);
  }
  return students;
}

/** assign alias for single student */
function assignName(user) {
  const fields = 'name,sortableName,shortName,email'.split(',');
  const id = user.student.id;
  if (typeof users[id] === 'undefined') {
    createAlias(user);
  }
  const info = users[user.student.id];
  fields.forEach(f => {
    if (typeof user.student.studentInfo[f] !== 'undefined') {
      user.student.studentInfo[f] = info[f];
    }
  });
  if (removeAvatar) {
    user.student.studentInfo.avatarURL = null;
  }
  return user;
}

/** find alias for user */
function createAlias(user) {
  const i = Object.keys(users).length;
  if (i > 0 && i % aliases.length === 0) {
    reshuffleAliases();
  }
  const originalName = user.student.studentInfo.name;
  const id = user.student.id;
  const nick = aliases[i % aliases.length];
  const nickParts = nick.split(' ');
  const email = assignEmail(nickParts, user.student.studentInfo.email);
  const item = {
    id: id,
    canvasId: user.student.studentId,
    originalName: originalName,
    name: nick,
    sortableName: `${nickParts[1]}, ${nickParts[0]}`,
    shortName: nick,
    email: email,
  };
  users[id] = item;
}

/** Look for usernames in assets */
function handleAssets(assets) {
  const userNames = [];
  const xref = {};
  for (const userId in users) {
    const user = users[userId];
    const name = user.originalName;
    if (userNames.indexOf(name) === -1) {
      userNames.push(name);
      xref[name] = user.name;
    }
  }
  let isChanged = false;
  for (const asset of assets) {
    if (
      asset.classification === 'course.users.user' &&
      userNames.indexOf(asset.name) > -1
    ) {
      asset.name = xref[asset.name];
      isChanged = true;
    }
  }
  return isChanged;
}

/** check data and modify if needed */
function listener(details) {
  const filter = browser.webRequest.filterResponseData(details.requestId);
  const decoder = new TextDecoder('utf-8');
  const encoder = new TextEncoder();
  const data = [];

  filter.ondata = event => {
    data.push(decoder.decode(event.data, { stream: true }));
  };

  filter.onstop = event => {
    data.push(decoder.decode());
    let str = data.join('');
    const json = JSON.parse(str);
    let isChanged = false;
    if (typeof json.data === 'object' && typeof json.data.course === 'object') {
      const course = json.data.course;
      if (
        typeof course.studentInCourseConnection === 'object' &&
        typeof course.studentInCourseConnection.edges === 'object' &&
        typeof course.studentInCourseConnection.edges[0].student === 'object'
      ) {
        assignMultipleNames(course.studentInCourseConnection.edges);
        isChanged = true;
      } else if (typeof course.assets === 'object') {
        isChanged = handleAssets(course.assets);
      } else if (
        typeof course.studentInCourse === 'object' &&
        typeof course.studentInCourse.student === 'object'
      ) {
        assignName(course.studentInCourse);
        isChanged = true;
      } else if (
        typeof course.series === 'object' &&
        typeof course.series.assets === 'object'
      ) {
        isChanged = handleAssets(course.series.assets);
      }
    }
    if (isChanged) {
      str = JSON.stringify(json);
    }
    filter.write(encoder.encode(str));
    filter.disconnect();
  };
}

/** listen to requests */
browser.webRequest.onBeforeRequest.addListener(
  listener,
  { urls: ['https://canvas-analytics-iad-prod.inscloudgate.net/v2/graphql'] },
  ['blocking']
);
