(() => {
  "use strict";

  const originalFetch = window.fetch.bind(window);
  const OFF_KEYS = ["punch","kick","throw","joint","stretch","power","agility","arm","technical","rough","mmaOverall","entertain"];
  const DEF_KEYS = ["punch","kick","throw","joint","stretch","aerial","impact","lariat","technical","rough","mmaOverall","entertain"];
  const UPDATED_AT = "2026-09-23T12:03:00.000Z";

  const makeProfile = ({ wrestlerId, wrestlerName, offense, defense, skills, movement }) => ({
    wrestlerId,
    wrestlerName,
    offense: Object.fromEntries(OFF_KEYS.map((key, index) => [key, offense[index]])),
    defense: Object.fromEntries(DEF_KEYS.map((key, index) => [key, defense[index]])),
    skills: {
      criticalAbility: "Finisher",
      ...skills
    },
    movement,
    bonuses: {
      permanent: 0,
      champion: 0
    },
    createdAt: UPDATED_AT,
    updatedAt: UPDATED_AT
  });

  const S = {
    standardGood: {
      recovery: "Fast",
      recoveryBleeding: "Medium",
      breathing: "Good",
      breathingBleeding: "Medium",
      spirit: "Strong",
      spiritBleeding: "Medium",
      specialSkill: "None"
    },
    standardNormal: {
      recovery: "Fast",
      recoveryBleeding: "Medium",
      breathing: "Normal",
      breathingBleeding: "Medium",
      spirit: "Strong",
      spiritBleeding: "Medium",
      specialSkill: "None"
    },
    kayla: {
      recovery: "Fast",
      recoveryBleeding: "Medium",
      breathing: "Normal",
      breathingBleeding: "Medium",
      spirit: "Strong",
      spiritBleeding: "Strong",
      specialSkill: "None"
    },
    hardcoreHeavy: {
      recovery: "Medium",
      recoveryBleeding: "Fast",
      breathing: "Normal",
      breathingBleeding: "Normal",
      spirit: "Strong",
      spiritBleeding: "Strong",
      specialSkill: "Hardcore"
    },
    hardcoreAthletic: {
      recovery: "Medium",
      recoveryBleeding: "Fast",
      breathing: "Normal",
      breathingBleeding: "Normal",
      spirit: "Medium",
      spiritBleeding: "Strong",
      specialSkill: "Hardcore"
    }
  };

  const M = {
    medium: {
      movementSpeed: "Medium",
      ascentStyle: "Can Ascend",
      upDownSpeed: "Medium"
    },
    mediumFastRun: {
      movementSpeed: "Medium Fast",
      ascentStyle: "Can Ascend While Running",
      upDownSpeed: "Medium Fast"
    },
    fastRun: {
      movementSpeed: "Fast",
      ascentStyle: "Can Ascend While Running",
      upDownSpeed: "Medium Fast"
    }
  };

  const overrides = [
    makeProfile({
      wrestlerId: "tiffany-omari-porter",
      wrestlerName: "Tiffany Omari Porter",
      offense: [4,5,7,4,5,4,5,4,8,5,1,1],
      defense: [7,6,7,6,7,6,8,6,8,5,1,1],
      skills: S.standardGood,
      movement: M.medium
    }),
    makeProfile({
      wrestlerId: "victoria-imani-porter",
      wrestlerName: "Victoria Imani Porter",
      offense: [4,6,5,2,2,4,8,4,7,5,1,1],
      defense: [6,6,6,5,5,8,6,5,7,7,1,1],
      skills: S.standardGood,
      movement: M.mediumFastRun
    }),
    makeProfile({
      wrestlerId: "kim-mccratt",
      wrestlerName: "Kim McCratt",
      offense: [5,5,6,4,5,5,5,5,7,5,1,5],
      defense: [7,7,7,6,6,6,7,6,8,6,1,2],
      skills: S.standardNormal,
      movement: M.medium
    }),
    makeProfile({
      wrestlerId: "connie-servativv",
      wrestlerName: "Connie Servativv",
      offense: [4,5,6,8,7,4,4,3,8,3,1,1],
      defense: [7,7,7,8,8,5,6,5,8,4,1,1],
      skills: S.standardGood,
      movement: M.medium
    }),
    makeProfile({
      wrestlerId: "keva-owensteen",
      wrestlerName: "Keva Owensteen",
      offense: [8,6,7,2,3,7,4,8,4,7,1,1],
      defense: [6,5,6,4,4,4,7,7,5,4,1,1],
      skills: S.hardcoreHeavy,
      movement: M.medium
    }),
    makeProfile({
      wrestlerId: "kayla-owensteen",
      wrestlerName: "Kayla Owensteen",
      offense: [6,7,7,3,4,6,5,7,6,4,1,1],
      defense: [7,7,7,5,5,6,8,7,7,6,1,1],
      skills: S.kayla,
      movement: M.medium
    }),
    makeProfile({
      wrestlerId: "katt-harvey",
      wrestlerName: "Katt Harvey",
      offense: [5,6,5,2,2,4,8,5,6,3,1,1],
      defense: [6,6,6,5,5,8,6,5,7,5,1,1],
      skills: S.hardcoreAthletic,
      movement: M.mediumFastRun
    }),
    makeProfile({
      wrestlerId: "jess-harvey",
      wrestlerName: "Jess Harvey",
      offense: [4,6,4,2,2,3,9,4,5,2,1,1],
      defense: [5,6,5,4,4,9,5,4,7,7,1,1],
      skills: S.hardcoreAthletic,
      movement: M.fastRun
    }),
    makeProfile({
      wrestlerId: "liv-morgan",
      wrestlerName: "Liv Morgan",
      offense: [4,6,5,2,3,3,8,4,6,5,1,1],
      defense: [6,7,6,5,5,8,6,5,8,6,1,1],
      skills: S.standardGood,
      movement: M.mediumFastRun
    }),
    makeProfile({
      wrestlerId: "anna-jay",
      wrestlerName: "Anna Jay",
      offense: [4,5,6,6,6,4,5,4,7,3,1,1],
      defense: [7,7,7,7,8,6,7,6,8,4,1,1],
      skills: S.standardGood,
      movement: M.medium
    }),
    makeProfile({
      wrestlerId: "stormy-frunts",
      wrestlerName: "Stormy Frunts",
      offense: [7,5,7,2,3,8,4,7,5,7,1,3],
      defense: [7,6,8,5,5,5,8,8,6,7,1,2],
      skills: S.standardNormal,
      movement: M.medium
    }),
    makeProfile({
      wrestlerId: "daisha-dukes",
      wrestlerName: "Daisha Dukes",
      offense: [5,6,6,3,4,5,6,5,6,6,1,1],
      defense: [7,7,7,6,6,6,7,6,7,6,1,1],
      skills: S.standardGood,
      movement: M.medium
    }),
    makeProfile({
      wrestlerId: "martha-may-deddley",
      wrestlerName: "Martha May Deddley",
      offense: [8,5,7,2,2,8,3,8,4,7,1,3],
      defense: [6,5,6,4,4,4,7,7,5,4,1,1],
      skills: S.hardcoreHeavy,
      movement: M.medium
    }),
    makeProfile({
      wrestlerId: "chevonne-deddley",
      wrestlerName: "Chevonne Deddley",
      offense: [4,5,5,2,2,4,7,5,7,3,1,3],
      defense: [6,6,6,5,5,7,6,5,7,6,1,1],
      skills: S.hardcoreAthletic,
      movement: M.mediumFastRun
    }),
    makeProfile({
      wrestlerId: "hitokiri-sune",
      wrestlerName: "Hitokiri Sune",
      offense: [7,7,7,3,4,6,5,7,5,4,1,1],
      defense: [7,7,8,6,6,6,8,7,8,5,1,1],
      skills: S.standardNormal,
      movement: M.medium
    }),
    makeProfile({
      wrestlerId: "reiyu-hojima",
      wrestlerName: "Reiyu Hojima",
      offense: [4,5,6,7,7,3,5,4,8,1,1,1],
      defense: [7,7,7,8,8,6,7,6,8,3,1,1],
      skills: S.standardGood,
      movement: M.medium
    })
  ];

  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url || "";
    const response = await originalFetch(input, init);

    if (!response.ok || !url.includes("data/owl-parameter-profiles.json")) {
      return response;
    }

    try {
      const database = await response.clone().json();
      const baseProfiles = Array.isArray(database?.profiles) ? database.profiles : [];
      const merged = new Map(baseProfiles.map(profile => [profile?.wrestlerId, profile]));

      overrides.forEach(profile => merged.set(profile.wrestlerId, profile));

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
      console.error("Could not apply OWL women's tag simulation profile overrides:", error);
      return response;
    }
  };
})();
