(()=>{"use strict";
const originalFetch=window.fetch.bind(window);
const OFF_KEYS=["punch","kick","throw","joint","stretch","power","agility","arm","technical","rough","mmaOverall","entertain"];
const DEF_KEYS=["punch","kick","throw","joint","stretch","aerial","impact","lariat","technical","rough","mmaOverall","entertain"];
const SKILL_PACKAGES={"S1":["Fast","Medium","Good","Normal","Strong","Medium","None"],"S3":["Fast","Medium","Normal","Normal","Strong","Medium","None"]};
const MOVEMENT_PACKAGES={"M1":["Medium Fast","Can Ascend","Medium Fast"],"M4":["Medium","Can Ascend","Medium"],"M5":["Medium Fast","Can Ascend While Running","Medium Fast"]};
const UPDATED_AT="2026-09-24T00:40:00.000Z";
const ROWS=[
["bloom-bella","Bloom Bella",[3,4,6,5,5,4,6,4,8,2,1,6],[7,7,7,6,6,6,7,6,8,4,1,2],"S1","M4"],
["bonnie-blu","Bonnie Blu",[3,6,5,2,2,4,9,4,7,3,1,3],[6,7,6,5,5,9,6,5,7,4,1,2],"S1","M5"],
["kairi-hojo","Kairi Hojo",[3,6,5,2,2,3,8,4,7,2,1,6],[6,7,6,5,5,9,6,5,8,3,1,2],"S1","M5"],
["hikaru-shida","Hikaru Shida",[4,8,6,4,4,5,6,5,8,2,1,2],[7,8,7,6,6,7,7,6,8,1,1,2],"S1","M4"],
["shelly-rotten","Shelly Rotten",[3,4,6,8,8,3,4,3,8,3,1,2],[7,7,7,8,8,5,6,5,8,4,1,2],"S1","M4"],
["kris-vicious","Kris Vicious",[6,7,7,3,4,7,5,8,5,6,1,1],[7,7,7,5,5,5,8,8,7,6,1,1],"S3","M4"],
["shayna-baszler","Shayna Baszler",[4,7,6,9,8,4,4,3,7,1,1,1],[7,8,7,9,8,5,6,5,8,1,1,1],"S1","M4"],
["marina-shafir","Marina Shafir",[4,7,6,8,7,4,4,4,7,1,1,1],[7,8,7,8,8,5,6,5,8,2,1,2],"S1","M4"],
["kaylani-osu","Kaylani Osu",[4,7,5,2,2,4,8,4,7,3,1,3],[6,7,6,5,5,8,6,5,8,4,1,1],"S1","M5"],
["leilani-osu","Leilani Osu",[3,5,6,5,5,4,6,4,8,2,1,5],[7,7,7,6,6,6,7,6,8,4,1,2],"S1","M4"],
["whideaux","Whideaux",[3,4,5,9,8,3,4,3,8,3,1,2],[7,7,7,9,8,5,6,5,8,4,1,1],"S1","M4"],
["aeirachna","Aeirachna",[7,5,7,2,3,9,4,8,5,7,1,1],[7,6,8,5,5,5,9,8,6,7,1,1],"S3","M4"],
["nefeteri","Nefeteri",[3,5,6,7,7,4,5,4,8,2,1,2],[7,7,7,7,7,6,6,5,8,5,1,1],"S1","M4"],
["isis","Isis",[7,5,8,2,3,9,4,8,5,6,1,1],[7,6,8,5,5,5,9,8,7,6,1,1],"S3","M4"],
["jacy-jayne","Jacy Jayne",[4,5,6,3,4,5,5,5,7,6,1,7],[7,7,7,6,6,6,7,6,8,5,1,3],"S3","M4"],
["blake-monroe","Blake Monroe",[5,6,7,2,3,7,7,6,6,3,1,5],[7,6,7,5,5,7,8,7,7,1,1,1],"S3","M1"]
];
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
  if(url.includes("data/owl-parameter-profiles.json")){
   const database=await response.clone().json();
   const baseProfiles=Array.isArray(database?.profiles)?database.profiles:[];
   const merged=new Map(baseProfiles.map(profile=>[profile?.wrestlerId,profile]));
   profiles.forEach(profile=>merged.set(profile.wrestlerId,profile));
   const headers=new Headers(response.headers);headers.delete("content-length");headers.set("content-type","application/json");
   return new Response(JSON.stringify({...database,profiles:Array.from(merged.values())}),{status:response.status,statusText:response.statusText,headers});
  }
 }catch(error){console.error("Could not apply Revolt women's tag simulation overrides:",error);}
 return response;
};
})();