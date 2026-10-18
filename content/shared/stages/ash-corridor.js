window.GameContent = window.GameContent || {};
window.GameContent.stages = window.GameContent.stages || {};
window.GameContent.stages["stage_ash_corridor"] = {
  id: "stage_ash_corridor",
  name: "灰の回廊",
  description: "灰に覆われた塔の入口。",
  floor: 1,
  nodeIds: [
    "node_ash_shop",
    "node_ash_battle",
    "node_ash_event",
    "node_ash_social_intro",
    "node_ash_social_first",
    "node_ash_rest",
    "node_ash_elite",
    "node_ash_social",
    "node_ash_social_third",
    "node_ash_final_boss",
  ],
};

window.GameContent.generateDungeonMap = function (random = Math.random) {
  const pool = [["node_ash_battle",32.5],["node_ash_event",32.5],["node_ash_elite",15],["node_ash_shop",10],["node_ash_rest",10]];
  const pick = () => { let roll = random()*100; for (const [id,w] of pool) { roll -= w; if (roll < 0) return id; } return pool[4][0]; };
  const floors = Array.from({length:16}, (_,i) => Array.from({length:i===15?1:3+Math.floor(random()*2)}, (_,j) => ({id:i+"_"+j,floor:i+1,nodeId:i===15?"node_ash_final_boss":i===0?"node_ash_battle":i===14?"node_ash_rest":pick(),nextIds:[]})));
  floors.forEach(row => row.forEach((node,j) => node.x=(j+0.5)/row.length));
  const nearest = (node, row) => row.reduce((best,n) => Math.abs(n.x-node.x)<Math.abs(best.x-node.x)?n:best);
  const connect = (a,b) => { if (!a.nextIds.includes(b.id)) a.nextIds.push(b.id); };
  for (let i=0;i<15;i++) {
    const from=floors[i], to=floors[i+1];
    from.forEach(a=>connect(a,nearest(a,to)));
    to.forEach(b=>connect(nearest(b,from),b));
    from.forEach(a=>{
      const roll=random(), count=roll<0.04?3:roll<0.28?2:1;
      const options=to.filter(b=>!a.nextIds.includes(b.id)).sort((a1,b1)=>Math.abs(a1.x-a.x)-Math.abs(b1.x-a.x));
      while(a.nextIds.length<count && options.length) {
        const target = options.shift();
        // Preserve left-to-right order between floors. Shared endpoints are
        // allowed for branches/merges, but routes must never cross in between.
        const crosses = from.some(source => source.nextIds.some(id => {
          const destination = to.find(node => node.id === id);
          return (source.x - a.x) * (destination.x - target.x) < 0;
        }));
        if (!crosses) connect(a,target);
      }
    });
  }
  return {floors,nodes:Object.fromEntries(floors.flat().map(n=>[n.id,n]))};
};
