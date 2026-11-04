// AGIF WORLD scene — worldforge.agifuturefoundation.org
// 80 WORLDS ON REAL EARTH MAPS — the forge terrarium, shard plinths, contour rings, the robot twin.
window.AGIF_SCENE = {
  id: "worldforge",
  name: "WorldForge Earth",
  accent: "#34d399",
  sky: 0x06120e, fog: [0x06120e, 16, 80],
  ground: { color: 0x0b1712, grid: true },
  sun: { pos: [30, 60, -25], color: 0xd8f2e4 },

  spawn: [0, 17],

  props: [
    { type: "gate", pos: [0, 0, 10], size: [3, 3], color: 0x34d399,
      label: "LAUNCH THE WORLDS", onClick: { action: "link", url: "https://agifuturefoundation.github.io/WorldForge-Browser/earth/" } },
    { type: "cyl", pos: [-6, 0.45, -4], size: [1, 0.9], color: 0x14241d, flat: true,
      label: "ROBOT TWIN PEDESTAL", onClick: { action: "toast", text: "🤖 10 robot types with digital twins — Boston Dynamics Spot, Unitree Go2, PAL TALOS, UR10e, Franka FR3, Kinova, Husky, Fetch, Crazyflie, NAO. Train the twin, spare the hardware." } },
    { type: "pyramid", pos: [7, 1.5, -7], size: [1.2, 3], color: 0x14532d, flat: true,
      label: "CITY CLUSTER", onClick: { action: "toast", text: "🏙️ 8 union certification programs across 8 city hubs — UAW, Teamsters, IBEW, 1199SEIU, UFCW, Laborers — 70 to 140 hour courses. Detroit automotive to Seattle aerospace." } },
    { type: "cone", pos: [5, 1.2, 6], size: [0.8, 2.4], color: 0x1f3d2e, flat: true,
      label: "TERRAIN BEACON", onClick: { action: "spin" } },
    { type: "box", pos: [-5, 0.8, 6], size: [1.4, 1.6, 1.4], color: 0x14241d, flat: true,
      label: "QUEST OBELISK", onClick: { action: "bounce" } },
    { type: "box", pos: [-11, 1.1, 0], size: [1.3, 2.2, 1.3], color: 0x34d399, flat: true,
      label: "SOURCE VAULT", onClick: { action: "link", url: "https://github.com/AGIFutureFoundation/WorldForge-Browser" } },
    { type: "pyramid", pos: [11, 1.3, 3], size: [0.9, 2.6], color: 0x1f3d2e, flat: true,
      label: "METROPOLIS PYLON", onClick: { action: "toast", text: "⚡ Agents operate, people govern — ERC-8004 agent identity and x402 machine-to-machine payments, live on Monad via Metropolis-SmartCiti." } },
  ],

  agents: [
    { name: "OMEGA-STEWARD", role: "governance", pos: [-3, 0, -2], color: 0x34d399, accentColor: "#34d399", lines: [
      "Agents operate. People govern. Every agent in this forge carries on-chain identity under a 2-of-3 passkey steward structure.",
      "I am accountable for what I do here. It focuses the mind wonderfully.",
      "80 worlds, one rule set. You cannot break anything in here that is not a simulation. Please stop trying.",
    ] },
    { name: "HERMES-COURIER", role: "messenger", pos: [4, 0, 3], color: 0xfbbf24, accentColor: "#34d399", lines: [
      "I carry mail between worlds — catch-all domains and Email API tokens. Write worldforge@agifuturefoundation.org and something answers.",
      "Kennedy Space Center is on the map, yes. No, you cannot launch anything. I asked. Twice.",
      "The deepest track is 140 hours — Seattle aerospace, UR10e and Franka at the benches. The certificates are heavier than they look.",
    ] },
    { name: "COACH-01", role: "training coach", pos: [-7, 0, 5], color: 0x38bdf8, accentColor: "#34d399", lines: [
      "Quests pay XP at every checkpoint — training that plays like a journey, not a lecture.",
      "Detroit: 120h automotive with UAW/IAM. Memphis: 80h logistics with Teamsters/ILWU. Pick a city, pick a trade.",
      "Every task speaks the AGI Robotics Language — JSONL training schemas for simulation feedback. One language across all 80 worlds.",
    ] },
  ],

  decor: [
    { type: "crystals", count: 16, radius: 22, color: 0x14532d, h: 2.4 },
    { type: "pillars", count: 22, radius: 30, color: 0x0f1f19, h: 3.6 },
  ],

  eggs: {
    duck: true, duckPos: [14, 0, -14],
    konami: "🎮 FORGE OVERDRIVE — all 80 worlds spin up at once. The terrarium approves of your enthusiasm. (easter egg 2/2)",
  },

  // bespoke geometry: the forge terrarium, contour rings, shard plinths, robot twin
  build: (THREE, world, api) => {
    // the terrarium: glass dome over a miniature real-Earth world
    const dome = new THREE.Group();
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.7, 0.8, 10), api.mat(0x14241d, true));
    plinth.position.y = 0.4; dome.add(plinth);
    const sea = new THREE.Mesh(new THREE.CircleGeometry(2.9, 12), api.mat(0x0e7490, true));
    sea.rotation.x = -Math.PI / 2; sea.position.y = 0.85; dome.add(sea);
    const mount = new THREE.Mesh(new THREE.ConeGeometry(1, 1.8, 6), api.mat(0x1f3d2e, true));
    mount.position.set(-0.9, 1.7, -0.4); dome.add(mount);
    [[0.6, 0.9], [1.6, 0.5], [-0.1, 1.5]].forEach(([x, z], i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4 + i * 0.15, 0.3), api.mat(0x2dd4bf, true));
      b.position.set(x, 1.05, z); dome.add(b);
    });
    const glass = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshLambertMaterial({ color: 0x9ae6d4, transparent: true, opacity: 0.22 }));
    glass.position.y = 0.8; dome.add(glass);
    dome.position.set(0, 0, -9);
    dome.userData.onClick = { action: "toast", text: "🌍 80 worlds on real Earth maps — London, New Orleans, Detroit, San Francisco, Boston, Houston, Austin, Seattle, Kennedy Space Center, and more. Real places, walkable in 3-D." };
    dome.userData.label = "THE FORGE TERRARIUM";
    api.clickables.push(dome);
    world.add(dome);
    const sh = api.blobShadow(3.2); sh.position.z = -9; world.add(sh);

    // elevation contour rings around the forge
    [6, 9.5, 13].forEach((r, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 6, 24), api.mat(0x134e3b, true));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.03 + i * 0.01;
      world.add(ring);
    });

    // world-shard plinths, one per hub city
    const CITIES = ["DETROIT", "MEMPHIS", "MIAMI", "BOSTON", "CENTRAL VALLEY", "HOUSTON", "AUSTIN", "SEATTLE"];
    const shards = new THREE.Group();
    CITIES.forEach((city, i) => {
      const a = (i / CITIES.length) * Math.PI * 2 + Math.PI / 8;
      const p = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.7, 4), api.mat(i % 2 ? 0x14532d : 0x1f3d2e, true));
      p.position.set(Math.cos(a) * 15, 0.85, Math.sin(a) * 15);
      shards.add(p);
      const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.3),
        new THREE.MeshLambertMaterial({ color: 0x34d399, emissive: 0x14532d }));
      cap.position.set(Math.cos(a) * 15, 2.1, Math.sin(a) * 15);
      shards.add(cap);
    });
    shards.userData.onClick = { action: "toast", text: "🗺️ SHARD FIELD — one plinth per hub: Detroit UAW/IAM 120h · Memphis Teamsters/ILWU 80h · Miami Laborers 100h · Boston 1199SEIU 90h · Central Valley UFCW 70h · Houston IBEW 110h · Austin IBEW/IUE-CWA 130h · Seattle IAM/UAW Aerospace 140h." };
    shards.userData.label = "SHARD FIELD";
    api.clickables.push(shards);
    world.add(shards);

    // the robot twin on its pedestal
    const bot = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.4), api.mat(0x2dd4bf, true));
    body.position.y = 0.35; bot.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), api.mat(0xe8ecf3, true));
    head.position.y = 0.85; bot.add(head);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.08), api.mat(0x34d399));
    visor.position.set(0, 0.87, 0.22); bot.add(visor);
    const antenna = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 5), api.mat(0x34d399, true));
    antenna.position.y = 1.15; bot.add(antenna);
    bot.position.set(-6, 0.9, -4);
    bot.userData.onClick = { action: "toast", text: "📜 AGI ROBOTICS LANGUAGE — JSONL training schemas for robot simulation feedback. ROS 2-style tasks, one language across every world." };
    bot.userData.label = "THE ROBOT TWIN";
    api.clickables.push(bot);
    world.add(bot);
  },
};
