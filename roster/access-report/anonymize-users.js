// This function will anonymize the user list so that you can make videos
// To use, insert into the main enclosure, I suggest at the end, right after errorHandler()
// Then, add anonymizeUsers(); as the first line of the makeReport() function;
// !!! This will fail if you have more users than names listed below !!!
// The list of names came from namethingy.com
function anonymizeUsers() {
  var randomData = [
    'Abnormal Code',
    'Absolute Eye',
    'Abstract Filth',
    'Absurd Fad',
    'Abundant Values',
    'Acidic Mob',
    'Addon Button',
    'Alpha Dollar',
    'American Spouse',
    'Aquatic Offer',
    'Automatic Difficulty',
    'Bent Geek',
    'Better Emotion',
    'Bizarre Ability',
    'Bleeding Rocket',
    'Broken Law',
    'Celebrity Budget',
    'Circular Wrap',
    'Clean Window',
    'Clicking Sentence',
    'Common Martyr',
    'Creative Check',
    'Cubic Dream',
    'Distant Language',
    'Doctor Stream',
    'Dynamic Creek',
    'Early Feet',
    'Eastern Card',
    'Energetic Dinner',
    'Exploding Function',
    'Fickle Goal',
    'Firm Plant',
    'First Bottle',
    'Fresh Male',
    'Friendly Vulture',
    'Frugal Widow',
    'Gifted Condition',
    'Glowing Envelope',
    'Groovy Viper',
    'Harmonic Fan',
    'Harmonious Pose',
    'Hot Spirit',
    'Imperial Profit',
    'Incurable Food',
    'Indigo Difference',
    'Innocent Paper',
    'Invisible Vamp',
    'Jolly Rule',
    'Light Eyeball',
    'Live Cat',
    'Long Elf',
    'Lost Levis',
    'Mad Fish',
    'Mini Tyrant',
    'Minute Economy',
    'Mister Flower',
    'Moist Tooth',
    'Natural Blouse',
    'Neanderthal Mix',
    'Normal Rockstar',
    'Nuclear Hotel',
    'Nutty Punk',
    'Odd Thingy',
    'Pacific State',
    'Padded Head',
    'Plastic Nut',
    'Powered Silence',
    'Precious Chaos',
    'Public Sword',
    'Puny Ego',
    'Radical Cartel',
    'Radioactive Baggage',
    'Rancid Tea',
    'Random Village',
    'Recycled Computer',
    'Red Investigation',
    'Regular Beast',
    'Rental Fashion',
    'Reptilian Bath',
    'Romantic Eyes',
    'Ruby Accolade',
    'Salty Air',
    'Second Medicine',
    'Selfish Hog',
    'Sharp Bed',
    'Shrinking Friendship',
    'Silicone Flag',
    'Skeptical Memory',
    'Skilled Brain',
    'Skinny Record',
    'Slick Space',
    'Sneaky Blame',
    'Social Tower',
    'Soggy Breakfast',
    'Solid Cash',
    'Spicy Mouse',
    'Spiritual Query',
    'Split Sanctuary',
    'Stellar Corn',
    'Stuck Reputation',
    'Suave Ship',
    'Suburban Kangaroo',
    'Super Wreck',
    'Tapered Jazz',
    'Tasty Term',
    'Tender Centipede',
    'This Rhyme',
    'Thoughtful Friction',
    'Tight Beer',
    'Ultimate Fleet',
    'Unspoken Slacker',
    'Unusual Alternative',
    'Urban Money',
    'Valid Spiral',
    'Velvet Attention',
    'Violent Pal',
    'Visiting Smell',
    'Weak Hacker',
    'Weathered College',
    'Western Chart',
    'Wet Crib',
    'Wild Father',
    'Zillion Stick'
  ];
  var nameData = shuffle(randomData);
  var userIds = [
  ];
  var sisIds = [
  ];
  var userNames = {
  };
  var i = 0;
  for (var id in userData) {
    if (userData.hasOwnProperty(id)) {
      var name = nameData[i++];
      var names = name.split(' ');
      var login = names[0].substr(0, 1) + names[1];
      login = login.toLowerCase();
      var newId = 0;
      while (newId == 0 || userIds.indexOf(newId) > - 1) {
        newId = 1234567 + Math.floor(100000 * Math.random());
      }
      userIds.push(newId);
      var sisId = 0;
      while (sisId == 0 || sisIds.indexOf(sisId) > - 1) {
        sisId = 476246 + Math.floor(10000 * Math.random());
      }
      sisIds.push(sisId);
      userNames[userData[id].name] = name;
      userData[id] = {
        'id': newId,
        'name': name,
        'sortable_name': names[1] + ', ' + names[0],
        'short_name': name,
        'sis_user_id': sisId,
        'sis_login_id': login,
        'login_id': login
      };
    }
  }
  for (var j = 0; j < accessData.length; j++) {
    if (accessData[j].asset_user_access.asset_category == 'roster' && accessData[j].asset_user_access.asset_class_name == 'student_enrollment') {
      var userName = accessData[j].asset_user_access.readable_name;
      if (typeof userNames[userName] !== 'undefined') {
        accessData[j].asset_user_access.readable_name = userNames[userName];
      }
    }
  }
  function shuffle(A) {
    var m = A.length,
    t,
    i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = A[m];
      A[m] = A[i];
      A[i] = t;
    }
    return A;
  }
}
