(() => {
  "use strict";

  const originalFetch = window.fetch.bind(window);
  const OFF_KEYS = ["punch","kick","throw","joint","stretch","power","agility","arm","technical","rough","mmaOverall","entertain"];
  const DEF_KEYS = ["punch","kick","throw","joint","stretch","aerial","impact","lariat","technical","rough","mmaOverall","entertain"];
  const SKILL_PACKAGES = {
    "S1":["Fast","Medium","Good","Normal","Strong","Medium","None"],
    "S2":["Fast","Slow","Good","Normal","Strong","Medium","None"],
    "S3":["Fast","Medium","Normal","Normal","Strong","Medium","None"],
    "S4":["Medium","Medium","Good","Normal","Strong","Medium","None"],
    "S5":["Fast","Medium","Normal","Normal","Strong","Strong","None"],
    "S6":["Medium","Fast","Normal","Normal","Strong","Strong","Hardcore"],
    "S8":["Medium","Fast","Normal","Normal","Medium","Strong","Hardcore"]
  };
  const MOVEMENT_PACKAGES = {
    "M1":["Medium Fast","Can Ascend","Medium Fast"],
    "M2":["Medium","Can Ascend","Medium Slow"],
    "M3":["Medium Slow","Can Ascend","Medium Slow"],
    "M4":["Medium","Can Ascend","Medium"],
    "M5":["Medium Fast","Can Ascend While Running","Medium Fast"],
    "M6":["Fast","Can Ascend While Running","Fast"],
    "M7":["Fast","Can Ascend While Running","Medium Fast"],
    "M8":["Medium","Can Ascend While Running","Medium Fast"]
  };
  const UPDATED_AT = "2026-09-23T15:12:00.000Z";

  const ROWS = [
    ["johnny-gargano","Johnny Gargano",[3,4,5,4,5,2,7,3,6,3,1,1],[6,6,7,7,8,7,6,5,8,8,1,1],"S1","M1"],
    ["zack-sabre-jr","Zack Sabre Jr.",[2,4,5,8,8,2,3,2,8,1,1,1],[7,7,8,9,9,7,7,5,8,6,6,1],"S2","M2"],
    ["brody-king","Brody King",[8,6,8,2,2,9,5,8,5,8,1,1],[7,6,8,5,5,5,9,8,6,8,1,1],"S3","M3"],
    ["jeff-cobb","Jeff Cobb",[6,5,9,2,2,9,6,7,6,4,1,1],[7,6,8,6,6,6,8,7,7,6,1,1],"S3","M4"],
    ["will-komplane","Will Komplane",[4,5,5,3,4,4,5,4,7,7,1,8],[6,6,6,5,6,5,7,6,8,6,1,8],"S4","M4"],
    ["buzz-kihl","Buzz Kihl",[8,5,8,2,3,9,3,8,5,8,1,1],[8,6,8,5,5,4,9,8,7,9,1,1],"S3","M3"],
    ["gabe-kidd","Gabe Kidd",[8,7,7,2,3,6,5,8,5,8,1,1],[7,7,7,5,5,5,8,8,6,6,1,1],"S3","M4"],
    ["jacob-fatu","Jacob Fatu",[7,6,8,2,2,9,7,8,5,5,1,1],[7,6,8,5,5,6,8,7,6,6,1,1],"S3","M4"],
    ["andrade","Andrade",[4,6,7,3,4,6,7,5,7,2,1,1],[7,7,8,6,6,7,6,6,8,5,1,1],"S1","M4"],
    ["rush","Rush",[8,7,7,2,3,7,5,8,4,7,1,1],[7,6,8,5,5,5,8,8,6,7,1,1],"S3","M4"],
    ["dragon-lee","Dragon Lee",[3,7,5,2,2,4,9,4,8,2,1,1],[6,7,6,5,5,9,6,5,8,5,1,1],"S1","M5"],
    ["dralistico","Dralistico",[4,6,5,2,2,4,8,4,7,5,1,1],[6,6,6,5,5,8,6,5,7,7,1,1],"S1","M5"],
    ["sheamus-o-shaunessy","Sheamus Farrelly",[8,6,8,2,3,8,3,9,5,7,1,1],[8,6,8,4,4,4,9,9,6,6,1,1],"S3","M4"],
    ["jordan-devlin","Jordan Devlin",[4,6,7,4,5,5,7,4,8,3,1,1],[7,7,8,6,6,7,6,5,8,4,1,1],"S1","M4"],
    ["disco-dave","Dynamite Disco Dave",[4,6,5,2,2,3,8,4,6,3,1,5],[6,6,6,5,5,8,6,5,7,5,1,3],"S1","M5"],
    ["boogie-down-barry","Boogie Down Barry",[6,4,7,2,3,8,4,8,5,5,1,5],[7,6,8,5,5,5,8,8,6,6,1,4],"S3","M4"],
    ["pete-dunne","Pete Dunne",[4,6,6,8,7,3,4,3,7,3,1,1],[7,7,7,8,8,6,7,6,7,4,1,1],"S1","M2"],
    ["pac","PAC",[4,8,5,2,2,5,8,4,7,2,1,1],[6,7,6,5,5,9,6,5,7,5,1,1],"S1","M5"],
    ["shane-taylor","Shane Taylor",[8,5,7,3,4,8,3,8,5,7,1,1],[7,6,7,6,6,4,8,8,7,8,1,1],"S5","M3"],
    ["keith-lee","Keith Lee",[6,5,7,2,2,9,6,6,5,4,1,1],[7,6,8,7,6,7,8,7,7,8,1,1],"S3","M4"],
    ["bron-breakker","Bron Breakker",[6,5,8,2,2,9,7,8,5,4,1,1],[7,6,8,5,5,5,7,7,5,5,1,1],"S3","M1"],
    ["clark-connors","Clark Connors",[7,6,7,2,3,7,5,8,5,8,1,1],[7,6,7,5,5,5,8,8,6,8,1,1],"S3","M4"],
    ["levi-martin","Levi Martín",[4,5,6,7,7,4,6,4,8,1,1,1],[7,7,8,7,8,5,6,5,7,5,1,1],"S1","M4"],
    ["connor-canada","Connor Canada",[8,5,7,2,3,7,4,8,5,8,1,1],[7,6,7,5,5,5,9,8,6,8,1,1],"S3","M4"],
    ["axiom","Axiom",[3,6,5,4,4,3,8,4,6,1,1,1],[6,7,6,6,6,9,6,5,8,5,1,1],"S1","M5"],
    ["nathan-frazer","Nathan Frazer",[3,7,4,2,2,3,9,4,6,1,1,1],[5,6,6,5,5,9,5,5,7,5,1,1],"S1","M6"],
    ["mark-davis","Mark Davis",[7,5,8,2,3,8,4,8,6,5,1,1],[7,6,8,5,5,5,8,8,7,8,1,1],"S3","M4"],
    ["bronson-reed","Bronson Reed",[7,5,8,2,2,9,5,9,5,7,1,1],[7,6,8,5,5,4,9,9,5,6,1,1],"S3","M4"],
    ["tiffany-omari-porter","Tiffany Omari Porter",[4,5,7,4,5,4,5,4,8,5,1,1],[7,6,7,6,7,6,8,6,8,5,1,1],"S1","M4"],
    ["victoria-imani-porter","Victoria Imani Porter",[4,6,5,2,2,4,8,4,7,5,1,1],[6,6,6,5,5,8,6,5,7,7,1,1],"S1","M5"],
    ["kim-mccratt","Kim McCratt",[5,5,6,4,5,5,5,5,7,5,1,5],[7,7,7,6,6,6,7,6,8,6,1,2],"S3","M4"],
    ["connie-servativv","Connie Servativv",[4,5,6,8,7,4,4,3,8,3,1,1],[7,7,7,8,8,5,6,5,8,4,1,1],"S1","M4"],
    ["keva-owensteen","Keva Owensteen",[8,6,7,2,3,7,4,8,4,7,1,1],[6,5,6,4,4,4,7,7,5,4,1,1],"S6","M4"],
    ["kayla-owensteen","Kayla Owensteen",[6,7,7,3,4,6,5,7,6,4,1,1],[7,7,7,5,5,6,8,7,7,6,1,1],"S5","M4"],
    ["katt-harvey","Katt Harvey",[5,6,5,2,2,4,8,5,6,3,1,1],[6,6,6,5,5,8,6,5,7,5,1,1],"S8","M5"],
    ["jess-harvey","Jess Harvey",[4,6,4,2,2,3,9,4,5,2,1,1],[5,6,5,4,4,9,5,4,7,7,1,1],"S8","M7"],
    ["liv-morgan","Liv Morgan",[4,6,5,2,3,3,8,4,6,5,1,1],[6,7,6,5,5,8,6,5,8,6,1,1],"S1","M5"],
    ["anna-jay","Anna Jay",[4,5,6,6,6,4,5,4,7,3,1,1],[7,7,7,7,8,6,7,6,8,4,1,1],"S1","M4"],
    ["stormy-frunts","Stormy Frunts",[7,5,7,2,3,8,4,7,5,7,1,3],[7,6,8,5,5,5,8,8,6,7,1,2],"S3","M4"],
    ["daisha-dukes","Daisha Dukes",[5,6,6,3,4,5,6,5,6,6,1,1],[7,7,7,6,6,6,7,6,7,6,1,1],"S1","M4"],
    ["martha-may-deddley","Martha May Deddley",[8,5,7,2,2,8,3,8,4,7,1,3],[6,5,6,4,4,4,7,7,5,4,1,1],"S6","M4"],
    ["chevonne-deddley","Chevonne Deddley",[4,5,5,2,2,4,7,5,7,3,1,3],[6,6,6,5,5,7,6,5,7,6,1,1],"S8","M5"],
    ["hitokiri-sune","Hitokiri Sune",[7,7,7,3,4,6,5,7,5,4,1,1],[7,7,8,6,6,6,8,7,8,5,1,1],"S3","M4"],
    ["reiyu-hojima","Reiyu Hojima",[4,5,6,7,7,3,5,4,8,1,1,1],[7,7,7,8,8,6,7,6,8,3,1,1],"S1","M4"],
    ["perro-rabioso","Perro Rabioso",[5,7,5,2,3,4,8,5,7,6,1,1],[6,6,6,5,5,8,5,5,6,4,1,1],"S1","M5"],
    ["kage-oni","Kage-Oni",[4,8,6,5,5,4,8,4,7,4,1,1],[7,7,7,5,5,8,5,5,7,3,1,1],"S1","M8"],
    ["danny-everhardt","Danny Everhardt",[5,5,6,3,4,6,5,6,6,5,1,8],[7,7,7,5,5,5,6,6,6,4,1,8],"S3","M4"],
    ["jaxson-thriller","Jaxson Thriller",[3,8,4,2,2,3,9,4,6,2,1,6],[6,7,6,5,5,9,5,5,7,4,1,2],"S1","M5"],
    ["jimbo-cooter","Jimbo Cooter",[8,4,8,2,3,9,2,9,4,9,1,3],[8,6,8,5,5,3,9,9,6,7,1,3],"S3","M3"],
    ["isaiah-jackson","Isaiah Jackson",[6,5,8,2,3,9,5,8,6,4,1,1],[7,6,8,6,6,5,9,8,7,5,1,1],"S3","M4"],
    ["pluto-carter","Pluto Carter",[3,6,4,2,2,3,8,4,7,3,1,1],[5,6,6,5,5,8,5,5,7,5,1,1],"S1","M6"],
    ["reverend-ezekiel-cross","Reverend Ezekiel Cross",[4,4,6,5,6,5,4,4,7,6,1,6],[7,7,7,7,6,5,7,6,7,4,1,5],"S3","M4"],
    ["liang-wei","Liang Wei",[6,9,6,4,4,4,5,8,7,2,1,1],[7,8,7,6,6,6,6,7,8,1,1,1],"S1","M4"],
    ["austin-stevens","Austin Stevens",[8,5,7,3,4,7,3,8,6,8,1,1],[8,7,8,5,5,4,9,9,7,7,1,1],"S3","M3"],
    ["kipp-stryker","Kipp Stryker",[3,9,5,2,2,3,8,4,7,5,1,1],[6,9,6,5,5,8,5,5,8,5,1,1],"S1","M1"],
    ["lucas-madchild","Lucas Madchild",[7,5,7,2,3,8,4,9,5,6,1,1],[7,6,8,5,5,5,9,9,6,4,1,1],"S5","M4"],
    ["thiago-cruz","Thiago Cruz",[3,9,5,2,2,3,9,4,6,4,1,1],[6,8,6,5,5,9,5,5,7,5,1,1],"S1","M5"],
    ["chicago-hart","Chicago Hart",[4,7,6,6,7,4,5,4,8,2,1,1],[7,7,8,7,8,6,6,5,8,2,1,1],"S1","M4"],
    ["justin-tyme","Justin Tyme",[3,6,5,2,2,3,9,4,8,3,1,1],[6,7,6,5,5,9,6,5,8,6,1,1],"S1","M5"],
    ["mysterio-negro","Mysterio Negro",[5,8,6,3,3,5,7,5,6,5,1,1],[7,8,7,6,6,8,6,5,7,3,1,1],"S3","M1"],
    ["gage-blackwell","Gage Blackwell",[7,5,8,2,3,8,4,8,6,5,1,1],[7,6,8,5,5,5,8,8,7,8,1,1],"S3","M4"],
    ["ryuji-sakamoto","Ryuji Sakamoto",[4,8,6,3,4,5,5,4,7,4,1,1],[7,8,7,6,6,7,7,6,8,5,1,1],"S1","M4"],
    ["virgil-kent","Virgil Kent",[3,5,5,2,2,3,8,4,7,3,1,5],[6,6,6,5,5,8,6,5,8,5,1,3],"S1","M5"],
    ["kwame-mensah","Kwame Mensah",[8,5,8,2,3,9,3,8,5,8,1,1],[8,6,8,5,5,4,9,8,7,9,1,1],"S3","M3"],
    ["tomasso-ciampa","Tomasso Ciampa",[6,5,7,3,4,6,4,7,7,2,1,1],[7,7,8,6,6,5,8,8,7,4,1,1],"S1","M4"],
    ["je-von-evans","Je'von Evans",[3,6,4,2,2,3,9,4,6,1,1,1],[5,6,6,5,5,9,5,5,8,5,1,1],"S1","M6"],
    ["yoshiki-inamura","Nick Wayne",[3,6,5,2,2,3,8,4,8,3,1,1],[6,7,7,5,5,8,6,5,8,7,1,1],"S1","M5"],
    ["rey-fenix","Rey Fenix",[3,7,5,2,2,3,9,4,7,1,1,1],[5,6,6,5,5,9,5,5,7,3,1,1],"S1","M6"],
    ["robert-roode","Amazing Red",[3,6,5,2,2,3,9,4,7,2,1,4],[6,7,6,5,5,9,6,5,8,4,1,2],"S1","M5"],
    ["calvin-tankman","Calvin Tankman",[7,5,8,2,2,9,5,8,5,6,1,1],[7,6,8,5,5,5,9,8,6,7,1,1],"S3","M4"],
    ["mike-santana","Mike Santana",[7,6,7,3,4,7,5,8,6,5,1,1],[7,7,8,5,5,5,8,8,7,5,1,1],"S3","M4"],
    ["johnathan-gresham","Jonathan Gresham",[2,4,6,9,9,2,4,3,9,1,1,1],[6,6,7,9,9,6,6,5,9,5,1,1],"S1","M4"],
    ["carmelo-hayes","Carmelo Hayes",[3,6,5,2,2,4,8,4,8,2,1,3],[6,7,6,5,5,8,6,5,8,5,1,2],"S1","M5"],
    ["lee-moriarty","Lee Moriarty",[3,5,6,8,8,3,5,3,9,2,1,1],[7,7,8,8,8,6,6,5,8,2,1,1],"S1","M4"],
    ["fabian-aichner","AR Fox",[4,6,5,2,2,4,9,4,7,3,1,1],[6,7,6,5,5,9,6,5,8,5,1,1],"S1","M5"],
    ["tavion-heights","AJ Styles",[4,6,7,4,5,5,7,5,8,2,1,1],[7,7,8,6,6,7,7,6,7,3,1,1],"S1","M4"]
  ];

  const mapValues = (keys, values) =>
    Object.fromEntries(keys.map((key, index) => [key, values[index]]));

  const overrides = ROWS.map(([wrestlerId, wrestlerName, offense, defense, skillCode, movementCode]) => {
    const [recovery, recoveryBleeding, breathing, breathingBleeding, spirit, spiritBleeding, specialSkill] =
      SKILL_PACKAGES[skillCode];
    const [movementSpeed, ascentStyle, upDownSpeed] =
      MOVEMENT_PACKAGES[movementCode];

    return {
      wrestlerId,
      wrestlerName,
      offense: mapValues(OFF_KEYS, offense),
      defense: mapValues(DEF_KEYS, defense),
      skills: {
        criticalAbility: "Finisher",
        recovery,
        recoveryBleeding,
        breathing,
        breathingBleeding,
        spirit,
        spiritBleeding,
        specialSkill
      },
      movement: {
        movementSpeed,
        ascentStyle,
        upDownSpeed
      },
      bonuses: {
        permanent: 0,
        champion: 0
      },
      createdAt: UPDATED_AT,
      updatedAt: UPDATED_AT
    };
  });

  window.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input?.url || "";

    const response = await originalFetch(input, init);

    if (
      !response.ok ||
      !url.includes("data/owl-parameter-profiles.json")
    ) {
      return response;
    }

    try {
      const database = await response.clone().json();
      const baseProfiles = Array.isArray(database?.profiles)
        ? database.profiles
        : [];

      const merged = new Map(
        baseProfiles.map(profile => [profile?.wrestlerId, profile])
      );

      overrides.forEach(profile => {
        merged.set(profile.wrestlerId, profile);
      });

      const headers = new Headers(response.headers);
      headers.delete("content-length");
      headers.set("content-type", "application/json");

      return new Response(
        JSON.stringify({
          ...database,
          profiles: Array.from(merged.values())
        }),
        {
          status: response.status,
          statusText: response.statusText,
          headers
        }
      );
    } catch (error) {
      console.error(
        "Could not apply OWL simulation profile overrides:",
        error
      );
      return response;
    }
  };
})();
