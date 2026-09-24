(()=>{"use strict";
const originalFetch=window.fetch.bind(window);
const OFF_KEYS=["punch","kick","throw","joint","stretch","power","agility","arm","technical","rough","mmaOverall","entertain"];
const DEF_KEYS=["punch","kick","throw","joint","stretch","aerial","impact","lariat","technical","rough","mmaOverall","entertain"];
const SKILL_PACKAGES={"S1":["Fast","Medium","Good","Normal","Strong","Medium","None"],"S3":["Fast","Medium","Normal","Normal","Strong","Medium","None"]};
const MOVEMENT_PACKAGES={"M1":["Medium Fast","Can Ascend","Medium Fast"],"M3":["Medium Slow","Can Ascend","Medium Slow"],"M4":["Medium","Can Ascend","Medium"],"M5":["Medium Fast","Can Ascend While Running","Medium Fast"],"M6":["Fast","Can Ascend While Running","Fast"]};
const UPDATED_AT="2026-09-23T23:55:00.000Z";
const ROWS=[["aleister-black","Aleister Black",[4,9,6,4,5,4,6,4,8,2,1,1],[7,8,7,6,6,7,7,5,8,4,1,1],"S1","M4"],["chad-gable","Chad Gable",[3,4,8,8,7,4,4,3,9,1,1,1],[7,7,8,8,8,6,6,5,8,3,1,1],"S1","M4"],["colt-stetson","Colt Stetson",[7,3,8,5,6,9,3,8,5,5,1,1],[8,6,8,6,6,4,9,8,7,7,1,1],"S3","M3"],["buck-austin","Buck Austin",[5,4,7,6,6,7,6,7,5,2,1,1],[7,6,7,6,6,6,7,7,7,2,1,1],"S3","M1"],["claudio-castagnoli","Claudio Castagnoli",[4,4,8,4,5,8,4,6,8,2,1,1],[7,6,8,6,6,5,7,6,9,4,1,1],"S1","M4"],["charlie-dempsey","Charlie Dempsey",[3,4,7,8,8,3,4,3,8,2,1,1],[7,7,8,8,8,5,6,5,8,5,1,1],"S1","M4"],["mistico","Mistico",[3,6,5,3,3,3,9,4,8,1,1,3],[6,7,6,6,6,9,6,5,8,2,1,1],"S1","M5"],["mascara-dorada","Mascara Dorada",[3,6,4,2,2,3,9,4,7,1,1,1],[5,6,6,5,5,9,5,5,7,5,1,1],"S1","M6"],["mikey-millions","Mikey Millions",[4,5,6,3,4,5,6,5,7,5,1,8],[7,7,7,5,5,6,7,6,8,5,1,4],"S3","M4"],["chassion-cash","Chassion Cash",[4,5,6,4,4,4,6,4,7,5,1,4],[7,7,7,6,6,6,7,6,8,4,1,2],"S1","M4"],["trick-williams","Dominik Mysterio",[4,6,6,4,5,4,6,4,7,4,1,1],[7,7,7,6,6,7,7,6,8,5,1,2],"S1","M4"],["sammy-guevara","Sammy Guevara",[3,6,5,2,2,4,9,4,7,4,1,2],[6,7,6,5,5,9,6,5,8,4,1,1],"S1","M5"],["omos","Omos",[8,4,8,2,2,10,2,9,4,8,1,3],[8,6,8,5,5,3,10,9,6,8,1,2],"S3","M3"],["moose","Moose",[7,5,7,2,3,8,6,8,5,5,1,1],[7,6,7,5,5,6,8,8,6,2,1,1],"S3","M1"],["rob-van-dam","Rob Van Dam",[3,8,5,2,2,4,8,4,7,2,1,4],[6,7,6,5,5,8,6,5,8,4,1,1],"S1","M5"],["matt-riddle","Matt Riddle",[5,8,7,7,6,5,5,3,7,1,1,1],[6,8,6,7,7,4,6,4,7,1,1,1],"S1","M1"],["samoa-joe","Samoa Joe",[7,7,7,6,6,7,3,7,7,4,1,1],[8,7,8,6,6,4,8,8,7,5,1,1],"S3","M3"],["toa-liona","Toa Liona",[8,5,8,2,3,9,4,8,5,7,1,1],[8,6,8,5,5,4,9,9,8,7,1,1],"S3","M3"],["jake-something","Jake Something",[7,5,8,2,3,9,5,8,5,6,1,1],[7,6,8,5,5,5,9,8,6,6,1,1],"S3","M4"],["tom-lawlor","Tom Lawlor",[5,8,6,7,7,4,4,4,7,2,1,1],[7,8,7,8,8,5,6,5,8,1,1,1],"S1","M4"],["allen-genn","Allen Genn",[3,4,8,8,7,5,4,4,8,1,1,1],[7,7,8,8,8,5,6,5,8,3,1,1],"S1","M4"],["eric-shields","Eric Shields",[3,4,7,9,8,4,4,3,8,1,1,1],[7,7,8,9,8,5,6,5,8,3,1,1],"S1","M4"],["dezmond-xavier","Dezmond Xavier",[3,7,5,2,2,3,9,4,7,2,1,3],[6,7,6,5,5,9,6,5,8,5,1,1],"S1","M5"],["zachary-wentz","Zachary Wentz",[4,8,5,2,2,3,9,4,6,4,1,1],[6,7,6,5,5,9,6,5,7,5,1,1],"S1","M5"],["blake-christian","Blake Christian",[3,6,5,2,2,4,9,4,7,1,1,4],[6,7,6,5,5,9,6,5,8,4,1,2],"S1","M5"],["austin-theory","Austin Theory",[5,5,7,2,3,8,7,7,7,2,1,4],[7,6,7,5,5,7,8,7,7,1,1,1],"S3","M1"],["julius-creed","Julius Creed",[4,4,8,7,6,8,6,5,7,1,1,1],[6,6,8,7,6,6,8,6,6,1,1,1],"S3","M1"],["brutus-creed","Brutus Creed",[7,4,8,6,6,8,4,8,6,1,1,1],[7,6,8,7,7,5,8,8,7,2,1,1],"S3","M4"]];
const WRESTLER_CORRECTIONS={
"rob-van-dam":{brand:"Revolt"},
"matt-riddle":{brand:"Revolt"},
"allen-genn":{whyImHere:"Allen Genn came to OWL to prove that collegiate fundamentals still matter when the level of competition rises. An All-American out of Ann Arbor, he treats every match like a wrestling tournament: establish position, control the hips, force the opponent to carry weight, and turn one mistake into a throw or pinning sequence. Beside Eric Shields in the Genn-Eric Varsity Club, Allen is the more physical positional wrestler of the pair. He is not interested in viral moments or flashy shortcuts. He came to Revolt to make opponents remember that disciplined fundamentals can still dictate the entire match."},
"eric-shields":{whyImHere:"Eric Shields came to OWL convinced that technical wrestling should be uncomfortable. Another Ann Arbor collegiate standout, he specializes in limb control, pressure and submission transitions, using the Ann Arbor Lock as the clearest expression of a style designed to remove options until an opponent has nowhere left to go. Alongside Allen Genn in the Genn-Eric Varsity Club, Shields is the more submission-focused technician, turning their shared amateur foundation into a methodical tag-team trap. He came to Revolt to prove that fundamentals do not need spectacle when they can simply make opponents quit."}
};
const mapValues=(keys,values)=>Object.fromEntries(keys.map((key,index)=>[key,values[index]]));
const profiles=ROWS.map(([wrestlerId,wrestlerName,offense,defense,skillCode,movementCode])=>{
 const [recovery,recoveryBleeding,breathing,breathingBleeding,spirit,spiritBleeding,specialSkill]=SKILL_PACKAGES[skillCode];
 const [movementSpeed,ascentStyle,upDownSpeed]=MOVEMENT_PACKAGES[movementCode];
 return {wrestlerId,wrestlerName,offense:mapValues(OFF_KEYS,offense),defense:mapValues(DEF_KEYS,defense),
 skills:{criticalAbility:"Finisher",recovery,recoveryBleeding,breathing,breathingBleeding,spirit,spiritBleeding,specialSkill},
 movement:{movementSpeed,ascentStyle,upDownSpeed},bonuses:{permanent:0,champion:0},createdAt:UPDATED_AT,updatedAt:UPDATED_AT};
});
window.fetch=async(input,init)=>{
 const url=typeof input==="string"?input:input?.url||"";
 const response=await originalFetch(input,init);
 if(!response.ok)return response;
 try{
  if(url.includes("data/wrestlers.json")){
   const wrestlers=await response.clone().json();
   if(!Array.isArray(wrestlers))return response;
   const corrected=wrestlers.map(wrestler=>WRESTLER_CORRECTIONS[wrestler?.id]?{...wrestler,...WRESTLER_CORRECTIONS[wrestler.id]}:wrestler);
   const headers=new Headers(response.headers);headers.delete("content-length");headers.set("content-type","application/json");
   return new Response(JSON.stringify(corrected),{status:response.status,statusText:response.statusText,headers});
  }
  if(url.includes("data/owl-parameter-profiles.json")){
   const database=await response.clone().json();
   const baseProfiles=Array.isArray(database?.profiles)?database.profiles:[];
   const merged=new Map(baseProfiles.map(profile=>[profile?.wrestlerId,profile]));
   profiles.forEach(profile=>merged.set(profile.wrestlerId,profile));
   const headers=new Headers(response.headers);headers.delete("content-length");headers.set("content-type","application/json");
   return new Response(JSON.stringify({...database,profiles:Array.from(merged.values())}),{status:response.status,statusText:response.statusText,headers});
  }
 }catch(error){console.error("Could not apply Revolt men's tag corrections/overrides:",error);}
 return response;
};
})();