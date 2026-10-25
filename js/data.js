/* ============================ CATALOG ============================ */
const CATS=[
 {id:"entry",title:"ENTRY PASSES",desc:"Your gateway into NEAC MANIA.",items:[
  {id:"e1",name:"Entry Pass",price:99,eb:79,unit:"person",d:"Single entry to NEAC MANIA. Entry only – events are separate."},
  {id:"e2",name:"Squad Entry Pack",price:349,eb:279,unit:"squad (up to 4)",d:"Bring your crew! Group entry for up to 4 people."},
  {id:"e3",name:"Couple / Duo Entry",price:179,eb:149,unit:"duo",d:"Entry for two – bring your partner or best friend."}]},
 {id:"online",title:"ONLINE VIEW",desc:"Cannot make it to Kolkata? Watch from home. The access link is shared on NEAC channels before the event.",items:[
  {id:"o1",name:"Online View Pass",price:1,unit:"viewer",d:"Online viewing access to NEAC MANIA for just ₹1. You get a digital ticket instantly."}]},
 {id:"esports",title:"ESPORTS ARENA",desc:"Registrations are per squad. Slots are limited. Game titles, rules and prizes are shared at registration.",items:[
  {id:"b1",type:"esports",name:"BGMI Tournament",price:799,eb:699,unit:"squad (4+1)",slots:36,d:"4 players + 1 sub. 36 squads."},
  {id:"f1",type:"esports",name:"Free Fire Tournament",price:799,eb:699,unit:"squad (4+1)",slots:36,d:"4 players + 1 sub. 36 squads."},
  {id:"v1",type:"esports",name:"Valorant Tournament",price:999,eb:849,unit:"squad (5+1)",slots:16,d:"5 players + 1 sub. 16 squads."},
  {id:"m1",type:"esports",name:"Minecraft: Build + PvP",price:399,eb:349,unit:"person",slots:50,d:"Build Challenge and PvP arena. 50 players total."}]},
 {id:"workshop",title:"WORKSHOPS & STAGE",desc:"Get hands-on with the anime world.",items:[
  {id:"w1",name:"Crowd Dubbing",price:149,eb:119,unit:"person",d:"Voice anime scenes live with the crowd."},
  {id:"w2",name:"Animation Workshop",price:499,eb:399,unit:"person",d:"Learn the basics of animation from the pros."}]},
 {id:"cosplay",title:"COSPLAY",desc:"Show off your craft on the NEAC stage.",items:[
  {id:"c1",type:"cosplay",name:"Cosplay – Solo",price:299,eb:249,unit:"person",d:"Solo cosplay showcase & competition."},
  {id:"c2",type:"cosplay",name:"Couple Cosplay",price:549,eb:449,unit:"couple",d:"Best Couple / Duo cosplay (Naruto×Hinata, Tanjiro×Nezuko…)."},
  {id:"c3",type:"cosplay",name:"Group Cosplay (3–5)",price:899,eb:749,unit:"group",d:"Team skits and group cosplay performances."}]},
 {id:"combo",title:"COMBO DEALS",desc:"Bundles for the best value.",items:[
  {id:"k1",name:"Otaku Starter Combo",price:229,eb:189,unit:"person",d:"Entry + Crowd Dubbing."},
  {id:"k2",type:"cosplay",name:"Cosplayer Combo",price:349,eb:289,unit:"person",d:"Entry + Solo Cosplay."},
  {id:"k3",type:"cosplay",name:"Ultimate Mania Pass",price:599,eb:429,unit:"person",d:"Entry + Cosplay + Crowd Dubbing in one pass."}]}
];
const EXPS=[
 ["WORKSHOP","o","","Voice Acting Workshop","Hands-on dubbing for beginners and fans. Learn mic technique, voice control and character acting, then record your own line in the booth.","Day 1 · Open to all"],
 ["WORKSHOP","p","","Animation Showcase","A look inside animation: studio and student showreels, how a scene comes together, and a live Q and A with animators.","Day 1 · Open to all"],
 ["COMPETITION","b","","Esports","Knockout brackets with live shoutcasting. Heats on Day 1, finals on Day 2. Game titles announced with registrations.","Day 1 heats · Day 2 finals"],
 ["COMPETITION","t","","Minecraft Build Challenge","Teams get a surprise theme and a countdown. Build it, show it, and let the judges pick the best on creativity and detail.","Starts Day 1 · Judged Day 2"],
 ["COMPETITION","","","PvP","Head-to-head showdowns on a knockout ladder. Win your match, climb the bracket and take the crowd with you.","Rounds Day 1 · Finals Day 2"],
 ["COMPETITION","o","","Cosplay Competition","Walk the ramp as your favourite character. Judged on craftsmanship, character accuracy and stage presence, solo and group.","Registration Day 1 · Finals Day 2"],
 ["PITCH","p","","Anime Pitching","Five minutes. One idea. Pitch your anime, comic or game concept to a studio panel and get feedback that matters. The best pitch is recognised at the awards.","Day 2 · Open to all creators"],
 ["SCREENING","t","","TRIO Screening","Watch TRIO: The Valley of Doom on the big screen in Kolkata. Seating is first come, first served.","Day 1 · 17:00"],
 ["TALK","b","","TRIO Talks","A conversation on making TRIO and the road ahead for Indian animation, with audience Q and A.","Day 1 · 18:30"],
 ["MEGA EVENT","o","","Concert Night","The grand finale: live concert, cosplay finale on stage, and awards across all events.","Day 2 · Evening"]
];
const SCHED=[
 [["10:00","Gates open, registration and check-in"],["11:00","Opening ceremony and Metro Tour 1 kickoff"],["11:30","Voice Acting Workshop: live dubbing and record-your-line booth"],["12:30","Cosplay Competition: registrations, photo sets and first round"],["13:00","Esports Arena: brackets begin with live shoutcasting"],["14:00","Animation Showcase Workshop"],["15:00","Minecraft Build Challenge: theme reveal and build starts"],["16:00","PvP rounds on the knockout ladder"],["17:00","TRIO SCREENING",1],["18:30","TRIO TALKS with audience Q and A",1],["19:30","Day 1 closes"]],
 [["10:00","Gates open, check-in and Day 2 briefing"],["10:30","Anime Pitching: five-minute pitches to the studio panel"],["12:30","Minecraft builds judged | PvP finals"],["14:00","Esports finals on the main stage"],["15:30","COSPLAY COMPETITION FINALS and ramp walk",1],["17:00","MEGA EVENT: concert night begins",1],["19:00","Awards and winners announced"],["20:30","Closing of NEAC MANIA Metro Tour 1. Thank you to partners and fans"]]
];
